'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function ChatRoomRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role === 'RECRUITER') {
      router.push(`/chats/recruiter?id=${id}`);
    } else if (user.role === 'CANDIDATE') {
      router.push(`/chats/candidate?id=${id}`);
    } else {
      router.push('/auth/login');
    }
  }, [user, loading, id, router]);

  return (
    <div className="hidden lg:flex h-screen bg-background items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Opening conversation...</p>
      </div>
    </div>
  );
}
