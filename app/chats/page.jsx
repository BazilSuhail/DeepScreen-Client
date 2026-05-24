'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ChatSkeleton from '@/components/skeletons/chats/ChatSkeleton';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // A null user while auth is still loading is not "signed out"; wait before routing.
    if (loading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (user.role === 'RECRUITER') {
      router.replace('/chats/recruiter');
    } else if (user.role === 'CANDIDATE') {
      router.replace('/chats/candidate');
    } else if (user.role === 'STAFF') {
      router.replace('/organizations');
    } else {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  return <ChatSkeleton />;
}
