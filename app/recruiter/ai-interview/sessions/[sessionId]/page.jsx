'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
import {
  HiOutlineChevronLeft, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineShieldExclamation, HiOutlineClock,
  HiOutlineChartBar, HiOutlineSparkles, HiOutlineClipboardDocumentList,
  HiOutlineChatBubbleLeftRight, HiOutlineEye, HiOutlineEyeSlash,
  HiOutlineExclamationTriangle, HiOutlineStar, HiOutlineArrowPath,
  HiOutlineBars3BottomLeft, HiOutlineCog6Tooth, HiOutlineLightBulb,
  HiOutlineIdentification, HiOutlineDocumentText,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const STATUS_BADGE = {
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  evaluated: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  pending: 'bg-muted text-muted-foreground border-border',
  terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const cardClass = 'rounded-xl border border-border bg-card p-5 lg:p-6';

function SectionTitle({ icon: Icon, tone = 'bg-emerald-500/10 text-emerald-500', children, hint }) {
  return (
    <div className="mb-4 flex min-w-0 items-center gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="min-w-0 text-base font-semibold tracking-tight">
        {children}
        {hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}
      </h3>
    </div>
  );
}

function CriteriaChart({ criteriaScores }) {
  const entries = Object.entries(criteriaScores || {});
  if (!entries.length) return null;

  const width = 600;
  const height = 250;
  const margin = { top: 20, right: 20, bottom: 60, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleBand({ domain: entries.map(([k]) => k.replace(/_/g, ' ')), range: [0, xMax], padding: 0.3 });
  const yScale = scaleLinear({ domain: [0, 100], range: [yMax, 0] });

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Score for each criterion, pass line at 65">
      <Group left={margin.left} top={margin.top}>
        {entries.map(([key, score]) => {
          const name = key.replace(/_/g, ' ');
          const barWidth = xScale.bandwidth();
          const x = xScale(name);
          const barHeight = yMax - yScale(score);
          return (
            <g key={key}>
              <rect x={x} y={yScale(score)} width={barWidth} height={barHeight} fill={score >= 65 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'} rx={4} opacity={0.85} className="hover:opacity-100 transition-opacity" />
              <text x={x + barWidth / 2} y={yScale(score) - 6} textAnchor="middle" fontSize={13} fill="currentColor" className="font-semibold font-mono">{score}</text>
              <text x={x + barWidth / 2} y={yMax + 16} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)" className="font-semibold capitalize">{name.length > 12 ? name.slice(0, 12) + '...' : name}</text>
            </g>
          );
        })}
        <line x1={0} y1={yScale(65)} x2={xMax} y2={yScale(65)} stroke="#10b981" strokeDasharray="4,4" strokeWidth={1.5} opacity={0.5} />
        <AxisBottom scale={xScale} top={yMax} hide />
      </Group>
    </svg>
  );
}

function TranscriptBlock({ messages }) {
  const [expanded, setExpanded] = useState(false);
  if (!messages || !messages.length) return null;

  const displayMessages = expanded ? messages : messages.slice(-4);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        title={expanded ? 'Show only the last few messages' : 'Show the full conversation'}
        className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/20 p-5 text-left transition-colors hover:bg-secondary/40"
      >
        <span className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <HiOutlineChatBubbleLeftRight className="h-5 w-5" aria-hidden="true" />
          </span>
          Interview transcript
          <span className="font-mono text-xs font-normal text-muted-foreground">({messages.length} messages)</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          {expanded ? <><HiOutlineEyeSlash className="h-4 w-4" aria-hidden="true" /> Collapse</> : <><HiOutlineEye className="h-4 w-4" aria-hidden="true" /> {messages.length > 4 ? `Show all (${messages.length})` : 'Show'}</>}
        </span>
      </button>
      <div className="max-h-[500px] divide-y divide-border overflow-y-auto">
        {displayMessages.map((msg, i) => {
          if (msg.role === 'system') return null;
          const isInterviewer = msg.role === 'assistant';
          const Icon = isInterviewer ? HiOutlineSparkles : HiOutlineIdentification;
          return (
            <div key={i} className={`p-4 ${isInterviewer ? 'bg-secondary/10' : ''}`}>
              <div className="flex items-start gap-3">
                <div
                  title={isInterviewer ? 'AI interviewer' : 'Candidate'}
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isInterviewer ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                    {isInterviewer ? 'Interviewer' : 'Candidate'} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SessionDetail() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [deciding, setDeciding] = useState(false);
  const [decisionMsg, setDecisionMsg] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [rejectOthers, setRejectOthers] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/ai-interviews/session/${sessionId}/`);
        setSession(data);
        setLoadError('');
      } catch (e) {
        console.error(e);
        setLoadError('We could not load this candidate report. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId, attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError('');
    setAttempt((n) => n + 1);
  };

  const handleDecision = async (action) => {
    setDeciding(true);
    setDecisionError('');
    try {
      await api.post(`/ai-interviews/sessions/${sessionId}/decide/`, {
        action,
        notes: decisionMsg || null,
        reject_others: action === 'select' ? rejectOthers : false,
      });
      alert(`Candidate ${action === 'select' ? 'advanced' : 'rejected'} successfully`);
      router.back();
    } catch (e) {
      setDecisionError(e.message || `Failed to ${action} candidate`);
    } finally {
      setDeciding(false);
    }
  };

  if (loading) return <PageSkeleton stats={0} cards={2} />;

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-6 px-4 pb-20 pt-6 md:px-8">
        {loadError ? (
          <>
            <FormError title="Could not load the report" message={loadError} />
            <button
              type="button"
              onClick={retry}
              title="Load this report again"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
            >
              <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          </>
        ) : (
          <EmptyState
            icon={HiOutlineDocumentText}
            title="Session not found"
            text="This candidate report may have been removed. Go back to the sessions list."
          />
        )}
      </div>
    );
  }

  const isTerminated = session.status === 'terminated' || session.guardrail_flagged;
  const isCompleted = session.status === 'completed' || session.status === 'evaluated';
  const conversationHistory = session.conversation_history || [];
  const userMessages = conversationHistory.filter(m => m.role === 'user');
  const criteriaScores = session.detailed_criteria_scores || {};
  const candidateReport = session.candidate_report;
  const summaryBlocks = session.summary_blocks || [];
  const passed = session.overall_score >= (session.interview_config?.passing_score || 65);

  return (
    <div className="mx-auto w-full max-w-[1400px] min-w-0 space-y-6 px-4 pb-24 pt-6 md:px-8">
      {/* Back & header */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          title="Go back to the candidates list"
          className="group flex w-fit items-center gap-2 pl-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-emerald-400"
        >
          <HiOutlineChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          Back to sessions
        </button>

        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div title="Candidate" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-lg font-semibold">
              {session.candidate_email?.charAt(0)?.toUpperCase() || <HiOutlineIdentification className="h-6 w-6" aria-hidden="true" />}
            </div>
            <div className="min-w-0 space-y-1.5">
              <h1 className="break-all text-xl font-semibold tracking-tight lg:text-2xl">{session.candidate_email || 'Unknown candidate'}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400">{session.job_title}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${STATUS_BADGE[session.status] || 'bg-muted text-muted-foreground border-border'}`}>
                  {session.status?.replace(/_/g, ' ')}
                </span>
                {isTerminated && (
                  <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-red-400">
                    <HiOutlineShieldExclamation className="h-3.5 w-3.5" aria-hidden="true" /> Guardrail flagged
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {session.question_count != null && (
              <div title="Questions asked" className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Questions</span>
                <span className="text-lg font-semibold">{session.question_count}</span>
              </div>
            )}
            {session.duration_taken_minutes != null && (
              <div title="Time taken" className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Duration</span>
                <span className="text-lg font-semibold">{session.duration_taken_minutes} min</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guardrail banner */}
      {isTerminated && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-5 lg:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
            <HiOutlineShieldExclamation className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-red-400">Interview terminated: guardrail triggered</h3>
            <p className="mt-1 text-sm text-muted-foreground">{session.guardrail_reason || 'Policy violation detected during interview.'}</p>
            <p className="mt-2 text-xs text-muted-foreground">No evaluation was performed. The interview ended when the guardrail fired.</p>
          </div>
        </motion.div>
      )}

      {!isTerminated && (
        <>
          {/* Score overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} flex flex-col items-center justify-center text-center lg:col-span-1`}>
              <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl ${passed ? 'border border-emerald-500/20 bg-emerald-500/10' : 'border border-red-500/20 bg-red-500/10'}`}>
                {passed ? <HiOutlineCheckCircle className="h-8 w-8 text-emerald-400" aria-hidden="true" /> : <HiOutlineXCircle className="h-8 w-8 text-red-400" aria-hidden="true" />}
              </div>
              <span className="text-4xl font-semibold">{session.overall_score ?? '—'}<span className="text-lg font-normal text-muted-foreground">/100</span></span>
              <span className={`mt-1 text-sm font-semibold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {passed ? 'Passed' : 'Failed'}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">Passing score: {session.interview_config?.passing_score || 65}%</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`${cardClass} min-w-0 lg:col-span-3`}>
              <SectionTitle icon={HiOutlineChartBar} hint="(pass line at 65)">Criteria breakdown</SectionTitle>
              <div className="overflow-x-auto">
                <CriteriaChart criteriaScores={criteriaScores} />
              </div>
            </motion.div>
          </div>

          {/* Strengths & weaknesses */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
              <SectionTitle icon={HiOutlineStar}>Key strengths</SectionTitle>
              {(session.strengths || []).length > 0 ? (
                <ul className="space-y-2.5">
                  {session.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                      <span className="min-w-0 break-words">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-muted-foreground">No strengths recorded.</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
              <SectionTitle icon={HiOutlineExclamationTriangle} tone="bg-red-500/10 text-red-400">Areas to improve</SectionTitle>
              {(session.weaknesses || []).length > 0 ? (
                <ul className="space-y-2.5">
                  {session.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <HiOutlineXCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                      <span className="min-w-0 break-words">{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-muted-foreground">No weaknesses recorded.</p>
              )}
            </motion.div>
          </div>

          {/* Overall assessment */}
          {session.overall_feedback && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
              <SectionTitle icon={HiOutlineBars3BottomLeft}>Overall assessment</SectionTitle>
              <p className="break-words text-sm leading-relaxed text-foreground/90">&ldquo;{session.overall_feedback}&rdquo;</p>
            </motion.div>
          )}

          {/* Candidate improvement report */}
          {candidateReport?.criteria_reports?.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
              <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <HiOutlineSparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                Improvement report
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {candidateReport.criteria_reports.map((cr, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }} className={`${cardClass} min-w-0`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="min-w-0 truncate text-sm font-semibold capitalize">{cr.criterion?.replace(/_/g, ' ') || 'Criterion'}</h4>
                      <span className={`shrink-0 text-sm font-semibold ${cr.score >= 65 ? 'text-emerald-400' : 'text-red-400'}`}>{cr.score}/100</span>
                    </div>
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{cr.feedback}</p>
                    <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-4">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <HiOutlineLightBulb className="h-3.5 w-3.5" aria-hidden="true" /> How to improve
                      </span>
                      <p className="text-xs leading-relaxed">{cr.how_to_improve}</p>
                    </div>
                    {cr.resources?.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <span className="block text-xs font-semibold text-muted-foreground">Resources</span>
                        <ul className="space-y-1">
                          {cr.resources.map((r, ri) => (
                            <li key={ri} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                              <span className="min-w-0 break-words">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {candidateReport.overall_improvement_plan && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 lg:p-6">
                  <span className="mb-2 block text-xs font-semibold text-emerald-400">Overall improvement plan</span>
                  <p className="text-sm leading-relaxed">{candidateReport.overall_improvement_plan}</p>
                </div>
              )}
            </motion.section>
          )}

          {/* Summary blocks */}
          {summaryBlocks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cardClass}>
              <SectionTitle icon={HiOutlineClipboardDocumentList} hint="(every 5 questions)">Session summaries</SectionTitle>
              <div className="space-y-3">
                {summaryBlocks.map((block, i) => (
                  <div key={i} className="rounded-xl border border-border bg-secondary/20 p-4">
                    <span className="mb-1 block text-xs font-semibold text-emerald-400">Block {block.block} · Q{block.question_range}</span>
                    <p className="text-xs leading-relaxed text-muted-foreground">{block.summary}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Full transcript */}
      {conversationHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <TranscriptBlock messages={conversationHistory} />
        </motion.div>
      )}

      {/* Recruiter decision */}
      {isCompleted && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`${cardClass} space-y-5`}>
          <SectionTitle icon={HiOutlineCog6Tooth} hint="Advance or reject this candidate">Recruiter decision</SectionTitle>

          {decisionError && <FormError title="Could not save the decision" message={decisionError} />}

          <div className="space-y-2">
            <label htmlFor="decision-notes" className="block text-xs font-semibold text-muted-foreground">Decision notes</label>
            <textarea
              id="decision-notes"
              value={decisionMsg}
              onChange={e => setDecisionMsg(e.target.value)}
              placeholder="Why you are advancing or rejecting this candidate (optional)"
              rows={2}
              className="w-full resize-none rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500/50"
            />
            <p className="text-xs text-muted-foreground/70">Notes are saved with the decision.</p>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2.5" title="Also reject every other candidate for this job">
            <input type="checkbox" checked={rejectOthers} onChange={e => setRejectOthers(e.target.checked)} className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500" />
            <span className="text-xs font-semibold text-muted-foreground">Reject all other candidates</span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleDecision('select')}
              disabled={deciding}
              title="Move this candidate to the next stage"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:opacity-50"
            >
              {deciding ? 'Processing...' : <><HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> Select and advance</>}
            </button>
            <button
              type="button"
              onClick={() => handleDecision('reject')}
              disabled={deciding}
              title="Reject this candidate"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 disabled:opacity-50"
            >
              {deciding ? 'Processing...' : <><HiOutlineXCircle className="h-4 w-4" aria-hidden="true" /> Reject</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* In progress */}
      {session.status === 'in_progress' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 text-center">
          <HiOutlineClock className="mx-auto mb-2 h-8 w-8 text-yellow-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-yellow-400">Interview in progress</h3>
          <p className="mt-1 text-xs text-muted-foreground">The candidate has not completed this interview yet. Results will appear here once they finish.</p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">{userMessages.length} question{userMessages.length !== 1 ? 's' : ''} answered so far</p>
        </motion.div>
      )}
    </div>
  );
}
