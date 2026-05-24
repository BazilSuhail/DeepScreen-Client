import Link from 'next/link';
import {
    HiOutlineArchiveBox,
    HiOutlineBriefcase,
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCommandLine,
    HiOutlinePencilSquare,
    HiOutlineQuestionMarkCircle,
    HiOutlineUserGroup,
} from 'react-icons/hi2';
import Badge from '@/components/assessments/AssessmentBadge';

import { focusRing, primaryButton, secondaryButton } from '@/components/ui/styles';
const metaItem = 'inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2.5 py-1.5 dark:bg-white/5';

// Whole-card link: the title link stretches over the card, and the action buttons sit above it (relative z-10).
export default function AssessmentCard({ assessment, editHref, onEdit, onSessions, onArchive }) {
    const active = assessment.is_active !== false;
    const title = assessment.title || 'Untitled assessment';
    const sessions = assessment.session_count || 0;
    const questions = assessment.questions_count || 0;

    return (
        <article className="relative flex min-w-0 flex-col gap-4 rounded-lg border border-emerald-100 bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform,translate,scale,rotate] duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-emerald-500 dark:border-white/10 dark:hover:border-emerald-500/40">
            <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <HiOutlineCommandLine className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Link
                            href={editHref}
                            className={`min-w-0 truncate rounded-sm text-base font-semibold text-emerald-950 after:absolute after:inset-0 after:rounded-lg focus:outline-none dark:text-foreground`}
                        >
                            {title}
                        </Link>
                        {active ? (
                            <Badge tone="emerald" icon={HiOutlineCheckCircle} title="Open to candidates">Active</Badge>
                        ) : (
                            <Badge tone="neutral" icon={HiOutlineArchiveBox} title="Archived: candidates already invited can still finish it">Archived</Badge>
                        )}
                    </div>
                    {assessment.job_title && (
                        <p className="flex min-w-0 items-center gap-1.5 text-xs text-emerald-800/70 dark:text-muted-foreground">
                            <HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">For {assessment.job_title}</span>
                        </p>
                    )}
                </div>
            </div>

            <ul className="flex flex-wrap gap-2 text-xs font-medium text-emerald-800/70 dark:text-muted-foreground">
                <li className={metaItem}>
                    <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
                    {assessment.duration_minutes ?? '—'} min
                </li>
                <li className={metaItem}>
                    <HiOutlineQuestionMarkCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {questions} {questions === 1 ? 'question' : 'questions'}
                </li>
                <li className={metaItem}>
                    <HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden="true" />
                    Pass at {assessment.passing_score ?? '—'}%
                </li>
                <li className={metaItem}>
                    <HiOutlineUserGroup className="h-3.5 w-3.5" aria-hidden="true" />
                    {sessions} {sessions === 1 ? 'session' : 'sessions'}
                </li>
            </ul>

            <div className="relative z-10 mt-auto flex flex-wrap items-center gap-2 border-t border-emerald-100 pt-4 dark:border-white/10">
                {active && (
                    <button
                        type="button"
                        onClick={() => onArchive(assessment)}
                        aria-label={`Archive ${title}`}
                        title="Archive"
                        className={`flex h-11 w-11 items-center justify-center rounded-md text-emerald-800/70 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-red-500/10 hover:text-red-600 dark:text-muted-foreground dark:hover:text-red-400 ${focusRing}`}
                    >
                        <HiOutlineArchiveBox className="h-5 w-5" aria-hidden="true" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onSessions(assessment)}
                    className={`${primaryButton} flex-1 sm:flex-none`}
                >
                    <HiOutlineUserGroup className="h-4 w-4" aria-hidden="true" /> View sessions
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(assessment)}
                    className={`${secondaryButton} flex-1 sm:flex-none`}
                >
                    <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit
                </button>
            </div>
        </article>
    );
}
