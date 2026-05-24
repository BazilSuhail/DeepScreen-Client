'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/utils/api';
import { interviewJoinUrl } from '@/utils/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    HiOutlineCalendar,
    HiOutlineBriefcase,
    HiOutlineInformationCircle,
    HiOutlineChevronDown,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineTrash,
    HiOutlineUser,
    HiOutlineExclamationTriangle,
    HiOutlineWrenchScrewdriver,
    HiOutlineBuildingOffice,
    HiOutlineAdjustmentsHorizontal,
    HiOutlineClipboardDocument,
    HiOutlineArrowLeft,
    HiOutlineClock,
    HiOutlineEye,
} from 'react-icons/hi2';
import Modal from '@/components/ui/Modal';
import { base, fast, stagger, fadeUp } from '@/constants/motion';
import {
    primaryButton,
    secondaryButton,
    focusRing,
    cardPadded,
    inputClass,
    labelClass,
    errorClass,
    iconTile,
    badge,
} from '@/components/ui/styles';
import { SectionHeading } from '@/components/interview/InterviewListParts';

const pickerClass = `${inputClass} flex items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50`;
const optionClass = 'flex min-h-14 w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-white/5';
const menuClass = 'absolute z-40 mt-2 w-full overflow-y-auto rounded-lg border border-emerald-100 bg-card shadow-md dark:border-white/10';
const tile = `${iconTile} h-9 w-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`;
const reveal = { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, transition: base };

// Local wall-clock time for display; the server receives UTC.
const formatLocal = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const toUtcIso = (localStr) => new Date(localStr).toISOString();

function FieldLabel({ htmlFor, icon: Icon, children }) {
    return (
        <label htmlFor={htmlFor} className={`${labelClass} flex items-center gap-1.5`}>
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {children}
        </label>
    );
}

function Chevron({ open }) {
    return (
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={fast} className="shrink-0 text-muted-foreground">
            <HiOutlineChevronDown className="h-4 w-4" aria-hidden="true" />
        </motion.span>
    );
}

function Notice({ text }) {
    if (!text) return null;
    return (
        <p role="alert" className={`${errorClass} flex items-center gap-1.5`}>
            <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {text}
        </p>
    );
}

export default function ScheduleInterview({ applications = [], recruiterJobs = [] }) {
    const router = useRouter();
    const [jobs, setJobs] = useState(recruiterJobs);
    const [showJobModal, setShowJobModal] = useState(false);
    const [removingJobId, setRemovingJobId] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
    const [selectedAppIds, setSelectedAppIds] = useState([]);
    const [startAt, setStartAt] = useState('');
    const [gapMinutes, setGapMinutes] = useState('');
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [copiedRoom, setCopiedRoom] = useState(null);
    // Inline feedback that replaced alert(): errors for remove/preview/schedule, and the copy-link result.
    const [notice, setNotice] = useState('');

    // Re-sync the local job list when the prop changes (render-time adjustment, not an effect).
    const [prevRecruiterJobs, setPrevRecruiterJobs] = useState(recruiterJobs);
    if (recruiterJobs !== prevRecruiterJobs) {
        setPrevRecruiterJobs(recruiterJobs);
        setJobs(recruiterJobs);
    }

    const selectedJob = jobs.find(j => j.job_id === selectedJobId);
    const candidates = applications.filter(a => a.job_id === selectedJobId);
    const duration = selectedJob?.default_duration_minutes || 45;
    const jobReady = Boolean(selectedJob?.has_config);
    const pipelineOk = Array.isArray(selectedJob?.interview_pipeline) && selectedJob.interview_pipeline.includes('real_interview');
    const gap = Number(gapMinutes);
    const gapValid = Number.isInteger(gap) && gap >= duration;
    const canPreview = jobReady && pipelineOk && selectedAppIds.length > 0 && Boolean(startAt) && gapValid;
    // The preview is only trusted while the inputs it was built from are unchanged.
    const inputKey = JSON.stringify([selectedJobId, [...selectedAppIds].sort(), startAt, gapMinutes]);
    const previewFresh = preview?.key === inputKey;
    const canSchedule = canPreview && previewFresh && preview.slots.length > 0 && preview.conflicts.length === 0;

    const handleRemoveConfig = async (jobId) => {
        try {
            setNotice('');
            setRemovingJobId(jobId);
            await api.delete(`/interviews/recruiter/config/${jobId}/`);
            setJobs(prev => prev.map(j =>
                j.job_id === jobId ? { ...j, has_config: false, config_id: null } : j
            ));
            setPreview(null);
        } catch (err) {
            console.error('Error removing config:', err);
            setNotice(err.message || 'Failed to remove configuration');
        } finally {
            setRemovingJobId(null);
        }
    };

    const chooseJob = (job) => {
        if (job.job_id !== selectedJobId) {
            setSelectedAppIds(applications.filter(a => a.job_id === job.job_id).map(a => a.application_id));
            setGapMinutes(String(job.default_duration_minutes || 45));
            setPreview(null);
        }
        setSelectedJobId(job.job_id);
        setJobDropdownOpen(false);
        setNotice('');
    };

    const toggleApp = (appId) => {
        setSelectedAppIds(prev => (prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]));
    };

    const requestBody = () => ({
        job_id: selectedJobId,
        application_ids: selectedAppIds,
        start_at: toUtcIso(startAt),
        gap_minutes: gap,
    });

    const runPreview = async () => {
        setLoading(true);
        setNotice('');
        try {
            const res = await api.post('/interviews/recruiter/slots/preview/', requestBody());
            setPreview({ key: inputKey, ...res });
        } catch (err) {
            setPreview(null);
            setNotice(err.message || 'Could not preview the schedule');
        } finally {
            setLoading(false);
        }
    };

    const runSchedule = async () => {
        setLoading(true);
        setNotice('');
        try {
            setSuccessData(await api.post('/interviews/recruiter/slots/schedule/', requestBody()));
        } catch (err) {
            console.error('Error scheduling interviews:', err);
            setNotice(err.message || 'Failed to schedule interviews');
        } finally {
            setLoading(false);
        }
    };

    const copyLink = async (slot) => {
        try {
            await navigator.clipboard.writeText(interviewJoinUrl(slot.access_token));
            setCopiedRoom(slot.room_id);
        } catch {
            setNotice('Could not copy the link. Select it and copy manually.');
        }
    };

    if (successData) {
        return (
            <motion.div {...fadeUp} transition={base} className={`${cardPadded} space-y-6`}>
                <div className="flex items-center gap-3">
                    <span className={`${iconTile} h-10 w-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                        <HiOutlineCheckCircle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Interviews scheduled</h2>
                        <p className="text-sm text-muted-foreground">
                            {successData.slots.length} {successData.slots.length === 1 ? 'candidate' : 'candidates'} assigned to a slot.
                        </p>
                    </div>
                </div>

                <ul className="divide-y divide-emerald-100 overflow-hidden rounded-md border border-emerald-100 dark:divide-white/10 dark:border-white/10">
                    {successData.slots.map(slot => (
                        <li key={slot.room_id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{slot.candidate_email}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatLocal(slot.scheduled_at)} to {new Date(slot.ends_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                </p>
                            </div>
                            <button type="button" onClick={() => copyLink(slot)} className={`${secondaryButton} shrink-0`}>
                                <HiOutlineClipboardDocument className="h-4 w-4" aria-hidden="true" />
                                {copiedRoom === slot.room_id ? 'Link copied' : 'Copy link'}
                            </button>
                        </li>
                    ))}
                </ul>

                {successData.skipped?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {successData.skipped.length} candidate(s) were left unchanged because their interview is already in progress or finished.
                    </p>
                )}
                <Notice text={notice} />

                <button type="button" onClick={() => router.push('/recruiter/interview')} className={`${secondaryButton} w-full`}>
                    <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to interviews
                </button>
            </motion.div>
        );
    }

    const configuredCount = jobs.filter(j => j.has_config).length;

    return (
        <motion.div {...fadeUp} transition={base} className="w-full space-y-6">
            {/* Template manager strip */}
            <div className={`${cardPadded} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
                <div className="flex items-center gap-3">
                    <span className={tile}>
                        <HiOutlineBuildingOffice className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold">Interview templates</p>
                        <p className="text-xs text-muted-foreground">
                            {configuredCount} of {jobs.length} jobs configured
                        </p>
                    </div>
                </div>
                <button type="button" onClick={() => { setNotice(''); setShowJobModal(true); }} className={secondaryButton}>
                    <HiOutlineAdjustmentsHorizontal className="h-4 w-4" aria-hidden="true" />
                    Manage configs
                </button>
            </div>

            <Modal
                open={showJobModal}
                onClose={() => setShowJobModal(false)}
                title="Job interview configurations"
            >
                <div className="space-y-3">
                    {jobs.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">No jobs found</p>
                    ) : (
                        <ul className="divide-y divide-emerald-100 overflow-hidden rounded-md border border-emerald-100 dark:divide-white/10 dark:border-white/10">
                            {jobs.map(job => (
                                <li key={job.job_id} className="flex items-center justify-between gap-3 p-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className={tile}>
                                            <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{job.job_title}</p>
                                            {job.organization && <p className="truncate text-xs text-muted-foreground">{job.organization}</p>}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {job.has_config ? (
                                            <>
                                                <span className={`${badge} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`}>
                                                    <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Configured
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveConfig(job.job_id)}
                                                    disabled={removingJobId === job.job_id}
                                                    className={`inline-flex h-11 w-11 items-center justify-center rounded-md text-red-600 transition-[color,background-color,translate,scale] hover:bg-red-500/10 active:scale-[0.97] disabled:opacity-40 motion-reduce:transform-none dark:text-red-400 ${focusRing}`}
                                                    title="Remove configuration"
                                                    aria-label={`Remove configuration for ${job.job_title}`}
                                                >
                                                    {removingJobId === job.job_id ? (
                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
                                                    ) : (
                                                        <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <Link
                                                href={`/recruiter/interview/setup/${job.job_id}`}
                                                className={`inline-flex min-h-11 items-center gap-1.5 rounded-md bg-amber-500/10 px-3 text-xs font-semibold text-amber-700 transition-[color,background-color,translate,scale] hover:bg-amber-500/20 active:scale-[0.97] motion-reduce:transform-none dark:text-amber-400 ${focusRing}`}
                                            >
                                                <HiOutlineWrenchScrewdriver className="h-3.5 w-3.5" aria-hidden="true" />
                                                Set up
                                            </Link>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {removingJobId && (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
                            Removing configuration...
                        </p>
                    )}
                    {showJobModal && <Notice text={notice} />}
                </div>
            </Modal>

            {/* Status banners */}
            {selectedJob && !jobReady && (
                <motion.div {...reveal} className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
                    <div className="flex items-start gap-3">
                        <span className={`${iconTile} h-9 w-9 bg-amber-500/15 text-amber-700 dark:text-amber-400`}>
                            <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold">Interview configuration required</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                This job doesn&apos;t have an interview template yet. Session length, requirements and instructions come from it.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/recruiter/interview/setup/${selectedJob.job_id}`}
                        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-amber-300 bg-card px-4 text-sm font-semibold text-amber-800 transition-[color,background-color,translate,scale] hover:bg-amber-100 active:scale-[0.97] motion-reduce:transform-none sm:w-auto dark:border-amber-500/30 dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-500/10 ${focusRing}`}
                    >
                        <HiOutlineWrenchScrewdriver className="h-4 w-4" aria-hidden="true" />
                        Go to interview setup
                    </Link>
                </motion.div>
            )}

            {selectedJob && jobReady && !pipelineOk && (
                <motion.div {...reveal} className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-500/30 dark:bg-red-500/10">
                    <div className="flex items-start gap-3">
                        <span className={`${iconTile} h-9 w-9 bg-red-500/15 text-red-600 dark:text-red-400`}>
                            <HiOutlineExclamationCircle className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold">Pipeline stage missing</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                This job&apos;s interview pipeline does not include{' '}
                                <code className="rounded-sm bg-red-500/10 px-1.5 py-0.5 text-[11px] text-red-700 dark:text-red-400">real_interview</code>.
                                Add this stage before scheduling live sessions.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/recruiter/jobs/${selectedJob.job_id}/edit`}
                        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-red-300 bg-card px-4 text-sm font-semibold text-red-700 transition-[color,background-color,translate,scale] hover:bg-red-100 active:scale-[0.97] motion-reduce:transform-none sm:w-auto dark:border-red-500/30 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10 ${focusRing}`}
                    >
                        <HiOutlineInformationCircle className="h-4 w-4" aria-hidden="true" />
                        Update pipeline stages
                    </Link>
                </motion.div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); if (canSchedule) runSchedule(); }} className={`${cardPadded} space-y-8`}>
                {/* 1. Job and candidates */}
                <section className="space-y-5">
                    <SectionHeading icon={HiOutlineUser} title="Job and candidates" text="Pick the job, then the candidates to schedule. All are selected by default." />

                    <div className="space-y-2">
                        <FieldLabel htmlFor="schedule-job" icon={HiOutlineBriefcase}>Job</FieldLabel>
                        <div className="relative">
                            <button
                                id="schedule-job"
                                type="button"
                                aria-expanded={jobDropdownOpen}
                                onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
                                className={pickerClass}
                            >
                                <span className={tile}>
                                    <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">
                                        {selectedJob ? selectedJob.job_title : 'Choose a job'}
                                    </span>
                                    {selectedJob?.organization && (
                                        <span className="block truncate text-xs text-muted-foreground">{selectedJob.organization}</span>
                                    )}
                                </span>
                                <Chevron open={jobDropdownOpen} />
                            </button>

                            <AnimatePresence>
                                {jobDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                        transition={fast}
                                        className={`${menuClass} max-h-72`}
                                    >
                                        {jobs.length === 0 ? (
                                            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No jobs available</p>
                                        ) : (
                                            jobs.map((job, i) => {
                                                const ready = job.has_config && Array.isArray(job.interview_pipeline) && job.interview_pipeline.includes('real_interview');
                                                return (
                                                    <motion.button
                                                        key={job.job_id}
                                                        type="button"
                                                        initial={{ opacity: 0, x: -8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ ...fast, delay: Math.min(i, 8) * stagger }}
                                                        onClick={() => chooseJob(job)}
                                                        className={`${optionClass} ${
                                                            selectedJobId === job.job_id
                                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                                                : 'border-transparent'
                                                        }`}
                                                    >
                                                        <span className={tile}>
                                                            <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-sm font-semibold">{job.job_title}</span>
                                                            {job.organization && <span className="block truncate text-xs text-muted-foreground">{job.organization}</span>}
                                                        </span>
                                                        <span className={`${badge} shrink-0 ${
                                                            ready
                                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                        }`}>
                                                            {ready ? 'Ready' : 'Setup'}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {selectedJob && (
                        candidates.length === 0 ? (
                            <p className="rounded-md bg-muted p-4 text-xs text-muted-foreground">No applications for this job yet.</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className={labelClass}>Candidates ({selectedAppIds.length} of {candidates.length})</p>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedAppIds(selectedAppIds.length === candidates.length ? [] : candidates.map(c => c.application_id)); setPreview(null); }}
                                        className={`text-xs font-semibold text-emerald-700 dark:text-emerald-400 ${focusRing}`}
                                    >
                                        {selectedAppIds.length === candidates.length ? 'Clear all' : 'Select all'}
                                    </button>
                                </div>
                                <ul className="divide-y divide-emerald-100 overflow-hidden rounded-md border border-emerald-100 dark:divide-white/10 dark:border-white/10">
                                    {candidates.map(app => {
                                        const picked = selectedAppIds.includes(app.application_id);
                                        return (
                                            <li key={app.application_id}>
                                                <button
                                                    type="button"
                                                    aria-pressed={picked}
                                                    onClick={() => { toggleApp(app.application_id); setPreview(null); }}
                                                    className={`flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-white/5 ${focusRing}`}
                                                >
                                                    <span className={`${tile} ${picked ? '' : 'opacity-50'}`}>
                                                        <HiOutlineUser className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold">{app.user_email}</span>
                                                        <span className="block truncate text-xs text-muted-foreground">{app.job_title}</span>
                                                    </span>
                                                    <span className={`${badge} shrink-0 ${picked ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                                        {picked ? 'Included' : 'Left out'}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )
                    )}
                </section>

                {/* 2. Slot timing */}
                <section className="space-y-5 border-t border-emerald-100 pt-6 dark:border-white/10">
                    <SectionHeading icon={HiOutlineClock} title="Time slots" text="Candidates are assigned back to back, in application order." />
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <FieldLabel htmlFor="schedule-start" icon={HiOutlineCalendar}>First interview starts</FieldLabel>
                            <input
                                id="schedule-start"
                                type="datetime-local"
                                value={startAt}
                                onChange={(e) => { setStartAt(e.target.value); setPreview(null); }}
                                disabled={!jobReady}
                                className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                            />
                        </div>
                        <div className="space-y-2">
                            <FieldLabel htmlFor="schedule-gap" icon={HiOutlineClock}>Gap between starts (minutes)</FieldLabel>
                            <input
                                id="schedule-gap"
                                type="number"
                                min={duration}
                                step={1}
                                value={gapMinutes}
                                onChange={(e) => { setGapMinutes(e.target.value); setPreview(null); }}
                                disabled={!jobReady}
                                className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                            />
                            <p className={`text-xs ${selectedJob && !gapValid && gapMinutes !== '' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                                Each session is {duration} minutes, so the gap must be at least {duration}.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Preview and confirm */}
                <section className="space-y-5 border-t border-emerald-100 pt-6 dark:border-white/10">
                    <SectionHeading icon={HiOutlineEye} title="Preview" text="Check each candidate's slot before anything is saved." />

                    {preview && previewFresh && (
                        <div className="space-y-3">
                            <ul className="divide-y divide-emerald-100 overflow-hidden rounded-md border border-emerald-100 dark:divide-white/10 dark:border-white/10">
                                {preview.slots.map(slot => (
                                    <li key={slot.application_id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="min-w-0 truncate text-sm font-semibold">{slot.candidate_email}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatLocal(slot.scheduled_at)} to {new Date(slot.ends_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                            {preview.conflicts.length > 0 && (
                                <Notice text={`${preview.conflicts.length} candidate(s) clash with another of your interviews. Move the start time or leave them out.`} />
                            )}
                            {preview.skipped.length > 0 && (
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <HiOutlineInformationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    {preview.skipped.length} candidate(s) are already in progress or finished and will be left unchanged.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        <Notice text={notice} />
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={runPreview}
                                disabled={!canPreview || loading}
                                className={`${secondaryButton} w-full sm:w-auto`}
                            >
                                <HiOutlineEye className="h-4 w-4" aria-hidden="true" />
                                Preview slots
                            </button>
                            <button
                                type="submit"
                                disabled={!canSchedule || loading}
                                className={`${primaryButton} w-full sm:w-auto`}
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineCheckCircle className="h-5 w-5" aria-hidden="true" />
                                        {canSchedule ? `Schedule ${preview.slots.length} interview${preview.slots.length === 1 ? '' : 's'}` : 'Preview first'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>
            </form>
        </motion.div>
    );
}
