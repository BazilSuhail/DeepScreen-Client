'use client';

import { HiOutlineInformationCircle } from 'react-icons/hi2';

// Tooltip-style help bubble. Shown only while a field inside the same `group` has focus,
// but kept in the DOM so aria-describedby can point at it.
export default function JobFieldHint({ id, children }) {
    return (
        <span
            id={id}
            className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 flex w-64 max-w-[calc(100vw-3rem)] items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground opacity-0 shadow-md transition-opacity duration-150 group-focus-within:opacity-100"
        >
            <HiOutlineInformationCircle className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
            <span className="min-w-0">{children}</span>
        </span>
    );
}
