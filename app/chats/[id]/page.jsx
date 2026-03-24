'use client';

import React, { useState, useEffect, use } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ChatThread from '@/components/chats/ChatThread';
import { motion } from 'motion/react';

export default function ChatRoomPage({ params }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchRoomData();
    }
  }, [user, authLoading, id]);

  const fetchRoomData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/chat_rooms/${id}/messages/`);
      setRoomData(response);
    } catch (err) {
      setError('Failed to load conversation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && !roomData)) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse">Establishing secure connection...</p>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <div className="glass p-8 rounded-[2rem] text-center max-w-md border-red-500/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">{error || 'This conversation is unavailable or you do not have permission to view it.'}</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <ChatThread 
        room={roomData.room_info} 
        initialMessages={roomData.messages}
        userRole={user.role} 
        onBack={() => router.back()} 
      />
    </div>
  );
}
