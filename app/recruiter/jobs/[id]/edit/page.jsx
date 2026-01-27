'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import {
    HiOutlineBriefcase,
    HiOutlineChevronLeft,
    HiOutlineCheckCircle,
    HiOutlineCommandLine,
    HiOutlinePlusCircle,
    HiOutlineXMark,
} from 'react-icons/hi2';
import { useRouter, useParams } from 'next/navigation';

const EMPTY_FORM = {
    job_title: '',
    organization: '',
    department: '',
    location: '',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_range: '',
    job_description: '',
    responsibilities: [''],
    requirements: [''],
    key_skills: [''],
    interview_pipeline: ['shortlist', 'coding', 'ai_interview', 'real_interview'],
    status: 'open',
};

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id;

    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        const init = async () => {
            try {
                const [orgs, job] = await Promise.all([
                    api.get('/organizations/'),
                    api.get(`/jobs/${jobId}/`),
                ]);
                setOrganizations(orgs);
                // Pre-fill form, ensuring arrays have at least one entry
                setFormData({
                    job_title:          job.job_title || '',
                    organization:       job.organization || (orgs[0]?.org_id ?? ''),
                    department:         job.department || '',
                    location:           job.location || '',
                    job_type:           job.job_type || 'Full-time',
                    experience_level:   job.experience_level || 'Mid-level',
                    salary_range:       job.salary_range || '',
                    job_description:    job.job_description || '',
                    responsibilities:   job.responsibilities?.length ? job.responsibilities : [''],
                    requirements:       job.requirements?.length ? job.requirements : [''],
                    key_skills:         job.key_skills?.length ? job.key_skills : [''],
                    interview_pipeline: job.interview_pipeline?.length ? job.interview_pipeline : ['shortlist'],
                    status:             job.status || 'open',
                });
            } catch (err) {
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };
        if (jobId) init();
    }, [jobId]);

    const handleArrayChange = (field, index, value) => {
        const list = [...formData[field]];
        list[index] = value;
        setFormData({ ...formData, [field]: list });
    };

    const addArrayItem = (field) =>
        setFormData({ ...formData, [field]: [...formData[field], ''] });

    const removeArrayItem = (field, index) =>
        setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });

    const togglePipelineStep = (step) => {
        const pipeline = [...formData.interview_pipeline];
        setFormData({
            ...formData,
            interview_pipeline: pipeline.includes(step)
                ? pipeline.filter(s => s !== step)
                : [...pipeline, step],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const cleanedData = {
            ...formData,
            responsibilities: formData.responsibilities.filter(v => v.trim()),
            requirements:     formData.requirements.filter(v => v.trim()),
            key_skills:       formData.key_skills.filter(v => v.trim()),
        };

        try {
            await api.put(`/jobs/${jobId}/`, cleanedData);
            router.push('/recruiter/jobs');
        } catch (err) {
            if (err.errors) {
                const firstKey = Object.keys(err.errors)[0];
                const msg = err.errors[firstKey];
                setError(`${firstKey}: ${Array.isArray(msg) ? msg[0] : msg}`);
            } else {
                setError(err.message || 'Failed to update job');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border transition-all">
                    <HiOutlineChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Edit Job</h1>
                    <p className="text-muted-foreground">Update the details for this position</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold">{error}</div>
                )}

                {/* Section 1: Basic Info */}
                <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-8">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <HiOutlineBriefcase className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Position Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Job Title', key: 'job_title', placeholder: 'e.g. Senior Software Engineer', required: true },
                            { label: 'Department', key: 'department', placeholder: 'e.g. Engineering' },
                            { label: 'Location', key: 'location', placeholder: 'e.g. Remote', required: true },
                            { label: 'Salary Range', key: 'salary_range', placeholder: 'e.g. $120k–$160k' },
                        ].map(({ label, key, placeholder, required }) => (
                            <div key={key} className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">{label}</label>
                                <input
                                    required={required}
                                    value={formData[key]}
                                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                    placeholder={placeholder}
                                />
                            </div>
                        ))}

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Organization</label>
                            <select
                                value={formData.organization}
                                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                            >
                                {organizations.map(org => (
                                    <option key={org.org_id} value={org.org_id}>{org.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                            >
                                {['open', 'paused', 'closed', 'draft', 'filled'].map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Job Description</label>
                        <textarea
                            required rows="6" value={formData.job_description}
                            onChange={e => setFormData({ ...formData, job_description: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                            placeholder="Describe the role, team, and company culture..."
                        />
                    </div>
                </div>

                {/* Section 2: Pipeline */}
                <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-6">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <HiOutlineCommandLine className="w-6 h-6" />
                        <h2 className="text-xl font-bold">AI Screening Pipeline</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'shortlist', name: 'AI Shortlist' },
                            { id: 'coding', name: 'Coding Test' },
                            { id: 'ai_interview', name: 'AI Interview' },
                            { id: 'real_interview', name: 'Human Interview' },
                        ].map(step => (
                            <button
                                key={step.id} type="button"
                                onClick={() => togglePipelineStep(step.id)}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    formData.interview_pipeline.includes(step.id)
                                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600'
                                        : 'border-border text-muted-foreground opacity-50'
                                }`}
                            >
                                <HiOutlineCheckCircle className={`w-6 h-6 ${formData.interview_pipeline.includes(step.id) ? 'opacity-100' : 'opacity-20'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{step.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 3: Arrays */}
                {[
                    { field: 'key_skills', label: 'Key Skills', placeholder: 'e.g. React' },
                    { field: 'requirements', label: 'Requirements', placeholder: 'e.g. 5+ years experience' },
                    { field: 'responsibilities', label: 'Responsibilities', placeholder: 'e.g. Build scalable APIs' },
                ].map(({ field, label, placeholder }) => (
                    <div key={field} className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">{label}</h2>
                            <button type="button" onClick={() => addArrayItem(field)} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                                <HiOutlinePlusCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData[field].map((val, i) => (
                                <div key={i} className="relative">
                                    <input
                                        value={val}
                                        onChange={e => handleArrayChange(field, i, e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border outline-none focus:border-emerald-500 pr-10 transition-all"
                                        placeholder={placeholder}
                                    />
                                    {formData[field].length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem(field, i)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50 hover:opacity-100 transition-opacity">
                                            <HiOutlineXMark className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Actions */}
                <div className="flex justify-end gap-4 pb-20">
                    <button type="button" onClick={() => router.back()}
                        className="px-10 py-4 rounded-2xl bg-secondary hover:bg-secondary/80 font-black text-sm transition-all">
                        Discard
                    </button>
                    <button type="submit" disabled={submitting}
                        className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-3 disabled:opacity-50">
                        {submitting ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
