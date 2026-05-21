'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  HiOutlineMicrophone, HiOutlineClock,
  HiOutlineDocumentText, HiOutlineSparkles,
  HiOutlineCheckCircle, HiOutlineSpeakerWave,
  HiOutlineXMark, HiOutlineCalendar, HiOutlineInformationCircle,
  HiOutlineShieldExclamation, HiOutlineLightBulb,
  HiOutlineArrowPath, HiOutlineExclamationTriangle,
  HiOutlineBriefcase, HiOutlineChartBar,
} from 'react-icons/hi2';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';

const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

const isDone = (status) => status === 'completed' || status === 'evaluated';

const statusPill = (status) => (
  isDone(status)
    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    : status === 'in_progress'
    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
);

const fmtDateTime = (value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function SectionHeader({ icon: Icon, tone, title, subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground/60">{subtitle}</p>}
      </div>
    </div>
  );
}

function InterviewCard({ interview, index, onOpen }) {
  const description = interview.interview_config?.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      role="button"
      tabIndex={0}
      title="View interview details"
      onClick={() => onOpen(interview)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(interview);
        }
      }}
      className="group flex min-w-0 cursor-pointer flex-col gap-5 rounded-xl border border-border bg-card p-5 transition-colors hover:border-amber-500/30 lg:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`min-w-0 truncate rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusPill(interview.status)}`}>
          {interview.job_title || 'AI Interview'}
        </span>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDone(interview.status) ? 'bg-emerald-500/10 text-emerald-500' : interview.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}
          title={interview.status?.replace('_', ' ') || 'Status'}
        >
          {isDone(interview.status) ? (
            <HiOutlineCheckCircle className="h-5 w-5" aria-hidden="true" />
          ) : interview.status === 'in_progress' ? (
            <HiOutlineSparkles className="h-5 w-5" aria-hidden="true" />
          ) : (
            <HiOutlineClock className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <h3 className="text-lg font-semibold leading-tight transition-colors group-hover:text-amber-500">
          {interview.interview_config?.title || 'AI Interview'}
        </h3>
        <p className="break-words text-sm leading-relaxed text-muted-foreground">
          {description
            ? description.length > 75
              ? description.slice(0, 75) + '...'
              : description
            : 'No description provided'}
        </p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted p-3" title="Questions answered">
          <HiOutlineDocumentText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-lg font-semibold text-foreground">{interview.question_count || 0}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Questions</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted p-3" title="Date created">
          <HiOutlineCalendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">
            {interview.started_at
              ? new Date(interview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Not started'}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Created</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CandidateAIInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await api.get('/ai-interviews/my/');
        setInterviews(data);
        setError('');
      } catch {
        setError('We could not load your AI interviews. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  if (loading) return <PageSkeleton stats={0} cards={2} />;

  const pendingCount = interviews.filter(i => i.status === 'pending' || i.status === 'in_progress').length;

  const nextStep = interviews.length === 0
    ? 'Next step: nothing to do yet. Recruiters assign AI interviews after reviewing your application.'
    : pendingCount > 0
      ? 'Next step: open your pending AI interview in DeepScreen Desktop to begin.'
      : 'Next step: review your feedback and prepare for the next round.';

  return (
    <div className="mx-auto w-full min-w-0 space-y-10 px-4 pb-20 md:px-8">
      {/* ═══ Banner ═══ */}
      <DashboardBanner
        icon={HiOutlineSpeakerWave}
        badge={{ label: `${pendingCount} pending`, icon: HiOutlineClock }}
        title="AI Interviews"
        subtitle="Complete your AI-powered interviews to progress in the hiring process"
        footer={
          <span className="flex items-start gap-2">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>{nextStep}</span>
          </span>
        }
      />

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
          <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-300">Something went wrong</p>
            <p className="mt-0.5 text-xs text-red-300/70">{error}</p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
          >
            <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
          </button>
        </div>
      )}

      {/* ═══ Interviews ═══ */}
      <section className="space-y-5">
        <SectionHeader icon={HiOutlineMicrophone} tone="bg-amber-500/10 text-amber-500" title="Your AI interviews" subtitle="Select an interview to see its details and feedback" />

        {interviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            {interviews.map((interview, idx) => (
              <InterviewCard key={interview.session_id} interview={interview} index={idx} onOpen={setSelected} />
            ))}
          </div>
        ) : !error && (
          <EmptyState
            icon={HiOutlineMicrophone}
            title="No AI interviews yet"
            text="Recruiters will assign AI interviews after reviewing your application."
            action={<Link href="/candidate/applications" className={linkButton}><HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> View applications</Link>}
          />
        )}
      </section>

      {/* Modal with Interview Details */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="relative max-h-[95vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6 lg:p-8"
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

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <HiOutlineSpeakerWave className="h-6 w-6" aria-hidden="true" />
            </div>

            <span className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusPill(selected.status)}`}>
              {selected.job_title || 'AI Interview'} • {selected.status?.replace('_', ' ')}
            </span>

            <h2 className="mb-2 break-words text-2xl font-semibold text-foreground">{selected.interview_config?.title || 'AI Interview'}</h2>
            {selected.interview_config?.description && <p className="mb-6 break-words text-sm text-muted-foreground">{selected.interview_config.description}</p>}

            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted p-3" title="Questions answered">
                <HiOutlineDocumentText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="text-2xl font-semibold text-foreground">{selected.question_count || 0}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Questions</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted p-3" title="Time taken">
                <HiOutlineClock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="text-2xl font-semibold text-foreground">{selected.duration_taken_minutes || '—'}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Minutes</span>
              </div>
            </div>

            <div className="mb-6 space-y-2.5">
              {selected.created_at && (
                <div className="flex min-w-0 items-center gap-3 text-muted-foreground">
                  <HiOutlineCalendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words text-sm">Created: {fmtDateTime(selected.created_at)}</span>
                </div>
              )}
              {selected.started_at && (
                <div className="flex min-w-0 items-center gap-3 text-muted-foreground">
                  <HiOutlineClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words text-sm">Started: {fmtDateTime(selected.started_at)}</span>
                </div>
              )}
              {selected.completed_at && (
                <div className="flex min-w-0 items-center gap-3 text-muted-foreground">
                  <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words text-sm">Completed: {fmtDateTime(selected.completed_at)}</span>
                </div>
              )}
              {selected.duration_taken_minutes != null && (
                <div className="flex min-w-0 items-center gap-3 text-muted-foreground">
                  <HiOutlineChartBar className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words text-sm">Time taken: {selected.duration_taken_minutes} min</span>
                </div>
              )}
              {selected.question_count != null && selected.question_count > 0 && (
                <div className="flex min-w-0 items-center gap-3 text-muted-foreground">
                  <HiOutlineInformationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words text-sm">Questions answered: {selected.question_count}</span>
                </div>
              )}
              {selected.guardrail_flagged && (
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-500">
                  <HiOutlineShieldExclamation className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words text-sm font-semibold">Guardrail triggered: {selected.guardrail_reason || 'Yes'}</span>
                </div>
              )}
            </div>

            {isDone(selected.status) && selected.overall_score != null && (
              <>
                <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-muted p-4">
                  <span className="text-sm font-semibold text-muted-foreground">Overall score</span>
                  <span className={`text-2xl font-semibold ${selected.overall_score >= 65 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selected.overall_score.toFixed(0)}%
                  </span>
                </div>

                {selected.strengths?.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2 text-emerald-500">
                      <FaThumbsUp className="h-4 w-4" aria-hidden="true" />
                      <span className="text-xs font-semibold uppercase tracking-widest">Strengths</span>
                    </div>
                    <ul className="space-y-1.5">
                      {selected.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 break-words text-sm text-muted-foreground">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.weaknesses?.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2 text-amber-500">
                      <HiOutlineLightBulb className="h-4 w-4" aria-hidden="true" />
                      <span className="text-xs font-semibold uppercase tracking-widest">Improvements</span>
                    </div>
                    <ul className="space-y-1.5">
                      {selected.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 break-words text-sm text-muted-foreground">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.recommended_for_next_round != null && (
                  <div className={`mb-4 flex items-center gap-3 rounded-xl p-3 ${selected.recommended_for_next_round ? 'border border-emerald-500/20 bg-emerald-500/10' : 'border border-amber-500/20 bg-amber-500/10'}`}>
                    {selected.recommended_for_next_round ? (
                      <FaThumbsUp className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                    ) : (
                      <FaThumbsDown className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                    )}
                    <span className={`text-sm font-semibold ${selected.recommended_for_next_round ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {selected.recommended_for_next_round ? 'Recommended for next round' : 'Not recommended for next round'}
                    </span>
                  </div>
                )}
              </>
            )}

            <a href={`deepscreen://ai-interview/${selected.interview}`}
              className="block w-full rounded-xl bg-amber-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-500">
              Open in DeepScreen Desktop
            </a>
          </motion.div>
        </div>
      )}
    </div>
  );
}
