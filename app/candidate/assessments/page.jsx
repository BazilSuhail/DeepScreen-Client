'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import {
  HiOutlineBeaker, HiOutlineCommandLine, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle, HiOutlineExclamationTriangle,
  HiOutlineChartBar, HiOutlineCalendar, HiOutlinePlay,
  HiOutlineBriefcase, HiOutlineArrowTopRightOnSquare, HiOutlineChevronRight,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import AssessmentsSkeleton from '@/components/skeletons/candidate/AssessmentsSkeleton';
import { badge, cardInteractive, iconTile, primaryButton } from '@/components/ui/styles';
import { base, fadeUp, stagger } from '@/constants/motion';

const statTile = 'flex flex-col gap-1 rounded-md border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/5';

// Colour plus icon per status, so status is never shown by colour alone.
const statusMeta = {
  pending:     { cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300', Icon: HiOutlineDocumentText },
  in_progress: { cls: 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300', Icon: HiOutlineClock },
  submitted:   { cls: 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300', Icon: HiOutlineChartBar },
  evaluated:   { cls: 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300', Icon: HiOutlineChartBar },
  passed:      { cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300', Icon: HiOutlineCheckCircle },
  failed:      { cls: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300', Icon: HiOutlineExclamationTriangle },
};

const getStatusMeta = (status) => statusMeta[status] || statusMeta.pending;

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function StatusBadge({ status }) {
  const { cls, Icon } = getStatusMeta(status);
  return (
    <span className={`${badge} font-semibold capitalize ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {(status || 'pending').replace('_', ' ')}
    </span>
  );
}

function SectionHeader({ icon: Icon, tone, title, count }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${iconTile} h-8 w-8 ${tone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <span className={`${badge} bg-muted tabular-nums text-muted-foreground`}>{count}</span>
    </div>
  );
}

function AssessmentRow({ sub, index, onOpen, showSubmitted }) {
  const hasScore = sub.total_score != null && sub.status !== 'pending';
  const passed = hasScore && sub.total_score >= sub.passing_score;

  return (
    <motion.button
      {...fadeUp}
      transition={{ ...base, delay: Math.min(index, 8) * stagger }}
      type="button"
      onClick={() => onOpen(sub)}
      title="Open assessment details"
      className={`group flex min-w-0 flex-col items-start justify-between gap-4 p-5 text-left md:flex-row md:items-center lg:p-6 ${cardInteractive}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className={`${iconTile} h-12 w-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
          <HiOutlineBeaker className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{sub.assessment_title}</h3>
          {sub.job_title && (
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">For: {sub.job_title}</span>
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span title="Time limit" className={`${badge} bg-muted text-muted-foreground`}>
              <HiOutlineClock className="h-3 w-3" aria-hidden="true" />{sub.duration_minutes} min
            </span>
            <span title="Score needed to pass" className={`${badge} bg-muted text-muted-foreground`}>
              <HiOutlineQuestionMarkCircle className="h-3 w-3" aria-hidden="true" />Pass: {sub.passing_score}%
            </span>
            {showSubmitted && sub.submitted_at && (
              <span title="Date you submitted" className={`${badge} bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
                <HiOutlineCalendar className="h-3 w-3" aria-hidden="true" />Submitted {new Date(sub.submitted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-between gap-4 md:w-auto">
        {hasScore && (
          <div title="Your score" className="md:text-right">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:justify-end">
              <HiOutlineChartBar className="h-3 w-3" aria-hidden="true" /> Score
            </p>
            <p className={`text-xl font-semibold tabular-nums ${passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {Number(sub.total_score).toFixed(0)}%
            </p>
          </div>
        )}
        <span className="flex items-center gap-2">
          <StatusBadge status={sub.status} />
          <HiOutlineChevronRight className="h-4 w-4 text-muted-foreground transition-[translate] group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </motion.button>
  );
}

function DetailRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

function AssessmentDetails({ sub }) {
  const timed = sub.started_at && sub.submitted_at;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={sub.status} />
        {sub.job_title && (
          <span className={`${badge} bg-muted text-muted-foreground`}>
            <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" /> For: {sub.job_title}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div title="Time you spent on the test" className={statTile}>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" /> {timed ? 'Minutes taken' : 'Minutes'}
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {timed
              ? Math.round((new Date(sub.submitted_at) - new Date(sub.started_at)) / 60000)
              : sub.duration_minutes || '—'}
          </span>
        </div>
        <div title="Your score on this test" className={statTile}>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <HiOutlineQuestionMarkCircle className="h-3.5 w-3.5" aria-hidden="true" /> Score
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {sub.total_score != null ? `${Number(sub.total_score).toFixed(0)}%` : '—'}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {sub.created_at && <DetailRow icon={HiOutlineCalendar}>Created: {formatDate(sub.created_at)}</DetailRow>}
        {sub.started_at && <DetailRow icon={HiOutlinePlay}>Started: {formatDate(sub.started_at)}</DetailRow>}
        {sub.submitted_at && <DetailRow icon={HiOutlineCheckCircle}>Submitted: {formatDate(sub.submitted_at)}</DetailRow>}
        {sub.time_taken_minutes != null && (
          <DetailRow icon={HiOutlineClock}>Time taken: {sub.time_taken_minutes} {sub.time_taken_minutes === 1 ? 'minute' : 'minutes'}</DetailRow>
        )}
        {sub.max_score != null && sub.max_score > 0 && <DetailRow icon={HiOutlineChartBar}>Max score: {sub.max_score}</DetailRow>}
        {sub.question_results && typeof sub.question_results === 'object' && (
          <DetailRow icon={HiOutlineDocumentText}>Questions evaluated: {Object.keys(sub.question_results).length}</DetailRow>
        )}
      </div>

      {sub.total_score != null && !['pending', 'in_progress'].includes(sub.status) && sub.max_score != null && sub.max_score > 0 && (
        <div className="flex items-center justify-between rounded-md border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5">
          <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <HiOutlineChartBar className="h-4 w-4" aria-hidden="true" /> Your score
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {Number(sub.total_score).toFixed(0)} / {Number(sub.max_score).toFixed(0)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function CandidateAssessmentsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  // Separate from `selected` so the dialog keeps its content while it animates out.
  const [detailOpen, setDetailOpen] = useState(false);
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

  if (loading) return <AssessmentsSkeleton />;

  const pending = submissions.filter(s => ['pending', 'in_progress'].includes(s?.status));
  const completed = submissions.filter(s => s?.status && !['pending', 'in_progress'].includes(s.status));
  const passedCount = submissions.filter((s) => s?.status === 'passed').length;
  const failedCount = submissions.filter((s) => s?.status === 'failed').length;
  const open = (sub) => { setSelected(sub); setDetailOpen(true); };

  const stats = [
    { label: 'Action required', value: pending.length, icon: HiOutlineClock, tone: 'amber' },
    { label: 'Completed', value: completed.length, icon: HiOutlineCheckCircle, tone: 'emerald' },
    { label: 'Passed', value: passedCount, icon: HiOutlineChartBar, tone: 'emerald' },
    { label: 'Not passed', value: failedCount, icon: HiOutlineExclamationTriangle, tone: 'amber' },
  ];

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <DashboardBanner
        compact
        icon={HiOutlineCommandLine}
        badge={error ? null : { label: `${pending.length} pending`, icon: HiOutlineClock }}
        title="My assessments"
        subtitle="Coding tests your recruiters assign for your applications."
        actions={[{ label: 'View applications', href: '/candidate/applications', icon: HiOutlineBriefcase }]}
        footer={!error && (pending.length > 0
          ? 'Open a pending test and finish it in the DeepScreen app.'
          : 'Nothing to do right now. New tests appear here after you are shortlisted.')}
      />

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={HiOutlineBeaker}
          title="No assessments yet"
          text="Recruiters will assign coding tests after shortlisting. They will show up here."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} delay={Math.min(i, 8) * stagger} />
            ))}
          </div>

          {pending.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={HiOutlineClock} tone="bg-amber-500/10 text-amber-700 dark:text-amber-400" title="Action required" count={pending.length} />
              <div className="grid gap-4 2xl:grid-cols-2">
                {pending.map((sub, i) => (
                  <AssessmentRow key={sub.submission_id} sub={sub} index={i} onOpen={open} showSubmitted={false} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={HiOutlineCheckCircle} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Completed" count={completed.length} />
              <div className="grid gap-4 2xl:grid-cols-2">
                {completed.map((sub, i) => (
                  <AssessmentRow key={sub.submission_id} sub={sub} index={i} onOpen={open} showSubmitted />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.assessment_title}
        footer={selected && (
          <a
            href={`deepscreen://assessment/${selected.submission_id}`}
            title="Open this test in the DeepScreen desktop app"
            className={primaryButton}
          >
            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
            Open in app
          </a>
        )}
      >
        {selected && <AssessmentDetails sub={selected} />}
      </Modal>
    </div>
  );
}
