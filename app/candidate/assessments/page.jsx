'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import {
  HiOutlineBeaker, HiOutlineCommandLine, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle, HiOutlineExclamationTriangle,
  HiOutlineChartBar, HiOutlineXMark,
} from 'react-icons/hi2';
import { HiOutlineCalendar, HiOutlinePlay } from 'react-icons/hi';

const statusStyles = {
  pending:     'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  submitted:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  evaluated:   'bg-teal-500/10 text-teal-500 border-teal-500/20',
  passed:      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  failed:      'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusIcon = {
  pending:     <HiOutlineDocumentText className="w-4 h-4" />,
  in_progress: <HiOutlineClock className="w-4 h-4" />,
  submitted:   <HiOutlineChartBar className="w-4 h-4" />,
  evaluated:   <HiOutlineChartBar className="w-4 h-4" />,
  passed:      <HiOutlineCheckCircle className="w-4 h-4" />,
  failed:      <HiOutlineExclamationTriangle className="w-4 h-4" />,
};

export default function CandidateAssessmentsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAssessments = async () => {
            try {
                const data = await api.get('/assessments/my/');
                if (isMounted) setSubmissions(data || []);
            } catch (err) {
                if (isMounted) setError('Failed to load assessments. Please try again later.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAssessments();
        return () => { isMounted = false; };
    }, []);

    const pending = submissions.filter(s => ['pending', 'in_progress'].includes(s?.status));
    const completed = submissions.filter(s => s?.status && !['pending', 'in_progress'].includes(s.status));

    const getStatusStyle = (status) => statusStyles[status] || statusStyles.pending;
    const getStatusIcon = (status) => statusIcon[status] || statusIcon.pending;

    if (loading) return (
        <div className="space-y-6 px-12">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
            <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-[2rem] animate-pulse" />)}</div>
        </div>
    );

    return (
        <div className="space-y-6 px-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">Assessments</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <HiOutlineCommandLine className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Assessments</h1>
                    <p className="text-muted-foreground mt-1">Coding tests assigned by recruiters for your applications</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Assigned', value: submissions.length, icon: HiOutlineBeaker, color: 'from-purple-500/10 to-purple-600/5 text-purple-500' },
                    { label: 'Pending', value: pending.length, icon: HiOutlineClock, color: 'from-yellow-500/10 to-yellow-600/5 text-yellow-500' },
                    { label: 'Completed', value: completed.length, icon: HiOutlineCheckCircle, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500' },
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
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold" role="alert">
                    {error}
                </div>
            )}

            {pending.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                        Action Required ({pending.length})
                    </h2>
                    <div className="space-y-4">
                        {pending.map((sub, i) => (
                            <motion.div
                                key={sub.submission_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelected(sub)}
                                className="bg-card border border-border hover:border-emerald-500/25 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group cursor-pointer"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                                        <HiOutlineBeaker className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-base truncate max-w-[25ch]">{sub.assessment_title}</h3>
                                        {sub.job_title && (
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[20ch]">For: {sub.job_title}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                            <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                                                <HiOutlineClock className="w-3 h-3" />{sub.duration_minutes} min
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                                                <HiOutlineQuestionMarkCircle className="w-3 h-3" />Pass: {sub.passing_score}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    {sub.total_score != null && sub.status !== 'pending' && (
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Score</div>
                                            <div className={`text-xl font-bold mt-0.5 ${sub.total_score >= sub.passing_score ? 'text-emerald-500' : 'text-red-400'}`}>
                                                {sub.total_score.toFixed(0)}%
                                            </div>
                                        </div>
                                    )}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(sub.status)}`}>
                                        {getStatusIcon(sub.status)} {sub.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {completed.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-foreground/60 flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                        Completed ({completed.length})
                    </h2>
                    <div className="space-y-4">
                        {completed.map((sub, i) => (
                            <motion.div
                                key={sub.submission_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelected(sub)}
                                className="bg-card border border-border hover:border-emerald-500/25 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group cursor-pointer"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                                        <HiOutlineBeaker className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-base truncate max-w-[25ch]">{sub.assessment_title}</h3>
                                        {sub.job_title && (
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[20ch]">For: {sub.job_title}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                            <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                                                <HiOutlineClock className="w-3 h-3" />{sub.duration_minutes} min
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                                                <HiOutlineQuestionMarkCircle className="w-3 h-3" />Pass: {sub.passing_score}%
                                            </span>
                                            {sub.submitted_at && (
                                                <span className="bg-emerald-500/5 text-emerald-500 px-2 py-0.5 rounded-lg">
                                                    Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    {sub.total_score != null && sub.status !== 'pending' && (
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Score</div>
                                            <div className={`text-xl font-bold mt-0.5 ${sub.total_score >= sub.passing_score ? 'text-emerald-500' : 'text-red-400'}`}>
                                                {sub.total_score.toFixed(0)}%
                                            </div>
                                        </div>
                                    )}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(sub.status)}`}>
                                        {getStatusIcon(sub.status)} {sub.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {submissions.length === 0 && !loading && (
                <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
                    <HiOutlineBeaker className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                    <h2 className="text-xl font-bold text-foreground mb-2">No Assessments Yet</h2>
                    <p className="text-muted-foreground">Recruiters will assign coding tests after shortlisting.</p>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={e => e.stopPropagation()}
                        className="relative bg-card border border-border rounded-[15px] overflow-auto p-8 max-w-lg w-full shadow-2xl max-h-[95vh]"
                    >
                        <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
                            <HiOutlineXMark className="w-5 h-5" />
                        </button>
            
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-5">
                            <HiOutlineBeaker className="w-7 h-7" />
                        </div>
            
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border mb-3 ${getStatusStyle(selected.status)}`}>
                            {getStatusIcon(selected.status)} {selected.status.replace('_', ' ')}
                        </span>
            
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-foreground">{selected.assessment_title}</h2>
                            <a href={`deepscreen://assessment/${selected.submission_id}`}
                               className="shrink-0 mt-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20">
                                Open in App
                            </a>
                        </div>
                        {selected.job_title && (
                            <p className="text-sm text-muted-foreground mb-6">For: {selected.job_title}</p>
                        )}
            
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-4 rounded-xl bg-muted border border-border flex flex-col items-center gap-2">
                              <HiOutlineClock className="w-5 h-5 text-muted-foreground" />
                              <span className="text-2xl font-black text-foreground">
                                  {selected.started_at && selected.submitted_at 
                                      ? Math.round((new Date(selected.submitted_at) - new Date(selected.started_at)) / 60000)
                                      : selected.duration_minutes || '—'}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  {selected.started_at && selected.submitted_at ? 'Minutes Taken' : 'Minutes'}
                              </span>
                          </div>
                            <div className="p-4 rounded-xl bg-muted border border-border flex flex-col items-center gap-2">
                                <HiOutlineQuestionMarkCircle className="w-5 h-5 text-muted-foreground" />
                                <span className="text-2xl font-black text-foreground">{selected.total_score.toFixed(0)}%</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pass Score</span>
                            </div>
                        </div>
            
                        <div className="space-y-2.5 mb-6">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                                <span className="text-sm">Created: {new Date(selected.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {selected.started_at && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlinePlay className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">Started: {new Date(selected.started_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )}
                            {selected.submitted_at && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">Submitted: {new Date(selected.submitted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )}
                            {selected.time_taken_minutes != null && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlineClock className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">Time Taken: {selected.time_taken_minutes} {selected.time_taken_minutes === 1 ? 'minute' : 'minutes'}</span>
                                </div>
                            )}
                            {selected.max_score != null && selected.max_score > 0 && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlineChartBar className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">Max Score: {selected.max_score}</span>
                                </div>
                            )}
                            {selected.question_results && typeof selected.question_results === 'object' && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <HiOutlineDocumentText className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">Questions Evaluated: {Object.keys(selected.question_results).length}</span>
                                </div>
                            )}
                        </div>
            
                        {selected.total_score != null && !['pending', 'in_progress'].includes(selected.status) && (
                            <div className="p-4 rounded-xl bg-muted border border-border flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-muted-foreground">Your Score</span>
                                <div className="text-right">
                       
                                    {selected.max_score != null && selected.max_score > 0 && (
                                        <div className="text-[14px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                            {selected.total_score.toFixed(0)} / {selected.max_score.toFixed(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
            
                        {/* Removed the bottom button - now it's at the top */}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
