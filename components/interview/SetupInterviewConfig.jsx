'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import {
    HiOutlineInformationCircle,
    HiOutlineClock,
    HiOutlineCalendar,
    HiOutlineLink,
    HiOutlineDocumentText,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineLockClosed,
    HiOutlineComputerDesktop,
    HiOutlineCheck,
    HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import { fadeUp, base } from '@/constants/motion';
import { cardPadded, errorClass, inputClass, labelClass, primaryButton } from '@/components/ui/styles';
import { SectionHeading } from '@/components/interview/InterviewListParts';
import HardwareToggles from '@/components/interview/HardwareToggles';
import { InterviewFormSkeleton } from '@/components/skeletons/recruiter/InterviewSetupSkeleton';

const toLocalDatetime = (utcStr) => {
    if (!utcStr) return '';
    const d = new Date(utcStr);
    if (isNaN(d)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function Field({ id, icon: Icon, label, children }) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className={`${labelClass} flex items-center gap-1.5`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
            </label>
            {children}
        </div>
    );
}

export default function SetupInterviewConfig({ job_id }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [status, setStatus] = useState('');
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
                // No saved config yet: the form keeps its defaults.
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
            setStatus('');
            const payload = {
                ...formData,
                default_scheduled_at: toUtcIso(formData.default_scheduled_at),
            };
            await api.post(`/interviews/recruiter/config/${job_id}/`, payload);
            setStatus('saved');
            router.push('/recruiter/interview');
        } catch (error) {
            console.error('Error saving config:', error);
            setStatus(error.message || 'Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <InterviewFormSkeleton />;

    return (
        <motion.form {...fadeUp} transition={base} onSubmit={handleSubmit} className={`${cardPadded} space-y-8`}>
            <section className="space-y-5">
                <SectionHeading icon={HiOutlineInformationCircle} title="Template details" text="Applied to every live interview for this job." />
                <div className="grid gap-5 md:grid-cols-2">
                    <Field id="setup-title" icon={HiOutlineDocumentText} label="Interview title">
                        <input id="setup-title" type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Live Technical Interview" className={inputClass} />
                    </Field>
                    <Field id="setup-duration" icon={HiOutlineClock} label="Default duration (minutes)">
                        <input id="setup-duration" type="number" name="default_duration_minutes" value={formData.default_duration_minutes} onChange={handleChange} required min={5} max={180} className={inputClass} />
                    </Field>
                    <Field id="setup-expiry" icon={HiOutlineLink} label="Default link expiry (hours)">
                        <input id="setup-expiry" type="number" name="default_link_expiry_hours" value={formData.default_link_expiry_hours} onChange={handleChange} required min={1} max={720} className={inputClass} />
                    </Field>
                    <Field id="setup-scheduled" icon={HiOutlineCalendar} label="Default date and time">
                        <input id="setup-scheduled" type="datetime-local" name="default_scheduled_at" value={formData.default_scheduled_at || ''} onChange={handleChange} className={inputClass} />
                    </Field>
                </div>
                <Field id="setup-description" icon={HiOutlineDocumentText} label="Description (optional)">
                    <textarea id="setup-description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of what this interview template covers..." rows={3} className={`${inputClass} resize-none`} />
                </Field>
            </section>

            <section className="space-y-5 border-t border-emerald-100 pt-6 dark:border-white/10">
                <SectionHeading icon={HiOutlineChatBubbleBottomCenterText} title="Instructions and notes" />
                <div className="grid gap-5 md:grid-cols-2">
                    <Field id="setup-candidate-instructions" icon={HiOutlineChatBubbleBottomCenterText} label="Instructions for candidate">
                        <textarea id="setup-candidate-instructions" name="candidate_instructions" value={formData.candidate_instructions} onChange={handleChange} placeholder="What should the candidate know before joining?" rows={4} className={`${inputClass} resize-none`} />
                    </Field>
                    <Field id="setup-interviewer-notes" icon={HiOutlineLockClosed} label="Notes for interviewers (internal)">
                        <textarea id="setup-interviewer-notes" name="interviewer_notes" value={formData.interviewer_notes} onChange={handleChange} placeholder="Points to cover during the interview..." rows={4} className={`${inputClass} resize-none`} />
                    </Field>
                </div>
            </section>

            <section className="space-y-5 border-t border-emerald-100 pt-6 dark:border-white/10">
                <SectionHeading icon={HiOutlineComputerDesktop} title="Hardware requirements" text="What the candidate must enable to join." />
                <HardwareToggles values={formData} onToggle={(name) => setFormData(prev => ({ ...prev, [name]: !prev[name] }))} />
            </section>

            <div className="space-y-3 border-t border-emerald-100 pt-6 dark:border-white/10">
                {status && status !== 'saved' && (
                    <p role="alert" className={`${errorClass} flex items-center gap-1.5`}>
                        <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {status}
                    </p>
                )}
                {status === 'saved' && (
                    <output className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <HiOutlineCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Configuration saved
                    </output>
                )}
                <button type="submit" disabled={loading} className={`${primaryButton} w-full sm:w-auto`}>
                    {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
                    ) : (
                        <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />
                    )}
                    {loading ? 'Saving...' : 'Save interview configuration'}
                </button>
            </div>
        </motion.form>
    );
}
