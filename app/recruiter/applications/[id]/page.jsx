'use client';

import React, { useState, useEffect, use } from 'react';
import { api } from '@/utils/api';
import {
    HiOutlineUserCircle,
    HiOutlineSparkles,
    HiOutlineChevronLeft,
    HiOutlineChatBubbleBottomCenterText
} from 'react-icons/hi2';

import CandidateCard from '@/components/applications/CandidateCard';
import ShortlistModal from '@/components/applications/modals/ShortlistModal';
import CandidateSearch from '@/components/applications/CandidateSearch';
import { useRouter } from 'next/navigation';

export default function JobApplicationsPage({ params }) {
    const { id: jobId } = use(params);
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shortlisting, setShortlisting] = useState(false);
    const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [stageFilter, setStageFilter] = useState('all');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!jobId) return;
        fetchJobAndApps();
    }, [jobId]);

    const fetchJobAndApps = async () => {
        setLoading(true);
        try {
            const [jobData, appsData] = await Promise.all([
                api.get(`/jobs/${jobId}/`),
                api.get(`/applications/job/${jobId}/`)
            ]);
            setJob(jobData);
            setApplications(appsData);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleShortlistConfirm = async () => {
        setShortlisting(true);
        setError('');
        try {
            await api.post(`/applications/job/${jobId}/shortlist/`, {});
            // Refresh data
            await fetchJobAndApps();
            setIsShortlistModalOpen(false);
        } catch (err) {
            setError(err.message || 'AI analysis failed');
        } finally {
            setShortlisting(false);
        }
    };

    const handleCandidateSearch = async (email) => {
        setSearching(true);
        setError('');
        try {
            const result = await api.get(`/applications/job/${jobId}/search/?email=${email}`);
            setApplications(prev => {
                const exists = prev.find(a => a.application_id === result.application_id);
                if (exists) return prev;
                return [result, ...prev];
            });
            setStageFilter('all');
        } catch (err) {
            setError(`No candidate found with email: ${email}`);
        } finally {
            setSearching(false);
        }
    };

    const handleUpdateStatus = async (appId, updates) => {
        try {
            await api.patch(`/applications/${appId}//`, updates);
            const data = await api.get(`/applications/job/${jobId}/`);
            setApplications(data);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleStartChat = (app) => {
        if (app?.application_id) {
            router.push(`/chats/${app.application_id}`);
        }
    };

    const filteredApps = stageFilter === 'all'
        ? applications
        : applications.filter(a => a.current_stage === stageFilter);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-mesh">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <button 
                    onClick={() => router.push('/recruiter/applications')}
                    className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all w-fit"
                >
                    <HiOutlineChevronLeft className="w-5 h-5" />
                    Back to Jobs
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">{job?.job_title}</h1>
                        <p className="text-muted-foreground mt-1">{job?.organization_details?.name} · {applications.length} Applicants</p>
                    </div>
                    <div className="w-full md:w-80">
                        <CandidateSearch onSearch={handleCandidateSearch} loading={searching} />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-xs uppercase font-black opacity-50 hover:opacity-100">Dismiss</button>
                </div>
            )}

            <div className="space-y-6">
                {/* Action Bar */}
                <div className="glass border border-emerald-500/10 rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold">Candidate Evaluation</h3>
                        <p className="text-sm text-muted-foreground">Manage your pipeline and trigger AI analysis</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsShortlistModalOpen(true)}
                            disabled={shortlisting || applications.length === 0 || job?.is_shortlisted}
                            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[1.5rem] transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:grayscale"
                        >
                            <HiOutlineSparkles className="w-5 h-5" /> 
                            {job?.is_shortlisted ? 'Shortlisting Done' : 'Run AI Shortlist'}
                        </button>
                        
                        {job?.is_shortlisted && (
                            <button
                                onClick={() => router.push(`/chats/recruiter?job_id=${jobId}`)}
                                className="flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-[1.5rem] transition-all border border-border"
                            >
                                <HiOutlineChatBubbleBottomCenterText className="w-5 h-5 text-emerald-600" />
                                Open Inbox
                            </button>
                        )}
                    </div>
                </div>

                {/* Stage filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {['all', 'applied', 'shortlisted', 'coding_pending', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStageFilter(s)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${stageFilter === s
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                }`}
                        >
                            {s === 'all' ? `All (${applications.length})` : s.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                {/* Candidate list */}
                {filteredApps.length === 0 ? (
                    <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                        <HiOutlineUserCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Candidates</h3>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {stageFilter === 'all'
                                ? 'No one has applied to this position yet.'
                                : `No candidates in the "${stageFilter}" stage.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredApps.map((app, i) => (
                            <CandidateCard
                                key={app.application_id}
                                app={app}
                                rank={i + 1}
                                onUpdateStatus={handleUpdateStatus}
                                onStartChat={() => handleStartChat(app)}
                                showMessageButton={job?.is_shortlisted}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <ShortlistModal
                isOpen={isShortlistModalOpen}
                onClose={() => setIsShortlistModalOpen(false)}
                onConfirm={handleShortlistConfirm}
                jobTitle={job?.job_title}
                totalApplicants={applications.length}
                loading={shortlisting}
            />
        </div>
    );
}
