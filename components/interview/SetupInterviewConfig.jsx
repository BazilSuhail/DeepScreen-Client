'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { HiOutlineInformationCircle, HiOutlineClock, HiOutlineCamera, HiOutlineMicrophone, HiOutlineDesktopComputer } from 'react-icons/hi';

export default function SetupInterviewConfig({ job_id }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: 'Live Technical Interview',
        description: '',
        default_duration_minutes: 45,
        candidate_instructions: '',
        interviewer_notes: '',
        camera_required: true,
        mic_required: true,
        screen_share_enabled: true
    });

    useEffect(() => {
        fetchConfig();
    }, [job_id]);

    const fetchConfig = async () => {
        try {
            const data = await api.get(`/interviews/recruiter/config/${job_id}/`);
            if (data && data.config_id) {
                setFormData(data);
            }
        } catch (error) {
            console.log('No existing config, using defaults');
        } finally {
            setFetching(false);
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
        try {
            setLoading(true);
            await api.post(`/interviews/recruiter/config/${job_id}/`, formData);
            alert('Interview configuration saved successfully!');
            router.push('/recruiter/interview');
        } catch (error) {
            console.error('Error saving config:', error);
            alert(error.message || 'Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
        >
            <div className="glass p-8 rounded-3xl border border-emerald-500/20 shadow-2xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        Setup Interview Instructions
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Configure the instructions and requirements for all live interviews for this job.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <HiOutlineInformationCircle className="text-emerald-500" />
                                Interview Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <HiOutlineClock className="text-emerald-500" />
                                Duration (Minutes)
                            </label>
                            <input
                                type="number"
                                name="default_duration_minutes"
                                value={formData.default_duration_minutes}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Candidate Instructions */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Instructions for Candidate</label>
                        <textarea
                            name="candidate_instructions"
                            value={formData.candidate_instructions}
                            onChange={handleChange}
                            placeholder="What should the candidate know before joining?"
                            rows={4}
                            className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none resize-none"
                        />
                    </div>

                    {/* Interviewer Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Notes for Interviewers (Internal)</label>
                        <textarea
                            name="interviewer_notes"
                            value={formData.interviewer_notes}
                            onChange={handleChange}
                            placeholder="Points to cover during the interview..."
                            rows={4}
                            className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none resize-none"
                        />
                    </div>

                    {/* Hardware Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border cursor-pointer hover:bg-secondary/50 transition-all">
                            <input
                                type="checkbox"
                                name="camera_required"
                                checked={formData.camera_required}
                                onChange={handleChange}
                                className="w-5 h-5 accent-emerald-500"
                            />
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <HiOutlineCamera className="w-5 h-5 text-emerald-500" />
                                Camera
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border cursor-pointer hover:bg-secondary/50 transition-all">
                            <input
                                type="checkbox"
                                name="mic_required"
                                checked={formData.mic_required}
                                onChange={handleChange}
                                className="w-5 h-5 accent-emerald-500"
                            />
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <HiOutlineMicrophone className="w-5 h-5 text-emerald-500" />
                                Microphone
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border cursor-pointer hover:bg-secondary/50 transition-all">
                            <input
                                type="checkbox"
                                name="screen_share_enabled"
                                checked={formData.screen_share_enabled}
                                onChange={handleChange}
                                className="w-5 h-5 accent-emerald-500"
                            />
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <HiOutlineDesktopComputer className="w-5 h-5 text-emerald-500" />
                                Screen Share
                            </div>
                        </label>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Interview Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
