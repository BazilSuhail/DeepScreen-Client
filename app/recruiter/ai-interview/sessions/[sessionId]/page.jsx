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
  HiOutlineChartBar, HiOutlineSparkles, HiOutlineHashtag,
  HiOutlineChatBubbleLeftRight, HiOutlineEye, HiOutlineEyeSlash,
  HiOutlineExclamationTriangle, HiOutlineStar,
  HiOutlineBars3BottomLeft, HiOutlineCog6Tooth,
} from 'react-icons/hi2';

const STATUS_BADGE = {
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  evaluated: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  pending: 'bg-muted text-muted-foreground border-border',
  terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

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
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Group left={margin.left} top={margin.top}>
        {entries.map(([key, score]) => {
          const name = key.replace(/_/g, ' ');
          const barWidth = xScale.bandwidth();
          const x = xScale(name);
          const barHeight = yMax - yScale(score);
          return (
            <g key={key}>
              <rect x={x} y={yScale(score)} width={barWidth} height={barHeight} fill={score >= 65 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'} rx={4} opacity={0.85} className="hover:opacity-100 transition-opacity" />
              <text x={x + barWidth / 2} y={yScale(score) - 6} textAnchor="middle" fontSize={13} fill="currentColor" className="font-bold font-mono">{score}</text>
              <text x={x + barWidth / 2} y={yMax + 16} textAnchor="middle" fontSize={8} fill="var(--muted-foreground)" className="font-bold uppercase tracking-tight">{name.length > 12 ? name.slice(0, 12) + '...' : name}</text>
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
    <div className="glass border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-5 bg-secondary/20 border-b border-border hover:bg-secondary/40 transition-colors">
        <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-emerald-400" /> Interview Transcript
          <span className="text-muted-foreground font-mono text-[10px]">({messages.length} messages)</span>
        </span>
        <span className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-bold">
          {expanded ? <><HiOutlineEyeSlash className="w-3.5 h-3.5" /> Collapse</> : <><HiOutlineEye className="w-3.5 h-3.5" /> {messages.length > 4 ? `Show all (${messages.length})` : 'Show'}</>}
        </span>
      </button>
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {displayMessages.map((msg, i) => {
          if (msg.role === 'system') return null;
          const isInterviewer = msg.role === 'assistant';
          return (
            <div key={i} className={`p-4 ${isInterviewer ? 'bg-secondary/10' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black uppercase shrink-0 mt-0.5 ${isInterviewer ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                  {isInterviewer ? 'AI' : 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
                    {isInterviewer ? 'Interviewer' : 'Candidate'} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
  const [deciding, setDeciding] = useState(false);
  const [decisionMsg, setDecisionMsg] = useState('');
  const [rejectOthers, setRejectOthers] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/ai-interviews/session/${sessionId}/`);
        console.log(data)
        setSession(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const handleDecision = async (action) => {
    setDeciding(true);
    setDecisionMsg('');
    try {
      await api.post(`/ai-interviews/sessions/${sessionId}/decide/`, {
        action,
        notes: decisionMsg || null,
        reject_others: action === 'select' ? rejectOthers : false,
      });
      alert(`Candidate ${action === 'select' ? 'advanced' : 'rejected'} successfully`);
      router.back();
    } catch (e) {
      alert(e.message || `Failed to ${action} candidate`);
    } finally {
      setDeciding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-emerald-500" />
          <HiOutlineSparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Session not found.</p>
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
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-6 pb-32 space-y-8 pt-6">
      {/* Back & Header */}
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-emerald-400 transition-colors font-black text-[10px] uppercase tracking-widest group">
          <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Sessions
        </button>

        <div className="glass border border-border rounded-2xl p-6 bg-secondary/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center text-2xl font-black shrink-0">
                {session.candidate_email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">{session.candidate_email || 'Unknown Candidate'}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{session.job_title}</span>
                  <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${STATUS_BADGE[session.status] || 'bg-muted text-muted-foreground border-border'}`}>
                    {session.status}
                  </span>
                  {isTerminated && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest">
                      <HiOutlineShieldExclamation className="w-3.5 h-3.5" /> Guardrail Flagged
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {session.question_count != null && (
                <div className="px-4 py-3 rounded-xl bg-secondary/40 border border-border text-center">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block">Questions</span>
                  <span className="text-lg font-black font-mono">{session.question_count}</span>
                </div>
              )}
              {session.duration_taken_minutes != null && (
                <div className="px-4 py-3 rounded-xl bg-secondary/40 border border-border text-center">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block">Duration</span>
                  <span className="text-lg font-black font-mono">{session.duration_taken_minutes}m</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guardrail Banner */}
      {isTerminated && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <HiOutlineShieldExclamation className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-black text-sm text-red-400">Interview Terminated — Guardrail Triggered</h3>
            <p className="text-sm text-muted-foreground mt-1">{session.guardrail_reason || 'Policy violation detected during interview.'}</p>
            <p className="text-xs text-muted-foreground mt-2">No evaluation was performed. The interview ended when the guardrail fired.</p>
          </div>
        </motion.div>
      )}

      {!isTerminated && (
        <>
          {/* Score Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 glass border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-3 ${passed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                {passed ? <HiOutlineCheckCircle className="w-10 h-10 text-emerald-400" /> : <HiOutlineXCircle className="w-10 h-10 text-red-400" />}
              </div>
              <span className="text-4xl font-black font-mono">{session.overall_score ?? '—'}<span className="text-lg text-muted-foreground font-bold">/100</span></span>
              <span className={`mt-1 text-sm font-black uppercase tracking-wider ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {passed ? 'Passed' : 'Failed'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">Passing: {session.interview_config?.passing_score || 65}%</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-3 glass border border-border rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <HiOutlineChartBar className="w-4 h-4 text-emerald-400" /> Criteria Breakdown
                <span className="text-muted-foreground/50 text-[9px]">(pass line at 65)</span>
              </h3>
              <div className="overflow-x-auto">
                <CriteriaChart criteriaScores={criteriaScores} />
              </div>
            </motion.div>
          </div>

          {/* Strengths & Weaknesses + Overall Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass border border-border rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <HiOutlineStar className="w-4 h-4 text-emerald-400" /> Key Strengths
              </h3>
              {(session.strengths || []).length > 0 ? (
                <ul className="space-y-2">
                  {session.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No strengths recorded</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass border border-border rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <HiOutlineExclamationTriangle className="w-4 h-4 text-red-400" /> Areas to Improve
              </h3>
              {(session.weaknesses || []).length > 0 ? (
                <ul className="space-y-2">
                  {session.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <HiOutlineXCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No weaknesses recorded</p>
              )}
            </motion.div>
          </div>

          {/* Overall Feedback */}
          {session.overall_feedback && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass border border-border rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <HiOutlineBars3BottomLeft className="w-4 h-4 text-emerald-400" /> Overall Assessment
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{session.overall_feedback}&rdquo;</p>
            </motion.div>
          )}

          {/* Candidate Improvement Report */}
          {candidateReport?.criteria_reports?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <HiOutlineSparkles className="w-5 h-5 text-emerald-400" /> Improvement Report
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidateReport.criteria_reports.map((cr, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }} className="glass border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm">{cr.criterion?.replace(/_/g, ' ') || 'Criterion'}</h4>
                      <span className={`text-sm font-black font-mono ${cr.score >= 65 ? 'text-emerald-400' : 'text-red-400'}`}>{cr.score}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cr.feedback}</p>
                    <div className="bg-secondary/30 border border-border rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block">How to Improve</span>
                      <p className="text-xs leading-relaxed">{cr.how_to_improve}</p>
                    </div>
                    {cr.resources?.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block">Resources</span>
                        <ul className="space-y-1">
                          {cr.resources.map((r, ri) => (
                            <li key={ri} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {candidateReport.overall_improvement_plan && (
                <div className="glass border border-emerald-500/20 rounded-2xl p-5 bg-emerald-500/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-2">Overall Improvement Plan</span>
                  <p className="text-sm leading-relaxed">{candidateReport.overall_improvement_plan}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Summary Blocks */}
          {summaryBlocks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass border border-border rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <HiOutlineHashtag className="w-4 h-4 text-emerald-400" /> Session Summaries (Every 5 Questions)
              </h3>
              <div className="space-y-3">
                {summaryBlocks.map((block, i) => (
                  <div key={i} className="bg-secondary/20 border border-border rounded-xl p-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Block {block.block} · Q{block.question_range}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{block.summary}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Full Transcript */}
      {conversationHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <TranscriptBlock messages={conversationHistory} />
        </motion.div>
      )}

      {/* Action Buttons */}
      {isCompleted && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass border border-border rounded-2xl p-6 space-y-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <HiOutlineCog6Tooth className="w-4 h-4 text-emerald-400" /> Recruiter Decision
          </h3>
          <div className="space-y-4">
            <textarea value={decisionMsg} onChange={e => setDecisionMsg(e.target.value)} placeholder="Add decision notes (optional)..." rows={2} className="w-full px-5 py-3 rounded-xl bg-secondary/40 border border-border focus:border-emerald-500/50 outline-none text-sm transition-all resize-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={rejectOthers} onChange={e => setRejectOthers(e.target.checked)} className="w-4 h-4 rounded border-border text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-bold text-muted-foreground">Reject all other candidates</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleDecision('select')} disabled={deciding} className="flex-1 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {deciding ? 'Processing...' : <><HiOutlineCheckCircle className="w-4 h-4" /> Select & Advance</>}
              </button>
              <button onClick={() => handleDecision('reject')} disabled={deciding} className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {deciding ? 'Processing...' : <><HiOutlineXCircle className="w-4 h-4" /> Reject</>}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edge case: In Progress */}
      {session.status === 'in_progress' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass border border-yellow-500/20 rounded-2xl p-6 bg-yellow-500/5 text-center">
          <HiOutlineClock className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
          <h3 className="font-black text-sm text-yellow-400">Interview In Progress</h3>
          <p className="text-xs text-muted-foreground mt-1">The candidate has not completed this interview yet. Results will appear here once they finish.</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">{userMessages.length} question{userMessages.length !== 1 ? 's' : ''} answered so far</p>
        </motion.div>
      )}
    </div>
  );
}
