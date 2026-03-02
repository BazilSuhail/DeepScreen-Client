import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineUserCircle,
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineArrowTrendingUp,
    HiOutlineAcademicCap,
    HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2';
import StageBadge from './StageBadge';
import ScoreBar from './ScoreBar';

function CandidateCard({ app, rank, onUpdateStatus, onStartChat }) {
    const [expanded, setExpanded] = useState(false);
    const sr      = app.stage_results?.shortlist;
    const resume  = app.resume_details  || {};
    const cand    = app.candidate_details || {};

    const displayName = resume.candidate_name
        || [cand.first_name, cand.last_name].filter(Boolean).join(' ')
        || cand.email
        || 'Candidate';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.04 }}
            className="glass border border-emerald-500/10 hover:border-emerald-500/25 rounded-[2rem] overflow-hidden transition-all"
        >
            <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0
                    ${rank === 1 ? 'bg-yellow-400/20 text-yellow-400' :
                      rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                      rank === 3 ? 'bg-orange-400/20 text-orange-400' :
                                   'bg-secondary text-muted-foreground'}`}
                >
                    #{rank}
                </div>

                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0">
                        <HiOutlineUserCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate">{displayName}</h3>
                        <p className="text-xs text-muted-foreground truncate">{cand.email}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {resume.current_location && (
                                <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />{resume.current_location}</span>
                            )}
                            {resume.years_experience != null && (
                                <span className="flex items-center gap-1 font-bold text-emerald-500/80">
                                    <HiOutlineBriefcase className="w-3.5 h-3.5" />{resume.years_experience} yrs exp
                                </span>
                            )}
                            {resume.education_level && (
                                <span className="flex items-center gap-1"><HiOutlineAcademicCap className="w-3.5 h-3.5" />{resume.education_level}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">AI Score</span>
                    {app.shortlist_score != null ? (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-emerald-500">
                                {(app.shortlist_score * 100).toFixed(0)}%
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Pending</span>
                    )}
                </div>

                <div className="min-w-[140px] text-center">
                    <StageBadge stage={app.current_stage} />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdateStatus(app.application_id, { status: 'rejected', current_stage: 'rejected' })}
                        className="p-2.5 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/15 border border-red-500/10 transition-all"
                        title="Reject Candidate"
                    >
                        <HiOutlineXCircle className="w-5 h-5" />
                    </button>
                    {app.current_stage === 'applied' && (
                        <button
                            onClick={() => onUpdateStatus(app.application_id, { current_stage: 'shortlisted', status: 'in_progress' })}
                            className="p-2.5 rounded-xl bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/10 transition-all"
                            title="Manually Shortlist"
                        >
                            <HiOutlineCheckCircle className="w-5 h-5" />
                        </button>
                    )}
                    {onStartChat && (
                        <button
                            onClick={onStartChat}
                            className="p-2.5 rounded-xl bg-blue-500/5 text-blue-500 hover:bg-blue-500/15 border border-blue-500/10 transition-all"
                            title="Message Candidate"
                        >
                            <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                        </button>
                    )}
                    {(sr || app.stage_results?.coding) && (
                        <button
                            onClick={() => setExpanded(x => !x)}
                            className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all"
                            title="Score breakdown"
                        >
                            <HiOutlineArrowTrendingUp className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {expanded && sr && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-emerald-500/5"
                    >
                        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-500/2">
                            <ScoreBar label="Skills Match" value={sr.skills_score ?? 0} color="bg-emerald-500" />
                            <ScoreBar label="Work Experience" value={sr.workexp_score ?? 0} color="bg-blue-500" />
                            <ScoreBar label="Projects" value={sr.projects_score ?? 0} color="bg-purple-500" />
                            <ScoreBar label="Summary" value={sr.summary_score ?? 0} color="bg-orange-400" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default CandidateCard;
