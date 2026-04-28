import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'motion/react';

export default function MessageList({ conversationId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [enableAI, setEnableAI] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Fetch messages for conversation
  const { data: conversationData } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/messaging/conversations/${conversationId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.messages);
      return response.data;
    },
    enabled: !!conversationId && !!token,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return await axios.post(
        `${API_URL}/messaging/messages/`,
        {
          conversation: conversationId,
          content,
          enable_ai_response: enableAI,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: (data) => {
      setMessages([...messages, data.data]);
      setInputValue('');
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
  });

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      return await axios.post(
        `${API_URL}/messaging/messages/${messageId}/mark_as_read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-mark visible messages as read
  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.is_read && msg.sender.id !== currentUserId) {
        markAsReadMutation.mutate(msg.id);
      }
    });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessageMutation.mutate(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.sender.id === currentUserId
                    ? 'bg-emerald-500 text-white rounded-br-none'
                    : msg.message_type === 'ai_response'
                    ? 'bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-white rounded-bl-none border border-blue-300'
                    : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.message_type === 'ai_response' && (
                  <p className="text-xs mt-1 opacity-70">🤖 AI Response</p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    msg.sender.id === currentUserId ? 'opacity-70' : 'opacity-50'
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* AI Toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={enableAI}
              onChange={(e) => setEnableAI(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700 dark:text-gray-300">
              🤖 Get AI response
            </span>
          </label>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={sendMessageMutation.isPending || !inputValue.trim()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
