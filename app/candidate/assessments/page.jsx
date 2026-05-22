'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  HiOutlineBeaker, HiOutlineCommandLine, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle, HiOutlineExclamationTriangle,
  HiOutlineChartBar, HiOutlineXMark, HiOutlineCalendar, HiOutlinePlay,
  HiOutlineBriefcase,
  HiOutlineArrowTopRightOnSquare, HiOutlineArrowPath,
} from 'react-icons/hi2';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';
const secondaryButton = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 ${focusRing}`;
const cardSurface = 'rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card';
const statTile = 'flex flex-col items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5';
const mutedText = 'text-emerald-900/70 dark:text-slate-400';

// Colour plus icon per status, so status is never shown by colour alone.
const statusMeta = {
  pending:     { cls: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400', Icon: HiOutlineDocumentText },
  in_progress: { cls: 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400', Icon: HiOutlineClock },
  submitted:   { cls: 'border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400', Icon: HiOutlineChartBar },
  evaluated:   { cls: 'border-teal-200 bg-teal-100 text-teal-800 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400', Icon: HiOutlineChartBar },
  passed:      { cls: 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400', Icon: HiOutlineCheckCircle },
  failed:      { cls: 'border-red-200 bg-red-100 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400', Icon: HiOutlineExclamationTriangle },
};

const getStatusMeta = (status) => statusMeta[status] || statusMeta.pending;

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function SectionHeader({ icon: Icon, tone, title, count }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight text-emerald-950 dark:text-foreground">{title}</h2>
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-white/10 dark:text-slate-300">{count}</span>
    </div>
  );
}

function AssessmentRow({ sub, index, onOpen, showSubmitted }) {
  const hasScore = sub.total_score != null && sub.status !== 'pending';
  const passed = hasScore && sub.total_score >= sub.passing_score;
  const { cls, Icon: StatusIcon } = getStatusMeta(sub.status);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      type="button"
      tabIndex={0}
      onClick={() => onOpen(sub)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(sub); }}
      title="Open assessment details"
      className={`group flex min-h-11 min-w-0 cursor-pointer flex-col items-start justify-between gap-4 p-5 text-left transition-all hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 md:flex-row md:items-center lg:p-6 ${cardSurface} ${focusRing}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-transform group-hover:scale-105 dark:bg-emerald-500/10 dark:text-emerald-400">
          <HiOutlineBeaker className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="max-w-[25ch] truncate text-base font-semibold text-emerald-950 dark:text-foreground">{sub.assessment_title}</h3>
          {sub.job_title && (
            <p className={`mt-0.5 flex min-w-0 items-center gap-1 text-xs ${mutedText}`}>
              <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">For: {sub.job_title}</span>
            </p>
          )}
          <div className={`mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>
            <span title="Time limit" className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 dark:bg-white/5">
              <HiOutlineClock className="h-3 w-3" aria-hidden="true" />{sub.duration_minutes} min
            </span>
            <span title="Score needed to pass" className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 dark:bg-white/5">
              <HiOutlineQuestionMarkCircle className="h-3 w-3" aria-hidden="true" />Pass: {sub.passing_score}%
            </span>
            {showSubmitted && sub.submitted_at && (
              <span title="Date you submitted" className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                <HiOutlineCalendar className="h-3 w-3" aria-hidden="true" />Submitted {new Date(sub.submitted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {hasScore && (
          <div title="Your score" className="text-right">
            <div className={`flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>
              <HiOutlineChartBar className="h-3 w-3" aria-hidden="true" /> Score
            </div>
            <div className={`mt-0.5 text-xl font-semibold ${passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {Number(sub.total_score).toFixed(0)}%
            </div>
          </div>
        )}
        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${cls}`}>
          <StatusIcon className="h-4 w-4" aria-hidden="true" /> {(sub.status || 'pending').replace('_', ' ')}
        </span>
      </div>
    </motion.button>
  );
}

export default function CandidateAssessmentsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchAssessments = async () => {
      try {
        const data = await api.get('/assessments/my/');
        if (!cancelled) { setSubmissions(Array.isArray(data) ? data : []); setError(''); }
      } catch {
        if (!cancelled) setError('We could not load your assessments. Check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAssessments();
    return () => { cancelled = true; };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  const pending = submissions.filter(s => ['pending', 'in_progress'].includes(s?.status));
  const completed = submissions.filter(s => s?.status && !['pending', 'in_progress'].includes(s.status));

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      <DashboardBanner
        loading={loading}
        icon={HiOutlineCommandLine}
        badge={loading ? undefined : { label: pending.length > 0 ? `${pending.length} action required` : 'Nothing pending', icon: HiOutlineClock }}
        title="My assessments"
        subtitle="Coding tests your recruiters assign for your applications."
        aside={loading ? (
          <div className="flex gap-2"><BannerBlock className="h-11 w-36 rounded-xl" /></div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link href="/candidate/applications" className={secondaryButton}>
              <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> View applications
            </Link>
          </div>
        )}
        footer={loading ? undefined : pending.length > 0
          ? 'Next step: open a pending test and finish it in the DeepScreen app.'
          : 'Next step: nothing to do right now. New tests appear here after you are shortlisted.'}
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
                className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-red-100 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25 ${focusRing}`}
              >
                <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}

          {pending.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={HiOutlineClock} tone="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" title="Action required" count={pending.length} />
              <div className="space-y-4">
                {pending.map((sub, i) => (
                  <AssessmentRow key={sub.submission_id} sub={sub} index={i} onOpen={setSelected} showSubmitted={false} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={HiOutlineCheckCircle} tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" title="Completed" count={completed.length} />
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
            <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)} onKeyDown={(e) => { if (e.key === 'Escape') setSelected(null); }}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={e => e.stopPropagation()}
                className={`relative max-h-[95vh] w-full max-w-lg overflow-auto p-5 shadow-2xl lg:p-6 ${cardSurface}`}
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

                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <HiOutlineBeaker className="h-7 w-7" aria-hidden="true" />
                </span>

                {selected && (() => {
                  const { cls, Icon: DetailStatusIcon } = getStatusMeta(selected.status);
                  return (
                    <span className={`mb-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${cls}`}>
                      <DetailStatusIcon className="h-4 w-4" aria-hidden="true" /> {(selected.status || 'pending').replace('_', ' ')}
                    </span>
                  );
                })()}

                <div className="mb-2 flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-emerald-950 dark:text-foreground">{selected.assessment_title}</h2>
                  <a
                    href={`deepscreen://assessment/${selected.submission_id}`}
                    title="Open this test in the DeepScreen desktop app"
                    className={`mt-1 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500 ${focusRing}`}
                  >
                    <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    Open in App
                  </a>
                </div>
                {selected.job_title && (
                  <p className={`mb-6 flex items-center gap-1.5 text-sm ${mutedText}`}>
                    <HiOutlineBriefcase className="h-4 w-4 shrink-0" aria-hidden="true" /> For: {selected.job_title}
                  </p>
                )}

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div title="Time you spent on the test" className={statTile}>
                    <HiOutlineClock className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-2xl font-semibold text-emerald-950 dark:text-foreground">
                      {selected.started_at && selected.submitted_at
                        ? Math.round((new Date(selected.submitted_at) - new Date(selected.started_at)) / 60000)
                        : selected.duration_minutes || '—'}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>
                      {selected.started_at && selected.submitted_at ? 'Minutes taken' : 'Minutes'}
                    </span>
                  </div>
                  <div title="Your score on this test" className={statTile}>
                    <HiOutlineQuestionMarkCircle className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-2xl font-semibold text-emerald-950 dark:text-foreground">
                      {selected.total_score != null ? `${Number(selected.total_score).toFixed(0)}%` : '—'}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>Score</span>
                  </div>
                </div>

                <div className={`mb-6 space-y-2.5 ${mutedText}`}>
                  {selected.created_at && (
                    <div className="flex items-center gap-3">
                      <HiOutlineCalendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="text-sm">Created: {formatDate(selected.created_at)}</span>
                    </div>
                  )}
                  {selected.started_at && (
                    <div className="flex items-center gap-3">
                      <HiOutlinePlay className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="text-sm">Started: {formatDate(selected.started_at)}</span>
                    </div>
                  )}
                  {selected.submitted_at && (
                    <div className="flex items-center gap-3">
                      <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="text-sm">Submitted: {formatDate(selected.submitted_at)}</span>
                    </div>
                  )}
                  {selected.time_taken_minutes != null && (
                    <div className="flex items-center gap-3">
                      <HiOutlineClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="text-sm">Time taken: {selected.time_taken_minutes} {selected.time_taken_minutes === 1 ? 'minute' : 'minutes'}</span>
                    </div>
                  )}
                  {selected.max_score != null && selected.max_score > 0 && (
                    <div className="flex items-center gap-3">
                      <HiOutlineChartBar className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="text-sm">Max score: {selected.max_score}</span>
                    </div>
                  )}
                  {selected.question_results && typeof selected.question_results === 'object' && (
                    <div className="flex items-center gap-3">
                      <HiOutlineDocumentText className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="text-sm">Questions evaluated: {Object.keys(selected.question_results).length}</span>
                    </div>
                  )}
                </div>

                {selected.total_score != null && !['pending', 'in_progress'].includes(selected.status) && (
                  <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-emerald-900/80 dark:text-slate-400">
                      <HiOutlineChartBar className="h-4 w-4" aria-hidden="true" /> Your score
                    </span>
                    <div className="text-right">
                      {selected.max_score != null && selected.max_score > 0 && (
                        <div className={`text-sm font-semibold ${mutedText}`}>
                          {Number(selected.total_score).toFixed(0)} / {Number(selected.max_score).toFixed(0)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
