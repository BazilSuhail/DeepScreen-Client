'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { HiOutlineBriefcase, HiOutlineCheck, HiOutlineChevronDown } from 'react-icons/hi2';

// Dropdown for choosing the job opening. Closes on outside click, Escape, or selection.
export default function JobSelector({ jobs, value, onChange, loading = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const listId = useId();
    const list = Array.isArray(jobs) ? jobs : [];
    const selected = list.find((j) => j.job_id === value);

    useEffect(() => {
        if (!open) return;
        const onPointer = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const label = loading ? 'Loading jobs...' : selected ? selected.job_title : 'Select a job';

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                disabled={loading}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-emerald-100 bg-card px-4 py-3 text-left text-sm font-medium text-emerald-950 outline-none transition-colors hover:border-emerald-200 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:bg-background dark:text-foreground"
            >
                <span className={`flex min-w-0 items-center gap-2 ${selected ? '' : 'text-emerald-700/70 dark:text-muted-foreground'}`}>
                    <HiOutlineBriefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                </span>
                <HiOutlineChevronDown
                    className={`h-4 w-4 shrink-0 text-emerald-700/70 transition-transform ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>
            {open && (
                <div
                    id={listId}
                    aria-label="Job openings"
                    className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-emerald-100 bg-card shadow-md dark:border-white/10"
                >
                    <div className="max-h-60 space-y-0.5 overflow-y-auto p-1.5">
                        {list.length === 0 && (
                            <p className="px-4 py-3 text-center text-sm text-emerald-800/70 dark:text-muted-foreground">No jobs available. Post a job first.</p>
                        )}
                        {list.map((job) => {
                            const isSelected = value === job.job_id;
                            return (
                                <button
                                    key={job.job_id}
                                    type="button"
                                    onClick={() => { onChange(job.job_id); setOpen(false); }}
                                    className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                                        isSelected
                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                            : 'text-emerald-900 hover:bg-emerald-50 dark:text-foreground dark:hover:bg-white/5'
                                    }`}
                                >
                                    <span className="min-w-0 truncate">{job.job_title}</span>
                                    {isSelected && <HiOutlineCheck className="h-4 w-4 shrink-0" aria-hidden="true" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
