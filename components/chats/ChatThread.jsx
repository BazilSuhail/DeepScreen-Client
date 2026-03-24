'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineChevronLeft, HiOutlinePaperAirplane, HiOutlineTrash } from 'react-icons/hi2';

export default function ChatThread({ room, initialMessages = [], userRole, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      sender_id: user.user_id,
      sender_name: 'You',
      content: messageInput,
      timestamp: new Date().toISOString(),
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setMessageInput('');
    setSending(true);
    setError('');

    try {
      const response = await api.post(`/chat_rooms/${room.application_id}/send/`, {
        content: optimisticMsg.content,
        message_type: 'text',
      });

      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? response.message : m));
    } catch (err) {
      setError('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setMessageInput(optimisticMsg.content); // Restore input
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
      setMessages(prev => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background max-w-5xl mx-auto border-x border-border shadow-2xl">
      {/* Elegant Header */}
      <header className="sticky top-0 z-10 glass border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-secondary transition-all text-muted-foreground hover:text-foreground"
          >
            <HiOutlineChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {userRole === 'CANDIDATE' ? room.recruiter_name : room.candidate_name}
            </h1>
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
              {room.job_title}
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Live Session</span>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
        <div className="flex flex-col justify-end min-h-full">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">👋</span>
                </div>
                <h3 className="text-lg font-semibold">No messages yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                  Send a message to start the conversation about this role.
                </p>
              </motion.div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = String(msg.sender_id) === String(user.user_id);
                const showSender = !isMe && (idx === 0 || String(messages[idx-1].sender_id) !== String(msg.sender_id));
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2`}
                  >
                    {showSender && (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 ml-1">
                        {msg.sender_name}
                      </span>
                    )}
                    <div className="group relative flex items-center gap-2 max-w-[85%] md:max-w-[70%]">
                      {isMe && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div
                        className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-600/20'
                            : 'bg-secondary text-foreground rounded-tl-none border border-border'
                        } ${msg.isOptimistic ? 'opacity-70' : ''}`}
                      >
                        {msg.content}
                        <div className={`text-[10px] mt-1.5 opacity-50 text-right ${isMe ? 'text-emerald-50' : 'text-muted-foreground'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Modern Input Area */}
      <footer className="p-6 bg-background border-t border-border">
        <form
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-3"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-12 left-0 right-0 p-2 bg-red-500/10 text-red-500 text-xs rounded-lg border border-red-500/20 text-center"
            >
              {error}
            </motion.div>
          )}
          
          <div className="flex-1 relative group">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="w-full pl-6 pr-14 py-4 rounded-[1.5rem] bg-secondary border-none focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !messageInput.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:grayscale flex items-center justify-center"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
              )}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
