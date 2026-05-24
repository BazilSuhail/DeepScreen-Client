'use client';

import React from 'react';
import Link from 'next/link';
import {
    HiOutlineBriefcase,
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineArrowRight,
    HiOutlineMapPin,
    HiOutlineSparkles,
    HiOutlineUserGroup,
    HiOutlineXCircle,
} from 'react-icons/hi2';
import { cardInteractive, iconTile, badge } from '@/components/ui/styles';
import { formatDate } from './ui';

// One role card. The whole card is a link to that role's applicants.
export default function RoleRow({ job }) {
    const applicants = Number(job.total_applications) || 0;
    const posted = formatDate(job.posted_date);
    const isOpen = job.status === 'open';
    const StatusIcon = isOpen ? HiOutlineCheckCircle : HiOutlineXCircle;

    return (
        <li className="min-w-0">
            <Link href={`/recruiter/applications/${job.job_id}`} className={`${cardInteractive} group flex h-full flex-col`}>
                <span className="flex items-start gap-3 p-5 pb-4">
                    <span className={`${iconTile} h-11 w-11 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                        <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 space-y-1.5">
                        <span className="line-clamp-2 block break-words font-semibold leading-snug">
                            {job.job_title || <span className="text-muted-foreground/60">—</span>}
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                            {job.status && (
                                <span className={`${badge} capitalize ${isOpen ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                    {String(job.status).replace(/_/g, ' ')}
                                </span>
                            )}
                            {job.is_shortlisted && (
                                <span className={`${badge} bg-teal-500/10 text-teal-700 dark:text-teal-400`}>
                                    <HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                    AI analyzed
                                </span>
                            )}
                        </span>
                    </span>
                </span>

                <span className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-emerald-100 px-5 py-3 text-xs text-muted-foreground dark:border-white/10">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                        <HiOutlineUserGroup className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        {applicants} {applicants === 1 ? 'applicant' : 'applicants'}
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                        <HiOutlineMapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{job.location || '—'}</span>
                    </span>
                    {posted && (
                        <span className="inline-flex items-center gap-1.5">
                            <HiOutlineCalendarDays className="h-4 w-4" aria-hidden="true" />
                            {posted}
                        </span>
                    )}
                    <HiOutlineArrowRight
                        className="ml-auto h-4 w-4 shrink-0 text-emerald-600 transition-[translate] duration-150 group-hover:translate-x-0.5 dark:text-emerald-400"
                        aria-hidden="true"
                    />
                </span>
            </Link>
        </li>
    );
}
