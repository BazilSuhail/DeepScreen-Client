import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import Badge from '@/components/assessments/AssessmentBadge';
import { DIFFICULTY_TONE, TYPE_META } from '@/components/assessments/AssessmentQuestionTypeMeta';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';

export default function QuestionListItem({ problem, index, onEdit, onDelete }) {
    const title = problem.title || 'Untitled question';
    const difficulty = problem.difficulty || 'medium';
    const meta = TYPE_META[problem.type];

    return (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-card p-4 shadow-sm transition-colors hover:border-emerald-500/40 sm:gap-4 sm:p-5 dark:border-white/10">
            <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-base font-semibold tabular-nums text-emerald-900 dark:bg-white/10 dark:text-foreground"
                aria-label={`Question ${index + 1}`}
            >
                {index + 1}
            </span>
            <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-emerald-950 sm:text-base dark:text-foreground">{title}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge tone={DIFFICULTY_TONE[difficulty] || 'neutral'}>{difficulty}</Badge>
                    {meta ? (
                        <Badge tone="neutral" icon={meta.icon}>{meta.label}</Badge>
                    ) : (
                        <Badge tone="neutral">{problem.type || 'Question'}</Badge>
                    )}
                    <span className="text-xs text-emerald-800/70 dark:text-muted-foreground">{problem.marks ?? 0} marks</span>
                </div>
            </div>
            <div className="flex shrink-0 gap-1">
                <button
                    type="button"
                    onClick={() => onEdit(problem)}
                    aria-label={`Edit question ${index + 1}`}
                    title="Edit question"
                    className={`flex h-11 w-11 items-center justify-center rounded-md text-emerald-800/70 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-muted-foreground dark:hover:text-emerald-400 ${focusRing}`}
                >
                    <HiOutlinePencilSquare className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(problem.question_id)}
                    aria-label={`Remove question ${index + 1}`}
                    title="Remove from this assessment"
                    className={`flex h-11 w-11 items-center justify-center rounded-md text-emerald-800/70 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-red-500/10 hover:text-red-600 dark:text-muted-foreground dark:hover:text-red-400 ${focusRing}`}
                >
                    <HiOutlineTrash className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
