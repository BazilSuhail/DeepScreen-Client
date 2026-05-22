import { HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlineListBullet, HiOutlineCommandLine } from 'react-icons/hi2';
import Badge from '@/components/assessments/AssessmentBadge';
import { DIFFICULTY_TONE, TYPE_META } from '@/components/assessments/AssessmentQuestionTypeMeta';

// Read-only view of a question as a candidate will see it. Lives outside the page so it does not remount on every render.
export default function QuestionPreview({ problem }) {
    const coding = problem.coding_details;
    const mcq = problem.mcq_details;
    const subj = problem.subjective_details;
    const difficulty = problem.difficulty || 'medium';
    const meta = TYPE_META[problem.type];
    const testCases = Array.isArray(coding?.testCases) ? coding.testCases : [];
    const options = Array.isArray(mcq?.options) ? mcq.options : [];

    return (
        <div className="space-y-5 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm lg:p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800/70 dark:bg-white/10 dark:text-slate-300">
                    <HiOutlineDocumentText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <h4 className="truncate text-base font-semibold text-emerald-950 dark:text-foreground">{problem.title || 'Untitled question'}</h4>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge tone={DIFFICULTY_TONE[difficulty] || 'neutral'}>{difficulty}</Badge>
                        {meta && <Badge tone="neutral" icon={meta.icon}>{meta.label}</Badge>}
                        <span className="text-xs text-emerald-800/70 dark:text-slate-400">{problem.marks ?? 0} marks</span>
                    </div>
                </div>
            </div>

            {problem.description && (
                <div
                    className="prose-content line-clamp-4 text-sm leading-relaxed text-emerald-800/70 dark:text-slate-400"
                    dangerouslySetInnerHTML={{ __html: problem.description }}
                />
            )}

            {problem.type === 'coding' && testCases.length > 0 && (
                <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/70 dark:text-slate-400">
                        <HiOutlineCommandLine className="h-3.5 w-3.5" aria-hidden="true" /> Test cases ({testCases.length})
                    </p>
                    <div className="grid gap-2">
                        {testCases.slice(0, 2).map((tc, i) => (
                            <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 font-mono text-xs dark:border-white/10 dark:bg-white/[0.02]">
                                <div className="mb-1 text-[10px] font-semibold uppercase text-emerald-700/70">{tc?.isHidden ? 'Hidden' : 'Visible'} case {i + 1}</div>
                                <div className="truncate text-emerald-900/80 dark:text-slate-300">In: {tc?.input || '—'}</div>
                                <div className="truncate text-emerald-900/80 dark:text-slate-300">Out: {tc?.expectedOutput || '—'}</div>
                            </div>
                        ))}
                        {testCases.length > 2 && <p className="text-xs font-medium text-emerald-700/70">+{testCases.length - 2} more</p>}
                    </div>
                </div>
            )}

            {problem.type === 'mcq' && options.length > 0 && (
                <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/70 dark:text-slate-400">
                        <HiOutlineListBullet className="h-3.5 w-3.5" aria-hidden="true" /> Options ({options.length})
                    </p>
                    <ul className="grid gap-1.5">
                        {options.map((opt, i) => {
                            const correct = Boolean(opt?.isCorrect);
                            return (
                                <li
                                    key={i}
                                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                                        correct
                                            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300'
                                            : 'border-emerald-100 bg-emerald-50/60 text-emerald-900/80 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300'
                                    }`}
                                >
                                    {correct
                                        ? <><HiOutlineCheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /><span className="sr-only">Correct answer</span></>
                                        : <span className="h-4 w-4 shrink-0 rounded-full border-2 border-emerald-200 dark:border-white/20" aria-hidden="true" />}
                                    <span className="min-w-0 truncate">{opt?.text || `Option ${i + 1}`}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {problem.type === 'subjective' && subj?.modelAnswer && (
                <div className="space-y-1">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/70 dark:text-slate-400">
                        <HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" /> Model answer
                    </p>
                    <p className="line-clamp-3 text-sm text-emerald-900/80 dark:text-slate-300">{subj.modelAnswer}</p>
                </div>
            )}
        </div>
    );
}
