'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
    HiOutlineBeaker,
    HiOutlineClock,
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineArrowRight,
    HiOutlineDocumentText,
    HiOutlineCommandLine,
    HiOutlineUserGroup,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlinePlus,
} from 'react-icons/hi2';

const statusStyles = {
    pending:     'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    submitted:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
    evaluated:   'bg-teal-500/10 text-teal-500 border-teal-500/20',
    passed:      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    failed:      'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusIcon = {
    pending:     <HiOutlineDocumentText className="w-5 h-5" />,
    in_progress: <HiOutlineClock className="w-5 h-5" />,
    submitted:   <HiOutlineChartBar className="w-5 h-5" />,
    evaluated:   <HiOutlineChartBar className="w-5 h-5" />,
    passed:      <HiOutlineCheckCircle className="w-5 h-5" />,
    failed:      <HiOutlineExclamationTriangle className="w-5 h-5" />,
};

/**
 * AssessmentCard — candidate-facing card showing an assigned assessment
 * Props: submission (object), index, onStart
 */
export function AssessmentCard({ submission, index = 0, onStart }) {
    const style = statusStyles[submission.status] || statusStyles.pending;
    const icon  = statusIcon[submission.status] || statusIcon.pending;
    const canStart = submission.status === 'pending' || submission.status === 'in_progress';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass border border-emerald-500/10 hover:border-emerald-500/25 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 group"
        >
            <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <HiOutlineBeaker className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-black text-xl italic uppercase tracking-tighter truncate">{submission.assessment_title}</h3>
                    {submission.job_title && (
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">For: {submission.job_title}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-lg">
                            <HiOutlineClock className="w-3.5 h-3.5" />{submission.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-lg">
                            Passing: {submission.passing_score}%
                        </span>
                        {submission.submitted_at && (
                            <span className="bg-emerald-500/5 text-emerald-600 px-2.5 py-1 rounded-lg">
                                Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
                {submission.total_score != null && (
                    <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Score</div>
                        <div className={`text-2xl font-black italic mt-0.5 ${submission.total_score >= submission.passing_score ? 'text-emerald-500' : 'text-red-400'}`}>
                            {submission.total_score.toFixed(0)}%
                        </div>
                    </div>
                )}

                <span className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${style}`}>
                    {icon} {submission.status.replace('_', ' ')}
                </span>

                {canStart && onStart && (
                    <button
                        onClick={() => onStart(submission)}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95 group/btn"
                    >
                        {submission.status === 'in_progress' ? 'Resume' : 'Begin'} 
                        <HiOutlineArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

/**
 * AssessmentSetupCard — recruiter card to configure an assessment
 */
export function AssessmentSetupCard({ assessment, index = 0, onEdit, onDelete }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="glass border border-emerald-500/10 hover:border-emerald-500/30 rounded-[3rem] p-8 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 group"
        >
            <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 group-hover:rotate-6 transition-transform">
                        <HiOutlineBeaker className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">{assessment.title}</h3>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">{assessment.job_title}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                            <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" /> {assessment.duration_minutes}m</span>
                            <span className="flex items-center gap-1"><HiOutlineCheckCircle className="w-3.5 h-3.5" /> Pass: {assessment.passing_score}%</span>
                            <span className="flex items-center gap-1"><HiOutlineCommandLine className="w-3.5 h-3.5" /> {assessment.questions_count || 0} Questions</span>
                        </div>
                    </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shrink-0 ${
                    assessment.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'
                }`}>
                    {assessment.is_active ? 'Active' : 'Archived'}
                </span>
            </div>

            {assessment.description && (
                <p className="text-sm font-medium text-muted-foreground/80 mb-8 line-clamp-2 leading-relaxed pl-2">{assessment.description}</p>
            )}

            <div className="flex items-center justify-between gap-6 pt-6 border-t border-emerald-500/5">
                <div className="flex items-center gap-2 text-muted-foreground/60">
                    {/* The assign button was removed because assessment is implicitly linked to the job's candidates */}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(assessment)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-border text-[10px] font-black uppercase tracking-widest transition-all">
                        <HiOutlinePencilSquare className="w-4 h-4" /> Edit Assessment
                    </button>
                    <button onClick={() => onDelete(assessment.assessment_id)}
                        className="p-3 rounded-xl bg-secondary hover:bg-red-500/10 hover:text-red-500 border border-border transition-all">
                        <HiOutlineTrash className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
