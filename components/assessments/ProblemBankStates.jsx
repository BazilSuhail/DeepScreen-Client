import { card } from '@/components/assessments/problemBankStyles';

export { default as ErrorState } from '@/components/dashboard/ErrorState';
export { default as EmptyState } from '@/components/dashboard/EmptyState';

export function StatTile({ icon: Icon, label, hint, value }) {
  return (
    <div className={`${card} flex min-w-0 items-start gap-3 p-4 sm:p-5`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-emerald-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-emerald-800/80 dark:text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums text-emerald-950 dark:text-foreground">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-emerald-800/70 dark:text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
