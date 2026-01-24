'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlinePlus, 
    HiOutlineCommandLine, 
    HiOutlineClock, 
    HiOutlineTrash,
    HiOutlinePencilSquare,
    HiOutlineChartBar,
    HiOutlineXMark,
    HiOutlineBriefcase,
    HiOutlinePlusCircle
} from 'react-icons/hi2';

export default function RecruiterAssessmentsPage() {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [jobs, setJobs] = useState([]);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration_minutes: 90,
        passing_score: 70,
        job: '',
        organization: '' // Will be set on submit
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assessData, jobsData] = await Promise.all([
                    api.get('/assessments/'),
                    api.get('/jobs/')
                ]);
                setAssessments(assessData);
                setJobs(jobsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Pick org from first job for now
            const orgId = jobs.find(j => j.job_id === formData.job)?.organization;
            await api.post('/assessments/', { ...formData, organization: orgId });
            setIsCreateModalOpen(false);
            // Refresh
            const data = await api.get('/assessments/');
            setAssessments(data);
        } catch (err) {
            alert('Failed to create assessment');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Assessment Bank</h1>
                    <p className="text-muted-foreground mt-1">Design and manage technical challenges for your jobs</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    New Assessment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.map((item, i) => (
                    <motion.div
                        key={item.assessment_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass p-6 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <HiOutlineCommandLine className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                                        <HiOutlinePencilSquare className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{item.description}</p>
                            
                            <div className="space-y-2 mb-8">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <HiOutlineClock className="w-4 h-4" />
                                    {item.duration_minutes} Minutes
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <HiOutlineChartBar className="w-4 h-4" />
                                    {item.problems_count} Problems
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <HiOutlineBriefcase className="w-4 h-4" />
                                    Linked Job: {jobs.find(j => j.job_id === item.job)?.job_title || 'Template'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-emerald-500/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full">
                                Active
                            </span>
                            <button className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                Manage Problems <HiOutlinePlusCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-card border border-emerald-500/10 rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-emerald-500/5 flex justify-between items-center bg-emerald-500/5">
                                <h2 className="text-2xl font-black">Create Assessment</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                                    <HiOutlineXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Assessment Title</label>
                                    <input 
                                        required value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. Senior Frontend Assessment"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Duration (Min)</label>
                                        <input 
                                            type="number" required value={formData.duration_minutes}
                                            onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Passing Score (%)</label>
                                        <input 
                                            type="number" required value={formData.passing_score}
                                            onChange={(e) => setFormData({...formData, passing_score: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Link to Job</label>
                                    <select 
                                        required value={formData.job}
                                        onChange={(e) => setFormData({...formData, job: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select a Job</option>
                                        {jobs.map(job => (
                                            <option key={job.job_id} value={job.job_id}>{job.job_title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button" onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl bg-secondary font-bold border border-border"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20"
                                    >
                                        Create
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
