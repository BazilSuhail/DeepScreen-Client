'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { HiOutlineBeaker } from 'react-icons/hi2';
import { AssessmentCard } from '@/components/assessments/AssessmentCard';

export default function CandidateAssessmentsPage() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await api.get('/assessments/my/');
                setSubmissions(data);
            } catch {
                setError('Failed to load assessments');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleStart = (submission) => {
        router.push(`/candidate/assessments/${submission.submission_id}`);
    };

    const pending    = submissions.filter(s => ['pending', 'in_progress'].includes(s.status));
    const completed  = submissions.filter(s => !['pending', 'in_progress'].includes(s.status));

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="space-y-10 p-4 md:p-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-black">My Assessments</h1>
                <p className="text-muted-foreground mt-1">Coding tests assigned by recruiters for your applications</p>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>
            )}

            {/* Pending / Active tests */}
            {pending.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" />
                        Action Required ({pending.length})
                    </h2>
                    {pending.map((sub, i) => (
                        <AssessmentCard key={sub.submission_id} submission={sub} index={i} onStart={handleStart} />
                    ))}
                </div>
            )}

            {/* Completed tests */}
            {completed.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-black opacity-60">Completed ({completed.length})</h2>
                    {completed.map((sub, i) => (
                        <AssessmentCard key={sub.submission_id} submission={sub} index={i} />
                    ))}
                </div>
            )}

            {submissions.length === 0 && !loading && (
                <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                    <HiOutlineBeaker className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold">No Assessments Yet</h3>
                    <p className="text-muted-foreground mt-2">
                        Recruiters will assign coding tests after shortlisting. Apply to more jobs to get started!
                    </p>
                </div>
            )}
        </div>
    );
}
