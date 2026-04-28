'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import ConversationList from '@/components/messaging/ConversationList';
import MessageList from '@/components/messaging/MessageList';

export default function MessagingPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <LayoutWrapper>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Chat with recruiters and candidates
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex gap-0">
          {/* Conversations Sidebar - Hidden on mobile */}
          <div className="w-80 hidden md:flex border-r border-gray-200 dark:border-slate-700">
            <ConversationList
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              currentUserId={user?.id}
            />
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <MessageList
                conversationId={selectedConversation}
                currentUserId={user?.id}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Select a conversation
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
