'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlinePlus,
    HiOutlineBeaker,
    HiOutlineXMark,
    HiOutlineChevronDown,
    HiOutlineSparkles,
    HiOutlineDocumentText,
    HiOutlineMagnifyingGlass,
    HiOutlineClock,
    HiOutlineChartBar
} from 'react-icons/hi2';
import { AssessmentSetupCard } from '@/components/assessments/AssessmentCard';

export default function RecruiterAssessmentsPage() {
    const router = useRouter();
    const [assessments, setAssessments] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        duration_minutes: 90,
        passing_score: 70,
        job: '',
    });

    const fetchData = async () => {
        try {
            const [assessData, jobsData] = await Promise.all([
                api.get('/assessments/'),
                api.get('/jobs/recruiter/'), // Fetch only recruiter's jobs
            ]);
            setAssessments(assessData);
            setMyJobs(jobsData || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to synchronize assessment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateAssessment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (!form.job) {
                throw new Error("You must select a job to create an assessment.");
            }

            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                duration_minutes: Number(form.duration_minutes),
                passing_score: Number(form.passing_score),
                job: form.job
            };

            const newAssessment = await api.post('/assessments/', payload);
            setIsCreateOpen(false);
            setForm({ title: '', description: '', job: '', duration_minutes: 90, passing_score: 70 });
            
            router.push(`/recruiter/assessments/${newAssessment.assessment_id}`);
        } catch (err) {
            setError(err.message || 'Failed to initialize assessment workspace');
        } finally {
            setSubmitting(false);
        }
    };

    const handleArchive = async (id) => {
        if (!confirm('Archive this assessment? Active candidates will still be able to complete it.')) return;
        try {
            await api.patch(`/assessments/${id}/`, { is_active: false });
            setAssessments(prev => prev.map(a => a.assessment_id === id ? { ...a, is_active: false } : a));
            setSuccessMsg('Assessment moved to archives.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setError('Archive operation failed');
        }
    };

    const filteredAssessments = assessments.filter(a => 
        a.title.toLowerCase().includes(search.toLowerCase()) || 
        a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.job_title?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500" />
                <HiOutlineBeaker className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-12 space-y-12 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gradient leading-none">Assessments</h1>
                    <p className="text-muted-foreground font-medium pl-1">Build, manage, and assign technical evaluations</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search assessments..."
                            className="pl-12 pr-6 py-3.5 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all w-full md:w-64 font-medium" />
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-emerald-600/20 active:scale-95"
                    >
                        <HiOutlinePlus className="w-5 h-5" /> Create New
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-3">
                    <HiOutlineXMark className="w-6 h-6" /> {error}
                </div>
            )}
            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center gap-3">
                    <HiOutlineSparkles className="w-6 h-6" /> {successMsg}
                </motion.div>
            )}

            {/* List Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {filteredAssessments.map((a, i) => (
                    <AssessmentSetupCard
                        key={a.assessment_id}
                        assessment={a}
                        index={i}
                        onEdit={(assessment) => router.push(`/recruiter/assessments/${assessment.assessment_id}`)}
                        onDelete={handleArchive}
                    />
                ))}
                {filteredAssessments.length === 0 && (
                    <div className="col-span-full py-32 text-center glass rounded-[4rem] border-dashed border-2 border-border/50">
                        <HiOutlineBeaker className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-10" />
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter opacity-20">No Results Found</h3>
                        <p className="text-muted-foreground font-medium mt-2">Create a new assessment to begin evaluating candidates</p>
                    </div>
                )}
            </div>

            {/* Create Assessment Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsCreateOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            className="relative w-full max-w-2xl bg-card border border-border rounded-[4rem] shadow-2xl overflow-hidden">

                            <div className="p-10 border-b border-border flex justify-between items-center bg-emerald-500/5">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Initialize Workspace</h2>
                                    <p className="text-muted-foreground text-sm font-medium">Define the core parameters for your new assessment</p>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="p-3 hover:bg-secondary rounded-2xl transition-all">
                                    <HiOutlineXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateAssessment} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Assessment Title</label>
                                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. Senior Frontend Engineer Test"
                                        className="w-full px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold text-lg" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Candidate Instructions</label>
                                    <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Outline the expectations for the candidate..."
                                        className="w-full px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all resize-none font-medium" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Duration (min)</label>
                                        <input type="number" min="15" max="360" value={form.duration_minutes}
                                            onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
                                            className="w-full px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Pass Threshold (%)</label>
                                        <input type="number" min="1" max="100" value={form.passing_score}
                                            onChange={e => setForm({ ...form, passing_score: e.target.value })}
                                            className="w-full px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3">Link to Job Opening (Required)</label>
                                    <select 
                                        required
                                        value={form.job} 
                                        onChange={e => setForm({ ...form, job: e.target.value })}
                                        className="w-full px-8 py-5 rounded-[2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select a Job</option>
                                        {myJobs.map(job => (
                                            <option key={job.job_id} value={job.job_id}>{job.job_title}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground px-3">Each assessment is uniquely tied to a specific job.</p>
                                </div>

                                <div className="flex justify-end gap-4 pt-6">
                                    <button type="button" onClick={() => setIsCreateOpen(false)}
                                        className="px-10 py-5 rounded-[2rem] bg-secondary hover:bg-secondary/80 font-black text-xs uppercase tracking-widest transition-all">
                                        Discard
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="px-10 py-5 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                                        {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Enter Workspace'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
