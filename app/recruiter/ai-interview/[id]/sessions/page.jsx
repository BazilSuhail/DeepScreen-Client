'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import {
  HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineFunnel, HiOutlineCheckCircle,
  HiOutlineClipboardDocumentList, HiOutlineClock, HiOutlineDocumentText, HiOutlineIdentification,
  HiOutlinePencilSquare, HiOutlineShieldCheck, HiOutlineShieldExclamation,
  HiOutlineTrophy, HiOutlineUserGroup, HiOutlineXCircle, HiOutlineChartBar, HiOutlineSparkles,
} from 'react-icons/hi2';
import {
  AsideBlocks, BTN, Card, DetailSkeleton, EmptyState, ErrorState, IconTile, Pill,
  SectionTitle, StatTile, StatusBadge, btnLink, btnSecondary, getScore, hintClass, isTerminatedSession,
} from '@/components/ai-interview/recruiter/AIInterviewDetailUi';
import { ScoreDistributionCard } from '@/components/ai-interview/recruiter/AIInterviewDetailCharts';

const ROOT = 'mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'passed', label: 'Passed' },
  { key: 'failed', label: 'Failed' },
  { key: 'terminated', label: 'Terminated' },
];

const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

function PassSummary({ stats }) {
  const total = stats.total_candidates || 0;
  const rows = [
    { label: 'Passed', value: stats.passed_count ?? 0, icon: HiOutlineCheckCircle, text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500' },
    { label: 'Failed', value: stats.failed_count ?? 0, icon: HiOutlineXCircle, text: 'text-red-700 dark:text-red-400', bar: 'bg-red-500' },
    { label: 'Terminated', value: stats.terminated ?? 0, icon: HiOutlineShieldExclamation, text: 'text-orange-700 dark:text-orange-400', bar: 'bg-orange-500' },
  ];
  return (
    <Card>
      <SectionTitle icon={HiOutlineClipboardDocumentList} title="Passing summary" />
      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={row.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-slate-200">
                <row.icon className={`h-4 w-4 ${row.text}`} aria-hidden="true" /> {row.label}
              </span>
              <span className={`font-mono text-lg font-semibold ${row.text}`}>{row.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/60 dark:bg-white/10" aria-hidden="true">
              <div className={`h-full rounded-full ${row.bar} transition-all`} style={{ width: `${pct(row.value, total)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className={`mt-4 ${hintClass}`}>Bars show each outcome as a share of {total} candidate{total !== 1 ? 's' : ''}.</p>
    </Card>
  );
}

function ScoreRange({ stats }) {
  const highest = stats.highest_score ?? '—';
  const lowest = stats.lowest_score ?? '—';
  return (
    <Card>
      <SectionTitle icon={HiOutlineTrophy} tone="amber" title="Score range" />
      <dl className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-emerald-50/60 p-4 dark:bg-white/[0.03]">
          <dt className="text-xs font-semibold text-emerald-800/70 dark:text-slate-400">Highest</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold text-emerald-700 dark:text-emerald-400">{highest}</dd>
        </div>
        <div className="rounded-xl bg-emerald-50/60 p-4 dark:bg-white/[0.03]">
          <dt className="text-xs font-semibold text-emerald-800/70 dark:text-slate-400">Lowest</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold text-red-700 dark:text-red-400">{lowest}</dd>
        </div>
      </dl>
    </Card>
  );
}

function CandidateRow({ session, passingScore }) {
  const score = getScore(session);
  const terminated = isTerminatedSession(session);
  const passed = !terminated && score != null && score >= passingScore;
  const failed = !terminated && score != null && score < passingScore;
  const initial = session.candidate_name?.charAt(0)?.toUpperCase() || session.candidate_email?.charAt(0)?.toUpperCase();
  const name = session.candidate_name || session.candidate_email || 'Unknown candidate';
  const reportHref = `/recruiter/ai-interview/sessions/${session.session_id}`;

  return (
    <li className="flex min-w-0 flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card sm:p-5">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {initial ? (
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-100 text-sm font-semibold text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              {initial}
            </span>
          ) : (
            <IconTile icon={HiOutlineIdentification} tone="emerald" />
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-emerald-950 dark:text-foreground" title={name}>{name}</h3>
            {session.candidate_email && session.candidate_name && (
              <p className="truncate text-xs text-emerald-800/70 dark:text-slate-400" title={session.candidate_email}>{session.candidate_email}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {terminated ? (
            <Pill tone="red" icon={HiOutlineShieldExclamation}>Terminated</Pill>
          ) : score != null ? (
            <>
              <span className={`font-mono text-lg font-semibold ${passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`} aria-label={`Score ${score} out of 100`}>
                {score}
                <span className="text-xs font-normal text-emerald-800/70 dark:text-slate-400">/100</span>
              </span>
              {passed && <Pill tone="emerald" icon={HiOutlineCheckCircle}>Passed</Pill>}
              {failed && <Pill tone="red" icon={HiOutlineXCircle}>Failed</Pill>}
            </>
          ) : (
            <Pill tone="neutral" icon={HiOutlineClock}>Not scored</Pill>
          )}
          <StatusBadge status={session.status} />
          <Link href={reportHref} className={`${btnSecondary} ml-auto lg:ml-0`} aria-label={`View report for ${name}`}>
            View report <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {terminated && session.guardrail_reason && (
        <p className="flex items-start gap-2 border-t border-emerald-100 pt-3 text-xs leading-relaxed text-red-700 dark:border-white/10 dark:text-red-400">
          <HiOutlineShieldExclamation className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{session.guardrail_reason}</span>
        </p>
      )}
      {!terminated && session.feedback && (
        <p className="line-clamp-2 border-t border-emerald-100 pt-3 text-xs leading-relaxed text-emerald-800/70 dark:border-white/10 dark:text-slate-400">
          &ldquo;{session.feedback}&rdquo;
        </p>
      )}
    </li>
  );
}

export default function InterviewSessions() {
  const { id } = useParams();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsData, sessionsData] = await Promise.all([
          api.get(`/ai-interviews/${id}/stats/`),
          api.get(`/ai-interviews/${id}/sessions/`),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setSessions(Array.isArray(sessionsData?.sessions) ? sessionsData.sessions : []);
        setLoadError('');
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setLoadError('We could not load the candidates for this interview. Check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError('');
    setAttempt((n) => n + 1);
  };

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(`/recruiter/ai-interview/${id}`);
  };

  const passingScore = stats?.passing_score ?? 65;

  const counts = useMemo(() => {
    const result = { all: sessions.length, passed: 0, failed: 0, terminated: 0 };
    sessions.forEach((s) => {
      const score = getScore(s);
      if (isTerminatedSession(s)) result.terminated += 1;
      else if (score != null && score >= passingScore) result.passed += 1;
      else if (score != null) result.failed += 1;
    });
    return result;
  }, [sessions, passingScore]);

  const visibleSessions = useMemo(() => sessions.filter((s) => {
    if (filter === 'all') return true;
    const score = getScore(s);
    const terminated = isTerminatedSession(s);
    if (filter === 'terminated') return terminated;
    if (terminated || score == null) return false;
    return filter === 'passed' ? score >= passingScore : score < passingScore;
  }), [sessions, filter, passingScore]);

  const bannerTitle = stats ? stats.interview_title || 'Candidates' : 'Candidates';
  const hasSessions = sessions.length > 0;

  const banner = (
    <DashboardBanner
      loading={loading}
      icon={HiOutlineUserGroup}
      badge={stats && !loading ? { label: `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`, icon: HiOutlineUserGroup } : undefined}
      title={bannerTitle}
      subtitle={stats?.job_title ? `Candidates for ${stats.job_title}` : 'Candidates who took this AI interview'}
      aside={
        loading ? (
          <AsideBlocks count={1} />
        ) : stats ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link href={`/recruiter/ai-interview/${id}`} className={btnSecondary}>
              <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit interview
            </Link>
          </div>
        ) : null
      }
      footer={
        stats && !loading ? (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleBack} className={`${btnLink} -ml-2`} aria-label="Back to interview">
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to interview
            </button>
            <Pill tone="emerald" icon={HiOutlineShieldCheck}>Passing score {passingScore}%</Pill>
          </div>
        ) : null
      }
    />
  );

  if (loading) {
    return (
      <div className={ROOT}>
        {banner}
        <DetailSkeleton stats={4} blocks={2} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={ROOT}>
        {banner}
        {loadError ? (
          <ErrorState title="Could not load the candidates" message={loadError} onRetry={retry} />
        ) : (
          <EmptyState
            icon={HiOutlineDocumentText}
            title="Interview not found"
            text="It may have been removed. Go back to your AI interviews list."
            action={
              <Link href="/recruiter/ai-interview" className={`${btnSecondary} w-fit`}>
                <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to AI interviews
              </Link>
            }
          />
        )}
      </div>
    );
  }

  const statTiles = [
    { label: 'Total', value: stats.total_candidates ?? 0, icon: HiOutlineUserGroup, hint: 'Candidates assigned to this interview' },
    { label: 'Completed', value: stats.completed ?? 0, icon: HiOutlineCheckCircle, hint: 'Candidates who finished the interview' },
    { label: 'In progress', value: stats.pending ?? 0, icon: HiOutlineClock, hint: 'Candidates still answering' },
    { label: 'Terminated', value: stats.terminated ?? 0, icon: HiOutlineShieldExclamation, hint: 'Ended early by a guardrail' },
    { label: 'Average score', value: stats.average_score != null ? `${stats.average_score}%` : null, icon: HiOutlineChartBar, hint: 'Average overall score' },
    {
      label: 'Pass rate',
      value: stats.completed ? `${pct(stats.passed_count ?? 0, stats.completed)}%` : null,
      icon: HiOutlineShieldCheck,
      hint: 'Share of completed candidates who passed',
    },
  ];

  return (
    <div className={ROOT}>
      {banner}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {statTiles.map((tile) => (
          <StatTile key={tile.label} label={tile.label} value={tile.value} icon={tile.icon} hint={tile.hint} />
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <ScoreDistributionCard sessions={sessions} passingScore={passingScore} />
        </div>
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <PassSummary stats={stats} />
          <ScoreRange stats={stats} />
        </div>
      </div>

      <section aria-labelledby="candidates-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="candidates-heading" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-emerald-950 dark:text-foreground">
            <HiOutlineSparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Candidates
          </h2>
          {hasSessions && (
            <fieldset aria-label="Filter candidates" className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`${BTN} min-h-11 gap-1.5 border px-3 text-xs ${filter === f.key ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-white/10 dark:bg-card dark:text-slate-300 dark:hover:bg-white/5'}`}
                >
                  {f.label}
                  <span className="font-mono text-emerald-700/70 dark:text-slate-400">{counts[f.key]}</span>
                </button>
              ))}
            </fieldset>
          )}
        </div>

        {!hasSessions ? (
          <EmptyState
            icon={HiOutlineUserGroup}
            title="No candidates yet"
            text="Candidates who take this interview will appear here with their scores and reports."
            action={
              <Link href={`/recruiter/ai-interview/${id}`} className={`${btnLink} text-emerald-700 dark:text-emerald-400`}>
                <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to interview
              </Link>
            }
          />
        ) : visibleSessions.length === 0 ? (
          <EmptyState
            icon={HiOutlineFunnel}
            title="No candidates match this filter"
            text="Try another filter to see the rest of the candidates."
            action={
              <button type="button" onClick={() => setFilter('all')} className={btnSecondary}>
                Show all candidates
              </button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {visibleSessions.map((session, idx) => (
              <CandidateRow
                key={session.session_id ?? `row-${idx}`}
                session={session}
                passingScore={passingScore}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
