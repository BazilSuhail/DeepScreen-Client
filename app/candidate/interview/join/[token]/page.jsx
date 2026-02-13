'use client';

import { useParams } from 'next/navigation';
import JoinInterview from '@/components/interview/JoinInterview';

export default function CandidateJoinPage() {
    const { token } = useParams();

    return (
        <JoinInterview token={token} />
    );
}
