'use client';

import { HiOutlineCheckCircle, HiOutlineMinusCircle } from 'react-icons/hi2';

// Progress through the required fields. `compact` is the one-line bar shown above the form on small screens.
export default function JobChecklist({ items, compact = false }) {
    const done = items.filter(item => item.done).length;
    const total = items.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const bar = (
        <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
    );

    if (compact) {
        return (
            <div className="space-y-2 rounded-lg border border-emerald-100 bg-card dark:border-white/10 px-4 py-3">
                <p className="text-xs font-semibold text-muted-foreground" aria-hidden="true">{done} of {total} required</p>
                <span className="sr-only">{done} of {total} required fields complete</span>
                {bar}
            </div>
        );
    }

    return (
        <div className="space-y-4 rounded-lg border border-emerald-100 bg-card dark:border-white/10 p-5">
            <div className="space-y-2">
                <p className="text-base font-semibold text-foreground">Required fields</p>
                <p className="text-xs font-semibold text-muted-foreground" aria-hidden="true">{done} of {total} complete</p>
                <span className="sr-only">{done} of {total} required fields complete</span>
                {bar}
            </div>
            <ul className="space-y-2.5">
                {items.map(item => {
                    const Icon = item.done ? HiOutlineCheckCircle : HiOutlineMinusCircle;
                    return (
                        <li key={item.id} className={`flex items-center gap-2.5 text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                            <Icon className={`h-4 w-4 shrink-0 ${item.done ? 'text-emerald-500' : 'text-foreground/35'}`} aria-hidden="true" />
                            <span>{item.label}</span>
                            <span className="sr-only">{item.done ? '(done)' : '(missing)'}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
