'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role === 'RECRUITER') {
      router.push('/chats/recruiter');
    } else if (user.role === 'CANDIDATE') {
      router.push('/chats/candidate');
    } else {
      router.push('/auth/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass p-8 rounded-3xl text-center">
        <div className="inline-block animate-spin">⚙️</div>
        <p className="text-muted-foreground mt-4">Redirecting to your chats...</p>
      </div>
    </div>
  );
}
