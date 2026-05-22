import React, { useState } from 'react';
import {
    HiOutlineUserCircle,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineArrowTrendingUp,
    HiOutlineChatBubbleLeftRight,
    HiOutlineShieldCheck,
    HiOutlineClipboardDocumentCheck,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
} from 'react-icons/hi2';
import { card, focusRing } from './ui';
import StageBadge from './StageBadge';

const SCORE_BARS = [
    { key: 'skills_score', label: 'Skills match', bar: 'bg-emerald-500' },
    { key: 'workexp_score', label: 'Work experience', bar: 'bg-blue-500' },
    { key: 'projects_score', label: 'Projects', bar: 'bg-violet-500' },
    { key: 'summary_score', label: 'Summary', bar: 'bg-amber-500' },
];

const toPercent = (value) => Math.round(Math.min(Math.max(Number(value) || 0, 0), 1) * 100);

const smallButton = `inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export default function CandidateRow({ app, rank, busy, showMessage, onShortlist, onReject, onMessage, onOpen }) {
    const [expanded, setExpanded] = useState(false);

    const resume = app?.resume_details || {};
    const candidate = app?.candidate_details || {};
    const stage = app?.current_stage;
    const scores = app?.stage_results?.shortlist;
    const name = resume.candidate_name
        || [candidate.first_name, candidate.last_name].filter(Boolean).join(' ')
        || candidate.email
        || 'Candidate';
    const hasScore = app?.shortlist_score != null;
    const expandId = `scores-${app?.application_id}`;

    return (
        <li className={`${card} relative p-4 sm:p-5`}>
            {/* Stretched button: the whole row opens the panel. The action row sits above it (relative z-10). */}
            <button
                type="button"
                onClick={() => onOpen?.(app)}
                aria-haspopup="dialog"
                aria-label={`View details for ${name}`}
                className={`absolute inset-0 cursor-pointer rounded-2xl ${focusRing}`}
            />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                        aria-label={rank ? `Rank ${rank}` : 'Not ranked yet'}
                        className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl px-2 text-xs font-bold ${rank && rank <= 3
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                            : 'bg-emerald-50 text-emerald-800 dark:bg-white/5 dark:text-emerald-200'}`}
                    >
                        {rank ? `#${rank}` : '–'}
                    </span>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <HiOutlineUserCircle className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-emerald-950 dark:text-foreground">{name}</h3>
                        {candidate.email && (
                            <p className="truncate text-sm text-emerald-800/80 dark:text-slate-400">{candidate.email}</p>
                        )}
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-emerald-800/80 dark:text-slate-400">
                            {resume.years_experience != null && (
                                <span className="inline-flex items-center gap-1"><HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" />{resume.years_experience} yrs experience</span>
                            )}
                            {resume.education_level && (
                                <span className="inline-flex items-center gap-1"><HiOutlineAcademicCap className="h-3.5 w-3.5" aria-hidden="true" />{resume.education_level}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:shrink-0 lg:justify-end">
                    {hasScore ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            <HiOutlineShieldCheck className="h-4 w-4" aria-hidden="true" />
                            AI score {toPercent(app.shortlist_score)}%
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-800/70 dark:text-slate-400">
                            <HiOutlineClipboardDocumentCheck className="h-4 w-4" aria-hidden="true" />
                            Not scored
                        </span>
                    )}
                    <StageBadge stage={stage} />
                </div>
            </div>

            {(stage === 'applied' || showMessage || scores || stage !== 'rejected') && (
                <div className="relative z-10 mt-4 flex flex-wrap gap-2 border-t border-emerald-100 pt-4 dark:border-white/10">
                    {stage === 'applied' && (
                        <button type="button" onClick={onShortlist} disabled={busy} className={`${smallButton} bg-emerald-600 text-white hover:bg-emerald-500`}>
                            <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                            Shortlist
                        </button>
                    )}
                    {showMessage && (
                        <button type="button" onClick={onMessage} disabled={busy} className={`${smallButton} border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-white/15 dark:bg-white/5 dark:text-emerald-100 dark:hover:bg-white/10`}>
                            <HiOutlineChatBubbleLeftRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            Message
                        </button>
                    )}
                    {scores && (
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            aria-expanded={expanded}
                            aria-controls={expandId}
                            className={`${smallButton} text-emerald-800 hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-white/5`}
                        >
                            <HiOutlineArrowTrendingUp className="h-4 w-4" aria-hidden="true" />
                            Scores
                            {expanded
                                ? <HiOutlineChevronUp className="h-4 w-4" aria-hidden="true" />
                                : <HiOutlineChevronDown className="h-4 w-4" aria-hidden="true" />}
                        </button>
                    )}
                    {stage !== 'rejected' && (
                        <button type="button" onClick={onReject} disabled={busy} className={`${smallButton} text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10`}>
                            <HiOutlineXCircle className="h-4 w-4" aria-hidden="true" />
                            Reject
                        </button>
                    )}
                </div>
            )}

            {scores && expanded && (
                <div id={expandId} className="relative z-10 mt-4 grid gap-4 rounded-xl bg-emerald-50/60 p-4 sm:grid-cols-2 dark:bg-white/5">
                    {SCORE_BARS.map(({ key, label, bar }) => {
                        const value = toPercent(scores[key]);
                        return (
                            <div key={key}>
                                <div className="flex justify-between text-xs">
                                    <span className="text-emerald-800/80 dark:text-slate-400">{label}</span>
                                    <span className="font-semibold text-emerald-950 dark:text-foreground">{value}%</span>
                                </div>
                                <div
                                    aria-label={label}
                                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-white/10"
                                >
                                    <span className="sr-only">{value}%</span>
                                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${value}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </li>
    );
}
