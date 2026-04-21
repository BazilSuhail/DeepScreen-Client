'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    HiOutlineCalendar, 
    HiOutlineBriefcase, 
    HiOutlineLink, 
    HiOutlineClock, 
    HiOutlineInformationCircle,
    HiOutlineCamera,
    HiOutlineMicrophone,
    HiOutlineDesktopComputer,
    HiOutlineChevronRight,
    HiOutlineCheckCircle, 
    HiOutlineExclamationCircle, 
    HiOutlineTrash, 
    HiOutlineUser,
} from 'react-icons/hi';
import { FaExclamationTriangle, FaPodcast } from 'react-icons/fa';
import { HiBuildingOffice } from 'react-icons/hi2';
import { CgToolbarRight } from 'react-icons/cg';

export default function ScheduleInterview({ applications = [], recruiterJobs = [] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checkingConfig, setCheckingConfig] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [jobs, setJobs] = useState(recruiterJobs);
    const [showJobModal, setShowJobModal] = useState(false);
    const [removingJobId, setRemovingJobId] = useState(null);
    const [configStatus, setConfigStatus] = useState({ exists: false, checked: false, jobId: null });
    const [pipelineStatus, setPipelineStatus] = useState({ passed: false, checked: false });
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
    const [appDropdownOpen, setAppDropdownOpen] = useState(false);
    const [formData, setFormData] = useState({
        job_application: '',
        candidate: '',
        title: 'Technical Interview',
        description: '',
        interviewer_notes: '',
        candidate_instructions: '',
        camera_required: true,
        mic_required: true,
        screen_share_enabled: true,
        scheduled_at: '',
        link_expires_at: '',
    });

    useEffect(() => {
        setJobs(recruiterJobs);
    }, [recruiterJobs]);

    useEffect(() => {
        if (selectedJobId) {
            setFormData(prev => ({ ...prev, job_application: '', candidate: '' }));
            setConfigStatus({ exists: false, checked: false, jobId: null });
            setPipelineStatus({ passed: false, checked: false });
        }
    }, [selectedJobId]);

    const selectedJob = jobs.find(j => j.job_id === selectedJobId);
    const filteredApplications = applications.filter(a => a.job_id === selectedJobId);
    const selectedApp = formData.job_application
        ? applications.find(a => a.application_id === formData.job_application)
        : null;

    const handleRemoveConfig = async (jobId) => {
        try {
            setRemovingJobId(jobId);
            await api.delete(`/interviews/recruiter/config/${jobId}/`);
            setJobs(prev => prev.map(j => 
                j.job_id === jobId ? { ...j, has_config: false, config_id: null } : j
            ));
            if (configStatus.jobId === jobId) {
                setConfigStatus({ exists: false, checked: false, jobId: null });
            }
        } catch (err) {
            console.error('Error removing config:', err);
            alert(err.message || 'Failed to remove configuration');
        } finally {
            setRemovingJobId(null);
        }
    };

    const handleSelectApplication = async (appId) => {
        const app = applications.find(a => a.application_id === appId);
        if (!app) return;

        setFormData(prev => ({ ...prev, job_application: appId, candidate: app.user }));
        setCheckingConfig(true);
        setConfigStatus({ exists: false, checked: false, jobId: app.job_id });
        setPipelineStatus({ passed: false, checked: false });

        try {
            const config = await api.get(`/interviews/recruiter/config/${app.job_id}/`);
            if (config) {
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + (config.default_link_expiry_hours || 24));

                setFormData(prev => ({
                    ...prev,
                    title: config.title || prev.title,
                    description: config.description || prev.description,
                    candidate_instructions: config.candidate_instructions || prev.candidate_instructions,
                    interviewer_notes: config.interviewer_notes || prev.interviewer_notes,
                    camera_required: config.camera_required ?? prev.camera_required,
                    mic_required: config.mic_required ?? prev.mic_required,
                    screen_share_enabled: config.screen_share_enabled ?? prev.screen_share_enabled,
                    scheduled_at: config.default_scheduled_at ? config.default_scheduled_at.slice(0, 16) : prev.scheduled_at,
                    link_expires_at: expiryDate.toISOString().slice(0, 16)
                }));
                setConfigStatus({ exists: true, checked: true, jobId: app.job_id });
            }

            const job = jobs.find(j => j.job_id === app.job_id);
            if (job && job.interview_pipeline) {
                const pipeline = Array.isArray(job.interview_pipeline)
                    ? job.interview_pipeline : [];
                setPipelineStatus({
                    passed: pipeline.includes('real_interview'),
                    checked: true,
                });
            } else {
                setPipelineStatus({ passed: false, checked: true });
            }
        } catch (error) {
            setConfigStatus({ exists: false, checked: true, jobId: app.job_id });
            setPipelineStatus({ passed: false, checked: true });
        } finally {
            setCheckingConfig(false);
            setAppDropdownOpen(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!configStatus.exists) return;
        if (pipelineStatus.checked && !pipelineStatus.passed) return;
        try {
            setLoading(true);
            const response = await api.post('/interviews/recruiter/', formData);
            setSuccessData(response);
        } catch (error) {
            console.error('Error scheduling interview:', error);
            alert(error.message || 'Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    if (successData) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto p-8 rounded-2xl border border-border bg-card text-center"
            >
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiOutlineLink className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Interview Scheduled!</h2>
                <p className="text-muted-foreground mb-8">
                    The interview has been successfully scheduled. You can share the secure link with the candidate.
                </p>

                <div className="bg-secondary/50 p-4 rounded-2xl flex items-center gap-3 mb-8 text-left border border-border">
                    <div className="flex-1 truncate font-mono text-sm">
                        {successData.interview_link}
                    </div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(successData.interview_link);
                            alert('Link copied!');
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                    >
                        Copy Link
                    </button>
                </div>

                <button
                    onClick={() => router.push('/recruiter/interview')}
                    className="w-full py-4 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-2xl transition-all"
                >
                    Back to Interviews
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <div className="rounded-2xl border border-border bg-card p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">Schedule Live Interview</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Complete the session details and requirements for the candidate.</p>
                </div>

                {/* Job Config Manager Modal Trigger */}
                <div className="mb-8 p-4 rounded-2xl border border-border bg-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <HiBuildingOffice className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-sm font-bold">Interview Templates</p>
                            <p className="text-xs text-muted-foreground">
                                {jobs.filter(j => j.has_config).length} of {jobs.length} jobs configured
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowJobModal(true)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                    >
                        <CgToolbarRight className="w-4 h-4" />
                        Manage Configs
                    </button>
                </div>

                {/* Job Config Modal */}
                <AnimatePresence>
                    {showJobModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowJobModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                onClick={e => e.stopPropagation()}
                                className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold">Job Interview Configurations</h3>
                                    <button
                                        onClick={() => setShowJobModal(false)}
                                        className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-xs font-bold transition-all"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {jobs.length === 0 ? (
                                        <div className="text-center py-8 text-sm text-muted-foreground">No jobs found</div>
                                    ) : (
                                        jobs.map(job => (
                                            <div
                                                key={job.job_id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border hover:border-emerald-500/20 transition-all"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold truncate">{job.job_title}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{job.organization}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                                    {job.has_config ? (
                                                        <>
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                                                <HiOutlineCheckCircle className="w-3 h-3" />
                                                                Configured
                                                            </span>
                                                            <button
                                                                onClick={() => handleRemoveConfig(job.job_id)}
                                                                disabled={removingJobId === job.job_id}
                                                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all disabled:opacity-40"
                                                                title="Remove configuration"
                                                            >
                                                                <HiOutlineTrash className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <Link
                                                            href={`/recruiter/interview/setup/${job.job_id}`}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-[10px] uppercase tracking-widest transition-all"
                                                        >
                                                            <FaExclamationTriangle className="w-3 h-3" />
                                                            Setup
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {removingJobId && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500" />
                                        Removing configuration...
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Config Required Banner */}
                {configStatus.checked && !configStatus.exists && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <FaExclamationTriangle className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm">Interview Configuration Required</h3>
                                <p className="text-xs text-muted-foreground">
                                    This job doesn't have an interview template yet. You must set up the 
                                    interview configuration before you can schedule sessions. 
                                    This ensures all session defaults (duration, requirements, instructions) are pre-filled correctly.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/recruiter/interview/setup/${configStatus.jobId}`}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs uppercase tracking-widest transition-all border border-amber-500/20"
                        >
                            <FaPodcast className="w-4 h-4" />
                            Go to Interview Setup
                        </Link>
                    </motion.div>
                )}

                {/* Config Exists Notice */}
                {configStatus.checked && configStatus.exists && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3"
                    >
                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-xs font-medium text-emerald-500">
                            Interview template loaded. Defaults have been pre-filled from your configuration.
                        </p>
                    </motion.div>
                )}

                {/* Pipeline Warning Banner */}
                {pipelineStatus.checked && !pipelineStatus.passed && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-5 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm">Pipeline Stage Missing</h3>
                                <p className="text-xs text-muted-foreground">
                                    This job's interview pipeline does not include <code className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded text-[10px]">real_interview</code>.
                                    You must add this stage to the pipeline before scheduling live sessions.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/recruiter/jobs/${configStatus.jobId}/edit`}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs uppercase tracking-widest transition-all border border-red-500/20"
                        >
                            <HiOutlineInformationCircle className="w-4 h-4" />
                            Update Pipeline Stages
                        </Link>
                    </motion.div>
                )}

                {/* Checking Config Spinner */}
                {checkingConfig && (
                    <div className="mb-8 p-4 rounded-2xl bg-secondary/30 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 shrink-0" />
                        <p className="text-xs text-muted-foreground">Checking interview configuration...</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1: Candidate & Title */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-xs tracking-widest">
                            <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                            Basic Information
                        </div>

                        {/* Custom Job Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                <HiOutlineBriefcase className="text-emerald-500" />
                                Select Job
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
                                    className="w-full px-5 py-4 pr-12 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all flex items-center gap-3 text-left"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                        <HiOutlineBriefcase className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold truncate">
                                            {selectedJob ? selectedJob.job_title : 'Choose a job for this session'}
                                        </p>
                                        {selectedJob && (
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">{selectedJob.organization}</p>
                                        )}
                                    </div>
                                    <motion.div
                                        animate={{ rotate: jobDropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="shrink-0"
                                    >
                                        <svg className="w-4 h-4 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {jobDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute z-40 mt-2 w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
                                        >
                                            {jobs.length === 0 ? (
                                                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No jobs available</div>
                                            ) : (
                                                jobs.map((job, i) => {
                                                    const pipelineHasInterview = job.interview_pipeline &&
                                                        Array.isArray(job.interview_pipeline) &&
                                                        job.interview_pipeline.includes('real_interview');
                                                    return (
                                                        <motion.button
                                                            key={job.job_id}
                                                            type="button"
                                                            initial={{ opacity: 0, x: -8 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.03 }}
                                                            onClick={() => {
                                                                setSelectedJobId(job.job_id);
                                                                setJobDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-5 py-4 flex items-center gap-3 text-left transition-all hover:bg-secondary/30 ${
                                                                selectedJobId === job.job_id
                                                                    ? 'bg-emerald-500/5 border-l-2 border-emerald-500'
                                                                    : 'border-l-2 border-transparent'
                                                            }`}
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                                <HiOutlineBriefcase className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-bold truncate">{job.job_title}</p>
                                                                <p className="text-xs text-muted-foreground truncate mt-0.5">{job.organization}</p>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                                                pipelineHasInterview
                                                                    ? 'text-emerald-500 bg-emerald-500/10'
                                                                    : 'text-amber-500 bg-amber-500/10'
                                                            }`}>
                                                                {pipelineHasInterview ? 'Ready' : 'Pipeline'}
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

                        {/* Candidate Application Selector (shown after job is selected) */}
                        {selectedJobId && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                    <HiOutlineUser className="text-emerald-500" />
                                    Candidate Application
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (filteredApplications.length > 0) setAppDropdownOpen(!appDropdownOpen);
                                        }}
                                        disabled={filteredApplications.length === 0}
                                        className="w-full px-5 py-4 pr-12 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all flex items-center gap-3 text-left disabled:opacity-40"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                            <HiOutlineUser className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold truncate">
                                                {selectedApp ? selectedApp.user_email : (filteredApplications.length > 0 ? 'Select a candidate' : 'No candidates for this job')}
                                            </p>
                                            {selectedApp && (
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">{selectedApp.job_title}</p>
                                            )}
                                        </div>
                                        {filteredApplications.length > 0 && (
                                            <motion.div
                                                animate={{ rotate: appDropdownOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="shrink-0"
                                            >
                                                <svg className="w-4 h-4 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {appDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute z-40 mt-2 w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                                            >
                                                {filteredApplications.map((app, i) => (
                                                    <motion.button
                                                        key={app.application_id}
                                                        type="button"
                                                        initial={{ opacity: 0, x: -8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.03 }}
                                                        onClick={() => handleSelectApplication(app.application_id)}
                                                        className={`w-full px-5 py-4 flex items-center gap-3 text-left transition-all hover:bg-secondary/30 ${
                                                            formData.job_application === app.application_id
                                                                ? 'bg-emerald-500/5 border-l-2 border-emerald-500'
                                                                : 'border-l-2 border-transparent'
                                                        }`}
                                                    >
                                                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                            <HiOutlineUser className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold truncate">{app.user_email}</p>
                                                            <p className="text-xs text-muted-foreground truncate mt-0.5">{app.job_title}</p>
                                                        </div>
                                                        <HiOutlineChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Config Description (read-only) */}
                        {configStatus.checked && configStatus.exists && formData.description && (
                            <div className="p-4 rounded-2xl bg-secondary/10 border border-border/50">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Template Description</p>
                                <p className="text-xs text-muted-foreground/80 leading-relaxed">{formData.description}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                <HiOutlineInformationCircle className="text-emerald-500" />
                                Session Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                disabled={configStatus.checked && !configStatus.exists}
                                placeholder="e.g. Technical Round 1"
                                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Section 2: Timing & Expiry */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-xs tracking-widest">
                            <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                            Timeline & Access
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                    <HiOutlineCalendar className="text-emerald-500" />
                                    Scheduled Start
                                </label>
                                <input
                                    type="datetime-local"
                                    name="scheduled_at"
                                    value={formData.scheduled_at}
                                    onChange={handleChange}
                                    required
                                    disabled={configStatus.checked && !configStatus.exists}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                    <HiOutlineClock className="text-amber-500" />
                                    Link Expiration
                                </label>
                                <input
                                    type="datetime-local"
                                    name="link_expires_at"
                                    value={formData.link_expires_at}
                                    onChange={handleChange}
                                    required
                                    disabled={configStatus.checked && !configStatus.exists}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Requirements */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-xs tracking-widest">
                            <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                            Hardware Requirements
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { name: 'camera_required', label: 'Camera', icon: HiOutlineCamera },
                                { name: 'mic_required', label: 'Microphone', icon: HiOutlineMicrophone },
                                { name: 'screen_share_enabled', label: 'Screen Share', icon: HiOutlineDesktopComputer },
                            ].map(({ name, label, icon: Icon }) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                        if (configStatus.checked && !configStatus.exists) return;
                                        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
                                    }}
                                    disabled={configStatus.checked && !configStatus.exists}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                                        configStatus.checked && !configStatus.exists
                                            ? 'opacity-40 cursor-not-allowed'
                                            : 'cursor-pointer hover:border-emerald-500/40'
                                    } ${
                                        formData[name]
                                            ? 'border-emerald-500/50 bg-emerald-500/10'
                                            : 'border-border bg-secondary/20'
                                    }`}
                                >
                                    <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                                        formData[name] ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                                    }`}>
                                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                            formData[name] ? 'translate-x-[18px]' : 'translate-x-0.5'
                                        }`} />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
                                        <Icon className={`w-5 h-5 ${formData[name] ? 'text-emerald-500' : 'text-muted-foreground/60'}`} />
                                        <span className={formData[name] ? 'text-foreground' : 'text-muted-foreground/60'}>{label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Notes & Instructions */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-xs tracking-widest">
                            <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                            Instructions & Notes
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Candidate Instructions</label>
                                <textarea
                                    name="candidate_instructions"
                                    value={formData.candidate_instructions}
                                    onChange={handleChange}
                                    disabled={configStatus.checked && !configStatus.exists}
                                    placeholder="What should the candidate know?"
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Interviewer Notes (Private)</label>
                                <textarea
                                    name="interviewer_notes"
                                    value={formData.interviewer_notes}
                                    onChange={handleChange}
                                    disabled={configStatus.checked && !configStatus.exists}
                                    placeholder="Private notes for the recruiter..."
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading || (configStatus.checked && !configStatus.exists) || (pipelineStatus.checked && !pipelineStatus.passed)}
                            className="w-full py-5 bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : configStatus.checked && !configStatus.exists ? (
                                <>
                                    <FaExclamationTriangle className="w-5 h-5" />
                                    Setup Required
                                </>
                            ) : pipelineStatus.checked && !pipelineStatus.passed ? (
                                <>
                                    <HiOutlineExclamationCircle className="w-5 h-5" />
                                    Pipeline Not Ready
                                </>
                            ) : (
                                <>
                                    Confirm & Create Session
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
