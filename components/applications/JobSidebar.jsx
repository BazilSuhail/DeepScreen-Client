import React from 'react';

export default function JobSidebar({ jobs, selectedJobId, onSelectJob }) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border bg-muted/30">
                <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Your Positions</h2>
            </div>
            <div className="divide-y divide-border">
                {jobs.map(job => (
                    <button
                        key={job.job_id}
                        onClick={() => onSelectJob(job.job_id)}
                        className={`w-full text-left p-4 transition-all hover:bg-muted/50 ${selectedJobId === job.job_id ? 'bg-emerald-500/5 border-l-2 border-emerald-500' : ''}`}
                    >
                        <p className="font-bold truncate text-sm">{job.job_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{job.organization}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-bold text-emerald-500">{job.total_applications} applicants</span>
                            <span className="text-xs text-muted-foreground">{job.shortlisted_count} shortlisted</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
