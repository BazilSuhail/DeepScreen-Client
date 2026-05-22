// Status badge: always icon plus text, so state is never conveyed by color alone.
const TONES = {
    emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    red: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400',
    neutral: 'border-emerald-100 bg-emerald-50 text-emerald-800/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-400',
};

export default function Badge({ tone = 'neutral', icon: Icon, children, title }) {
    return (
        <span
            title={title}
            className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${TONES[tone] || TONES.neutral}`}
        >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {children}
        </span>
    );
}
