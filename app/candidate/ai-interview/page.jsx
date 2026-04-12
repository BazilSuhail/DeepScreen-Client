'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineMicrophone, HiOutlineChevronRight, HiOutlineClock,
  HiOutlineDocumentText, HiOutlineSparkles, HiOutlinePlay,
  HiOutlineCheckCircle, HiOutlineXCircle
} from 'react-icons/hi2';

export default function CandidateAIInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await api.get('/ai-interviews/my/');
        setInterviews(data);
      } catch (err) {
        setError(err.message || 'Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const pending = interviews.filter(i => i.status === 'pending' || i.status === 'in_progress');
  const completed = interviews.filter(i => i.status === 'completed');

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
    </div>
  );

  return (
    <div className="space-y-10 p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
          <HiOutlineMicrophone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black">AI Interviews</h1>
          <p className="text-muted-foreground mt-1">Complete your AI-powered interviews to progress in the hiring process</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-3">
          <HiOutlineXCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Pending / Active */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" />
            Action Required ({pending.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pending.map((interview, idx) => (
              <motion.div
                key={interview.interview_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="glass border border-emerald-500/10 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1 min-w-0">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        {interview.job_title || 'AI Interview'}
                      </span>
                      <h3 className="text-xl font-bold tracking-tight group-hover:text-emerald-500 transition-colors leading-tight">
                        {interview.title}
                      </h3>
                      <p className="text-muted-foreground text-[12px] line-clamp-2 font-medium leading-relaxed">
                        {interview.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
                      <HiOutlineDocumentText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-black">{interview.number_of_questions || 0}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Questions</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
                      <HiOutlineClock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-black">{interview.duration_minutes || 0}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Minutes</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
                      <HiOutlineSparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-lg font-black text-emerald-500">{interview.status === 'in_progress' ? 'Resume' : 'Start'}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Status</span>
                    </div>
                  </div>

                  <Link
                    href={`/candidate/ai-interview/${interview.interview_id}`}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <HiOutlinePlay className="w-4 h-4" /> {interview.status === 'in_progress' ? 'Continue Interview' : 'Start Interview'}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black opacity-60 flex items-center gap-2">
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
            Completed ({completed.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completed.map((interview, idx) => (
              <motion.div
                key={interview.interview_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="glass border border-border rounded-[2.5rem] p-8 opacity-70 hover:opacity-100 transition-all group"
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1 min-w-0">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/5 text-emerald-500/60 text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">
                        {interview.job_title || 'AI Interview'}
                      </span>
                      <h3 className="text-xl font-bold tracking-tight leading-tight">{interview.title}</h3>
                    </div>
                    <HiOutlineCheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
                      <HiOutlineDocumentText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-black">{interview.number_of_questions || 0}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Questions</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
                      <HiOutlineClock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-black">{interview.duration_minutes || 0}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Minutes</span>
                    </div>
                  </div>

                  <Link
                    href={`/candidate/ai-interview/${interview.interview_id}/review`}
                    className="w-full py-3.5 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    View Results <HiOutlineChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {interviews.length === 0 && !loading && (
        <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
          <HiOutlineMicrophone className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold">No Interviews Yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Recruiters will assign AI interviews after reviewing your application. Apply to more jobs to get started!
          </p>
        </div>
      )}
    </div>
  );
}
