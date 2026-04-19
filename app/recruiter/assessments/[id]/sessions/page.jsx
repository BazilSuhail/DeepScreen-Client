'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineUserGroup, HiOutlineChevronLeft, HiOutlineMagnifyingGlass,
    HiOutlineFunnel, HiOutlineClock, HiOutlineChartBar,
    HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineMinusCircle,
    HiOutlinePlayCircle, HiOutlineDocumentText, HiOutlineAcademicCap,
    HiOutlineArrowTopRightOnSquare, HiOutlineSparkles, HiOutlineBeaker,
    HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const STATUS_META = {
    pending:     { icon: HiOutlineMinusCircle,  label: 'Pending',     className: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    in_progress: { icon: HiOutlinePlayCircle,   label: 'In Progress', className: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    submitted:   { icon: HiOutlineDocumentText, label: 'Submitted',   className: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    evaluated:   { icon: HiOutlineCheckCircle,  label: 'Evaluated',   className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
};

function getCandidateInitial(name, email) {
    if (name && name.length > 0) {
        const parts = name.split(' ');
        return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
    }
    return email ? email[0].toUpperCase() : '?';
}

function getScoreColor(percentage) {
    if (percentage === null || percentage === undefined) return 'text-muted-foreground';
    if (percentage >= 80) return 'text-emerald-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
}

function getScoreRing(percentage) {
    if (percentage === null || percentage === undefined) return { stroke: '#64748b', dash: '' };
    if (percentage >= 80) return { stroke: '#10b981' };
    if (percentage >= 60) return { stroke: '#f59e0b' };
    return { stroke: '#ef4444' };
}

function ScoreRing({ percentage, size = 48, strokeWidth = 4 }) {
    const radius = (size - strokeWidth) / 2;
    const circ = radius * 2 * Math.PI;
    const offset = percentage !== null ? circ - (percentage / 100) * circ : circ;
    const { stroke } = getScoreRing(percentage);

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
                {percentage !== null && (
                    <circle cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={stroke} strokeWidth={strokeWidth}
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out" />
                )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[10px] font-black ${getScoreColor(percentage)}`}>
                    {percentage !== null ? `${Math.round(percentage)}%` : '—'}
                </span>
            </div>
        </div>
    );
}

export default function AssessmentSessionsPage() {
    const router = useRouter();
    const { id } = useParams();

    const [assessment, setAssessment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!id) return;
        Promise.all([
            api.get(`/assessments/${id}/`),
            api.get(`/assessments/${id}/submissions/`),
        ])
            .then(([assessData, submissionsData]) => {
                setAssessment(assessData);
                setSubmissions(submissionsData);
            })
            .catch(() => setError('Failed to load session data'))
            .finally(() => setLoading(false));
    }, [id]);

    const filtered = submissions.filter(s => {
        const q = search.toLowerCase();
        const nameMatch = (s.candidate_name || '').toLowerCase().includes(q);
        const emailMatch = (s.candidate_email || '').toLowerCase().includes(q);
        const statusMatch = statusFilter === 'all' || s.status === statusFilter;
        return (nameMatch || emailMatch) && statusMatch;
    });

    const stats = {
        total: submissions.length,
        evaluated: submissions.filter(s => s.status === 'evaluated').length,
        in_progress: submissions.filter(s => s.status === 'in_progress').length,
        passed: submissions.filter(s => s.percentage >= (assessment?.passing_score || 70)).length,
    };

    const statCards = [
        { label: 'Total Invited', value: stats.total, icon: HiOutlineUserGroup, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Completed', value: stats.evaluated, icon: HiOutlineCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'In Progress', value: stats.in_progress, icon: HiOutlinePlayCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Passed', value: stats.passed, icon: HiOutlineAcademicCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500" />
                <HiOutlineUserGroup className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="w-full px-4 md:px-6 space-y-8 pt-10">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push(`/recruiter/assessments`)}
                        className="p-3 rounded-xl bg-secondary border border-border transition-all hover:bg-emerald-500/10 hover:text-emerald-500 group shrink-0">
                        <HiOutlineChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Sessions</h1>
                            <motion.span
                                key={stats.total}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20"
                            >
                                {stats.total} candidate{stats.total !== 1 ? 's' : ''}
                            </motion.span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {assessment?.title || 'Assessment'} &middot; Passing: {assessment?.passing_score || 70}%
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="relative overflow-hidden bg-card border border-border rounded-xl p-4 group"
                    >
                        <div className={`absolute top-0 right-0 w-20 h-20 -translate-y-6 translate-x-6 rounded-full ${stat.bg} opacity-30 group-hover:opacity-50 transition-opacity`} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <motion.span
                                key={stat.value}
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`text-2xl font-black ${stat.color}`}
                            >
                                {stat.value}
                            </motion.span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Filters ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all text-sm" />
                </div>
                <div className="flex gap-1.5 p-1 bg-secondary/50 rounded-xl border border-border overflow-x-auto scrollbar-none">
                    {['all', 'pending', 'in_progress', 'submitted', 'evaluated'].map(s => {
                        const active = statusFilter === s;
                        const meta = STATUS_META[s];
                        const Icon = meta?.icon || HiOutlineFunnel;
                        return (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                                    active
                                        ? 'bg-card shadow-sm text-emerald-500 border border-border'
                                        : 'text-muted-foreground hover:text-emerald-500 hover:bg-card/50'
                                }`}>
                                <Icon className="w-3 h-3" />
                                {s === 'all' ? 'All' : meta?.label || s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Error ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold flex items-center gap-2.5">
                        <HiOutlineExclamationTriangle className="w-5 h-5" /> {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Candidate Cards ────────────────────────────────────── */}
            <AnimatePresence mode="popLayout">
                {filtered.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="col-span-full py-24 text-center bg-card border border-dashed border-border rounded-2xl">
                        <HiOutlineUserGroup className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
                        <h3 className="text-xl font-bold text-muted-foreground/40">{search || statusFilter !== 'all' ? 'No Matching Candidates' : 'No Sessions Yet'}</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            {search || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Invite candidates to this assessment to see their sessions'}
                        </p>
                    </motion.div>
                )}

                {filtered.map((sub, i) => {
                    const StatusIcon = STATUS_META[sub.status]?.icon || HiOutlineMinusCircle;
                    const statusClass = STATUS_META[sub.status]?.className || 'text-muted-foreground bg-secondary/50 border-border';
                    return (
                        <motion.div
                            key={sub.submission_id}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={() => router.push(`/recruiter/assessments/${id}/sessions/${sub.submission_id}`)}
                            className="relative bg-card border border-border hover:border-emerald-500/30 rounded-xl p-4 md:p-5 flex items-center gap-4 cursor-pointer transition-all group active:scale-[0.99]"
                        >
                            {/* Accent glow on hover */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/[0.02] group-hover:via-emerald-500/[0.01] group-hover:to-emerald-500/0 transition-all pointer-events-none" />

                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-600/20">
                                    {getCandidateInitial(sub.candidate_name, sub.candidate_email)}
                                </div>
                                <motion.div
                                    initial={false}
                                    animate={sub.status === 'evaluated' ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-card flex items-center justify-center"
                                >
                                    <StatusIcon className={`w-3 h-3 ${statusClass.split(' ')[0]}`} />
                                </motion.div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="font-bold text-base truncate max-w-[200px] md:max-w-[300px]">
                                        {sub.candidate_name || 'Unknown Candidate'}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${statusClass}`}>
                                        {STATUS_META[sub.status]?.label || sub.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                    <span className="truncate max-w-[180px] md:max-w-[280px]">{sub.candidate_email}</span>
                                    {sub.time_taken_minutes && (
                                        <span className="inline-flex items-center gap-1 shrink-0">
                                            <HiOutlineClock className="w-3 h-3" />
                                            {sub.time_taken_minutes}m
                                        </span>
                                    )}
                                    {sub.submitted_at && (
                                        <span className="shrink-0">
                                            {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Score ring */}
                            <div className="flex items-center gap-3 shrink-0">
                                {sub.status === 'evaluated' ? (
                                    <ScoreRing percentage={sub.percentage} size={52} />
                                ) : (
                                    <div className="w-[52px] h-[52px] rounded-full bg-secondary/50 border border-border flex items-center justify-center">
                                        <HiOutlineClock className={`w-5 h-5 ${sub.status === 'in_progress' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                    </div>
                                )}
                                <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-muted-foreground/30 group-hover:text-emerald-500 transition-colors shrink-0" />
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
