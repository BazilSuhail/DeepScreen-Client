'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { HiOutlineCalendar, HiOutlineUser, HiOutlineBriefcase, HiOutlineLink } from 'react-icons/hi';

export default function ScheduleInterview({ applications = [] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [formData, setFormData] = useState({
        job_application: '',
        candidate: '',
        scheduled_at: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Auto-fill candidate from application if selected
        if (name === 'job_application') {
            const app = applications.find(a => a.application_id === value);
            if (app) {
                setFormData(prev => ({ ...prev, candidate: app.user }));
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
            className="max-w-2xl mx-auto"
        >
            <div className="glass p-8 rounded-3xl border border-emerald-500/20 shadow-2xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        Schedule Live Interview
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Set up a secure LiveKit-powered interview session for a candidate.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Application Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1 flex items-center gap-2">
                            <HiOutlineBriefcase className="text-emerald-500" />
                            Select Job Application
                        </label>
                        <select
                            name="job_application"
                            value={formData.job_application}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                        >
                            <option value="">Select an application</option>
                            {applications.map(app => (
                                <option key={app.application_id} value={app.application_id}>
                                    {app.user_email} - {app.job_title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Candidate (Read-only or Auto-filled) */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1 flex items-center gap-2">
                            <HiOutlineUser className="text-emerald-500" />
                            Candidate ID
                        </label>
                        <input
                            type="text"
                            name="candidate"
                            value={formData.candidate}
                            readOnly
                            required
                            placeholder="Select an application first"
                            className="w-full px-4 py-4 rounded-2xl bg-secondary/30 border border-border text-muted-foreground outline-none cursor-not-allowed"
                        />
                    </div>

                    {/* Schedule Time */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1 flex items-center gap-2">
                            <HiOutlineCalendar className="text-emerald-500" />
                            Scheduled At
                        </label>
                        <input
                            type="datetime-local"
                            name="scheduled_at"
                            value={formData.scheduled_at}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Scheduling...' : 'Create Interview Session'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
