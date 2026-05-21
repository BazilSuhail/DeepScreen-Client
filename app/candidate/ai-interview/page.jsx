'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import {
  HiOutlineMicrophone, HiOutlineClock,
  HiOutlineDocumentText, HiOutlineSparkles,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineSpeakerWave,
  HiOutlineXMark, HiOutlineCalendar, HiOutlineInformationCircle,
  HiOutlineShieldExclamation, HiOutlineLightBulb,
} from 'react-icons/hi2';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';

export default function CandidateAIInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await api.get('/ai-interviews/my/');
        console.log(data)
        setInterviews(data);
      } catch (err) {
        setError(err.message || 'Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) return (
    <div className="space-y-6 px-12">
      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
      <div className="grid grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-56 bg-muted rounded-[2rem] animate-pulse" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 px-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-semibold">AI Interviews</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
          <HiOutlineSpeakerWave className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Interviews</h1>
          <p className="text-muted-foreground mt-1">Complete your AI-powered interviews to progress in the hiring process</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Assigned', value: interviews.length, icon: HiOutlineMicrophone, color: 'from-amber-500/10 to-amber-600/5 text-amber-500' },
          { label: 'Pending', value: interviews.filter(i => i.status === 'pending' || i.status === 'in_progress').length, icon: HiOutlineClock, color: 'from-yellow-500/10 to-yellow-600/5 text-yellow-500' },
          { label: 'Completed', value: interviews.filter(i => i.status === 'completed').length, icon: HiOutlineCheckCircle, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold flex items-center gap-3">
          <HiOutlineXCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* All Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interviews.map((interview, idx) => (
          <motion.div
            key={interview.session_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => setSelected(interview)}
            className="bg-card border border-border rounded-[2rem] p-6 hover:border-amber-500/30 transition-all group cursor-pointer"
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1 min-w-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    interview.status === 'completed' || interview.status === 'evaluated'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : interview.status === 'in_progress'
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {interview.job_title || 'AI Interview'}
                  </span>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-amber-500 transition-colors leading-tight">
                    {interview.interview_config?.title || 'AI Interview'}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {interview.interview_config?.description
                      ? interview.interview_config.description.length > 75
                        ? interview.interview_config.description.slice(0, 75) + '...'
                        : interview.interview_config.description
                      : 'No description provided'}
                  </p>
                </div>
                {interview.status === 'completed' || interview.status === 'evaluated' ? (
                  <HiOutlineCheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                ) : interview.status === 'in_progress' ? (
                  <HiOutlineSparkles className="w-6 h-6 text-blue-500 shrink-0" />
                ) : (
                  <HiOutlineClock className="w-6 h-6 text-amber-500 shrink-0" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted border border-border flex flex-col items-center gap-1">
                  <HiOutlineDocumentText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-bold text-foreground">{interview.question_count || 0}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Questions</span>
                </div>
                <div className="p-3 rounded-xl bg-muted border border-border flex flex-col items-center gap-1">
                  <HiOutlineClock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">
                    {interview.started_at
                      ? new Date(interview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Not Started'}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Created</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {interviews.length === 0 && !loading && (
        <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
          <HiOutlineMicrophone className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Interviews Yet</h2>
          <p className="text-muted-foreground">Recruiters will assign AI interviews after reviewing your application.</p>
        </div>
      )}

      {/* Modal with Interview Details */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="relative bg-card border border-border rounded-[2rem] p-8 max-w-lg w-full shadow-2xl max-h-[95vh] overflow-auto"
          >
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
              <HiOutlineXMark className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-5">
              <HiOutlineSpeakerWave className="w-7 h-7" />
            </div>

            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-3 ${
              selected.status === 'completed' || selected.status === 'evaluated'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : selected.status === 'in_progress'
                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {selected.job_title || 'AI Interview'} • {selected.status?.replace('_', ' ')}
            </span>

            <h2 className="text-2xl font-bold text-foreground mb-2">{selected.interview_config?.title || 'AI Interview'}</h2>
            {selected.interview_config?.description && <p className="text-muted-foreground text-sm mb-6">{selected.interview_config.description}</p>}

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-muted border border-border flex flex-col items-center gap-1">
                <HiOutlineDocumentText className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-black text-foreground">{selected.question_count || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Questions</span>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border flex flex-col items-center gap-1">
                <HiOutlineClock className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-black text-foreground">{selected.duration_taken_minutes || '—'}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Minutes</span>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              {selected.created_at && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Created: {new Date(selected.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {selected.started_at && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HiOutlineClock className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Started: {new Date(selected.started_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {selected.completed_at && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Completed: {new Date(selected.completed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {selected.duration_taken_minutes != null && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HiOutlineClock className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Time Taken: {selected.duration_taken_minutes} min</span>
                </div>
              )}
              {selected.question_count != null && selected.question_count > 0 && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HiOutlineInformationCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Questions Answered: {selected.question_count}</span>
                </div>
              )}
              {selected.guardrail_flagged && (
                <div className="flex items-center gap-3 rounded-xl mt-2 p-3 bg-red-900/20 text-red-600">
                  <HiOutlineShieldExclamation className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-semibold">Guardrail Triggered: {selected.guardrail_reason || 'Yes'}</span>
                </div>
              )}
            </div>

            {(selected.status === 'completed' || selected.status === 'evaluated') && selected.overall_score != null && (
              <>
                <div className="p-4 rounded-xl bg-muted border border-border flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-muted-foreground">Overall Score</span>
                  <span className={`text-2xl font-black ${selected.overall_score >= 65 ? 'text-emerald-500' : 'text-red-600'}`}>
                    {selected.overall_score.toFixed(0)}%
                  </span>
                </div>

                {selected.strengths?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                      <FaThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {selected.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.weaknesses?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                      <HiOutlineLightBulb className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Improvements</span>
                    </div>
                    <ul className="space-y-1">
                      {selected.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.recommended_for_next_round != null && (
                  <div className={`p-3 rounded-xl mb-4 flex items-center gap-3 ${selected.recommended_for_next_round ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                    {selected.recommended_for_next_round ? (
                      <FaThumbsUp className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <FaThumbsDown className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    <span className={`text-sm font-bold ${selected.recommended_for_next_round ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {selected.recommended_for_next_round ? 'Recommended for next round' : 'Not recommended for next round'}
                    </span>
                  </div>
                )}
              </>
            )}

            <a href={`deepscreen://ai-interview/${selected.interview}`}
              className="block w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm text-center transition-all shadow-lg shadow-amber-600/20">
              Open in DeepScreen Desktop
            </a>
          </motion.div>
        </div>
      )}
    </div>
  );
}
