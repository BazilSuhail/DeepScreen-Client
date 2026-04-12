'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineChevronLeft, HiOutlineUserGroup, HiOutlineSparkles,
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineChartBar, HiOutlineHandThumbUp, HiOutlineHandThumbDown,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';

export default function InterviewSessions() {
  const { id } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/ai-interviews/${id}/`);
        setInterview(data);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Interview not found.</p>
      </div>
    );
  }

  const sessions = interview.sessions || [];
  const evaluated = sessions.filter(s => s.status === 'evaluated');
  const scores = evaluated.map(s => s.overall_score).filter(Boolean);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
  const passCount = evaluated.filter(s => s.overall_score >= (interview.passing_score || 65)).length;
  const passRate = evaluated.length ? Math.round((passCount / evaluated.length) * 100) : 0;
  const completed = sessions.filter(s => s.status === 'completed' || s.status === 'evaluated').length;

  const stats = [
    { label: 'Total', value: sessions.length, icon: HiOutlineUserGroup, color: 'text-blue-500' },
    { label: 'Completed', value: completed, icon: HiOutlineCheckCircle, color: 'text-emerald-500' },
    { label: 'Avg Score', value: avgScore, suffix: '%', icon: HiOutlineChartBar, color: 'text-violet-500' },
    { label: 'Pass Rate', value: passRate, suffix: '%', icon: HiOutlineSparkles, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-10 w-full px-4 md:px-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-colors font-bold text-[10px] uppercase tracking-widest group"
      >
        <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
            {interview.job_title}
          </span>
          <h1 className="text-3xl font-bold">
            {interview.title}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          {sessions.length} candidate session{sessions.length !== 1 ? 's' : ''} · Passing score: {interview.passing_score}%
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass border border-border rounded-xl p-6 flex items-center gap-5"
          >
            <div className={`w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-0.5">
                {stat.value}{stat.suffix || ''}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto text-muted-foreground/40">
            <HiOutlineUserGroup className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground/60">
            No sessions yet
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, idx) => {
            const passed = session.overall_score >= (interview.passing_score || 65);
            return (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass border border-border rounded-xl p-6 hover:border-emerald-500/20 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-bold text-base shrink-0">
                      {session.candidate_name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold tracking-tight truncate group-hover:text-emerald-500 transition-colors">
                        {session.candidate_name || 'Unknown'}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium truncate">{session.candidate_email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Score</span>
                        <span className={`text-lg font-bold ${passed ? 'text-emerald-500' : 'text-red-400'}`}>
                          {session.overall_score ?? '—'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          session.status === 'evaluated'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : session.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : session.status === 'in_progress'
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/recruiter/ai-interview/sessions/${session.session_id}`}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" /> View Details
                    </Link>
                  </div>
                </div>

                {session.overall_feedback && (
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-1 border-t border-border/50 pt-4">
                    &ldquo;{session.overall_feedback}&rdquo;
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
