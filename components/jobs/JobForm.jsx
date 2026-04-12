'use client';

import { useState, useCallback } from 'react';
import {
    HiOutlineBriefcase,
    HiOutlineCommandLine,
    HiOutlineCheckCircle,
    HiOutlinePlusCircle,
    HiOutlineXMark,
    HiOutlineChevronLeft,
} from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

const MAX = {
    job_title: 200,
    department: 100,
    location: 200,
    salary_range: 100,
    job_description: 5000,
    key_skills: 20,
    requirements: 30,
    responsibilities: 30,
};

const MAX_ITEM_LENGTH = 200;

const DEFAULT_FORM = {
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

const PIPELINE_STEPS = [
    { id: 'shortlist', name: 'AI Shortlist' },
    { id: 'coding', name: 'Coding Test' },
    { id: 'ai_interview', name: 'AI Interview' },
    { id: 'real_interview', name: 'Human Interview' },
];

const JOB_TYPES = ['Full-time', 'Contract', 'Remote', 'Freelance', 'Internship'];
const EXP_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Lead'];
const STATUSES = ['open', 'draft', 'paused', 'closed', 'filled'];

export default function JobForm({ initialData, organizations, onSubmit, submitLabel, mode }) {
    const router = useRouter();
    const [formData, setFormData] = useState({ ...DEFAULT_FORM, ...initialData, organization: initialData?.organization || (organizations[0]?.org_id ?? '') });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const set = useCallback((key, value) => setFormData(prev => ({ ...prev, [key]: value })), []);

    const handleArrayChange = (field, index, value) => {
        const list = [...formData[field]];
        list[index] = value;
        set(field, list);
    };

    const addArrayItem = (field) => {
        if (formData[field].length >= MAX[field]) return;
        set(field, [...formData[field], '']);
    };

    const removeArrayItem = (field, index) => {
        set(field, formData[field].filter((_, i) => i !== index));
    };

    const togglePipelineStep = (step) => {
        const pipeline = [...formData.interview_pipeline];
        set('interview_pipeline', pipeline.includes(step) ? pipeline.filter(s => s !== step) : [...pipeline, step]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.job_title.trim() || !formData.location.trim() || !formData.job_description.trim()) {
            setError('Job Title, Location, and Description are required.');
            return;
        }
        setSubmitting(true);
        setError('');

        const cleaned = {
            ...formData,
            responsibilities: formData.responsibilities.filter(v => v.trim()),
            requirements: formData.requirements.filter(v => v.trim()),
            key_skills: formData.key_skills.filter(v => v.trim()),
        };

        try {
            await onSubmit(cleaned);
        } catch (err) {
            if (err.errors) {
                const key = Object.keys(err.errors)[0];
                const msg = err.errors[key];
                setError(`${key}: ${Array.isArray(msg) ? msg[0] : msg}`);
            } else {
                setError(err.message || 'Something went wrong');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full px-4 md:px-6 space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border transition-all">
                    <HiOutlineChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {mode === 'edit' ? 'Edit Job' : 'Post New Role'}
                    </h1>
                    <p className="text-muted-foreground">
                        {mode === 'edit' ? 'Update the details for this position' : 'Hire top talent with DeepScreen\'s AI screening'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold">{error}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <div className="glass p-6 md:p-8 rounded-[2rem] border border-emerald-500/10 space-y-6">
                            <div className="flex items-center gap-3 text-emerald-500">
                                <HiOutlineBriefcase className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Position Details</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Job Title *</label>
                                    <input
                                        required
                                        value={formData.job_title}
                                        onChange={e => set('job_title', e.target.value.slice(0, MAX.job_title))}
                                        className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. Senior Software Engineer"
                                        maxLength={MAX.job_title}
                                    />
                                    <span className="text-[10px] text-muted-foreground/60 px-1">{formData.job_title.length}/{MAX.job_title}</span>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Department</label>
                                    <input
                                        value={formData.department}
                                        onChange={e => set('department', e.target.value.slice(0, MAX.department))}
                                        className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. Engineering"
                                        maxLength={MAX.department}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Location *</label>
                                    <input
                                        required
                                        value={formData.location}
                                        onChange={e => set('location', e.target.value.slice(0, MAX.location))}
                                        className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. Remote"
                                        maxLength={MAX.location}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Job Type</label>
                                    <select
                                        value={formData.job_type}
                                        onChange={e => set('job_type', e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                                    >
                                        {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Experience Level</label>
                                    <select
                                        value={formData.experience_level}
                                        onChange={e => set('experience_level', e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                                    >
                                        {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Salary Range</label>
                                    <input
                                        value={formData.salary_range}
                                        onChange={e => set('salary_range', e.target.value.slice(0, MAX.salary_range))}
                                        className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. $120k - $160k"
                                        maxLength={MAX.salary_range}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Organization</label>
                                    <select
                                        required
                                        value={formData.organization}
                                        onChange={e => set('organization', e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                                    >
                                        {organizations.map(org => (
                                            <option key={org.org_id} value={org.org_id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {mode === 'edit' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => set('status', e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                                        >
                                            {STATUSES.map(s => (
                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass p-6 md:p-8 rounded-[2rem] border border-emerald-500/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Job Description *
                                </label>
                                <span className="text-[10px] text-muted-foreground/60">{formData.job_description.length}/{MAX.job_description}</span>
                            </div>
                            <textarea
                                required
                                rows="8"
                                value={formData.job_description}
                                onChange={e => set('job_description', e.target.value.slice(0, MAX.job_description))}
                                className="w-full px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                                placeholder="Describe the role, team, and company culture..."
                                maxLength={MAX.job_description}
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="glass p-6 md:p-8 rounded-[2rem] border border-emerald-500/10 space-y-6">
                            <div className="flex items-center gap-3 text-emerald-500">
                                <HiOutlineCommandLine className="w-6 h-6" />
                                <h2 className="text-xl font-bold">AI Screening Pipeline</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {PIPELINE_STEPS.map(step => {
                                    const active = formData.interview_pipeline.includes(step.id);
                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            onClick={() => togglePipelineStep(step.id)}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                active
                                                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500'
                                                    : 'border-border text-muted-foreground opacity-50'
                                            }`}
                                        >
                                            <HiOutlineCheckCircle className={`w-6 h-6 ${active ? 'opacity-100' : 'opacity-20'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{step.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glass p-6 md:p-8 rounded-[2rem] border border-emerald-500/10 space-y-6">
                            <h2 className="text-lg font-bold">Key Skills</h2>
                            <div className="space-y-2.5">
                                {formData.key_skills.map((skill, i) => (
                                    <div key={i} className="relative">
                                        <input
                                            value={skill}
                                            onChange={e => handleArrayChange('key_skills', i, e.target.value.slice(0, MAX_ITEM_LENGTH))}
                                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border outline-none focus:border-emerald-500 pr-10 text-sm"
                                            placeholder="e.g. React"
                                            maxLength={MAX_ITEM_LENGTH}
                                        />
                                        {formData.key_skills.length > 1 && (
                                            <button type="button" onClick={() => removeArrayItem('key_skills', i)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50 hover:opacity-100">
                                                <HiOutlineXMark className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {formData.key_skills.length < MAX.key_skills && (
                                    <button type="button" onClick={() => addArrayItem('key_skills')}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 transition-all text-sm font-bold">
                                        <HiOutlinePlusCircle className="w-5 h-5" /> Add Skill
                                    </button>
                                )}
                                <span className="text-[10px] text-muted-foreground/60">{formData.key_skills.length}/{MAX.key_skills}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass p-6 md:p-8 rounded-[2rem] border border-emerald-500/10 space-y-6">
                        <h2 className="text-lg font-bold">Requirements</h2>
                        <div className="space-y-2.5">
                            {formData.requirements.map((req, i) => (
                                <div key={i} className="relative">
                                    <input
                                        value={req}
                                        onChange={e => handleArrayChange('requirements', i, e.target.value.slice(0, MAX_ITEM_LENGTH))}
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border outline-none focus:border-emerald-500 pr-10 text-sm"
                                        placeholder="e.g. 5+ years experience"
                                        maxLength={MAX_ITEM_LENGTH}
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem('requirements', i)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50 hover:opacity-100">
                                            <HiOutlineXMark className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {formData.requirements.length < MAX.requirements && (
                                <button type="button" onClick={() => addArrayItem('requirements')}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 transition-all text-sm font-bold">
                                    <HiOutlinePlusCircle className="w-5 h-5" /> Add Requirement
                                </button>
                            )}
                            <span className="text-[10px] text-muted-foreground/60">{formData.requirements.length}/{MAX.requirements}</span>
                        </div>
                    </div>

                    <div className="glass p-6 md:p-8 rounded-[2rem] border border-emerald-500/10 space-y-6">
                        <h2 className="text-lg font-bold">Responsibilities</h2>
                        <div className="space-y-2.5">
                            {formData.responsibilities.map((resp, i) => (
                                <div key={i} className="relative">
                                    <input
                                        value={resp}
                                        onChange={e => handleArrayChange('responsibilities', i, e.target.value.slice(0, MAX_ITEM_LENGTH))}
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border outline-none focus:border-emerald-500 pr-10 text-sm"
                                        placeholder="e.g. Build scalable APIs"
                                        maxLength={MAX_ITEM_LENGTH}
                                    />
                                    {formData.responsibilities.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem('responsibilities', i)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50 hover:opacity-100">
                                            <HiOutlineXMark className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {formData.responsibilities.length < MAX.responsibilities && (
                                <button type="button" onClick={() => addArrayItem('responsibilities')}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 transition-all text-sm font-bold">
                                    <HiOutlinePlusCircle className="w-5 h-5" /> Add Responsibility
                                </button>
                            )}
                            <span className="text-[10px] text-muted-foreground/60">{formData.responsibilities.length}/{MAX.responsibilities}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pb-20">
                    <button type="button" onClick={() => router.back()}
                        className="px-10 py-4 rounded-xl bg-secondary hover:bg-secondary/80 font-bold text-sm transition-all">
                        Discard
                    </button>
                    <button type="submit" disabled={submitting}
                        className="px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-3 disabled:opacity-50">
                        {submitting ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {mode === 'edit' ? 'Saving...' : 'Posting...'}</>
                        ) : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}
