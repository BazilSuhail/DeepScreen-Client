'use client';

import { use } from 'react';
import SetupInterviewConfig from '@/components/interview/SetupInterviewConfig';
import Link from 'next/link';
import { HiOutlineChevronLeft } from 'react-icons/hi';

export default function JobInterviewSetupPage({ params }) {
    const { job_id } = use(params);

    return (
        <div className="min-h-screen bg-mesh p-6">
   
    <Link
                    href="/recruiter/interview"
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-8 transition-all"
                >
                    <HiOutlineChevronLeft className="w-5 h-5" />
                    Back to Dashboard
                </Link>

                <SetupInterviewConfig job_id={job_id} />
        </div>
    );
}
