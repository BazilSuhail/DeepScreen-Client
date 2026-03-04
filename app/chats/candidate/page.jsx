'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import {
  decryptPrivateKey,
  hexToUint8Array,
  restorePrivateKeyLocally,
  stretchPassword,
} from '@/components/authentication/crypto';
import ChatThread from '@/components/chats/ChatThread';

export default function CandidateChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [decryptingKey, setDecryptingKey] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [user]);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/chat_rooms/candidate/rooms/');
      setRooms(response.rooms || []);
    } catch (err) {
      setError('Failed to load chat rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptPrivateKey = async (e) => {
    e.preventDefault();
    setDecryptingKey(true);
    setError('');
    try {
      // Try local restore first
      const localKey = await restorePrivateKeyLocally();
      if (localKey) {
        setDecryptedPrivateKey(localKey);
        setShowPasswordPrompt(false);
        setPasswordInput('');
        return;
      }

      // Otherwise, decrypt using password and encryption_salt from server
      if (!user.encryption_salt || !user.encrypted_private_key) {
        setError('E2EE keys not set up. Please contact support.');
        return;
      }

      const aesKey = await stretchPassword(passwordInput, user.encryption_salt);
      const privateKey = await decryptPrivateKey(user.encrypted_private_key, aesKey);
      setDecryptedPrivateKey(privateKey);
      setShowPasswordPrompt(false);
      setPasswordInput('');
    } catch (err) {
      setError('Failed to decrypt private key. Check your password.');
      console.error(err);
    } finally {
      setDecryptingKey(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-3xl text-center">
          <p className="text-muted-foreground">Please log in to view chats.</p>
        </div>
      </div>
    );
  }

  if (selectedRoom && decryptedPrivateKey) {
    return (
      <ChatThread
        room={selectedRoom}
        userRole="CANDIDATE"
        privateKey={decryptedPrivateKey}
        onBack={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Your Chats
          </h1>
          <p className="text-muted-foreground">Interview discussions with recruiters</p>
        </div>

        {/* Password/Decrypt Prompt */}
        {!decryptedPrivateKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass p-6 rounded-3xl border border-emerald-500/20"
          >
            <h2 className="text-lg font-semibold text-emerald-600 mb-4">Unlock Your Messages</h2>
            {showPasswordPrompt ? (
              <form onSubmit={handleDecryptPrivateKey} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={decryptingKey}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {decryptingKey ? 'Unlocking...' : 'Unlock'}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowPasswordPrompt(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
              >
                Unlock Messages with Password
              </button>
            )}
          </motion.div>
        )}

        {/* Rooms List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⚙️</div>
            <p className="text-muted-foreground mt-4">Loading chats...</p>
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass p-8 rounded-3xl text-center border border-emerald-500/10"
          >
            <p className="text-muted-foreground text-lg">No chats yet</p>
            <p className="text-sm text-muted-foreground mt-2">Your recruiter chats will appear here</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room) => (
              <motion.button
                key={room.application_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  if (!decryptedPrivateKey) {
                    setShowPasswordPrompt(true);
                  } else {
                    setSelectedRoom({
                      ...room,
                      candidate_id: user.user_id,
                      recruiter_id: room.recruiter_id,
                    });
                  }
                }}
                disabled={!decryptedPrivateKey}
                className="glass p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                      {room.job_title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {room.chat_room_exists ? 'Active conversation' : 'No messages yet'}
                    </p>
                  </div>
                  {room.unread_count > 0 && (
                    <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {room.unread_count}
                    </div>
                  )}
                </div>
                {room.last_message_at && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Last message: {new Date(room.last_message_at).toLocaleDateString()}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
