'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import {
  HiOutlineChevronLeft, HiOutlineUserGroup, HiOutlineSparkles,
  HiOutlineCheckCircle, HiOutlineChartBar, HiOutlineArrowTopRightOnSquare,
  HiOutlineClock, HiOutlineDocumentText, HiOutlineClipboardDocumentList,
  HiOutlineXCircle, HiOutlineShieldExclamation, HiOutlineArrowPath,
  HiOutlineTrophy, HiOutlineIdentification,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const STATUS_STYLES = {
  evaluated: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  pending: 'bg-muted text-muted-foreground border-border',
  terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SCORE_BUCKETS = ['0-20', '21-40', '41-60', '61-80', '81-100'];

const cardClass = 'rounded-xl border border-border bg-card p-5 lg:p-6';
const sectionTitle = 'mb-4 flex items-center gap-3';

function SectionIcon({ icon: Icon, tone }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function ScoreDistributionChart({ sessions }) {
  const [dimensions, setDimensions] = useState({ width: 600, height: 250 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(window.innerWidth - 110, 600);
      setDimensions({ width: Math.max(w, 260), height: 250 });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const evaluated = sessions.filter(s => s.score != null);
  const buckets = SCORE_BUCKETS.map(b => {
    const [lo, hi] = b.split('-').map(Number);
    return {
      bucket: b,
      count: evaluated.filter(s => s.score >= lo && s.score <= hi).length,
    };
  });

  const xScale = scaleBand({ domain: SCORE_BUCKETS, range: [0, dimensions.width - 60], padding: 0.3 });
  const yScale = scaleLinear({ domain: [0, Math.max(...buckets.map(b => b.count), 1)], range: [dimensions.height - 50, 0] });

  return (
    <div className={`${cardClass} relative`}>
      <h3 className={`${sectionTitle} text-sm font-semibold`}>
        <SectionIcon icon={HiOutlineChartBar} tone="bg-emerald-500/10 text-emerald-500" />
        <span>
          Score distribution
          <span className="block text-xs font-normal text-muted-foreground">How many candidates landed in each score range</span>
        </span>
      </h3>
      <div className="overflow-x-auto">
        <svg width={dimensions.width} height={dimensions.height + 10} role="img" aria-label="Bar chart of candidate score ranges">
          <Group left={40} top={10}>
            {buckets.map((b) => {
              const barWidth = xScale.bandwidth();
              const x = xScale(b.bucket);
              const y = yScale(b.count);
              const barHeight = dimensions.height - 50 - yScale(b.count);
              const isPass = b.bucket === '61-80' || b.bucket === '81-100';
              return (
                <g key={b.bucket}>
                  <rect x={x} y={y} width={barWidth} height={barHeight} fill={isPass ? '#10b981' : '#ef4444'} opacity={0.7} rx={4} className="hover:opacity-100 transition-opacity cursor-pointer"
                    onMouseEnter={() => setTooltip({ label: `${b.bucket}: ${b.count} candidate${b.count !== 1 ? 's' : ''}`, x: x + barWidth / 2 + 40, y: y - 10 })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize={11} fill="currentColor" className="font-semibold font-mono">{b.count}</text>
                </g>
              );
            })}
            <AxisBottom scale={xScale} top={dimensions.height - 50} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={() => ({ fontSize: 10, fill: 'var(--muted-foreground)', textAnchor: 'middle', fontWeight: 600 })} />
            <AxisLeft scale={yScale} left={0} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={() => ({ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 })} />
          </Group>
        </svg>
      </div>
      {tooltip && (
        <div className="pointer-events-none absolute rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-xl" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.label}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500 opacity-70" /> Pass range (above 60)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500 opacity-70" /> Fail range</span>
      </div>
    </div>
  );
}

export default function InterviewSessions() {
  const { id } = useParams();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [interviewInfo, setInterviewInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, sessionsData] = await Promise.all([
          api.get(`/ai-interviews/${id}/stats/`),
          api.get(`/ai-interviews/${id}/sessions/`),
        ]);
        setStats(statsData);
        setSessions(sessionsData.sessions || []);
        setInterviewInfo({ title: statsData.interview_title, job_title: statsData.job_title, passing_score: statsData.passing_score });
        setLoadError('');
      } catch (e) {
        console.error(e);
        setLoadError('We could not load the sessions for this interview. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError('');
    setAttempt((n) => n + 1);
  };

  const handleBack = () => {
    setNavigating(true);
    router.back();
  };

  if (loading || navigating) return <PageSkeleton stats={0} cards={2} />;

  if (!stats) {
    return (
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-6 px-4 pb-20 pt-6 md:px-8">
        {loadError ? (
          <>
            <FormError title="Something went wrong" message={loadError} />
            <button
              type="button"
              onClick={retry}
              title="Load these sessions again"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
            >
              <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          </>
        ) : (
          <EmptyState
            icon={HiOutlineDocumentText}
            title="Interview not found"
            text="It may have been removed. Go back to your AI interviews list."
          />
        )}
      </div>
    );
  }

  const statCards = [
    { label: 'Total', value: stats.total_candidates, icon: HiOutlineUserGroup, tone: 'bg-blue-500/10 text-blue-500', hint: 'Candidates assigned to this interview' },
    { label: 'Completed', value: stats.completed, icon: HiOutlineCheckCircle, tone: 'bg-emerald-500/10 text-emerald-500', hint: 'Candidates who finished the interview' },
    { label: 'In progress', value: stats.pending, icon: HiOutlineClock, tone: 'bg-yellow-500/10 text-yellow-500', hint: 'Candidates still answering' },
    { label: 'Terminated', value: stats.terminated, icon: HiOutlineShieldExclamation, tone: 'bg-red-500/10 text-red-400', hint: 'Ended early by a guardrail' },
    { label: 'Avg score', value: stats.average_score, suffix: '%', icon: HiOutlineChartBar, tone: 'bg-violet-500/10 text-violet-500', hint: 'Average overall score' },
    { label: 'Pass rate', value: stats.total_candidates ? Math.round((stats.passed_count / (stats.completed || 1)) * 100) : 0, suffix: '%', icon: HiOutlineSparkles, tone: 'bg-amber-500/10 text-amber-500', hint: 'Share of completed candidates who passed' },
  ];

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-20 pt-6 md:px-8">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/80 px-4 pb-4 backdrop-blur-lg md:-mx-8 md:px-8">
        <button
          type="button"
          onClick={handleBack}
          title="Go back to the previous page"
          className="group mb-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-emerald-400"
        >
          <HiOutlineChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          Back to interview
        </button>

        <div className="min-w-0 space-y-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span title="Job" className="max-w-full truncate rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              {interviewInfo?.job_title || 'N/A'}
            </span>
            <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight lg:text-3xl">{interviewInfo?.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} · Passing score: {stats.passing_score}%
          </p>
        </div>
      </div>

      {loadError && (
        <div className="space-y-3">
          <FormError title="Something went wrong" message={loadError} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            title={stat.hint}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-xl font-semibold">{stat.value}{stat.suffix || ''}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart + summary */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <ScoreDistributionChart sessions={sessions} />
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
            <h3 className={`${sectionTitle} text-sm font-semibold`}>
              <SectionIcon icon={HiOutlineClipboardDocumentList} tone="bg-emerald-500/10 text-emerald-500" />
              Passing summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span title="Candidates who passed" className="flex items-center gap-2 text-sm font-semibold"><HiOutlineCheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Passed</span>
                <span className="text-lg font-semibold text-emerald-400">{stats.passed_count}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span title="Candidates who did not reach the passing score" className="flex items-center gap-2 text-sm font-semibold"><HiOutlineXCircle className="h-4 w-4 text-red-400" aria-hidden="true" /> Failed</span>
                <span className="text-lg font-semibold text-red-400">{stats.failed_count}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span title="Candidates ended early by a guardrail" className="flex items-center gap-2 text-sm font-semibold"><HiOutlineShieldExclamation className="h-4 w-4 text-orange-400" aria-hidden="true" /> Terminated</span>
                <span className="text-lg font-semibold text-orange-400">{stats.terminated}</span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: stats.total_candidates ? `${(stats.passed_count / stats.total_candidates) * 100}%` : '0%' }} />
                <div className="h-full bg-red-500 transition-all" style={{ width: stats.total_candidates ? `${(stats.failed_count / stats.total_candidates) * 100}%` : '0%' }} />
                <div className="h-full bg-orange-500 transition-all" style={{ width: stats.total_candidates ? `${((stats.terminated || 0) / stats.total_candidates) * 100}%` : '0%' }} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
            <h3 className={`${sectionTitle} text-sm font-semibold`}>
              <SectionIcon icon={HiOutlineTrophy} tone="bg-amber-500/10 text-amber-500" />
              Score range
            </h3>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
              <div>
                <p className="text-3xl font-semibold text-emerald-400">{stats.highest_score ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Highest</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-red-400">{stats.lowest_score ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Lowest</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Candidates */}
      {sessions.length === 0 ? (
        <EmptyState
          icon={HiOutlineUserGroup}
          title="No sessions yet"
          text="Assign candidates to this interview to start seeing results here."
          action={
            <Link
              href={`/recruiter/ai-interview/${id}`}
              title="Open the interview to assign candidates"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20"
            >
              <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> Assign candidates
            </Link>
          }
        />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight">
              <SectionIcon icon={HiOutlineUserGroup} tone="bg-emerald-500/10 text-emerald-500" />
              All candidates
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">{sessions.length} total</span>
          </div>

          {sessions.map((session, idx) => {
            const passed = session.overall_score >= (stats.passing_score || 65);
            const isTerminated = session.status === 'terminated' || session.guardrail_flagged;
            const statusBg = isTerminated ? 'bg-red-500/10 border-red-500/20 text-red-400' : passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-400';
            return (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-emerald-500/25 lg:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div title="Candidate" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-sm font-semibold text-muted-foreground">
                      {session.candidate_name?.charAt(0)?.toUpperCase() || <HiOutlineIdentification className="h-5 w-5" aria-hidden="true" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold tracking-tight transition-colors group-hover:text-emerald-400">
                        {session.candidate_name || 'Unknown'}
                      </h4>
                      <p className="truncate text-xs text-muted-foreground">{session.candidate_email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    {isTerminated ? (
                      <span className="flex min-w-0 items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                        <HiOutlineShieldExclamation className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">Guardrail: {session.guardrail_reason?.slice(0, 40) || 'Flagged'}</span>
                      </span>
                    ) : (
                      <>
                        <div title="Overall score" className="flex items-center gap-2">
                          <HiOutlineChartBar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span className={`text-xl font-semibold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                            {session.score ?? '—'}
                          </span>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusBg}`}>
                          {session.score >= (stats.passing_score || 65) ? 'Passed' : 'Failed'}
                        </span>
                      </>
                    )}

                    <span
                      title="Current status of this session"
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${STATUS_STYLES[session.status] || STATUS_STYLES.pending}`}
                    >
                      {session.status?.replace(/_/g, ' ')}
                    </span>
                    <Link
                      href={`/recruiter/ai-interview/sessions/${session.session_id}`}
                      title="Open the full report for this candidate"
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
                    >
                      <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" aria-hidden="true" /> View report
                    </Link>
                  </div>
                </div>

                {session.feedback && !isTerminated && (
                  <p className="line-clamp-2 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">
                    &ldquo;{session.feedback}&rdquo;
                  </p>
                )}
              </motion.div>
            );
          })}
        </section>
      )}
    </div>
  );
}
