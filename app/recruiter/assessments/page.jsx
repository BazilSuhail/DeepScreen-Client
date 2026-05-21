'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
    HiOutlinePlus,
    HiOutlineBeaker,
    HiOutlineSparkles,
    HiOutlineMagnifyingGlass,
    HiOutlineCommandLine,
    HiOutlineUserGroup,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineBriefcase,
    HiOutlinePencilSquare,
    HiOutlineArchiveBox,
    HiOutlineQuestionMarkCircle,
    HiOutlineArrowPath,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const pageSpacing = 'mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8';

function SectionHeader({ icon: Icon, tone, title, count }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{count}</span>
        </div>
    );
}

function AssessmentRow({ assessment, index, onEdit, onArchive, onSessions }) {
    const active = assessment.is_active;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="group flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/5 md:flex-row md:items-center md:justify-between lg:p-6"
        >
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <span
                    title="Coding assessment"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-105"
                >
                    <HiOutlineBeaker className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="max-w-[25ch] truncate text-base font-semibold">{assessment.title}</h3>
                        <span
                            title={active ? 'Open to candidates' : 'Archived: active candidates can still finish it'}
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                active
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                                    : 'border-border bg-secondary text-muted-foreground'
                            }`}
                        >
                            {active ? 'Active' : 'Archived'}
                        </span>
                    </div>
                    {assessment.job_title && (
                        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                            <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">For: {assessment.job_title}</span>
                        </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                        <span title="Time limit" className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-0.5">
                            <HiOutlineClock className="h-3 w-3" aria-hidden="true" />{assessment.duration_minutes} min
                        </span>
                        <span title="Score needed to pass" className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-0.5">
                            <HiOutlineQuestionMarkCircle className="h-3 w-3" aria-hidden="true" />Pass: {assessment.passing_score}%
                        </span>
                        <span title="Number of questions" className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-0.5">
                            <HiOutlineCommandLine className="h-3 w-3" aria-hidden="true" />{assessment.questions_count || 0} questions
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={() => onSessions(assessment)}
                    title="View candidate sessions for this assessment"
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20 active:scale-95"
                >
                    <HiOutlineUserGroup className="h-3.5 w-3.5" aria-hidden="true" /> Sessions
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(assessment)}
                    title="Edit questions and settings"
                    aria-label="Edit assessment"
                    className="rounded-lg border border-transparent bg-secondary/50 p-2.5 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500"
                >
                    <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => onArchive(assessment.assessment_id)}
                    title="Archive this assessment"
                    aria-label="Archive assessment"
                    className="rounded-lg border border-transparent bg-secondary/50 p-2.5 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                >
                    <HiOutlineArchiveBox className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </motion.div>
    );
}

export default function RecruiterAssessmentsPage() {
    const router = useRouter();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [search, setSearch] = useState('');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const assessData = await api.get('/assessments/');
                if (isMounted) setAssessments(assessData);
            } catch (err) {
                console.error('Fetch error:', err);
                if (isMounted) setError('We could not load your assessments. Check your connection and try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const handleArchive = async (id) => {
        if (!confirm('Archive this assessment? Active candidates will still be able to complete it.')) return;
        try {
            await api.patch(`/assessments/${id}/`, { is_active: false });
            setAssessments(prev => prev.map(a => a.assessment_id === id ? { ...a, is_active: false } : a));
            setSuccessMsg('Assessment moved to archives.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setError('The assessment could not be archived. Try again.');
        }
    };

    const filteredAssessments = assessments.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.job_title?.toLowerCase().includes(search.toLowerCase())
    );

    const activeAssessments = assessments.filter(a => a.is_active !== false).length;
    const totalQuestions = assessments.reduce((sum, a) => sum + (a.questions_count || 0), 0);
    const totalSessions = assessments.reduce((sum, a) => sum + (a.session_count || 0), 0);

    if (loading) return <PageSkeleton stats={3} cards={2} />;

    const statCards = [
        { label: 'Total assessments', value: assessments.length, icon: HiOutlineBeaker, tone: 'bg-purple-500/10 text-purple-500', hint: 'Every assessment you have created' },
        { label: 'Active', value: activeAssessments, icon: HiOutlineCheckCircle, tone: 'bg-emerald-500/10 text-emerald-500', hint: 'Assessments open to candidates' },
        { label: 'Candidate sessions', value: totalSessions, icon: HiOutlineUserGroup, tone: 'bg-blue-500/10 text-blue-500', hint: 'Attempts across all assessments' },
    ];

    return (
        <div className={pageSpacing}>
            <DashboardBanner
                icon={HiOutlineCommandLine}
                badge={{ label: `${assessments.length} ${assessments.length === 1 ? 'assessment' : 'assessments'}`, icon: HiOutlineBeaker }}
                title="Assessments"
                subtitle={`${activeAssessments} active · ${totalQuestions} questions · ${totalSessions} candidate ${totalSessions === 1 ? 'session' : 'sessions'}`}
                footer={assessments.length === 0
                    ? 'Next step: create your first assessment and link it to a job opening.'
                    : 'Next step: open Sessions to review candidate results, or Edit to change questions.'}
            />

            {error && (
                <div className="space-y-3">
                    <FormError
                        title="Something went wrong"
                        message={error}
                    />
                    {assessments.length === 0 && (
                        <button
                            type="button"
                            onClick={retry}
                            title="Load assessments again"
                            className="-mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary"
                        >
                            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
                        </button>
                    )}
                </div>
            )}
            {successMsg && (
                <motion.div
                    role="status"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-sm font-semibold text-emerald-500"
                >
                    <HiOutlineSparkles className="h-5 w-5 shrink-0" aria-hidden="true" /> {successMsg}
                </motion.div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        title={stat.hint}
                        className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 lg:p-6"
                    >
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                            <stat.icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                            <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SectionHeader
                        icon={HiOutlineBeaker}
                        tone="bg-emerald-500/10 text-emerald-500"
                        title="All assessments"
                        count={`${filteredAssessments.length} of ${assessments.length}`}
                    />
                    <button
                        type="button"
                        onClick={() => router.push('/recruiter/assessments/create')}
                        title="Create a new coding, MCQ or written assessment"
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95"
                    >
                        <HiOutlinePlus className="h-5 w-5" aria-hidden="true" /> Create New
                    </button>
                </div>

                <div className="relative">
                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by title, description or job"
                        aria-label="Search assessments"
                        title="Search by title, description or job"
                        className="w-full rounded-xl border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredAssessments.map((a, i) => (
                        <AssessmentRow
                            key={a.assessment_id}
                            assessment={a}
                            index={i}
                            onEdit={(assessment) => router.push(`/recruiter/assessments/${assessment.assessment_id}`)}
                            onArchive={handleArchive}
                            onSessions={(assessment) => router.push(`/recruiter/assessments/${assessment.assessment_id}/sessions`)}
                        />
                    ))}

                    {filteredAssessments.length === 0 && (
                        <EmptyState
                            icon={HiOutlineBeaker}
                            title={search ? 'No matching assessments' : 'No assessments yet'}
                            text={search
                                ? 'Try a different title, description or job name.'
                                : 'Create your first assessment, then add coding, MCQ or written questions.'}
                            action={!search && (
                                <button
                                    type="button"
                                    onClick={() => router.push('/recruiter/assessments/create')}
                                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-emerald-500"
                                >
                                    <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create New
                                </button>
                            )}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
