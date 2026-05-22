'use client';

import React from 'react';
import Link from 'next/link';
import {
    HiOutlineBriefcase,
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineChevronRight,
    HiOutlineMapPin,
    HiOutlineSparkles,
    HiOutlineUserCircle,
    HiOutlineXCircle,
} from 'react-icons/hi2';
import { card, focusRing, formatDate } from './ui';

const badgeClass = 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200';

// One role in the list. The whole row is a link to that role's applicants.
export default function RoleRow({ job }) {
    const applicants = Number(job.total_applications) || 0;
    const posted = formatDate(job.posted_date);
    const isOpen = job.status === 'open';
    const StatusIcon = isOpen ? HiOutlineCheckCircle : HiOutlineXCircle;

    return (
        <li>
            <Link
                href={`/recruiter/applications/${job.job_id}`}
                className={`${card} group flex min-h-11 items-center gap-4 p-4 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/50 sm:p-5 dark:hover:bg-white/5 ${focusRing}`}
            >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1 space-y-2">
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="min-w-0 truncate text-base font-semibold text-emerald-950 dark:text-foreground">
                            {job.job_title || 'Untitled role'}
                        </span>
                        {job.status && (
                            <span className={badgeClass}>
                                <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                {String(job.status).replace(/_/g, ' ')}
                            </span>
                        )}
                        {job.is_shortlisted && (
                            <span className={badgeClass}>
                                <HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                AI analyzed
                            </span>
                        )}
                    </span>

                    <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-800/80 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                            <HiOutlineUserCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {applicants} {applicants === 1 ? 'applicant' : 'applicants'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {job.location || 'Remote'}
                        </span>
                        {posted && (
                            <span className="inline-flex items-center gap-1.5">
                                <HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                                Posted {posted}
                            </span>
                        )}
                    </span>
                </span>

                <HiOutlineChevronRight
                    className="h-5 w-5 shrink-0 text-emerald-600 transition-transform group-hover:translate-x-0.5 dark:text-emerald-400"
                    aria-hidden="true"
                />
            </Link>
        </li>
    );
}
