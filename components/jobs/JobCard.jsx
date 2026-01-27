'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineCurrencyDollar,
    HiOutlineClock,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineUserGroup,
    HiOutlineChevronRight,
    HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';

const statusStyles = {
    open:   'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    draft:  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    filled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    paused: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

/**
 * JobCard — used in recruiter job list
 * Props: job, index, onDelete, showApplicants (bool)
 */
export function JobCard({ job, index = 0, onDelete, showApplicants = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="glass p-6 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
            {/* Left: icon + info */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <HiOutlineBriefcase className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-bold group-hover:text-emerald-500 transition-colors truncate">
                        {job.job_title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {job.location && (
                            <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />{job.location}</span>
                        )}
                        {job.salary_range && (
                            <span className="flex items-center gap-1"><HiOutlineCurrencyDollar className="w-3.5 h-3.5" />{job.salary_range}</span>
                        )}
                        <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" />{job.job_type}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusStyles[job.status] || statusStyles.draft}`}>
                            {job.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3 shrink-0">
                {showApplicants && job.total_applications != null && (
                    <div className="text-center hidden md:block">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Applicants</div>
                        <div className="flex items-center gap-1 text-emerald-500 font-black mt-0.5">
                            <HiOutlineUserGroup className="w-4 h-4" />
                            {job.total_applications}
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2 border-l border-emerald-500/10 pl-4">
                    <Link
                        href={`/recruiter/jobs/${job.job_id}/edit`}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-border transition-all"
                        title="Edit"
                    >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                    </Link>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(job.job_id)}
                            className="p-2.5 rounded-xl bg-secondary hover:bg-red-500/10 hover:text-red-500 border border-border transition-all"
                            title="Delete"
                        >
                            <HiOutlineTrash className="w-4 h-4" />
                        </button>
                    )}
                    <Link
                        href={`/recruiter/applications?job=${job.job_id}`}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                    >
                        Pipeline <HiOutlineChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * JobCardCandidate — used in candidate job browse/applied list
 * Props: job, applied (bool), onApply
 */
export function JobCardCandidate({ job, applied = false, onApply, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="glass p-6 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group"
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <HiOutlineBriefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold group-hover:text-emerald-500 transition-colors">{job.job_title}</h3>
                        <p className="text-sm text-muted-foreground">{job.organization_details?.name || job.organization}</p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0 ${statusStyles[job.status] || statusStyles.draft}`}>
                    {job.status}
                </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {job.key_skills?.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-bold">{skill}</span>
                ))}
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {job.location && <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />{job.location}</span>}
                    {job.salary_range && <span className="flex items-center gap-1"><HiOutlineCurrencyDollar className="w-3.5 h-3.5" />{job.salary_range}</span>}
                </div>
                {!applied && onApply && (
                    <button
                        onClick={() => onApply(job)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all shrink-0"
                    >
                        Apply Now <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                    </button>
                )}
                {applied && (
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm font-bold shrink-0">Applied ✓</span>
                )}
            </div>
        </motion.div>
    );
}
