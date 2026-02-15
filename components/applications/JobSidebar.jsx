import React from 'react';

export default function JobSidebar({ jobs, selectedJobId, onSelectJob }) {
    return (
        <div className="glass border border-emerald-500/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-emerald-500/5 bg-emerald-500/3">
                <h2 className="font-black text-sm uppercase tracking-widest opacity-50">Your Positions</h2>
            </div>
            <div className="divide-y divide-emerald-500/5">
                {jobs.map(job => (
                    <button
                        key={job.job_id}
                        onClick={() => onSelectJob(job.job_id)}
                        className={`w-full text-left p-5 transition-all hover:bg-emerald-500/5 ${selectedJobId === job.job_id ? 'bg-emerald-500/8 border-l-2 border-emerald-500' : ''}`}
                    >
                        <p className="font-bold truncate">{job.job_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{job.organization}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs font-black text-emerald-500">{job.total_applications} applicants</span>
                            <span className="text-xs text-muted-foreground">{job.shortlisted_count} shortlisted</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
