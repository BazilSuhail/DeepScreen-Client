'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { 
    HiOutlineCalendar, 
    HiOutlineUser, 
    HiOutlineBriefcase, 
    HiOutlineLink, 
    HiOutlineClock, 
    HiOutlineInformationCircle,
    HiOutlineCamera,
    HiOutlineMicrophone,
    HiOutlineDesktopComputer,
    HiOutlineChevronRight
} from 'react-icons/hi';

export default function ScheduleInterview({ applications = [] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [formData, setFormData] = useState({
        job_application: '',
        candidate: '',
        title: 'Technical Interview',
        interviewer_notes: '',
        candidate_instructions: '',
        camera_required: true,
        mic_required: true,
        screen_share_enabled: true,
        scheduled_at: '',
        link_expires_at: '',
    });

    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        
        // Auto-fill candidate and fetch config defaults from application if selected
        if (name === 'job_application' && value) {
            const app = applications.find(a => a.application_id === value);
            if (app) {
                setFormData(prev => ({ ...prev, candidate: app.user }));
                
                try {
                    // Assuming we have the job_id in the application object
                    const config = await api.get(`/interviews/recruiter/config/${app.job_id}/`);
                    if (config) {
                        // Calculate default link expiry based on now + config.default_link_expiry_hours
                        const expiryDate = new Date();
                        expiryDate.setHours(expiryDate.getHours() + (config.default_link_expiry_hours || 24));
                        
                        setFormData(prev => ({
                            ...prev,
                            title: config.title || prev.title,
                            candidate_instructions: config.candidate_instructions || prev.candidate_instructions,
                            interviewer_notes: config.interviewer_notes || prev.interviewer_notes,
                            camera_required: config.camera_required ?? prev.camera_required,
                            mic_required: config.mic_required ?? prev.mic_required,
                            screen_share_enabled: config.screen_share_enabled ?? prev.screen_share_enabled,
                            scheduled_at: config.default_scheduled_at ? config.default_scheduled_at.slice(0, 16) : prev.scheduled_at,
                            link_expires_at: expiryDate.toISOString().slice(0, 16) // Format for datetime-local
                        }));
                    }
                } catch (error) {
                    console.log('No specific config defaults found, using global defaults');
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                className="max-w-2xl mx-auto p-8 glass rounded-3xl border border-emerald-500/20 text-center"
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
            className="max-w-3xl mx-auto"
        >
            <div className="glass p-8 rounded-3xl border border-emerald-500/20 shadow-2xl">
                <div className="mb-10">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        Schedule Live Interview
                    </h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Complete the session details and requirements for the candidate.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1: Candidate & Title */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest">
                            <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                            Basic Information
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                    <HiOutlineBriefcase className="text-emerald-500" />
                                    Job Application
                                </label>
                                <select
                                    name="job_application"
                                    value={formData.job_application}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select an application</option>
                                    {applications.map(app => (
                                        <option key={app.application_id} value={app.application_id}>
                                            {app.user_email} - {app.job_title}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                                    placeholder="e.g. Technical Round 1"
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Timing & Expiry */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest">
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
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all"
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
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Requirements */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest">
                            <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                            Hardware Requirements
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl border border-border cursor-pointer hover:bg-secondary/40 transition-all">
                                <input
                                    type="checkbox"
                                    name="camera_required"
                                    checked={formData.camera_required}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-emerald-500"
                                />
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter">
                                    <HiOutlineCamera className="w-5 h-5 text-emerald-500" />
                                    Camera
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl border border-border cursor-pointer hover:bg-secondary/40 transition-all">
                                <input
                                    type="checkbox"
                                    name="mic_required"
                                    checked={formData.mic_required}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-emerald-500"
                                />
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter">
                                    <HiOutlineMicrophone className="w-5 h-5 text-emerald-500" />
                                    Microphone
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl border border-border cursor-pointer hover:bg-secondary/40 transition-all">
                                <input
                                    type="checkbox"
                                    name="screen_share_enabled"
                                    checked={formData.screen_share_enabled}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-emerald-500"
                                />
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter">
                                    <HiOutlineDesktopComputer className="w-5 h-5 text-emerald-500" />
                                    Screen
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Section 4: Notes & Instructions */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest">
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
                                    placeholder="What should the candidate know?"
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Interviewer Notes (Private)</label>
                                <textarea
                                    name="interviewer_notes"
                                    value={formData.interviewer_notes}
                                    onChange={handleChange}
                                    placeholder="Private notes for the recruiter..."
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
