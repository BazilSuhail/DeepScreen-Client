'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  HiOutlineMicrophone, HiOutlineClock,
  HiOutlineDocumentText, HiOutlineSparkles,
  HiOutlineCheckCircle, HiOutlineSpeakerWave,
  HiOutlineCalendar, HiOutlineInformationCircle,
  HiOutlineShieldExclamation, HiOutlineLightBulb,
  HiOutlineBriefcase, HiOutlineChartBar,
  HiOutlineArrowTopRightOnSquare, HiOutlineChevronRight,
  HiOutlineHandThumbDown, HiOutlineHandThumbUp,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import AiInterviewsSkeleton from '@/components/skeletons/candidate/AiInterviewsSkeleton';
import { badge, card, cardInteractive, iconTile, primaryButton, secondaryButton } from '@/components/ui/styles';
import { base, fadeUp, stagger } from '@/constants/motion';

const statTile = 'flex flex-col gap-1 rounded-md border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/5';

const isDone = (status) => status === 'completed' || status === 'evaluated';

// Colour plus icon for each status, so the status is never shown by colour alone.
const statusMeta = (status) => {
  if (isDone(status)) {
    return { cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300', Icon: HiOutlineCheckCircle };
  }
  if (status === 'in_progress') {
    return { cls: 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300', Icon: HiOutlineSparkles };
  }
  return { cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300', Icon: HiOutlineClock };
};

const statusLabel = (status) => status?.replace('_', ' ') || 'pending';

const fmtDateTime = (value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function StatusBadge({ status }) {
  const { cls, Icon } = statusMeta(status);
  return (
    <span className={`${badge} font-semibold capitalize ${cls}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {statusLabel(status)}
    </span>
  );
}

function InterviewCard({ interview, index, onOpen }) {
  const description = interview.interview_config?.description;
  const title = interview.interview_config?.title || 'AI Interview';
  const { cls, Icon } = statusMeta(interview.status);

  return (
    <motion.button
      {...fadeUp}
      transition={{ ...base, delay: Math.min(index, 8) * stagger }}
      type="button"
      onClick={() => onOpen(interview)}
      className={`group flex min-w-0 flex-col gap-4 p-5 text-left lg:p-6 ${cardInteractive}`}
    >
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={interview.status} />
        <span className={`${iconTile} h-10 w-10 ${cls}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="min-w-0 space-y-1.5">
        <h3 className="break-words text-base font-semibold leading-snug transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
          {title}
        </h3>
        {interview.job_title && (
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{interview.job_title}</span>
          </p>
        )}
        <p className="line-clamp-2 break-words text-sm leading-relaxed text-muted-foreground">
          {description || 'No description provided'}
        </p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <div className={statTile}>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" /> Questions
          </span>
          <span className="text-lg font-semibold tabular-nums">{interview.question_count || 0}</span>
        </div>
        <div className={statTile}>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <HiOutlineCalendar className="h-3.5 w-3.5" aria-hidden="true" /> Created
          </span>
          <span className="text-sm font-semibold">
            {interview.created_at
              ? new Date(interview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : <span className="text-muted-foreground">—</span>}
          </span>
        </div>
      </div>

      <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
        View details <HiOutlineChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </motion.button>
  );
}

function DetailRow({ icon: Icon, children }) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

function InterviewDetails({ interview }) {
  const done = isDone(interview.status) && interview.overall_score != null;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={interview.status} />
        {interview.job_title && (
          <span className={`${badge} bg-muted text-muted-foreground`}>
            <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" /> {interview.job_title}
          </span>
        )}
      </div>

      {interview.interview_config?.description && (
        <p className="break-words text-sm text-muted-foreground">{interview.interview_config.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className={statTile}>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" /> Questions
          </span>
          <span className="text-2xl font-semibold tabular-nums">{interview.question_count || 0}</span>
        </div>
        <div className={statTile}>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" /> Minutes
          </span>
          <span className="text-2xl font-semibold tabular-nums">{interview.duration_taken_minutes || '—'}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {interview.created_at && <DetailRow icon={HiOutlineCalendar}>Created: {fmtDateTime(interview.created_at)}</DetailRow>}
        {interview.started_at && <DetailRow icon={HiOutlineClock}>Started: {fmtDateTime(interview.started_at)}</DetailRow>}
        {interview.completed_at && <DetailRow icon={HiOutlineCheckCircle}>Completed: {fmtDateTime(interview.completed_at)}</DetailRow>}
        {interview.duration_taken_minutes != null && <DetailRow icon={HiOutlineChartBar}>Time taken: {interview.duration_taken_minutes} min</DetailRow>}
        {interview.question_count > 0 && <DetailRow icon={HiOutlineInformationCircle}>Questions answered: {interview.question_count}</DetailRow>}
      </div>

      {interview.guardrail_flagged && (
        <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <HiOutlineShieldExclamation className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words text-sm font-semibold">Guardrail triggered: {interview.guardrail_reason || 'Yes'}</span>
        </div>
      )}

      {done && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5">
            <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <HiOutlineChartBar className="h-4 w-4" aria-hidden="true" /> Overall score
            </span>
            <span className={`text-2xl font-semibold tabular-nums ${Number(interview.overall_score) >= 65 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {Number(interview.overall_score).toFixed(0)}%
            </span>
          </div>

          {interview.strengths?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <HiOutlineHandThumbUp className="h-4 w-4" aria-hidden="true" /> Strengths
              </p>
              <ul className="space-y-1.5">
                {interview.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 break-words text-sm text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interview.weaknesses?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <HiOutlineLightBulb className="h-4 w-4" aria-hidden="true" /> Improvements
              </p>
              <ul className="space-y-1.5">
                {interview.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 break-words text-sm text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interview.recommended_for_next_round != null && (
            <div className={`flex items-center gap-3 rounded-md border p-3 ${interview.recommended_for_next_round ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'}`}>
              {interview.recommended_for_next_round
                ? <HiOutlineHandThumbUp className="h-5 w-5 shrink-0" aria-hidden="true" />
                : <HiOutlineHandThumbDown className="h-5 w-5 shrink-0" aria-hidden="true" />}
              <span className="text-sm font-semibold">
                {interview.recommended_for_next_round ? 'Recommended for next round' : 'Not recommended for next round'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CandidateAIInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  // Separate from `selected` so the dialog keeps its content while it animates out.
  const [detailOpen, setDetailOpen] = useState(false);
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

  if (loading) return <AiInterviewsSkeleton />;

  const pendingCount = interviews.filter(i => i?.status === 'pending' || i?.status === 'in_progress').length;
  const doneCount = interviews.filter((i) => isDone(i?.status)).length;

  const nextStep = interviews.length === 0
    ? 'Nothing to do yet. Recruiters assign AI interviews after reviewing your application.'
    : pendingCount > 0
      ? 'Open your pending AI interview in DeepScreen Desktop to begin.'
      : 'Review your feedback and prepare for the next round.';

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <DashboardBanner
        compact
        icon={HiOutlineSpeakerWave}
        badge={error ? null : { label: `${pendingCount} pending · ${doneCount} completed`, icon: HiOutlineClock }}
        title="AI interviews"
        subtitle="Complete your AI-powered interviews to progress in the hiring process."
        actions={[{ label: 'View applications', href: '/candidate/applications', icon: HiOutlineBriefcase }]}
      />

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <motion.div {...fadeUp} transition={base} className={`flex items-start gap-3 p-4 ${card}`}>
            <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
              <HiOutlineLightBulb className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="pt-1.5 text-sm"><span className="font-semibold">Next step:</span> <span className="text-muted-foreground">{nextStep}</span></p>
          </motion.div>

          {interviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {interviews.map((interview, idx) => (
                <InterviewCard key={interview.session_id} interview={interview} index={idx} onOpen={(item) => { setSelected(item); setDetailOpen(true); }} />
              ))}
            </div>
          ) : (
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
        </>
      )}

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.interview_config?.title || 'AI Interview'}
        footer={selected && (
          <a href={`deepscreen://ai-interview/${selected.interview}`} className={primaryButton}>
            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
            Open in DeepScreen Desktop
          </a>
        )}
      >
        {selected && <InterviewDetails interview={selected} />}
      </Modal>
    </div>
  );
}
