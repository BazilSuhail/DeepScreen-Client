import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'motion/react';

export default function ConversationList({ selectedConversation, onSelectConversation, currentUserId }) {
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const queryClient = useQueryClient();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/messaging/conversations/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.results || response.data;
    },
    enabled: !!token,
  });

  // Fetch available users for new conversation
  const { data: users = [] } = useQuery({
    queryKey: ['users-for-chat'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/accounts/users/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return (response.data.results || response.data).filter((u) => u.id !== currentUserId);
    },
    enabled: !!token && showNewConversation,
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (participantIds) => {
      return await axios.post(
        `${API_URL}/messaging/conversations/`,
        {
          participant_ids: participantIds,
          conversation_type: 'direct',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onSelectConversation(data.data.id);
      setShowNewConversation(false);
      setSelectedUsers([]);
    },
  });

  const handleCreateConversation = () => {
    if (selectedUsers.length > 0) {
      createConversationMutation.mutate(selectedUsers);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Messages</h2>
        <button
          onClick={() => setShowNewConversation(!showNewConversation)}
          className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
        >
          + New Message
        </button>
      </div>

      {/* New Conversation Panel */}
      {showNewConversation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700"
        >
          <div className="space-y-3">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user.profile_info?.first_name || user.email}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0 || createConversationMutation.isPending}
              className="w-full px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Start Chat
            </button>
          </div>
        </motion.div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <motion.button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              className={`w-full text-left p-3 border-b border-gray-100 dark:border-slate-700 transition-colors ${
                selectedConversation === conv.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {/* Participant Name */}
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {conv.conversation_type === 'direct'
                  ? conv.participants.find((p) => p.id !== currentUserId)?.profile_info?.first_name ||
                    conv.participants.find((p) => p.id !== currentUserId)?.email
                  : conv.name}
              </p>

              {/* Latest Message */}
              {conv.latest_message && (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {conv.latest_message.content}
                </p>
              )}

              {/* Unread Badge */}
              {conv.unread_count > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                  {conv.unread_count}
                </span>
              )}
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
