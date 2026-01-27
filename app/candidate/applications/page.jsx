'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineDocumentText,
    HiOutlineBuildingOffice2,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineArrowPath,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineBeaker,
    HiOutlineSparkles,
    HiOutlineMapPin,
    HiOutlineCurrencyDollar,
} from 'react-icons/hi2';
import Link from 'next/link';

const STAGE_CONFIG = {
    applied:                  { color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Application Received' },
    shortlisted:              { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Shortlisted by AI' },
    coding_pending:           { color: 'text-yellow-500',  bg: 'bg-yellow-500/10',  label: 'Coding Test Pending' },
    coding_passed:            { color: 'text-teal-500',    bg: 'bg-teal-500/10',    label: 'Coding Test Passed' },
    ai_interview_pending:     { color: 'text-purple-400',  bg: 'bg-purple-500/10',  label: 'AI Interview Pending' },
    ai_interview_passed:      { color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  label: 'AI Interview Passed' },
    real_interview_scheduled: { color: 'text-orange-400',  bg: 'bg-orange-500/10',  label: 'Interview Scheduled' },
    offered:                  { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    label: 'Offer Extended' },
    hired:                    { color: 'text-green-500',   bg: 'bg-green-500/10',   label: 'Hired! 🎉' },
    rejected:                 { color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Not Selected' },
};

function ScoreBreakdown({ stageResults }) {
    const sr = stageResults?.shortlist;
    if (!sr) return null;
    return (
        <div className="mt-4 p-4 rounded-2xl bg-secondary/50 border border-emerald-500/10 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest opacity-50">AI Match Breakdown</p>
            {[
                { label: 'Skills', value: sr.skills_score },
                { label: 'Work Experience', value: sr.workexp_score },
                { label: 'Projects', value: sr.projects_score },
                { label: 'Summary', value: sr.summary_score },
            ].map(({ label, value }) => value != null && (
                <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-bold">{(value * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${value * 100}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ApplicationCard({ app, index }) {
    const [expanded, setExpanded] = useState(false);
    const stage = STAGE_CONFIG[app.current_stage] || STAGE_CONFIG.applied;
    const hasScore = app.shortlist_score != null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/25 transition-all overflow-hidden"
        >
            {/* Card Header */}
            <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <HiOutlineBuildingOffice2 className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate group-hover:text-emerald-500 transition-colors">
                            {app.job_details?.job_title || 'Position'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <HiOutlineBuildingOffice2 className="w-3.5 h-3.5" />
                                {app.job_details?.organization_name || 'Organization'}
                            </span>
                            {app.job_details?.location && (
                                <span className="flex items-center gap-1">
                                    <HiOutlineMapPin className="w-3.5 h-3.5" />{app.job_details.location}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <HiOutlineClock className="w-3.5 h-3.5" />
                                Applied {new Date(app.applied_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0">
                    {/* AI Score */}
                    {hasScore && (
                        <div className="text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">AI Score</div>
                            <div className="text-xl font-black text-emerald-500 mt-0.5">
                                {(app.shortlist_score * 100).toFixed(0)}%
                            </div>
                        </div>
                    )}

                    {/* Stage badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${stage.bg} ${stage.color}`}>
                        {app.current_stage === 'rejected' ? <HiOutlineXCircle className="w-3.5 h-3.5" /> :
                         app.current_stage === 'shortlisted' || app.current_stage === 'hired' ? <HiOutlineCheckCircle className="w-3.5 h-3.5" /> :
                         app.current_stage === 'coding_pending' ? <HiOutlineBeaker className="w-3.5 h-3.5" /> :
                         <HiOutlineArrowPath className="w-3.5 h-3.5" />}
                        {stage.label}
                    </div>

                    {/* Expand toggle */}
                    <button
                        onClick={() => setExpanded(x => !x)}
                        className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all"
                    >
                        {expanded ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Expanded detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-emerald-500/5"
                    >
                        <div className="p-6 bg-secondary/20 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</p>
                                    <p className="font-bold mt-0.5 capitalize">{app.status.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Stage</p>
                                    <p className={`font-bold mt-0.5 ${stage.color}`}>{stage.label}</p>
                                </div>
                                {app.shortlist_rank && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">AI Rank</p>
                                        <p className="font-bold mt-0.5">#{app.shortlist_rank}</p>
                                    </div>
                                )}
                            </div>

                            {/* AI Score Breakdown */}
                            {hasScore && <ScoreBreakdown stageResults={app.stage_results} />}

                            {/* Coding assessment CTA */}
                            {app.current_stage === 'coding_pending' && (
                                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <HiOutlineBeaker className="w-5 h-5 text-yellow-500" />
                                        <p className="text-sm font-bold text-yellow-500">You have a coding assessment waiting!</p>
                                    </div>
                                    <Link href="/candidate/assessments"
                                        className="px-4 py-2 rounded-xl bg-yellow-500 text-black text-xs font-black shrink-0 hover:bg-yellow-400 transition-all">
                                        Take Test →
                                    </Link>
                                </div>
                            )}

                            {/* Rejection note */}
                            {app.current_stage === 'rejected' && app.rejection_reason && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">Feedback</p>
                                    <p className="text-sm text-muted-foreground">{app.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function CandidateApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const data = await api.get('/applications/');
                setApplications(data);
            } catch {
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const activeCount  = applications.filter(a => !['rejected', 'hired'].includes(a.status)).length;
    const pendingTests = applications.filter(a => a.current_stage === 'coding_pending').length;

    const filtered = filter === 'all' ? applications
        : applications.filter(a => a.current_stage === filter || a.status === filter);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-black">My Applications</h1>
                <p className="text-muted-foreground mt-1">Track your pipeline across all applied positions</p>
            </div>

            {/* Summary stats */}
            {applications.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Applied', value: applications.length, color: 'text-foreground' },
                        { label: 'Active', value: activeCount, color: 'text-blue-400' },
                        { label: 'Tests Pending', value: pendingTests, color: 'text-yellow-500' },
                        { label: 'Shortlisted', value: applications.filter(a => a.current_stage === 'shortlisted').length, color: 'text-emerald-500' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="glass p-5 rounded-[2rem] border border-emerald-500/10 text-center">
                            <div className={`text-3xl font-black ${color}`}>{value}</div>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'applied', 'shortlisted', 'coding_pending', 'rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            filter === f ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }`}>
                        {f === 'all' ? `All (${applications.length})` : f.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.map((app, i) => <ApplicationCard key={app.application_id} app={app} index={i} />)}
                {filtered.length === 0 && !loading && (
                    <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                        <HiOutlineDocumentText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Applications</h3>
                        <p className="text-muted-foreground mt-2 mb-8">
                            {filter === 'all' ? "You haven't applied to any jobs yet." : `No applications in the "${filter}" stage.`}
                        </p>
                        {filter === 'all' && (
                            <Link href="/candidate/jobs" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl">
                                Browse Jobs
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
