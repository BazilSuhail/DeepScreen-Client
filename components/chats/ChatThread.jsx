'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import {
  aesEncrypt,
  aesDecrypt,
  uint8ArrayToHex,
  hexToUint8Array,
  deriveAESKeyFromPublicKey,
  deriveSharedSecret,
} from '@/components/authentication/crypto';

export default function ChatThread({ room, userRole, privateKey, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [otherUserPublicKey, setOtherUserPublicKey] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessagesAndSetup();
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessagesAndSetup = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch messages
      const response = await api.get(`/chat_rooms/${room.application_id}/messages/`);
      const encryptedMessages = response.messages || [];

      // Cache for public keys to avoid redundant API calls
      const publicKeyCache = {};
      const fetchPublicKey = async (userId) => {
        if (!publicKeyCache[userId]) {
          try {
            const response = await api.get(`/accounts/users/${userId}/public_key/`);
            publicKeyCache[userId] = response.public_key;
          } catch (err) {
            console.error(`Failed to fetch public key for user ${userId}:`, err);
            return null;
          }
        }
        return publicKeyCache[userId];
      };

      // Decrypt messages using ECDH key derivation
      const decryptedMessages = await Promise.all(
        encryptedMessages.map(async (msg) => {
          try {
            // Skip decryption for old messages (those with non-empty encrypted_key field)
            // Old messages were encrypted with a different approach
            if (msg.encrypted_key && msg.encrypted_key.trim() !== '') {
              return { ...msg, content: '[Old message - cannot decrypt]', decryptionError: true };
            }

            // Determine who is the "other" user for this message
            let otherUserId;
            if (msg.sender_id === String(user.user_id)) {
              // This is a message I sent - other user is the recipient
              otherUserId = msg.recipient_id;
            } else {
              // This is a message I received - other user is the sender
              otherUserId = msg.sender_id;
            }

            // Fetch the other user's public key
            const otherUserPublicKey = await fetchPublicKey(otherUserId);
            if (!otherUserPublicKey) {
              return { ...msg, content: '[Could not decrypt - missing key]', decryptionError: true };
            }

            // DEBUG: log keys and derived secrets to help diagnose AES-GCM failures
            try {
              console.groupCollapsed('[E2EE DEBUG] message ' + msg.id);
              console.log('otherUserId:', otherUserId);
              console.log('otherUserPublicKey (hex):', otherUserPublicKey);

              // compute shared secret and AES key for logging
              const sharedSecret = deriveSharedSecret(privateKey, otherUserPublicKey);
              console.log('sharedSecret (hex):', uint8ArrayToHex(sharedSecret));

              const aesKey = await deriveAESKeyFromPublicKey(privateKey, otherUserPublicKey);
              console.log('derivedAESKey (hex):', uint8ArrayToHex(aesKey));

              // Log encrypted blob details
              console.log('encrypted_content (hex, len):', msg.encrypted_content?.length);
              if (msg.encrypted_content) {
                const encryptedArr = hexToUint8Array(msg.encrypted_content);
                const iv = encryptedArr.slice(0, 12);
                console.log('iv(hex):', uint8ArrayToHex(iv));
                console.log('ciphertext+tag len:', encryptedArr.length - 12);
              }
              console.groupEnd();
            } catch (dbgErr) {
              console.warn('E2EE debug log failed', dbgErr);
            }

            // Derive AES key from other user's public key using ECDH
            // This works for both sent and received messages due to ECDH symmetry
            const aesKey = await deriveAESKeyFromPublicKey(privateKey, otherUserPublicKey);

            // Decrypt the message content with the AES key
            const content = await aesDecrypt(msg.encrypted_content, aesKey);

            return { ...msg, content, decryptionError: false };
          } catch (err) {
            console.error('Failed to decrypt message:', err);
            return { ...msg, content: '[Failed to decrypt]', decryptionError: true };
          }
        })
      );

      setMessages(decryptedMessages);

      // Fetch other user's public key for sending messages
      try {
        if (userRole === 'CANDIDATE') {
          // Get recruiter's public key (job poster)
          const jobPubKeyResponse = await api.get(`/accounts/users/${room.recruiter_id}/public_key/`);
          setOtherUserPublicKey(jobPubKeyResponse.public_key);
        } else {
          // Get candidate's public key
          const candPubKeyResponse = await api.get(`/accounts/users/${room.candidate_id}/public_key/`);
          setOtherUserPublicKey(candPubKeyResponse.public_key);
        }
      } catch (err) {
        console.warn('Could not fetch other user public key:', err);
        // Will show error when trying to send
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !otherUserPublicKey) return;

    setSending(true);
    setError('');
    try {
      // 1. Derive AES key from recipient's public key using ECDH
      const aesKey = await deriveAESKeyFromPublicKey(privateKey, otherUserPublicKey);

      // 2. Encrypt message with AES key
      const encryptedContent = await aesEncrypt(messageInput, aesKey);

      // 3. Determine recipient ID
      let recipientId;
      if (userRole === 'CANDIDATE') {
        recipientId = room.recruiter_id;
      } else {
        recipientId = room.candidate_id;
      }

      // 4. Send to server (no encrypted_key needed - AES key is derived from ECDH)
      const response = await api.post(
        `/chat_rooms/${room.application_id}/send/`,
        {
          encrypted_content: encryptedContent,
          recipient_id: recipientId,
          message_type: 'text',
        }
      );

      // 5. Add to local messages
      const newMessage = {
        ...response.message,
        content: messageInput,
        decryptionError: false,
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.post(`/chat_rooms/${room.application_id}/delete_message/`, {
        message_id: messageId,
      });
      // Remove from local state
      setMessages(messages.filter((m) => m.id !== messageId));
    } catch (err) {
      setError('Failed to delete message');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border-b border-emerald-500/20 p-4 md:p-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all"
        >
          ← Back
        </button>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {userRole === 'CANDIDATE' ? room.job_title : room.candidate_email}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            End-to-end encrypted conversation
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">⚙️</div>
              <p className="text-muted-foreground mt-4">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${String(msg.sender_id) === String(user.user_id) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-3xl ${
                    String(msg.sender_id) === String(user.user_id)
                      ? 'bg-emerald-600 text-white'
                      : 'glass border border-emerald-500/20'
                  }`}
                >
                  <p className="text-sm font-semibold opacity-75">
                    {msg.sender_name}
                  </p>
                  <p className="mt-1">
                    {msg.decryptionError ? (
                      <span className="italic opacity-50">{msg.content}</span>
                    ) : (
                      msg.content
                    )}
                  </p>
                  <p className="text-xs opacity-50 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {String(msg.sender_id) === String(user.user_id) && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-xs opacity-50 hover:opacity-100 mt-1 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background">
        {!otherUserPublicKey && (
          <div className="max-w-4xl mx-auto p-4 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-700 text-sm rounded-lg">
            ⚠️ Cannot send messages - recipient's encryption key not available yet
          </div>
        )}
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto p-4 md:p-6 flex gap-3"
        >
          {error && (
            <div className="absolute top-0 left-0 right-0 p-3 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !messageInput.trim() || !otherUserPublicKey}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '↗️' : '⬆️'}
          </button>
        </form>
      </div>
    </div>
  );
}
