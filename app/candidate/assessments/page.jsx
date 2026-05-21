'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import {
  HiOutlineBeaker, HiOutlineCommandLine, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle, HiOutlineExclamationTriangle,
  HiOutlineChartBar, HiOutlineXMark, HiOutlineCalendar, HiOutlinePlay,
  HiOutlineBriefcase,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';

const statusStyles = {
  pending:     'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  submitted:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  evaluated:   'bg-teal-500/10 text-teal-500 border-teal-500/20',
  passed:      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  failed:      'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusIcon = {
  pending:     <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" />,
  in_progress: <HiOutlineClock className="h-4 w-4" aria-hidden="true" />,
  submitted:   <HiOutlineChartBar className="h-4 w-4" aria-hidden="true" />,
  evaluated:   <HiOutlineChartBar className="h-4 w-4" aria-hidden="true" />,
  passed:      <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />,
  failed:      <HiOutlineExclamationTriangle className="h-4 w-4" aria-hidden="true" />,
};

const pageSpacing = 'mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8';

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function SectionHeader({ icon: Icon, tone, title, count }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{count}</span>
    </div>
  );
}

function AssessmentRow({ sub, index, onOpen, showSubmitted }) {
  const hasScore = sub.total_score != null && sub.status !== 'pending';
  const passed = hasScore && sub.total_score >= sub.passing_score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(sub)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(sub); }}
      title="Open assessment details"
      className="group flex min-w-0 cursor-pointer flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/5 md:flex-row md:items-center lg:p-6"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-105">
          <HiOutlineBeaker className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="max-w-[25ch] truncate text-base font-semibold">{sub.assessment_title}</h3>
          {sub.job_title && (
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">For: {sub.job_title}</span>
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            <span title="Time limit" className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-0.5">
              <HiOutlineClock className="h-3 w-3" aria-hidden="true" />{sub.duration_minutes} min
            </span>
            <span title="Score needed to pass" className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-0.5">
              <HiOutlineQuestionMarkCircle className="h-3 w-3" aria-hidden="true" />Pass: {sub.passing_score}%
            </span>
            {showSubmitted && sub.submitted_at && (
              <span title="Date you submitted" className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/5 px-2 py-0.5 text-emerald-500">
                <HiOutlineCalendar className="h-3 w-3" aria-hidden="true" />Submitted {new Date(sub.submitted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {hasScore && (
          <div title="Your score" className="text-right">
            <div className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              <HiOutlineChartBar className="h-3 w-3" aria-hidden="true" /> Score
            </div>
            <div className={`mt-0.5 text-xl font-semibold ${passed ? 'text-emerald-500' : 'text-red-400'}`}>
              {sub.total_score.toFixed(0)}%
            </div>
          </div>
        )}
        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${statusStyles[sub.status] || statusStyles.pending}`}>
          {statusIcon[sub.status] || statusIcon.pending} {sub.status.replace('_', ' ')}
        </span>
      </div>
    </motion.div>
  );
}

export default function CandidateAssessmentsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchAssessments = async () => {
            try {
                const data = await api.get('/assessments/my/');
                if (isMounted) { setSubmissions(data || []); setError(''); }
            } catch (err) {
                if (isMounted) setError('We could not load your assessments. Check your connection and try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAssessments();
        return () => { isMounted = false; };
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const pending = submissions.filter(s => ['pending', 'in_progress'].includes(s?.status));
    const completed = submissions.filter(s => s?.status && !['pending', 'in_progress'].includes(s.status));

    if (loading) return <PageSkeleton stats={0} cards={2} />;

    return (
        <div className={pageSpacing}>
            <DashboardBanner
                icon={HiOutlineCommandLine}
                badge={{ label: pending.length > 0 ? `${pending.length} action required` : 'Nothing pending', icon: HiOutlineClock }}
                title="My assessments"
                subtitle="Coding tests your recruiters assign for your applications."
                footer={pending.length > 0
                    ? 'Next step: open a pending test and finish it in the DeepScreen app.'
                    : 'Next step: nothing to do right now. New tests appear here after you are shortlisted.'}
            />

            {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5">
                    <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-red-300">Something went wrong</p>
                        <p className="mt-0.5 text-xs text-red-300/70">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={retry}
                        className="shrink-0 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
                    >
                        Retry
                    </button>
                </div>
            )}

            {pending.length > 0 && (
                <section className="space-y-4">
                    <SectionHeader icon={HiOutlineClock} tone="bg-amber-500/10 text-amber-500" title="Action required" count={pending.length} />
                    <div className="space-y-4">
                        {pending.map((sub, i) => (
                            <AssessmentRow key={sub.submission_id} sub={sub} index={i} onOpen={setSelected} showSubmitted={false} />
                        ))}
                    </div>
                </section>
            )}

            {completed.length > 0 && (
                <section className="space-y-4">
                    <SectionHeader icon={HiOutlineCheckCircle} tone="bg-emerald-500/10 text-emerald-500" title="Completed" count={completed.length} />
                    <div className="space-y-4">
                        {completed.map((sub, i) => (
                            <AssessmentRow key={sub.submission_id} sub={sub} index={i} onOpen={setSelected} showSubmitted />
                        ))}
                    </div>
                </section>
            )}

            {!error && submissions.length === 0 && (
                <EmptyState
                    icon={HiOutlineBeaker}
                    title="No assessments yet"
                    text="Recruiters will assign coding tests after shortlisting. They will show up here."
                />
            )}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={e => e.stopPropagation()}
                        className="relative max-h-[95vh] w-full max-w-lg overflow-auto rounded-xl border border-border bg-card p-5 shadow-2xl lg:p-6"
                    >
                        <button
                            type="button"
                            onClick={() => setSelected(null)}
                            aria-label="Close"
                            title="Close"
                            className="absolute right-4 top-4 rounded-xl bg-muted p-2 transition-colors hover:bg-secondary"
                        >
                            <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
                        </button>

                        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                            <HiOutlineBeaker className="h-7 w-7" aria-hidden="true" />
                        </span>

                        <span className={`mb-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${statusStyles[selected.status] || statusStyles.pending}`}>
                            {statusIcon[selected.status] || statusIcon.pending} {selected.status.replace('_', ' ')}
                        </span>

                        <div className="mb-2 flex items-start justify-between gap-3">
                            <h2 className="text-2xl font-semibold tracking-tight">{selected.assessment_title}</h2>
                            <a
                                href={`deepscreen://assessment/${selected.submission_id}`}
                                title="Open this test in the DeepScreen desktop app"
                                className="mt-1 flex shrink-0 items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-500"
                            >
                                <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" aria-hidden="true" />
                                Open in App
                            </a>
                        </div>
                        {selected.job_title && (
                            <p className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <HiOutlineBriefcase className="h-4 w-4 shrink-0" aria-hidden="true" /> For: {selected.job_title}
                            </p>
                        )}

                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <div title="Time you spent on the test" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted p-4">
                                <HiOutlineClock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                <span className="text-2xl font-semibold text-foreground">
                                    {selected.started_at && selected.submitted_at
                                        ? Math.round((new Date(selected.submitted_at) - new Date(selected.started_at)) / 60000)
                                        : selected.duration_minutes || '—'}
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    {selected.started_at && selected.submitted_at ? 'Minutes taken' : 'Minutes'}
                                </span>
                            </div>
                            <div title="Your score on this test" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted p-4">
                                <HiOutlineQuestionMarkCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                <span className="text-2xl font-semibold text-foreground">
                                    {selected.total_score != null ? `${selected.total_score.toFixed(0)}%` : '—'}
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Score</span>
                            </div>
                        </div>

                        <div className="mb-6 space-y-2.5">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <HiOutlineCalendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span className="text-sm">Created: {formatDate(selected.created_at)}</span>
                            </div>
                            {selected.started_at && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlinePlay className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="text-sm">Started: {formatDate(selected.started_at)}</span>
                                </div>
                            )}
                            {selected.submitted_at && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="text-sm">Submitted: {formatDate(selected.submitted_at)}</span>
                                </div>
                            )}
                            {selected.time_taken_minutes != null && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlineClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="text-sm">Time taken: {selected.time_taken_minutes} {selected.time_taken_minutes === 1 ? 'minute' : 'minutes'}</span>
                                </div>
                            )}
                            {selected.max_score != null && selected.max_score > 0 && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlineChartBar className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="text-sm">Max score: {selected.max_score}</span>
                                </div>
                            )}
                            {selected.question_results && typeof selected.question_results === 'object' && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlineDocumentText className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="text-sm">Questions evaluated: {Object.keys(selected.question_results).length}</span>
                                </div>
                            )}
                        </div>

                        {selected.total_score != null && !['pending', 'in_progress'].includes(selected.status) && (
                            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-muted p-4">
                                <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <HiOutlineChartBar className="h-4 w-4" aria-hidden="true" /> Your score
                                </span>
                                <div className="text-right">
                                    {selected.max_score != null && selected.max_score > 0 && (
                                        <div className="text-sm font-semibold text-muted-foreground/70">
                                            {selected.total_score.toFixed(0)} / {selected.max_score.toFixed(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
