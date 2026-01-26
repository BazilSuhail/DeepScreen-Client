'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineUserCircle,
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineCalendar,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineSparkles,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineArrowTrendingUp,
    HiOutlineBeaker,
    HiOutlineAcademicCap,
    HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';

// ─── Pill badge ───────────────────────────────────────────────────────────────
const StageBadge = ({ stage }) => {
    const map = {
        applied: 'bg-blue-500/10 text-blue-400',
        shortlisted: 'bg-emerald-500/10 text-emerald-500',
        coding_pending: 'bg-yellow-500/10 text-yellow-500',
        coding_passed: 'bg-teal-500/10 text-teal-400',
        ai_interview_pending: 'bg-purple-500/10 text-purple-400',
        ai_interview_passed: 'bg-indigo-500/10 text-indigo-400',
        real_interview_scheduled: 'bg-orange-500/10 text-orange-400',
        offered: 'bg-cyan-500/10 text-cyan-400',
        hired: 'bg-green-500/10 text-green-500',
        rejected: 'bg-red-500/10 text-red-400',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${map[stage] || 'bg-secondary text-muted-foreground'}`}>
            {stage.replace(/_/g, ' ')}
        </span>
    );
};

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreBar = ({ label, value, color = 'bg-emerald-500' }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold">{(value * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
                className={`h-full ${color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />
        </div>
    </div>
);

// ─── Candidate card ───────────────────────────────────────────────────────────
function CandidateCard({ app, rank, onUpdateStatus }) {
    const [expanded, setExpanded] = useState(false);
    const sr      = app.stage_results?.shortlist;
    const resume  = app.resume_details  || {};
    const cand    = app.candidate_details || {};

    const displayName = resume.candidate_name
        || [cand.first_name, cand.last_name].filter(Boolean).join(' ')
        || cand.email
        || 'Candidate';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.04 }}
            className="glass border border-emerald-500/10 hover:border-emerald-500/25 rounded-[2rem] overflow-hidden transition-all"
        >
            {/* Main row */}
            <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Rank badge */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0
                    ${rank === 1 ? 'bg-yellow-400/20 text-yellow-400' :
                      rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                      rank === 3 ? 'bg-orange-400/20 text-orange-400' :
                                   'bg-secondary text-muted-foreground'}`}
                >
                    #{rank}
                </div>

                {/* Avatar + info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0">
                        <HiOutlineUserCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate">{displayName}</h3>
                        <p className="text-xs text-muted-foreground truncate">{cand.email}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {resume.current_location && (
                                <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />{resume.current_location}</span>
                            )}
                            {resume.years_experience != null && (
                                <span className="flex items-center gap-1 font-bold text-emerald-500/80">
                                    <HiOutlineBriefcase className="w-3.5 h-3.5" />{resume.years_experience} yrs exp
                                </span>
                            )}
                            {resume.education_level && (
                                <span className="flex items-center gap-1"><HiOutlineAcademicCap className="w-3.5 h-3.5" />{resume.education_level}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Score */}
                <div className="flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">AI Score</span>
                    {app.shortlist_score != null ? (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-emerald-500">
                                {(app.shortlist_score * 100).toFixed(0)}%
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Pending</span>
                    )}
                </div>

                {/* Stage */}
                <div className="min-w-[140px] text-center">
                    <StageBadge stage={app.current_stage} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdateStatus(app.application_id, 'rejected')}
                        className="p-2.5 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/15 border border-red-500/10 transition-all"
                        title="Reject"
                    >
                        <HiOutlineXCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onUpdateStatus(app.application_id, 'shortlisted')}
                        className="p-2.5 rounded-xl bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/10 transition-all"
                        title="Advance"
                    >
                        <HiOutlineCheckCircle className="w-5 h-5" />
                    </button>
                    {sr && (
                        <button
                            onClick={() => setExpanded(x => !x)}
                            className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all"
                            title="Score breakdown"
                        >
                            <HiOutlineArrowTrendingUp className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded score breakdown */}
            <AnimatePresence>
                {expanded && sr && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-emerald-500/5"
                    >
                        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-500/2">
                            <ScoreBar label="Skills Match" value={sr.skills_score ?? 0} color="bg-emerald-500" />
                            <ScoreBar label="Work Experience" value={sr.workexp_score ?? 0} color="bg-blue-500" />
                            <ScoreBar label="Projects" value={sr.projects_score ?? 0} color="bg-purple-500" />
                            <ScoreBar label="Summary" value={sr.summary_score ?? 0} color="bg-orange-400" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RecruiterApplicationsPage() {
    const [myJobs, setMyJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingApps, setLoadingApps] = useState(false);
    const [shortlisting, setShortlisting] = useState(false);
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

    const handleShortlist = async () => {
        if (!selectedJobId) return;
        setShortlisting(true);
        setError('');
        try {
            const result = await api.post(`/applications/job/${selectedJobId}/shortlist/`, {});
            // Refresh applications list to show new scores
            const data = await api.get(`/applications/job/${selectedJobId}/`);
            setApplications(data);
            alert(`✅ ${result.message}`);
        } catch (err) {
            setError(err.message || 'AI analysis failed');
        } finally {
            setShortlisting(false);
        }
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        try {
            await api.patch(`/applications/${appId}/status/`, { status: newStatus });
            const data = await api.get(`/applications/job/${selectedJobId}/`);
            setApplications(data);
        } catch (err) {
            alert('Failed to update status');
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
            <div>
                <h1 className="text-3xl font-black tracking-tight">Candidate Pipeline</h1>
                <p className="text-muted-foreground mt-1">AI-powered recruitment for your open positions</p>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
                    {error}
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

                    {/* ── Left: Job selector panel ─────────────────────────── */}
                    <div className="glass border border-emerald-500/10 rounded-[2.5rem] overflow-hidden">
                        <div className="p-6 border-b border-emerald-500/5 bg-emerald-500/3">
                            <h2 className="font-black text-sm uppercase tracking-widest opacity-50">Your Positions</h2>
                        </div>
                        <div className="divide-y divide-emerald-500/5">
                            {myJobs.map(job => (
                                <button
                                    key={job.job_id}
                                    onClick={() => { setSelectedJobId(job.job_id); setStageFilter('all'); }}
                                    className={`w-full text-left p-5 transition-all hover:bg-emerald-500/5 ${selectedJobId === job.job_id ? 'bg-emerald-500/8 border-l-2 border-emerald-500' : ''}`}
                                >
                                    <p className="font-bold truncate">{job.job_title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{job.organization}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-xs font-black text-emerald-500">{job.total_applications} applicants</span>
                                        <span className="text-xs text-muted-foreground">{job.shortlisted_count} shortlisted</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

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
                                    onClick={handleShortlist}
                                    disabled={shortlisting || selectedJob.total_applications === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 shrink-0"
                                >
                                    {shortlisting ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                                    ) : (
                                        <><HiOutlineSparkles className="w-5 h-5" /> Run AI Shortlist</>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Stage filter tabs */}
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'applied', 'shortlisted', 'coding_pending', 'rejected'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStageFilter(s)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        stageFilter === s
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
        </div>
    );
}
