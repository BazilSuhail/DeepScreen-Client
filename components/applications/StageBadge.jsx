import React from 'react';

const STAGE_STYLES = {
    applied: 'bg-muted text-muted-foreground',
    shortlisted: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    coding_pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    coding_passed: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    ai_interview_pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    ai_interview_passed: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    real_interview_scheduled: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    offered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    hired: 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300',
    rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

const StageBadge = ({ stage }) => {
    if (!stage) return null;
    return (
        <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STAGE_STYLES[stage] || 'bg-muted text-muted-foreground'}`}>
            {stage.replace(/_/g, ' ')}
        </span>
    );
};

export default StageBadge;
