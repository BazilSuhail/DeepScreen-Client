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
            className="glass border border-emerald-500/10 hover:border-emerald-500/25 rounded-[2rem] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all"
        >
            <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <HiOutlineBeaker className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate">{submission.assessment_title}</h3>
                    {submission.job_title && (
                        <p className="text-sm text-muted-foreground mt-0.5">For: {submission.job_title}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <HiOutlineClock className="w-3.5 h-3.5" />{submission.duration_minutes} min
                        </span>
                        <span>Passing: {submission.passing_score}%</span>
                        {submission.submitted_at && (
                            <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {submission.total_score != null && (
                    <div className="text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Score</div>
                        <div className={`text-xl font-black mt-0.5 ${submission.total_score >= submission.passing_score ? 'text-emerald-500' : 'text-red-400'}`}>
                            {submission.total_score.toFixed(0)}%
                        </div>
                    </div>
                )}

                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${style}`}>
                    {icon} {submission.status.replace('_', ' ')}
                </span>

                {canStart && onStart && (
                    <button
                        onClick={() => onStart(submission)}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
                    >
                        {submission.status === 'in_progress' ? 'Resume' : 'Start'} <HiOutlineArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

/**
 * AssessmentSetupCard — recruiter card to configure and assign an assessment
 * Props: assessment, onEdit, onAssign, onDelete, submissionsCount
 */
export function AssessmentSetupCard({ assessment, index = 0, onEdit, onAssign, onDelete, submissionsCount = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="glass border border-emerald-500/10 hover:border-emerald-500/25 rounded-[2rem] p-6 transition-all"
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <HiOutlineBeaker className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold">{assessment.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {assessment.duration_minutes} min · Pass: {assessment.passing_score}% · {assessment.problems_count || 0} problems
                        </p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0 ${
                    assessment.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'
                }`}>
                    {assessment.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>

            {assessment.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{assessment.description}</p>
            )}

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-emerald-500/5">
                <span className="text-xs text-muted-foreground">
                    {submissionsCount} candidate{submissionsCount !== 1 ? 's' : ''} assigned
                </span>
                <div className="flex gap-2">
                    {onEdit && (
                        <button onClick={() => onEdit(assessment)}
                            className="px-3 py-2 rounded-xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 text-xs font-bold border border-border transition-all">
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={() => onDelete(assessment.assessment_id)}
                            className="px-3 py-2 rounded-xl bg-secondary hover:bg-red-500/10 hover:text-red-500 text-xs font-bold border border-border transition-all">
                            Delete
                        </button>
                    )}
                    {onAssign && (
                        <button onClick={() => onAssign(assessment)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all">
                            Assign to Shortlisted
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
