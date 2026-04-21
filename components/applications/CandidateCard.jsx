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
    HiOutlineCalendarDays,
    HiOutlineStar,
    HiOutlineShieldCheck,
    HiOutlineCodeBracketSquare,
    HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2';
import StageBadge from './StageBadge';
import ScoreBar from './ScoreBar';

function CandidateCard({ app, rank, onUpdateStatus, onStartChat, showMessageButton }) {
    const [expanded, setExpanded] = useState(false);
  console.log(app.shortlist_score);
  const sr = app.stage_results?.shortlist;
    const resume  = app.resume_details  || {};
    const cand    = app.candidate_details || {};

    const displayName = resume.candidate_name
        || [cand.first_name, cand.last_name].filter(Boolean).join(' ')
        || cand.email
        || 'Candidate';

    const skills = resume.skills || resume.key_skills || [];
    const topSkills = skills.slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.04 }}
            className="bg-card border border-border hover:border-emerald-500/25 rounded-xl overflow-hidden transition-all"
        >
            <div className="p-4 md:p-5 flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0
                    ${rank === 1 ? 'bg-yellow-500/10 text-yellow-500' :
                      rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                      rank === 3 ? 'bg-orange-500/10 text-orange-500' :
                                   'bg-secondary text-muted-foreground'}`}
                >
                    #{rank}
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0">
                        <HiOutlineUserCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold truncate">{displayName}</h3>
                            {rank === 1 && app.shortlist_score > 0.8 && (
                                <HiOutlineStar className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{cand.email}</p>
                        <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-muted-foreground">
                            {resume.current_location && (
                                <span className="inline-flex items-center gap-1"><HiOutlineMapPin className="w-3 h-3" />{resume.current_location}</span>
                            )}
                            {resume.years_experience != null && (
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-500/80">
                                    <HiOutlineBriefcase className="w-3 h-3" />{resume.years_experience}y exp
                                </span>
                            )}
                            {resume.education_level && (
                                <span className="inline-flex items-center gap-1"><HiOutlineAcademicCap className="w-3 h-3" />{resume.education_level}</span>
                            )}
                        </div>
                        {topSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {topSkills.map((s, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-medium text-muted-foreground">{s}</span>
                                ))}
                                {skills.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground/60 self-center">+{skills.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center min-w-[80px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5">AI Score</span>
                    {app.shortlist_score != null ? (
                        <div className="flex items-center gap-1.5">
                            <HiOutlineShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xl font-bold text-emerald-500">
                                {(app.shortlist_score * 100).toFixed(0)}%
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                            <HiOutlineClipboardDocumentCheck className="w-3 h-3" /> Pending
                        </span>
                    )}
                </div>

                <div className="min-w-[120px] text-center">
                    <StageBadge stage={app.current_stage} />
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onUpdateStatus(app.application_id, { status: 'rejected', current_stage: 'rejected' })}
                        className="p-2 rounded-lg bg-red-500/5 text-red-400 hover:bg-red-500/15 border border-red-500/10 transition-all"
                        title="Reject"
                    >
                        <HiOutlineXCircle className="w-4 h-4" />
                    </button>
                    {app.current_stage === 'applied' && (
                        <button
                            onClick={() => onUpdateStatus(app.application_id, { current_stage: 'shortlisted', status: 'in_progress' })}
                            className="p-2 rounded-lg bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/10 transition-all"
                            title="Shortlist"
                        >
                            <HiOutlineCheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    {onStartChat && showMessageButton && (
                        <button
                            onClick={onStartChat}
                            className="p-2 rounded-lg bg-blue-500/5 text-blue-500 hover:bg-blue-500/15 border border-blue-500/10 transition-all"
                            title="Message"
                        >
                            <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                        </button>
                    )}
                    {(sr || app.stage_results?.coding) && (
                        <button
                            onClick={() => setExpanded(x => !x)}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border transition-all"
                            title="Scores"
                        >
                            <HiOutlineArrowTrendingUp className="w-4 h-4" />
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
                        className="overflow-hidden border-t border-border"
                    >
                        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/30">
                            <ScoreBar label="Skills Match" value={sr.skills_score ?? 0} color="bg-emerald-500" />
                            <ScoreBar label="Work Experience" value={sr.workexp_score ?? 0} color="bg-blue-500" />
                            <ScoreBar label="Projects" value={sr.projects_score ?? 0} color="bg-purple-500" />
                            <ScoreBar label="Summary" value={sr.summary_score ?? 0} color="bg-orange-500" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default CandidateCard;
