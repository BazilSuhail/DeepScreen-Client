'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ProfileView from '@/components/profile/ProfileView';

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="w-full bg-amber-50 px-4 py-32">
            <ProfileView user={user} role={user?.role || 'CANDIDATE'} />
        </div>
    );
}
