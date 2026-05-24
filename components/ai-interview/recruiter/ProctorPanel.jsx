'use client';

import {
  HiOutlineArrowPath, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineShieldCheck,
  HiOutlineShieldExclamation, HiOutlineSignal, HiOutlineSignalSlash,
} from 'react-icons/hi2';
import useProctorFeed from '@/hooks/useProctorFeed';
import {
  Card, EmptyState, ErrorState, Pill, SectionTitle, btnSecondary, formatLabel, hintClass,
} from '@/components/ai-interview/recruiter/AIInterviewDetailUi';

const INDICATOR = {
  clean: { label: 'Clean', tone: 'emerald', icon: HiOutlineShieldCheck },
  review: { label: 'Needs review', tone: 'yellow', icon: HiOutlineExclamationTriangle },
  concern: { label: 'Concern', tone: 'red', icon: HiOutlineShieldExclamation },
};

const LIVE = {
  connecting: { label: 'Connecting', tone: 'neutral', icon: HiOutlineArrowPath },
  live: { label: 'Live', tone: 'emerald', icon: HiOutlineSignal },
  reconnecting: { label: 'Reconnecting', tone: 'yellow', icon: HiOutlineArrowPath },
  refused: { label: 'Live feed refused', tone: 'red', icon: HiOutlineSignalSlash },
  unavailable: { label: 'Live feed offline', tone: 'neutral', icon: HiOutlineSignalSlash },
};

const SEVERITY_TONE = { serious: 'red', warning: 'yellow', info: 'neutral' };

const COUNT_FIELDS = [
  { key: 'strikes', label: 'Strikes' },
  { key: 'serious', label: 'Serious' },
  { key: 'critical', label: 'Critical' },
  { key: 'event_count', label: 'Events' },
];

const formatTime = (iso) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';
};

export default function ProctorPanel({ sessionId }) {
  const { report, events, loadError, live, refresh } = useProctorFeed(sessionId);
  const indicator = INDICATOR[report?.indicator] ?? INDICATOR.clean;
  const liveMeta = LIVE[live] ?? LIVE.connecting;
  const newestFirst = [...events].reverse();

  return (
    <Card className="min-w-0 space-y-5">
      <SectionTitle
        icon={HiOutlineShieldCheck}
        title="Proctoring"
        description="Integrity signals from this interview"
        action={<Pill tone={liveMeta.tone} icon={liveMeta.icon}>{liveMeta.label}</Pill>}
      />

      {live === 'refused' && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          Your account cannot receive live proctoring updates for this session. The summary below is from the last load.
        </p>
      )}
      {live === 'unavailable' && (
        <p className="flex flex-wrap items-center gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
          Live updates stopped after several attempts.
          <button type="button" onClick={refresh} className={`${btnSecondary} min-h-9 px-3`}>Reconnect</button>
        </p>
      )}

      {!report && loadError && (
        <ErrorState title="Could not load proctoring data" message={loadError} onRetry={refresh} />
      )}
      {!report && !loadError && <p className={hintClass}>Loading proctoring data...</p>}

      {report && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone={indicator.tone} icon={indicator.icon}>{indicator.label}</Pill>
            <span className={`${hintClass} tabular-nums`}>
              Last heartbeat: {report.last_heartbeat_at ? formatTime(report.last_heartbeat_at) : 'none yet'}
            </span>
          </div>

          {report.reasons?.length > 0 ? (
            <ul className="space-y-2">
              {report.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-emerald-900 dark:text-foreground">
                  <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span className="min-w-0 break-words">{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-sm text-emerald-900 dark:text-foreground">
              <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              No proctoring concerns recorded.
            </p>
          )}

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COUNT_FIELDS.map((f) => (
              <div key={f.key} className="rounded-md border border-emerald-100 p-3 dark:border-white/10">
                <dt className="text-xs font-semibold text-emerald-800/80 dark:text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-950 dark:text-foreground">
                  {report.counts?.[f.key] ?? 0}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={hintClass}>Timeline updates live. Counts and the indicator refresh on reload.</p>
            <button type="button" onClick={refresh} className={`${btnSecondary} min-h-9 px-3`}>
              <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Refresh
            </button>
          </div>
        </>
      )}

      {report && (
        newestFirst.length ? (
          <ol className="max-h-80 space-y-2 overflow-y-auto pr-1" aria-label="Proctoring timeline, newest first">
            {newestFirst.map((e) => (
              <li
                key={`${e.seq}-${e.kind}-${e.t_server}`}
                className="flex min-w-0 items-center justify-between gap-3 border border-emerald-100 bg-emerald-50/60 p-3 text-sm dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span className="min-w-0 truncate font-semibold text-emerald-950 dark:text-foreground">{formatLabel(e.kind)}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <Pill tone={SEVERITY_TONE[e.severity] ?? 'neutral'}>{formatLabel(e.severity) || 'event'}</Pill>
                  <time dateTime={e.t_server} className="tabular-nums text-xs text-emerald-800/70 dark:text-muted-foreground">
                    {formatTime(e.t_server)}
                  </time>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={HiOutlineShieldCheck} title="No proctoring events" text="Events appear here as the interview is monitored." />
        )
      )}
    </Card>
  );
}
