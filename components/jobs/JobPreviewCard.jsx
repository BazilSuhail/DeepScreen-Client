'use client';

import { motion } from 'motion/react';
import { HiOutlineBriefcase, HiOutlineMapPin, HiOutlineBanknotes } from 'react-icons/hi2';

const MAX_SKILLS = 6;

// Live preview of how the posting will read to candidates. Values come straight from the form state.
export default function JobPreviewCard({ values, organizationName, pipelineCount }) {
    const skills = values.key_skills.filter(s => s.trim()).slice(0, MAX_SKILLS);
    const meta = [values.job_type, values.experience_level].filter(Boolean).join(' · ');

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            aria-label="Posting preview"
            className="space-y-4 rounded-lg border border-border bg-card p-5"
        >
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Preview</p>
            <div className="min-w-0 space-y-1">
                <p className="break-words text-base font-semibold text-foreground">{values.job_title.trim() || 'Untitled role'}</p>
                <p className="truncate text-sm text-muted-foreground">
                    {[organizationName, values.department].filter(Boolean).join(' · ') || 'Organization and department'}
                </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><HiOutlineMapPin className="h-4 w-4 shrink-0 text-foreground/35" aria-hidden="true" /><span className="truncate">{values.location.trim() || 'Location'}</span></li>
                <li className="flex items-center gap-2"><HiOutlineBriefcase className="h-4 w-4 shrink-0 text-foreground/35" aria-hidden="true" /><span className="truncate">{meta}</span></li>
                <li className="flex items-center gap-2"><HiOutlineBanknotes className="h-4 w-4 shrink-0 text-foreground/35" aria-hidden="true" /><span className="truncate">{values.salary_range.trim() || 'Salary not shown'}</span></li>
            </ul>
            {skills.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Key skills">
                    {skills.map((skill, i) => (
                        <li key={`${skill}-${i}`} className="rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-500">{skill}</li>
                    ))}
                </ul>
            )}
            <p className="text-xs text-muted-foreground">{pipelineCount} of 4 screening stages selected</p>
        </motion.div>
    );
}
