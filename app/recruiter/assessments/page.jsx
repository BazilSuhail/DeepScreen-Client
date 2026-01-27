'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlinePlus,
    HiOutlineBeaker,
    HiOutlineXMark,
    HiOutlinePlusCircle,
    HiOutlineChevronDown,
    HiOutlineSparkles,
    HiOutlineDocumentText,
} from 'react-icons/hi2';
import { AssessmentSetupCard } from '@/components/assessments/AssessmentCard';

export default function RecruiterAssessmentsPage() {
    const [assessments, setAssessments] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [assignJobId, setAssignJobId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        duration_minutes: 90,
        passing_score: 70,
        organization: '',
        job: '',
        problems: [],
    });

    const [newProblem, setNewProblem] = useState({
        title: '',
        problem_statement: '',
        difficulty: 'medium',
        points: 100,
        order_number: 1,
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        allowed_languages: ['python', 'javascript'],
        public_test_cases: [],
        hidden_test_cases: [],
    });

    const fetchData = async () => {
        try {
            const [assessData, jobsData, orgsData] = await Promise.all([
                api.get('/assessments/'),
                api.get('/applications/my-jobs/'),
                api.get('/organizations/'),
            ]);
            setAssessments(assessData);
            setMyJobs(jobsData);
            setOrganizations(orgsData);
            if (orgsData.length > 0) {
                setForm(f => ({ ...f, organization: orgsData[0].org_id }));
            }
        } catch (err) {
            setError('Failed to load data');
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
            await api.post('/assessments/', {
                title: form.title,
                description: form.description,
                duration_minutes: Number(form.duration_minutes),
                passing_score: Number(form.passing_score),
                organization: form.organization,
                job: form.job || null,
            });
            setIsCreateOpen(false);
            setForm(f => ({ ...f, title: '', description: '', job: '' }));
            await fetchData();
            setSuccessMsg('Assessment created!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to create assessment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssign = async () => {
        if (!assignJobId || !selectedAssessment) return;
        setAssigning(true);
        setError('');
        try {
            const result = await api.post(`/assessments/assign/${assignJobId}/`, {
                assessment_id: selectedAssessment.assessment_id,
            });
            setIsAssignOpen(false);
            setSuccessMsg(result.message || 'Assessment assigned!');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setError(err.message || 'Failed to assign assessment');
        } finally {
            setAssigning(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this assessment?')) return;
        try {
            await api.delete(`/assessments/${id}/`);
            setAssessments(prev => prev.filter(a => a.assessment_id !== id));
        } catch {
            alert('Failed to delete');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Coding Assessments</h1>
                    <p className="text-muted-foreground mt-1">Build and assign coding tests to shortlisted candidates</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                >
                    <HiOutlinePlus className="w-5 h-5" /> New Assessment
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">{error}</div>
            )}
            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-medium">
                    ✅ {successMsg}
                </motion.div>
            )}

            <div className="space-y-4">
                {assessments.map((a, i) => (
                    <AssessmentSetupCard
                        key={a.assessment_id}
                        assessment={a}
                        index={i}
                        onDelete={handleDelete}
                        onAssign={(assessment) => {
                            setSelectedAssessment(assessment);
                            setAssignJobId(myJobs[0]?.job_id || '');
                            setIsAssignOpen(true);
                        }}
                    />
                ))}
                {assessments.length === 0 && (
                    <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                        <HiOutlineBeaker className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Assessments Yet</h3>
                        <p className="text-muted-foreground mt-2">Create your first coding assessment to evaluate shortlisted candidates.</p>
                    </div>
                )}
            </div>

            {/* ── Create Assessment Modal ──────────────────────────────────── */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsCreateOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-emerald-500/10 rounded-[3rem] shadow-2xl scrollbar-hide">

                            <div className="p-8 border-b border-emerald-500/5 flex justify-between items-center bg-emerald-500/5">
                                <h2 className="text-2xl font-black">New Assessment</h2>
                                <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                                    <HiOutlineXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateAssessment} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Title</label>
                                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. Backend Engineer Assessment"
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Description</label>
                                    <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Instructions for candidates..."
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Duration (min)</label>
                                        <input type="number" min="15" max="360" value={form.duration_minutes}
                                            onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Passing Score (%)</label>
                                        <input type="number" min="1" max="100" value={form.passing_score}
                                            onChange={e => setForm({ ...form, passing_score: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Link to Job (optional)</label>
                                    <select value={form.job} onChange={e => setForm({ ...form, job: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none">
                                        <option value="">— Not linked to a specific job —</option>
                                        {myJobs.map(j => (
                                            <option key={j.job_id} value={j.job_id}>{j.job_title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsCreateOpen(false)}
                                        className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 font-bold border border-border transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all">
                                        {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : 'Create Assessment'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Assign Assessment Modal ────────────────────────────────────── */}
            <AnimatePresence>
                {isAssignOpen && selectedAssessment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsAssignOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-card border border-emerald-500/10 rounded-[3rem] shadow-2xl">

                            <div className="p-8 border-b border-emerald-500/5 bg-emerald-500/5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black">Assign to Shortlisted Candidates</h2>
                                    <button onClick={() => setIsAssignOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                                        <HiOutlineXMark className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Assessment: <strong>{selectedAssessment.title}</strong>
                                </p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Select Job</label>
                                    <select value={assignJobId} onChange={e => setAssignJobId(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none">
                                        {myJobs.map(j => (
                                            <option key={j.job_id} value={j.job_id}>
                                                {j.job_title} ({j.shortlisted_count} shortlisted)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                                    <p className="text-sm text-yellow-500 font-medium">
                                        <strong>Note:</strong> This will only send to candidates currently in the <strong>shortlisted</strong> stage for the selected job.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsAssignOpen(false)}
                                        className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 font-bold border border-border transition-all">
                                        Cancel
                                    </button>
                                    <button onClick={handleAssign} disabled={assigning || !assignJobId}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all">
                                        {assigning ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><HiOutlineSparkles className="w-4 h-4" /> Send Assessment</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
