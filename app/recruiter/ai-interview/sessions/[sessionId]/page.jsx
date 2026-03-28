'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HiOutlineChevronLeft, HiOutlineUser, HiOutlineSparkles,
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineStar, HiOutlineLightBulb, HiOutlineExclamationTriangle,
  HiOutlineChatBubbleLeftRight, HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';

export default function SessionDetail() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/ai-interviews/sessions/${sessionId}/`);
        setSession(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const handleBack = () => {
    setNavigating(true);
    router.back();
  };

  if (loading || navigating) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
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

  const passed = session.overall_score >= (session.passing_score || 65);
  const questions = session.interview_data || [];
  const criteria = session.detailed_criteria_scores || {};
  const strengths = session.strengths || [];
  const weaknesses = session.weaknesses || [];

  const statusColor = {
    evaluated: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    pending: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  }[session.status] || 'bg-muted text-muted-foreground border-border';

  return (
    <div className="space-y-10 p-6 lg:p-8 max-w-5xl mx-auto pb-24">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-colors font-black text-[10px] uppercase tracking-widest group"
      >
        <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Sessions
      </button>

      {/* Candidate Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-2xl italic uppercase">
            {session.candidate_name?.charAt(0) || '?'}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              {session.candidate_name || 'Unknown'}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
              <span>{session.candidate_email}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="text-[10px] font-black uppercase tracking-widest">{session.interview_title}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor}`}>
            {session.status}
          </span>
          <div className={`flex items-center gap-2 px-5 py-2 rounded-xl border ${
            passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span className="font-black text-sm">{session.overall_score ?? '—'}%</span>
          </div>
        </div>
      </div>

      {/* Session Meta */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Duration', value: session.duration_taken_minutes ? `${session.duration_taken_minutes} min` : '—', icon: HiOutlineClock },
          { label: 'Questions', value: questions.length, icon: HiOutlineDocumentText },
          { label: 'Status', value: session.status, icon: HiOutlineCheckCircle },
          { label: 'Passing', value: `${session.passing_score || 65}%`, icon: HiOutlineSparkles },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass border border-border rounded-[1.5rem] p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground">
              <m.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</p>
              <p className="font-black mt-0.5">{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Q&A */}
      <div className="glass border border-border rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-6">
          <HiOutlineClipboardDocumentList className="w-6 h-6 text-emerald-500" />
          <h3 className="text-xl font-black italic uppercase tracking-widest">Questions & Answers</h3>
          <span className="ml-auto text-[10px] font-black text-muted-foreground">{questions.length} total</span>
        </div>
        <div className="space-y-5">
          {questions.length === 0 ? (
            <p className="text-muted-foreground text-sm font-medium italic py-6 text-center">No interview data available.</p>
          ) : (
            questions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-6 rounded-2xl bg-secondary/20 border border-border/50"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground shrink-0">
                      {i + 1}
                    </div>
                    <p className="font-bold text-sm leading-relaxed">{q.question}</p>
                  </div>
                  {q.score !== undefined && q.score !== null && (
                    <span className={`shrink-0 px-3 py-1 rounded-lg text-[10px] font-black border ${
                      q.score >= 75 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : q.score >= 50 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {q.score}/100
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed ml-11">
                  {q.answer || <span className="italic opacity-50">No answer provided</span>}
                </p>
                {q.score !== undefined && q.score !== null && (
                  <div className="mt-3 ml-11 w-full max-w-xs bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        q.score >= 75 ? 'bg-emerald-500'
                          : q.score >= 50 ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(q.score, 100)}%` }}
                    />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Criteria Scores */}
      {Object.keys(criteria).length > 0 && (
        <div className="glass border border-border rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <HiOutlineStar className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-black italic uppercase tracking-widest">Evaluation Criteria</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(criteria).map(([name, score], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-secondary/20 border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-tight italic">{name.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-black">{Math.round(score)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass border border-emerald-500/20 rounded-[2.5rem] p-8 space-y-5"
            >
              <div className="flex items-center gap-2">
                <HiOutlineLightBulb className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-[10px] uppercase tracking-widest text-emerald-500">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
          {weaknesses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass border border-amber-500/20 rounded-[2.5rem] p-8 space-y-5"
            >
              <div className="flex items-center gap-2">
                <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-[10px] uppercase tracking-widest text-amber-500">Areas to Improve</h3>
              </div>
              <ul className="space-y-3">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      )}

      {/* Overall Feedback */}
      {session.overall_feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass border border-border rounded-[2.5rem] p-8 space-y-5"
        >
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <HiOutlineChatBubbleLeftRight className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-black italic uppercase tracking-widest">AI Feedback</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
            &ldquo;{session.overall_feedback}&rdquo;
          </p>
        </motion.div>
      )}

      {/* Recruiter Notes */}
      {session.recruiter_notes && (
        <div className="glass border border-border rounded-[2.5rem] p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <HiOutlineUser className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-black italic uppercase tracking-widest">Recruiter Notes</h3>
          </div>
          <p className="text-sm leading-relaxed font-medium">{session.recruiter_notes}</p>
        </div>
      )}
    </div>
  );
}
