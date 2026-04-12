"use client";

import React from 'react';
import {
    HiOutlineLocationMarker,
    HiOutlineLightningBolt,
    HiOutlineBriefcase
} from 'react-icons/hi';
import Link from 'next/link';

const JobCard = ({ job }) => {
    return (
        <div className="group bg-white rounded-[32px] border border-slate-200 p-8 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Column 1: Identity (40%) */}
                <div className="lg:w-[40%]">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-slate-900 flex items-center justify-center rounded-2xl text-emerald-400 font-black text-xl shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                            {job.company?.[0] || 'DS'}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">
                                {job.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-slate-500 font-bold text-sm">DeepScreen Intelligence</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-emerald-500 font-bold text-xs uppercase tracking-wider">{job.job_type || 'Full-time'}</span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-100">
                                <HiOutlineLightningBolt size={12} />
                                Urgently hiring
                            </span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Details/Benefits (40%) */}
                <div className="lg:w-[40%] flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                    <ul className="space-y-3 mb-4">
                        {(job.responsibilities || []).slice(0, 2).map((res, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                                <HiOutlineBriefcase className="text-slate-300 mt-1 shrink-0" size={16} />
                                <p className="line-clamp-1">{res}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5">
                        {(job.skills_required || []).slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                                {skill}
                            </span>
                        ))}
                        {job.skills_required?.length > 3 && (
                            <span className="text-[10px] font-bold text-slate-300 self-center">+{job.skills_required.length - 3} more</span>
                        )}
                    </div>
                </div>

                {/* Column 3: Stats & Meta (20%) */}
                <div className="lg:w-[20%] flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:pl-8 lg:border-l border-slate-100 pb-2 lg:pb-0">
                    <div className="text-right">
                        <div className="flex items-center lg:justify-end gap-1.5 text-slate-900 font-black text-sm mb-1">
                            <HiOutlineLocationMarker size={16} className="text-emerald-500" />
                            {job.location || 'Remote'}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(job.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <Link
                        href={`/jobs/${job.uuid}`}
                        className="px-6 py-3 bg-slate-900 group-hover:bg-emerald-500 text-white rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-slate-900/10 group-hover:shadow-emerald-500/20 text-center whitespace-nowrap"
                    >
                        Apply Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
