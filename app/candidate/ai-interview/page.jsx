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
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';
const secondaryButton = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 ${focusRing}`;
const cardSurface = 'rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card';
const statTile = 'flex flex-col items-center gap-1 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/5';
const mutedText = 'text-emerald-900/70 dark:text-slate-400';

const isDone = (status) => status === 'completed' || status === 'evaluated';

// Colour plus icon for each status, so the status is never shown by colour alone.
const statusMeta = (status) => {
  if (isDone(status)) {
    return { cls: 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400', Icon: HiOutlineCheckCircle };
  }
  if (status === 'in_progress') {
    return { cls: 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400', Icon: HiOutlineSparkles };
  }
  return { cls: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400', Icon: HiOutlineClock };
};

const fmtDateTime = (value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function StatusBadge({ status, label }) {
  const { cls, Icon } = statusMeta(status);
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${cls}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-emerald-950 dark:text-foreground">{title}</h2>
        {subtitle && <p className={`text-xs ${mutedText}`}>{subtitle}</p>}
      </div>
    </div>
  );
}

function InterviewCard({ interview, index, onOpen }) {
  const description = interview.interview_config?.description;
  const { cls, Icon } = statusMeta(interview.status);
  const title = interview.interview_config?.title || 'AI Interview';

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      type="button"
      title="View interview details"
      onClick={() => onOpen(interview)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(interview);
        }
      }}
      className={`group flex min-h-11 min-w-0 cursor-pointer flex-col gap-5 p-5 text-left transition-colors hover:border-emerald-300 lg:p-6 ${cardSurface} ${focusRing}`}
    >
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={interview.status} label={interview.job_title || 'AI Interview'} />
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cls}`} title={interview.status?.replace('_', ' ') || 'Status'}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <h3 className="text-lg font-semibold leading-tight text-emerald-950 transition-colors group-hover:text-emerald-700 dark:text-foreground dark:group-hover:text-emerald-400">
          {title}
        </h3>
        <p className={`break-words text-sm leading-relaxed ${mutedText}`}>
          {description
            ? description.length > 75
              ? description.slice(0, 75) + '...'
              : description
            : 'No description provided'}
        </p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <div className={statTile} title="Questions answered">
          <HiOutlineDocumentText className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          <span className="text-lg font-semibold text-emerald-950 dark:text-foreground">{interview.question_count || 0}</span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>Questions</span>
        </div>
        <div className={statTile} title="Date created">
          <HiOutlineCalendar className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-emerald-950 dark:text-foreground">
            {interview.started_at
              ? new Date(interview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Not started'}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>Created</span>
        </div>
      </div>
    </motion.button>
  );
}

export default function CandidateAIInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchInterviews = async () => {
      try {
        const data = await api.get('/ai-interviews/my/');
        if (!cancelled) {
          setInterviews(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch {
        if (!cancelled) setError('We could not load your AI interviews. Check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchInterviews();
    return () => { cancelled = true; };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  const pendingCount = interviews.filter(i => i?.status === 'pending' || i?.status === 'in_progress').length;

  const nextStep = interviews.length === 0
    ? 'Next step: nothing to do yet. Recruiters assign AI interviews after reviewing your application.'
    : pendingCount > 0
      ? 'Next step: open your pending AI interview in DeepScreen Desktop to begin.'
      : 'Next step: review your feedback and prepare for the next round.';

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      <DashboardBanner
        loading={loading}
        icon={HiOutlineSpeakerWave}
        badge={loading ? undefined : { label: `${pendingCount} pending`, icon: HiOutlineClock }}
        title="AI Interviews"
        subtitle="Complete your AI-powered interviews to progress in the hiring process"
        aside={loading ? (
          <div className="flex gap-2"><BannerBlock className="h-11 w-36 rounded-xl" /></div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link href="/candidate/applications" className={secondaryButton}>
              <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> View applications
            </Link>
          </div>
        )}
        footer={loading ? undefined : (
          <span className="flex items-start gap-2">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <span>{nextStep}</span>
          </span>
        )}
      />

      {loading && <PageSkeleton stats={0} cards={2} banner={false} />}

      {!loading && (
        <>
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/25 dark:bg-red-500/10">
              <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Something went wrong</p>
                <p className="mt-0.5 text-xs text-red-700/80 dark:text-red-300/70">{error}</p>
              </div>
              <button
                type="button"
                onClick={retry}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-red-100 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25 ${focusRing}`}
              >
                <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
              </button>
            </div>
          )}

          <section className="space-y-5">
            <SectionHeader icon={HiOutlineMicrophone} title="Your AI interviews" subtitle="Select an interview to see its details and feedback" />

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
                action={(
                  <Link href="/candidate/applications" className={secondaryButton}>
                    <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> View applications
                  </Link>
                )}
              />
            )}
          </section>

          {selected && (
            <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)} onKeyDown={(e) => { if (e.key === 'Escape') setSelected(null); }}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.dialog
                open
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={e => e.stopPropagation()}
                className={`relative m-0 border-0 max-h-[95vh] w-full max-w-lg overflow-auto p-5 shadow-2xl sm:p-6 lg:p-8 ${cardSurface}`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  title="Close"
                  className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 ${focusRing}`}
                >
                  <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <HiOutlineSpeakerWave className="h-6 w-6" aria-hidden="true" />
                </div>

                <div className="mb-3">
                  <StatusBadge status={selected.status} label={`${selected.job_title || 'AI Interview'} • ${selected.status?.replace('_', ' ') || 'status'}`} />
                </div>

                <h2 className="mb-2 break-words text-2xl font-semibold text-emerald-950 dark:text-foreground">{selected.interview_config?.title || 'AI Interview'}</h2>
                {selected.interview_config?.description && <p className={`mb-6 break-words text-sm ${mutedText}`}>{selected.interview_config.description}</p>}

                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className={statTile} title="Questions answered">
                    <HiOutlineDocumentText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-2xl font-semibold text-emerald-950 dark:text-foreground">{selected.question_count || 0}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>Questions</span>
                  </div>
                  <div className={statTile} title="Time taken">
                    <HiOutlineClock className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-2xl font-semibold text-emerald-950 dark:text-foreground">{selected.duration_taken_minutes || '—'}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>Minutes</span>
                  </div>
                </div>

                <div className="mb-6 space-y-2.5">
                  {selected.created_at && (
                    <div className={`flex min-w-0 items-center gap-3 ${mutedText}`}>
                      <HiOutlineCalendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm">Created: {fmtDateTime(selected.created_at)}</span>
                    </div>
                  )}
                  {selected.started_at && (
                    <div className={`flex min-w-0 items-center gap-3 ${mutedText}`}>
                      <HiOutlineClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm">Started: {fmtDateTime(selected.started_at)}</span>
                    </div>
                  )}
                  {selected.completed_at && (
                    <div className={`flex min-w-0 items-center gap-3 ${mutedText}`}>
                      <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm">Completed: {fmtDateTime(selected.completed_at)}</span>
                    </div>
                  )}
                  {selected.duration_taken_minutes != null && (
                    <div className={`flex min-w-0 items-center gap-3 ${mutedText}`}>
                      <HiOutlineChartBar className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm">Time taken: {selected.duration_taken_minutes} min</span>
                    </div>
                  )}
                  {selected.question_count != null && selected.question_count > 0 && (
                    <div className={`flex min-w-0 items-center gap-3 ${mutedText}`}>
                      <HiOutlineInformationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm">Questions answered: {selected.question_count}</span>
                    </div>
                  )}
                  {selected.guardrail_flagged && (
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                      <HiOutlineShieldExclamation className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm font-semibold">Guardrail triggered: {selected.guardrail_reason || 'Yes'}</span>
                    </div>
                  )}
                </div>

                {isDone(selected.status) && selected.overall_score != null && (
                  <>
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5">
                      <span className="text-sm font-semibold text-emerald-900/80 dark:text-slate-400">Overall score</span>
                      <span className={`text-2xl font-semibold ${Number(selected.overall_score) >= 65 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                        {Number(selected.overall_score).toFixed(0)}%
                      </span>
                    </div>

                    {selected.strengths?.length > 0 && (
                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                          <FaThumbsUp className="h-4 w-4" aria-hidden="true" />
                          <span className="text-xs font-semibold uppercase tracking-widest">Strengths</span>
                        </div>
                        <ul className="space-y-1.5">
                          {selected.strengths.map((s, i) => (
                            <li key={i} className={`flex items-start gap-2 break-words text-sm ${mutedText}`}>
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selected.weaknesses?.length > 0 && (
                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <HiOutlineLightBulb className="h-4 w-4" aria-hidden="true" />
                          <span className="text-xs font-semibold uppercase tracking-widest">Improvements</span>
                        </div>
                        <ul className="space-y-1.5">
                          {selected.weaknesses.map((w, i) => (
                            <li key={i} className={`flex items-start gap-2 break-words text-sm ${mutedText}`}>
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selected.recommended_for_next_round != null && (
                      <div className={`mb-4 flex items-center gap-3 rounded-xl p-3 ${selected.recommended_for_next_round ? 'border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10' : 'border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10'}`}>
                        {selected.recommended_for_next_round ? (
                          <FaThumbsUp className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                        ) : (
                          <FaThumbsDown className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                        )}
                        <span className={`text-sm font-semibold ${selected.recommended_for_next_round ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'}`}>
                          {selected.recommended_for_next_round ? 'Recommended for next round' : 'Not recommended for next round'}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <a
                  href={`deepscreen://ai-interview/${selected.interview}`}
                  className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500 ${focusRing}`}
                >
                  <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
                  Open in DeepScreen Desktop
                </a>
              </motion.dialog>
            </div>
          )}
        </>
      )}
    </div>
  );
}
