"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/utils/api';

export default function CandidateInbox() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const data = await chatApi.get('/candidate/inbox/');
      setThreads(data);
    } catch (err) {
      console.error('Failed to load inbox', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--foreground)]">Loading your chats...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-[var(--background)]">
      <h1 className="text-3xl font-bold text-[var(--primary)] mb-8 font-sans">Your Messages</h1>
      
      {threads.length === 0 ? (
        <div className="bg-[var(--card)] p-8 rounded-xl shadow-sm text-center border border-gray-100">
          <p className="text-gray-500">No active conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <div 
              key={thread.thread_id}
              onClick={() => router.push(`/chats/${thread.thread_id}`)}
              className={`p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                !thread.can_message ? 'bg-gray-50 border-gray-200' : 'bg-[var(--card)] border-gray-100 hover:border-[var(--primary)]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">{thread.job_title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{thread.company_name}</p>
                  <p className="text-gray-700 truncate max-w-lg">
                    {thread.last_message ? "Decryption required to view latest message" : "No messages yet"}
                  </p>
                </div>
                <div className="text-right">
                  {thread.unread_count_candidate > 0 && (
                    <span className="bg-[var(--accent)] text-white text-xs px-2 py-1 rounded-full font-bold">
                      {thread.unread_count_candidate} new
                    </span>
                  )}
                  {!thread.can_message && (
                    <span className="block mt-2 text-xs text-red-500 font-medium">Closed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
