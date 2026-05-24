import {
  HiOutlineCodeBracket,
  HiOutlineTag,
  HiOutlineFaceSmile,
  HiOutlineBolt,
  HiOutlineFire,
  HiOutlineSignal,
} from 'react-icons/hi2';
import { card } from '@/components/assessments/problemBankStyles';

const DIFFICULTY = {
  easy: {
    label: 'Easy',
    icon: HiOutlineFaceSmile,
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  medium: {
    label: 'Medium',
    icon: HiOutlineBolt,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  hard: {
    label: 'Hard',
    icon: HiOutlineFire,
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
  },
};

const FALLBACK_DIFFICULTY = {
  label: 'Unset',
  icon: HiOutlineSignal,
  className: 'bg-emerald-50 text-emerald-900 dark:bg-white/10 dark:text-muted-foreground',
};

export function DifficultyBadge({ difficulty }) {
  const config = DIFFICULTY[difficulty] || FALLBACK_DIFFICULTY;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default function ProblemCard({ problem }) {
  return (
    <li className={`${card} flex min-w-0 items-center gap-3 p-4 sm:gap-4 sm:p-5`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <HiOutlineCodeBracket className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-emerald-950 dark:text-foreground">
          {problem.title || 'Untitled problem'}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800/80 dark:text-muted-foreground">
            <HiOutlineTag className="h-3.5 w-3.5" aria-hidden="true" />
            {problem.points ?? 0} points
          </span>
        </div>
      </div>
    </li>
  );
}
