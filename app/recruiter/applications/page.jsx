'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineUserCircle,
    HiOutlineSparkles,
    HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';

// Modular Components
import StageBadge from '@/components/applications/StageBadge';
import CandidateCard from '@/components/applications/CandidateCard';
import JobSidebar from '@/components/applications/JobSidebar';
import ShortlistModal from '@/components/applications/modals/ShortlistModal';
import CandidateSearch from '@/components/applications/CandidateSearch';

export default function RecruiterApplicationsPage() {
    const [myJobs, setMyJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingApps, setLoadingApps] = useState(false);
    const [shortlisting, setShortlisting] = useState(false);
    const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [stageFilter, setStageFilter] = useState('all');
    const [error, setError] = useState('');

    // Fetch recruiter's own jobs
    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const data = await api.get('/applications/my-jobs/');
                setMyJobs(data);
                if (data.length > 0) setSelectedJobId(data[0].job_id);
            } catch (err) {
                setError('Failed to load your jobs');
            } finally {
                setLoadingJobs(false);
            }
        };
        fetchMyJobs();
    }, []);

    // Fetch applications whenever selected job changes
    useEffect(() => {
        if (!selectedJobId) return;
        const fetchApps = async () => {
            setLoadingApps(true);
            try {
                const data = await api.get(`/applications/job/${selectedJobId}/`);
                setApplications(data);
            } catch (err) {
                setError('Failed to load applications');
            } finally {
                setLoadingApps(false);
            }
        };
        fetchApps();
    }, [selectedJobId]);

    const handleShortlistConfirm = async () => {
        if (!selectedJobId) return;
        setShortlisting(true);
        setError('');
        try {
            const result = await api.post(`/applications/job/${selectedJobId}/shortlist/`, {});
            // Refresh applications list
            const data = await api.get(`/applications/job/${selectedJobId}/`);
            setApplications(data);
            setIsShortlistModalOpen(false);
        } catch (err) {
            setError(err.message || 'AI analysis failed');
        } finally {
            setShortlisting(false);
        }
    };

    const handleCandidateSearch = async (email) => {
        if (!selectedJobId) return;
        setSearching(true);
        setError('');
        try {
            const result = await api.get(`/applications/job/${selectedJobId}/search/?email=${email}`);
            // If found, highlight it or filter to it
            setApplications(prev => {
                const exists = prev.find(a => a.application_id === result.application_id);
                if (exists) return prev;
                return [result, ...prev];
            });
            // Switch filter to all so user can see the result
            setStageFilter('all');
        } catch (err) {
            setError(`No candidate found with email: ${email}`);
        } finally {
            setSearching(false);
        }
    };

    const handleUpdateStatus = async (appId, updates) => {
        try {
            await api.patch(`/applications/${appId}/`, updates);
            const data = await api.get(`/applications/job/${selectedJobId}/`);
            setApplications(data);
        } catch (err) {
            alert('Failed to update status: ' + (err.message || 'unknown error'));
        }
    };

    const selectedJob = myJobs.find(j => j.job_id === selectedJobId);

    const filteredApps = stageFilter === 'all'
        ? applications
        : applications.filter(a => a.current_stage === stageFilter);

    if (loadingJobs) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Candidate Pipeline</h1>
                    <p className="text-muted-foreground mt-1">AI-powered recruitment for your open positions</p>
                </div>
                {selectedJob && (
                    <div className="w-full md:w-96">
                        <CandidateSearch onSearch={handleCandidateSearch} loading={searching} />
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-xs uppercase font-black opacity-50 hover:opacity-100">Dismiss</button>
                </div>
            )}

            {myJobs.length === 0 ? (
                <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                    <HiOutlineClipboardDocumentList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold">No Jobs Posted Yet</h3>
                    <p className="text-muted-foreground mt-2">Post a job first to start receiving applications.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8 items-start">

                    <JobSidebar
                        jobs={myJobs}
                        selectedJobId={selectedJobId}
                        onSelectJob={(id) => { setSelectedJobId(id); setStageFilter('all'); }}
                    />

                    {/* ── Right: Applications for selected job ─────────────── */}
                    <div className="space-y-6">
                        {/* Job action bar */}
                        {selectedJob && (
                            <div className="glass border border-emerald-500/10 rounded-[2rem] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black">{selectedJob.job_title}</h2>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                        <span>{selectedJob.organization}</span>
                                        <span>·</span>
                                        <span className="text-emerald-500 font-bold">{selectedJob.total_applications} applicants</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsShortlistModalOpen(true)}
                                    disabled={shortlisting || selectedJob.total_applications === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 shrink-0"
                                >
                                    <HiOutlineSparkles className="w-5 h-5" /> Run AI Shortlist
                                </button>
                            </div>
                        )}

                        {/* Stage filter tabs */}
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'applied', 'shortlisted', 'coding_pending', 'rejected'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStageFilter(s)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${stageFilter === s
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {s === 'all' ? `All (${applications.length})` : s.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Candidate list */}
                        {loadingApps ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
                            </div>
                        ) : filteredApps.length === 0 ? (
                            <div className="py-20 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                                <HiOutlineUserCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-bold">No Candidates</h3>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {stageFilter === 'all'
                                        ? 'No one has applied to this position yet.'
                                        : `No candidates in the "${stageFilter}" stage.`}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredApps.map((app, i) => (
                                    <CandidateCard
                                        key={app.application_id}
                                        app={app}
                                        rank={i + 1}
                                        onUpdateStatus={handleUpdateStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <ShortlistModal
                isOpen={isShortlistModalOpen}
                onClose={() => setIsShortlistModalOpen(false)}
                onConfirm={handleShortlistConfirm}
                jobTitle={selectedJob?.job_title}
                totalApplicants={selectedJob?.total_applications}
                loading={shortlisting}
            />
        </div>
    );
}
