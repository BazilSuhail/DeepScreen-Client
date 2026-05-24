'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import ChatSkeleton from '@/components/skeletons/chats/ChatSkeleton';

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
      // Recruiter links need job_id too (see /chats/recruiter); the app never sends recruiters here.
      router.push('/chats/recruiter');
    } else if (user.role === 'CANDIDATE') {
      router.push(`/chats/candidate?id=${id}`);
    } else {
      router.push('/auth/login');
    }
  }, [user, loading, id, router]);

  // Same shape as the screen it redirects to, on every breakpoint (it used to render nothing below lg).
  return <ChatSkeleton />;
}
