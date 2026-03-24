'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { HiOutlineChatBubbleLeftRight, HiOutlineArrowRight } from 'react-icons/hi2';

export default function CandidateChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="glass p-8 rounded-3xl text-center border border-emerald-500/10">
          <p className="text-muted-foreground font-medium">Please log in to view chats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh pb-20">
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight text-gradient mb-3">
            Messages
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Direct communication with your hiring teams
          </p>
        </div>

        {/* Rooms List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2].map(i => (
              <div key={i} className="glass h-24 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-12 rounded-[2.5rem] text-center border border-emerald-500/10 shadow-xl"
          >
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No active chats</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Once you're shortlisted for a role, you'll be able to chat with recruiters here.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {rooms.map((room) => (
              <motion.button
                key={room.application_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/chats/${room.application_id}`)}
                className="group glass p-8 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-600 font-bold text-xl group-hover:scale-110 transition-transform">
                    {room.recruiter_name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                      {room.recruiter_name}
                    </h3>
                    <p className="text-emerald-600/70 font-bold text-xs uppercase tracking-widest mt-1">
                      {room.job_title}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {room.chat_room_exists ? 'Continue conversation' : 'Send your first message'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {room.unread_count > 0 && (
                    <div className="bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-600/30 animate-bounce">
                      {room.unread_count}
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <HiOutlineArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
