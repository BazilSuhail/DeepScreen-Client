// Status badge: always icon plus text, so state is never conveyed by color alone.
const TONES = {
    emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    yellow: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    red: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400',
    neutral: 'border-emerald-100 bg-emerald-50 text-emerald-800/70 dark:border-white/10 dark:bg-white/5 dark:text-muted-foreground',
};

export default function Badge({ tone = 'neutral', icon: Icon, children, title }) {
    return (
        <span
            title={title}
            className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${TONES[tone] || TONES.neutral}`}
        >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {children}
        </span>
    );
}
