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
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineQuestionMarkCircle,
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
    pending:     <HiOutlineDocumentText className="w-4 h-4" />,
    in_progress: <HiOutlineClock className="w-4 h-4" />,
    submitted:   <HiOutlineChartBar className="w-4 h-4" />,
    evaluated:   <HiOutlineChartBar className="w-4 h-4" />,
    passed:      <HiOutlineCheckCircle className="w-4 h-4" />,
    failed:      <HiOutlineExclamationTriangle className="w-4 h-4" />,
};

export function AssessmentCard({ submission, index = 0, onStart }) {
    const style = statusStyles[submission.status] || statusStyles.pending;
    const icon  = statusIcon[submission.status] || statusIcon.pending;
    const canStart = submission.status === 'pending' || submission.status === 'in_progress';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border hover:border-emerald-500/25 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group"
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                    <HiOutlineBeaker className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-base truncate max-w-[25ch]">{submission.assessment_title}</h3>
                    {submission.job_title && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[20ch]">For: {submission.job_title}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                            <HiOutlineClock className="w-3 h-3" />{submission.duration_minutes} min
                        </span>
                        <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                            <HiOutlineQuestionMarkCircle className="w-3 h-3" />Pass: {submission.passing_score}%
                        </span>
                        {submission.submitted_at && (
                            <span className="bg-emerald-500/5 text-emerald-500 px-2 py-0.5 rounded-lg">
                                Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {submission.total_score != null && (
                    <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Score</div>
                        <div className={`text-xl font-bold mt-0.5 ${submission.total_score >= submission.passing_score ? 'text-emerald-500' : 'text-red-400'}`}>
                            {submission.total_score.toFixed(0)}%
                        </div>
                    </div>
                )}

                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${style}`}>
                    {icon} {submission.status.replace('_', ' ')}
                </span>

                {canStart && onStart && (
                    <button
                        onClick={() => onStart(submission)}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95 group/btn"
                    >
                        {submission.status === 'in_progress' ? 'Resume' : 'Begin'} 
                        <HiOutlineArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export function AssessmentSetupCard({ assessment, index = 0, onEdit, onDelete }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-card border border-border hover:border-emerald-500/30 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group"
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:rotate-6 transition-transform">
                        <HiOutlineBeaker className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate max-w-[25ch]">{assessment.title}</h3>
                        <p className="text-xs font-semibold text-emerald-500 mt-0.5 truncate max-w-[20ch]">{assessment.job_title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <span className="inline-flex items-center gap-1"><HiOutlineClock className="w-3 h-3" />{assessment.duration_minutes}m</span>
                            <span className="inline-flex items-center gap-1"><HiOutlineCheckCircle className="w-3 h-3" />Pass: {assessment.passing_score}%</span>
                            <span className="inline-flex items-center gap-1"><HiOutlineCommandLine className="w-3 h-3" />{assessment.questions_count || 0} Qs</span>
                        </div>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shrink-0 ${
                    assessment.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'
                }`}>
                    {assessment.is_active ? 'Active' : 'Archived'}
                </span>
            </div>

            {assessment.description && (
                <p className="text-sm text-muted-foreground/80 mb-5 line-clamp-2 leading-relaxed">{assessment.description}</p>
            )}

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
                <div />
                <div className="flex gap-2">
                    <button onClick={() => onEdit(assessment)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-border text-[10px] font-bold uppercase tracking-widest transition-all">
                        <HiOutlinePencilSquare className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => onDelete(assessment.assessment_id)}
                        className="p-2 rounded-lg bg-secondary hover:bg-red-500/10 hover:text-red-500 border border-border transition-all">
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
