'use client';

import { use } from 'react';
import JoinInterview from '@/components/interview/JoinInterview';

export default function InterviewJoinPage({ params }) {
    const { token } = use(params);

    return (
        <div className="min-h-screen bg-mesh">
            <JoinInterview token={token} />
        </div>
    );
}
