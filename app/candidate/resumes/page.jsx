'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlineDocumentDuplicate, 
    HiOutlinePlus, 
    HiOutlineTrash, 
    HiOutlineCheckCircle,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlineMapPin,
    HiOutlineXMark
} from 'react-icons/hi2';

export default function CandidateResumesPage() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        candidate_name: '',
        candidate_email: '',
        candidate_phone: '',
        years_experience: '',
        current_location: '',
        education_level: '',
        summary_text: '',
        skills_text: '',
        projects_text: '',
        experience_text: '',
        raw_full_text: ''
    });

    const fetchResumes = async () => {
        try {
            const data = await api.get('/resumes/me/');
            setResumes(data);
        } catch (err) {
            setError('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleCreateResume = async (e) => {
        e.preventDefault();
        try {
            await api.post('/resumes/me/', formData);
            setIsCreateModalOpen(false);
            fetchResumes();
            // Reset form
            setFormData({
                candidate_name: '',
                candidate_email: '',
                candidate_phone: '',
                years_experience: '',
                current_location: '',
                education_level: '',
                summary_text: '',
                skills_text: '',
                projects_text: '',
                experience_text: '',
                raw_full_text: ''
            });
        } catch (err) {
            setError('Failed to create resume');
        }
    };

    const handleDeleteResume = async (id) => {
        if (!confirm('Are you sure you want to delete this resume?')) return;
        try {
            await api.delete(`/resumes/${id}/`);
            setResumes(resumes.filter(r => r.resume_id !== id));
        } catch (err) {
            alert('Failed to delete resume');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">My Resumes</h1>
                    <p className="text-muted-foreground mt-1">Manage your professional profiles and AI-ready resumes</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Create Resume
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {resumes.map((resume) => (
                        <motion.div
                            key={resume.resume_id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass p-6 rounded-[2rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                        <HiOutlineDocumentDuplicate className="w-6 h-6" />
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteResume(resume.resume_id)}
                                        className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">
                                    {resume.candidate_name || 'Untitled Resume'}
                                </h3>
                                
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <HiOutlineBriefcase className="w-4 h-4" />
                                        {resume.years_experience} Years Experience
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <HiOutlineMapPin className="w-4 h-4" />
                                        {resume.current_location || 'Location not specified'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <HiOutlineCalendar className="w-4 h-4" />
                                        Uploaded on {new Date(resume.upload_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-emerald-500/5">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                                    resume.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'
                                }`}>
                                    {resume.status}
                                </span>
                                <button className="text-emerald-500 font-bold text-sm hover:underline">
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {resumes.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                        <HiOutlineDocumentDuplicate className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Resumes Found</h3>
                        <p className="text-muted-foreground mt-2 mb-8">Create your first resume to start applying for jobs.</p>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card border border-emerald-500/10 rounded-[3rem] shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-emerald-500/5 flex justify-between items-center bg-emerald-500/5">
                                <h2 className="text-2xl font-black">Create New Resume</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                                    <HiOutlineXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateResume} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Full Name</label>
                                        <input 
                                            required
                                            value={formData.candidate_name}
                                            onChange={(e) => setFormData({...formData, candidate_name: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Email Address</label>
                                        <input 
                                            required
                                            type="email"
                                            value={formData.candidate_email}
                                            onChange={(e) => setFormData({...formData, candidate_email: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Phone Number</label>
                                        <input 
                                            value={formData.candidate_phone}
                                            onChange={(e) => setFormData({...formData, candidate_phone: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Years of Experience</label>
                                        <input 
                                            type="number"
                                            value={formData.years_experience}
                                            onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Current Location</label>
                                        <input 
                                            value={formData.current_location}
                                            onChange={(e) => setFormData({...formData, current_location: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                            placeholder="New York, NY"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Education Level</label>
                                        <input 
                                            value={formData.education_level}
                                            onChange={(e) => setFormData({...formData, education_level: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Master's in CS"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Summary</label>
                                        <textarea 
                                            rows="3"
                                            value={formData.summary_text}
                                            onChange={(e) => setFormData({...formData, summary_text: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                                            placeholder="Experienced software engineer with a focus on..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Skills (Comma separated)</label>
                                        <textarea 
                                            rows="2"
                                            value={formData.skills_text}
                                            onChange={(e) => setFormData({...formData, skills_text: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                                            placeholder="Python, React, AWS, Docker..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Experience Details</label>
                                        <textarea 
                                            rows="4"
                                            value={formData.experience_text}
                                            onChange={(e) => setFormData({...formData, experience_text: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                                            placeholder="Senior Engineer at Google (2018-2023)..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Projects</label>
                                        <textarea 
                                            rows="3"
                                            value={formData.projects_text}
                                            onChange={(e) => setFormData({...formData, projects_text: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                                            placeholder="Open source contribution to Kubernetes..."
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="p-8 border-t border-emerald-500/5 bg-emerald-500/5 flex justify-end gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-8 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 font-bold transition-all border border-border"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreateResume}
                                    className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    Create Resume
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
