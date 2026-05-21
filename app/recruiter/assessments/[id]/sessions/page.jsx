'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineUserGroup, HiOutlineChevronLeft, HiOutlineMagnifyingGlass,
    HiOutlineFunnel, HiOutlineClock,
    HiOutlineCheckCircle, HiOutlineMinusCircle,
    HiOutlinePlayCircle, HiOutlineDocumentText, HiOutlineAcademicCap,
    HiOutlineArrowTopRightOnSquare, HiOutlineArrowPath,
    HiOutlineEnvelope, HiOutlineSparkles,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const STATUS_META = {
    pending:     { icon: HiOutlineMinusCircle,  label: 'Pending',     className: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    in_progress: { icon: HiOutlinePlayCircle,   label: 'In progress', className: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    submitted:   { icon: HiOutlineDocumentText, label: 'Submitted',   className: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    evaluated:   { icon: HiOutlineCheckCircle,  label: 'Evaluated',   className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
};

const FILTERS = [
    { key: 'all', label: 'All', hint: 'Show every candidate' },
    { key: 'pending', label: 'Pending', hint: 'Invited but not started' },
    { key: 'in_progress', label: 'In progress', hint: 'Currently taking the test' },
    { key: 'submitted', label: 'Submitted', hint: 'Waiting for evaluation' },
    { key: 'evaluated', label: 'Evaluated', hint: 'Scored and ready to review' },
];

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
    const offset = percentage != null ? circ - (percentage / 100) * circ : circ;
    const { stroke } = getScoreRing(percentage);

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }} title={percentage !== null ? `Score: ${Math.round(percentage)}%` : 'Not scored yet'}>
            <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
                {percentage != null && (
                    <circle cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={stroke} strokeWidth={strokeWidth}
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out" />
                )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[10px] font-semibold ${getScoreColor(percentage)}`}>
                    {percentage != null ? `${Math.round(percentage)}%` : '—'}
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
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            api.get(`/assessments/${id}/`),
            api.get(`/assessments/${id}/submissions/`),
        ])
            .then(([assessData, submissionsData]) => {
                setAssessment(assessData);
                setSubmissions(submissionsData);
                setError('');
            })
            .catch(() => setError('We could not load the sessions for this assessment. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [id, attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

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
        passed: submissions.filter(s => s.percentage != null && s.percentage >= (assessment?.passing_score ?? 70)).length,
    };

    const statCards = [
        { label: 'Total invited', value: stats.total, icon: HiOutlineUserGroup, color: 'text-blue-500', tone: 'bg-blue-500/10', hint: 'Candidates invited to this assessment' },
        { label: 'Completed', value: stats.evaluated, icon: HiOutlineCheckCircle, color: 'text-emerald-500', tone: 'bg-emerald-500/10', hint: 'Sessions that have been scored' },
        { label: 'In progress', value: stats.in_progress, icon: HiOutlinePlayCircle, color: 'text-amber-500', tone: 'bg-amber-500/10', hint: 'Candidates taking the test now' },
        { label: 'Passed', value: stats.passed, icon: HiOutlineAcademicCap, color: 'text-emerald-500', tone: 'bg-emerald-500/10', hint: 'Scores at or above the pass mark' },
    ];

    if (loading) return <PageSkeleton stats={4} cards={2} />;

    const filtersActive = search || statusFilter !== 'all';

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            <DashboardBanner
                icon={HiOutlineUserGroup}
                badge={{ label: `${stats.total} ${stats.total === 1 ? 'candidate' : 'candidates'}`, icon: HiOutlineUserGroup }}
                title="Sessions"
                subtitle={`${assessment?.title || 'Assessment'} · Pass mark ${assessment?.passing_score || 70}%`}
                footer={stats.evaluated < stats.total
                    ? 'Next step: open an evaluated session to review answers, or wait for in-progress candidates to submit.'
                    : stats.total === 0
                        ? 'Next step: invite candidates to this assessment. Their sessions will appear here.'
                        : 'Next step: all sessions are scored. Open any row to review the breakdown.'}
            />

            <div className="flex items-center gap-3">
                <button onClick={() => router.push('/recruiter/assessments')}
                    title="Back to assessments" aria-label="Back to assessments"
                    className="group shrink-0 rounded-xl border border-border bg-secondary p-3 transition-all hover:bg-emerald-500/10 hover:text-emerald-500">
                    <HiOutlineChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                </button>
                <p className="text-sm text-muted-foreground">Back to all assessments</p>
            </div>

            {/* ── Stat cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        title={stat.hint}
                        className="rounded-xl border border-border bg-card p-4 lg:p-5"
                    >
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.tone}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
                            </span>
                        </div>
                        <motion.span
                            key={stat.value}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`block text-2xl font-semibold ${stat.color}`}
                        >
                            {stat.value}
                        </motion.span>
                    </motion.div>
                ))}
            </div>

            {/* ── Error ──────────────────────────────────────────────── */}
            {error && (
                <div className="space-y-3">
                    <FormError title="Could not load sessions" message={error} />
                    <button type="button" onClick={retry} title="Load sessions again"
                        className="-mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary">
                        <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
                    </button>
                </div>
            )}

            {/* ── Filters ────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="group relative flex-1">
                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-500" aria-hidden="true" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email"
                        aria-label="Search candidates by name or email"
                        title="Search by candidate name or email"
                        className="w-full rounded-xl border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-secondary/50 p-1 [scrollbar-width:none]">
                    {FILTERS.map(f => {
                        const active = statusFilter === f.key;
                        const meta = STATUS_META[f.key];
                        const Icon = meta?.icon || HiOutlineFunnel;
                        return (
                            <button key={f.key} onClick={() => setStatusFilter(f.key)} title={f.hint}
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                                    active
                                        ? 'border border-border bg-card text-emerald-500 shadow-sm'
                                        : 'text-muted-foreground hover:bg-card/50 hover:text-emerald-500'
                                }`}>
                                <Icon className="h-3 w-3" aria-hidden="true" />
                                {f.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Candidate list ─────────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                        <HiOutlineUserGroup className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-lg font-semibold tracking-tight">Candidates</h2>
                    <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{filtered.length} of {submissions.length}</span>
                </div>

                {filtered.length === 0 && !loading && (
                    <EmptyState
                        icon={filtersActive ? HiOutlineMagnifyingGlass : HiOutlineUserGroup}
                        title={filtersActive ? 'No matching candidates' : 'No sessions yet'}
                        text={filtersActive
                            ? 'Try a different search or clear the status filter.'
                            : 'Invite candidates to this assessment and their sessions will show up here.'}
                    />
                )}

                <AnimatePresence mode="popLayout">
                    {filtered.map((sub, i) => {
                        const StatusIcon = STATUS_META[sub.status]?.icon || HiOutlineMinusCircle;
                        const statusClass = STATUS_META[sub.status]?.className || 'text-muted-foreground bg-secondary/50 border-border';
                        const isPending = sub.status === 'pending';
                        return (
                            <motion.div
                                key={sub.submission_id}
                                layout
                                initial={{ opacity: 0, scale: 0.98, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -16 }}
                                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                                role={isPending ? undefined : 'link'}
                                tabIndex={isPending ? -1 : 0}
                                onClick={() => !isPending && router.push(`/recruiter/assessments/${id}/sessions/${sub.submission_id}`)}
                                onKeyDown={(e) => { if (!isPending && e.key === 'Enter') router.push(`/recruiter/assessments/${id}/sessions/${sub.submission_id}`); }}
                                title={isPending ? 'This candidate has not started yet' : 'Open this candidate\'s session'}
                                className={`group relative flex items-center gap-4 rounded-xl border bg-card p-5 transition-all lg:p-6 ${
                                    isPending
                                        ? 'cursor-not-allowed border-border/60 opacity-60'
                                        : 'cursor-pointer border-border hover:border-emerald-500/30 active:scale-[0.99]'
                                }`}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold text-white ${
                                        isPending ? 'bg-muted-foreground/30' : 'bg-emerald-600'
                                    }`}>
                                        {getCandidateInitial(sub.candidate_name, sub.candidate_email)}
                                    </div>
                                    <motion.div
                                        initial={false}
                                        animate={sub.status === 'evaluated' ? { scale: [1, 1.2, 1] } : {}}
                                        transition={{ duration: 0.3 }}
                                        title={STATUS_META[sub.status]?.label || sub.status}
                                        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-card"
                                    >
                                        <StatusIcon className={`h-3 w-3 ${statusClass.split(' ')[0]}`} aria-hidden="true" />
                                    </motion.div>
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h3 className="max-w-[200px] truncate text-base font-semibold md:max-w-[300px]">
                                            {sub.candidate_name || 'Unknown candidate'}
                                        </h3>
                                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${statusClass}`}>
                                            <StatusIcon className="h-3 w-3" aria-hidden="true" />
                                            {STATUS_META[sub.status]?.label || sub.status}
                                        </span>
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span className="inline-flex min-w-0 items-center gap-1">
                                            <HiOutlineEnvelope className="h-3 w-3 shrink-0" aria-hidden="true" />
                                            <span className="truncate max-w-[180px] md:max-w-[280px]">{sub.candidate_email}</span>
                                        </span>
                                        {sub.time_taken_minutes != null && (
                                            <span title="Time taken" className="inline-flex shrink-0 items-center gap-1">
                                                <HiOutlineClock className="h-3 w-3" aria-hidden="true" />
                                                {sub.time_taken_minutes}m
                                            </span>
                                        )}
                                        {sub.submitted_at && (
                                            <span title="Submitted on" className="inline-flex shrink-0 items-center gap-1">
                                                <HiOutlineSparkles className="h-3 w-3" aria-hidden="true" />
                                                {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="flex shrink-0 items-center gap-3">
                                    {isPending ? (
                                        <div title="Not started" className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-border/40 bg-muted/30">
                                            <HiOutlineMinusCircle className="h-5 w-5 text-muted-foreground/40" aria-hidden="true" />
                                        </div>
                                    ) : sub.status === 'evaluated' ? (
                                        <ScoreRing percentage={sub.percentage} size={52} />
                                    ) : (
                                        <div title={sub.status === 'in_progress' ? 'In progress' : 'Waiting for evaluation'}
                                            className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-border bg-secondary/50">
                                            <HiOutlineClock className={`h-5 w-5 ${sub.status === 'in_progress' ? 'text-blue-500' : 'text-muted-foreground'}`} aria-hidden="true" />
                                        </div>
                                    )}
                                    <HiOutlineArrowTopRightOnSquare className={`h-4 w-4 shrink-0 transition-colors ${
                                        isPending ? 'text-muted-foreground/10' : 'text-muted-foreground/40 group-hover:text-emerald-500'
                                    }`} aria-hidden="true" />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </section>
        </div>
    );
}
