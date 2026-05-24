import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineVideoCamera,
  HiOutlineMicrophone,
  HiOutlineComputerDesktop,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineClipboardDocument,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineSignal,
  HiOutlinePlay,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { formatUtcDate, formatUtcDateTime, humanize } from '@/components/interview/interviewFormat';
import { listBtnPrimary, listBtnSecondary } from '@/components/interview/InterviewListParts';
import { interviewJoinUrl } from '@/utils/config';

const STATUS = {
  pending: { icon: HiOutlineClock, className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  scheduled: { icon: HiOutlineCalendar, className: 'bg-teal-500/10 text-teal-700 dark:text-teal-400' },
  in_progress: { icon: HiOutlinePlay, className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  completed: { icon: HiOutlineCheckCircle, className: 'bg-muted text-muted-foreground' },
  cancelled: { icon: HiOutlineXCircle, className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
};

const FALLBACK_STATUS = {
  icon: HiOutlineSignal,
  className: 'bg-emerald-50 text-emerald-900 dark:bg-white/10 dark:text-muted-foreground',
};

const DAY_MS = 24 * 60 * 60 * 1000;

function StatusBadge({ status }) {
  const config = STATUS[status] || FALLBACK_STATUS;
  const Icon = config.icon;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold capitalize ${config.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {humanize(status) || '—'}
    </span>
  );
}

function RequirementChip({ icon: Icon, on, onLabel, offLabel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-medium ${
        on
          ? 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-white/20 dark:bg-white/10 dark:text-foreground'
          : 'border-emerald-100 text-emerald-800/70 dark:border-white/10 dark:text-muted-foreground'
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {on ? onLabel : offLabel}
    </span>
  );
}

export default function SessionListCard({ interview }) {
  const [copyState, setCopyState] = useState('idle');
  const [now] = useState(() => Date.now());
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(interviewJoinUrl(interview.access_token));
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState('idle'), 2000);
  };

  const profile = interview.candidate_details?.profile;
  const candidateName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const expiresAt = interview.link_expires_at ? new Date(interview.link_expires_at) : null;
  const hasExpiry = expiresAt && !Number.isNaN(expiresAt.getTime());
  const isExpired = hasExpiry && expiresAt.getTime() <= now;
  const isExpiringSoon = hasExpiry && !isExpired && expiresAt.getTime() - now < DAY_MS;
  const scheduled = formatUtcDateTime(interview.scheduled_at);
  const expiry = formatUtcDate(interview.link_expires_at);
  const attention = isExpired || isExpiringSoon;

  return (
    <article className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-emerald-100 bg-card transition-colors hover:border-emerald-300 dark:border-white/10 dark:hover:border-emerald-500/40">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-900 dark:bg-white/10 dark:text-foreground">
              <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">
                {interview.title || 'Technical interview'}
              </h3>
              <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-emerald-800/80 dark:text-muted-foreground">
                <HiOutlineUser className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {candidateName || interview.candidate_details?.email || '—'}
                </span>
              </p>
            </div>
          </div>
          <StatusBadge status={interview.status} />
        </div>

        <ul className="space-y-2 text-xs text-emerald-800/80 dark:text-muted-foreground">
          {scheduled && (
            <li className="flex items-center gap-2">
              <HiOutlineCalendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{scheduled}</span>
            </li>
          )}
          {expiry && (
            <li className={`flex items-center gap-2 ${attention ? 'font-medium text-amber-700 dark:text-amber-400' : ''}`}>
              {attention ? (
                <HiOutlineExclamationTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <HiOutlineClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>
                {isExpired ? `Link expired ${expiry}` : `Link expires ${expiry}`}
                {isExpiringSoon && ' (within 24 hours)'}
              </span>
            </li>
          )}
        </ul>

        <div className="flex flex-wrap gap-2">
          <RequirementChip
            icon={HiOutlineVideoCamera}
            on={!!interview.camera_required}
            onLabel="Camera required"
            offLabel="Camera optional"
          />
          <RequirementChip
            icon={HiOutlineMicrophone}
            on={!!interview.mic_required}
            onLabel="Mic required"
            offLabel="Mic optional"
          />
          <RequirementChip
            icon={HiOutlineComputerDesktop}
            on={!!interview.screen_share_enabled}
            onLabel="Screen share on"
            offLabel="Screen share off"
          />
        </div>

        {interview.candidate_instructions && (
          <div className="rounded-md bg-emerald-50 p-3 dark:bg-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800/70 dark:text-muted-foreground">
              Instructions
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-emerald-900 dark:text-muted-foreground">
              {interview.candidate_instructions}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 border-t border-emerald-100 p-4 sm:grid-cols-2 dark:border-white/10">
        <button
          type="button"
          onClick={copyLink}
          disabled={!interview.interview_link}
          className={listBtnSecondary}
        >
          {copyState === 'copied' ? (
            <HiOutlineClipboardDocumentCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <HiOutlineClipboardDocument className="h-4 w-4" aria-hidden="true" />
          )}
          {copyState === 'copied' ? 'Link copied' : copyState === 'failed' ? 'Copy failed' : 'Copy link'}
        </button>
        {interview.access_token ? (
          <Link href={`/interview/join/${interview.access_token}`} className={listBtnPrimary}>
            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
            Join session
          </Link>
        ) : (
          <button type="button" disabled className={listBtnPrimary}>
            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
            Room unavailable
          </button>
        )}
      </div>
    </article>
  );
}
