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
  HiOutlineClock, HiOutlineDocumentText,
  HiOutlineXCircle, HiOutlineShieldExclamation,
} from 'react-icons/hi2';

const STATUS_STYLES = {
  evaluated: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  pending: 'bg-muted text-muted-foreground border-border',
  terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SCORE_BUCKETS = ['0-20', '21-40', '41-60', '61-80', '81-100'];

function ScoreDistributionChart({ sessions }) {
  const [dimensions, setDimensions] = useState({ width: 600, height: 250 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(window.innerWidth - 100, 600);
      setDimensions({ width: Math.max(w, 300), height: 250 });
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
    <div className="glass border border-border rounded-2xl p-6 relative">
      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
        <HiOutlineChartBar className="w-4 h-4 text-emerald-400" /> Score Distribution
      </h3>
      <svg width={dimensions.width} height={dimensions.height + 10}>
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
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize={11} fill="currentColor" className="font-bold font-mono">{b.count}</text>
              </g>
            );
          })}
          <AxisBottom scale={xScale} top={dimensions.height - 50} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={() => ({ fontSize: 9, fill: 'var(--muted-foreground)', textAnchor: 'middle', fontWeight: 700 })} />
          <AxisLeft scale={yScale} left={0} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={() => ({ fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 700 })} />
        </Group>
      </svg>
      {tooltip && (
        <div className="absolute px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-bold shadow-xl pointer-events-none" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.label}
        </div>
      )}
      <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 opacity-70" /> Pass range ({'>'}60)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 opacity-70" /> Fail range</span>
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBack = () => {
    setNavigating(true);
    router.back();
  };

  if (loading || navigating) {
    return (
      <div className="space-y-10 w-full px-4 pt-6 md:px-6 pb-20 animate-pulse">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg -mx-4 px-4 md:-mx-6 md:px-6 pb-4 border-b border-border">
          <div className="h-4 w-32 bg-secondary rounded mb-4" />
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 bg-secondary rounded-lg" />
            <div className="h-8 w-64 bg-secondary rounded-lg" />
          </div>
          <div className="h-4 w-48 bg-secondary rounded mt-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-secondary rounded" />
                <div className="h-5 w-12 bg-secondary rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="border border-border rounded-2xl p-6">
              <div className="h-4 w-36 bg-secondary rounded mb-4" />
              <div className="h-[260px] bg-secondary rounded-lg" />
            </div>
          </div>
          <div className="space-y-4 lg:col-span-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-border rounded-2xl p-6">
                <div className="h-4 w-32 bg-secondary rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-5 w-full bg-secondary rounded" />
                  <div className="h-5 w-full bg-secondary rounded" />
                  <div className="h-5 w-3/4 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-6 w-40 bg-secondary rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-border rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-44 bg-secondary rounded" />
                  <div className="h-3 w-60 bg-secondary rounded" />
                </div>
                <div className="h-8 w-28 bg-secondary rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Interview not found.</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total', value: stats.total_candidates, icon: HiOutlineUserGroup, color: 'text-blue-400' },
    { label: 'Completed', value: stats.completed, icon: HiOutlineCheckCircle, color: 'text-emerald-400' },
    { label: 'In Progress', value: stats.pending, icon: HiOutlineClock, color: 'text-yellow-400' },
    { label: 'Terminated', value: stats.terminated, icon: HiOutlineShieldExclamation, color: 'text-red-400' },
    { label: 'Avg Score', value: stats.average_score, suffix: '%', icon: HiOutlineChartBar, color: 'text-violet-400' },
    { label: 'Pass Rate', value: stats.total_candidates ? Math.round((stats.passed_count / (stats.completed || 1)) * 100) : 0, suffix: '%', icon: HiOutlineSparkles, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-10 w-full px-4 pt-6 md:px-6 pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg -mx-4 px-4 md:-mx-6 md:px-6 pb-4 border-b border-border">
        <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-emerald-400 transition-colors font-black text-[10px] uppercase tracking-widest group mb-4">
          <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Interview
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                {interviewInfo?.job_title || 'N/A'}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{interviewInfo?.title}</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} · Passing score: {stats.passing_score}%
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-black mt-0.5 ">{stat.value}{stat.suffix || ''}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Score Distribution Chart + Failed/Terminated */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ScoreDistributionChart sessions={sessions} interview={interviewInfo} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass border border-border rounded-2xl p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4 text-emerald-400" /> Passing Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-2"><HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" /> Passed</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{stats.passed_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-2"><HiOutlineXCircle className="w-4 h-4 text-red-400" /> Failed</span>
                <span className="text-lg font-black text-red-400 font-mono">{stats.failed_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-2"><HiOutlineShieldExclamation className="w-4 h-4 text-orange-400" /> Terminated</span>
                <span className="text-lg font-black text-orange-400 font-mono">{stats.terminated}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: stats.total_candidates ? `${(stats.passed_count / stats.total_candidates) * 100}%` : '0%' }} />
                <div className="bg-red-500 h-full transition-all" style={{ width: stats.total_candidates ? `${(stats.failed_count / stats.total_candidates) * 100}%` : '0%' }} />
                <div className="bg-orange-500 h-full transition-all" style={{ width: stats.total_candidates ? `${((stats.terminated || 0) / stats.total_candidates) * 100}%` : '0%' }} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass border border-border rounded-2xl p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <HiOutlineChartBar className="w-4 h-4 text-emerald-400" /> Score Range
            </h3>
            <div className="text-3xl font-black font-mono text-emerald-400">{stats.highest_score}<span className="text-sm text-muted-foreground font-bold"> highest</span></div>
            <div className="text-xl font-black font-mono text-red-400 mt-1">{stats.lowest_score}<span className="text-sm text-muted-foreground font-bold"> lowest</span></div>
          </motion.div>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto text-muted-foreground/40">
            <HiOutlineUserGroup className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground/60">No sessions yet</h3>
          <p className="text-muted-foreground text-sm">Assign this interview to candidates to start seeing results.</p>
          <Link href={`/recruiter/ai-interview/${id}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
            <HiOutlineSparkles className="w-4 h-4" /> Assign Candidates
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <HiOutlineUserGroup className="w-5 h-5 text-emerald-400" /> All Candidates
            </h2>
            <span className="text-xs text-muted-foreground font-bold">{sessions.length} total</span>
          </div>

          {sessions.map((session, idx) => {
            const passed = session.overall_score >= (stats.passing_score || 65);
            const isTerminated = session.status === 'terminated' || session.guardrail_flagged;
            const statusColor = isTerminated ? 'text-red-400' : passed ? 'text-emerald-400' : 'text-red-400';
            const statusBg = isTerminated ? 'bg-red-500/10 border-red-500/20 text-red-400' : passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-400';
            return (
              <motion.div key={session.session_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="glass border border-border rounded-xl p-5 hover:border-emerald-500/20 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-bold text-base shrink-0">
                      {session.candidate_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                        {session.candidate_name || 'Unknown'}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium truncate">{session.candidate_email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {isTerminated ? (
                      <div className="flex items-center gap-2">
                        <HiOutlineShieldExclamation className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Guardrail: {session.guardrail_reason?.slice(0, 40) || 'Flagged'}</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-right">
                          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block">Score</span>
                          <span className={`text-xl font-black font-mono ${statusColor}`}>
                            {session.score ?? '—'}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${statusBg}`}>
                          {isTerminated ? 'Terminated' : session.score >= (stats.passing_score || 65) ? 'Passed' : 'Failed'}
                        </span>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${STATUS_STYLES[session.status] || STATUS_STYLES.pending}`}>
                        {session.status}
                      </span>
                      <Link href={`/recruiter/ai-interview/sessions/${session.session_id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[8px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all shrink-0">
                        <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" /> View Report
                      </Link>
                    </div>
                  </div>
                </div>

                {session.feedback && !isTerminated && (
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-1 border-t border-border/50 pt-3">
                    &ldquo;{session.feedback}&rdquo;
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
