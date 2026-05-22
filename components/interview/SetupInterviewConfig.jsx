'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { HiOutlineInformationCircle, HiOutlineClock, HiOutlineCamera, HiOutlineMicrophone, HiOutlineDesktopComputer } from 'react-icons/hi';

const toLocalDatetime = (utcStr) => {
    if (!utcStr) return '';
    const d = new Date(utcStr);
    if (isNaN(d)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function SetupInterviewConfig({ job_id }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: 'Live Technical Interview',
        description: '',
        default_duration_minutes: 45,
        default_link_expiry_hours: 24,
        default_scheduled_at: '',
        candidate_instructions: '',
        interviewer_notes: '',
        camera_required: true,
        mic_required: true,
        screen_share_enabled: true
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await api.get(`/interviews/recruiter/config/${job_id}/`);
                if (data && data.config_id) {
                    setFormData({
                        ...data,
                        default_scheduled_at: toLocalDatetime(data.default_scheduled_at),
                    });
                }
            } catch {
                console.log('No existing config, using defaults');
            } finally {
                setFetching(false);
            }
        };
        fetchConfig();
    }, [job_id]);

    const toUtcIso = (localStr) => {
        if (!localStr) return '';
        return new Date(localStr).toISOString();
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
            const payload = {
                ...formData,
                default_scheduled_at: toUtcIso(formData.default_scheduled_at),
            };
            await api.post(`/interviews/recruiter/config/${job_id}/`, payload);
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
         className="glass p-8 rounded-2xl border border-border">
               <div className="mb-8">
                    <h2 className="text-2xl font-bold">Interview Setup</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Configure the template and requirements for all live interviews tied to this job.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase text-xs tracking-widest">
                            <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                            Template Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="setup-title" className="text-sm font-semibold flex items-center gap-2">
                                    <HiOutlineInformationCircle className="text-emerald-500" />
                                    Interview Title
                                </label>
                                <input id="setup-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Live Technical Interview"
                                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="setup-duration" className="text-sm font-semibold flex items-center gap-2">
                                    <HiOutlineClock className="text-emerald-500" />
                                    Default Duration (Mins)
                                </label>
                                <input id="setup-duration"
                                    type="number"
                                    name="default_duration_minutes"
                                    value={formData.default_duration_minutes}
                                    onChange={handleChange}
                                    required
                                    min={5}
                                    max={180}
                                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="setup-expiry" className="text-sm font-semibold flex items-center gap-2">
                                    <HiOutlineClock className="text-amber-500" />
                                    Default Link Expiry (Hours)
                                </label>
                                <input id="setup-expiry"
                                    type="number"
                                    name="default_link_expiry_hours"
                                    value={formData.default_link_expiry_hours}
                                    onChange={handleChange}
                                    required
                                    min={1}
                                    max={720}
                                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="setup-scheduled" className="text-sm font-semibold flex items-center gap-2">
                                    <HiOutlineClock className="text-blue-500" />
                                    Default Scheduled Date/Time
                                </label>
                                <input id="setup-scheduled"
                                    type="datetime-local"
                                    name="default_scheduled_at"
                                    value={formData.default_scheduled_at || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="setup-description" className="text-sm font-semibold flex items-center gap-2">
                                <HiOutlineInformationCircle className="text-zinc-400" />
                                Description (Optional)
                            </label>
                            <textarea id="setup-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief description of what this interview template covers..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Candidate Instructions */}
                    <div className="space-y-2">
                        <label htmlFor="setup-candidate-instructions" className="text-sm font-semibold">Instructions for Candidate</label>
                        <textarea id="setup-candidate-instructions"
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
                        <label htmlFor="setup-interviewer-notes" className="text-sm font-semibold">Notes for Interviewers (Internal)</label>
                        <textarea id="setup-interviewer-notes"
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
                        {[
                            { name: 'camera_required', label: 'Camera', icon: HiOutlineCamera },
                            { name: 'mic_required', label: 'Microphone', icon: HiOutlineMicrophone },
                            { name: 'screen_share_enabled', label: 'Screen Share', icon: HiOutlineDesktopComputer },
                        ].map(({ name, label, icon: Icon }) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, [name]: !prev[name] }))}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer hover:border-emerald-500/40 ${
                                    formData[name]
                                        ? 'border-emerald-500/50 bg-emerald-500/10'
                                        : 'border-border bg-secondary/30'
                                }`}
                            >
                                <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                                    formData[name] ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                                }`}>
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                        formData[name] ? 'translate-x-[18px]' : 'translate-x-0.5'
                                    }`} />
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold">
                                    <Icon className={`w-5 h-5 ${formData[name] ? 'text-emerald-500' : 'text-muted-foreground/60'}`} />
                                    <span className={formData[name] ? 'text-foreground' : 'text-muted-foreground/60'}>{label}</span>
                                </div>
                            </button>
                        ))}
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
        </motion.div>
    );
}
