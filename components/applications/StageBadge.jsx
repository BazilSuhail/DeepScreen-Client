import React from 'react';

const STAGE_STYLES = {
    applied: 'bg-blue-500/10 text-blue-400',
    shortlisted: 'bg-emerald-500/10 text-emerald-500',
    coding_pending: 'bg-yellow-500/10 text-yellow-500',
    coding_passed: 'bg-teal-500/10 text-teal-400',
    ai_interview_pending: 'bg-purple-500/10 text-purple-400',
    ai_interview_passed: 'bg-indigo-500/10 text-indigo-400',
    real_interview_scheduled: 'bg-orange-500/10 text-orange-400',
    offered: 'bg-cyan-500/10 text-cyan-400',
    hired: 'bg-green-500/10 text-green-500',
    rejected: 'bg-red-500/10 text-red-400',
};

const StageBadge = ({ stage }) => {
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STAGE_STYLES[stage] || 'bg-secondary text-muted-foreground'}`}>
            {stage?.replace(/_/g, ' ') || 'unknown'}
        </span>
    );
};

export default StageBadge;
