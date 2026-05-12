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

function Input({ label, required, maxLength, value, onChange, placeholder, className }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                {label} {required && <span className="text-destructive">*</span>}
            </label>
            <input
                required={required}
                value={value}
                onChange={onChange}
                className={`w-full px-5 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all ${className}`}
                placeholder={placeholder}
                maxLength={maxLength}
            />
        </div>
    );
}

function Select({ label, required, value, onChange, options }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                {label} {required && <span className="text-destructive">*</span>}
            </label>
            <select
                required={required}
                value={value}
                onChange={onChange}
                className="w-full px-5 py-3.5 rounded-xl bg-muted border border-border text-foreground focus:border-emerald-500/50 focus:bg-emerald-500/5 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all appearance-none"
            >
                {options.map(opt => (
                    <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
                ))}
            </select>
        </div>
    );
}

function ArrayInput({ items, max, onAdd, onRemove, onChange, placeholder, label }) {
    return (
        <div className="space-y-2.5">
            {items.map((item, i) => (
                <div key={i} className="relative">
                    <input
                        value={item}
                        onChange={e => onChange(i, e.target.value.slice(0, MAX_ITEM_LENGTH))}
                        className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 pr-10 text-sm transition-all"
                        placeholder={placeholder}
                        maxLength={MAX_ITEM_LENGTH}
                    />
                    {items.length > 1 && (
                        <button type="button" onClick={() => onRemove(i)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50 hover:opacity-100 transition-opacity">
                            <HiOutlineXMark className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
            {items.length < max && (
                <button type="button" onClick={onAdd}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 transition-all text-sm font-bold">
                    <HiOutlinePlusCircle className="w-5 h-5" /> Add {label}
                </button>
            )}
            <span className="text-[10px] text-muted-foreground/60">{items.length}/{max}</span>
        </div>
    );
}

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
        <div className="w-full space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 rounded-2xl bg-card hover:bg-secondary border border-border transition-all">
                    <HiOutlineChevronLeft className="w-6 h-6 text-foreground" />
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

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold">{error}</div>
                )}

                <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 text-emerald-500 pb-2 border-b border-border">
                        <HiOutlineBriefcase className="w-6 h-6" />
                        <h2 className="text-xl font-bold text-foreground">Basic Information</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                            Job Title <span className="text-destructive">*</span>
                        </label>
                        <input
                            required
                            value={formData.job_title}
                            onChange={e => set('job_title', e.target.value.slice(0, MAX.job_title))}
                            className="w-full px-5 py-4 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-lg"
                            placeholder="e.g. Senior Software Engineer"
                            maxLength={MAX.job_title}
                        />
                        <span className="text-[10px] text-muted-foreground/60 px-1">{formData.job_title.length}/{MAX.job_title}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Input label="Department" value={formData.department} onChange={e => set('department', e.target.value.slice(0, MAX.department))} placeholder="e.g. Engineering" maxLength={MAX.department} />
                        <Input label="Location" required value={formData.location} onChange={e => set('location', e.target.value.slice(0, MAX.location))} placeholder="e.g. Remote" maxLength={MAX.location} />
                        <Input label="Salary Range" value={formData.salary_range} onChange={e => set('salary_range', e.target.value.slice(0, MAX.salary_range))} placeholder="e.g. $120k - $160k" maxLength={MAX.salary_range} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Select label="Job Type" value={formData.job_type} onChange={e => set('job_type', e.target.value)} options={JOB_TYPES} />
                        <Select label="Experience Level" value={formData.experience_level} onChange={e => set('experience_level', e.target.value)} options={EXP_LEVELS} />
                        <Select label="Organization" required value={formData.organization} onChange={e => set('organization', e.target.value)} options={organizations.map(org => ({ value: org.org_id, label: org.name }))} />
                    </div>

                    {mode === 'edit' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2 border-t border-border">
                            <Select label="Status" value={formData.status} onChange={e => set('status', e.target.value)} options={STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                            Job Description <span className="text-destructive">*</span>
                        </label>
                        <span className="text-[10px] text-muted-foreground/60">{formData.job_description.length}/{MAX.job_description}</span>
                    </div>
                    <textarea
                        required
                        rows="10"
                        value={formData.job_description}
                        onChange={e => set('job_description', e.target.value.slice(0, MAX.job_description))}
                        className="w-full px-5 py-4 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all resize-none leading-relaxed"
                        placeholder="Describe the role, team, and company culture..."
                        maxLength={MAX.job_description}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-6">
                        <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Requirements</h2>
                        <ArrayInput
                            items={formData.requirements}
                            max={MAX.requirements}
                            onAdd={() => addArrayItem('requirements')}
                            onRemove={(i) => removeArrayItem('requirements', i)}
                            onChange={(i, v) => handleArrayChange('requirements', i, v)}
                            placeholder="e.g. 5+ years experience"
                            label="Requirement"
                        />
                    </div>

                    <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-6">
                        <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Responsibilities</h2>
                        <ArrayInput
                            items={formData.responsibilities}
                            max={MAX.responsibilities}
                            onAdd={() => addArrayItem('responsibilities')}
                            onRemove={(i) => removeArrayItem('responsibilities', i)}
                            onChange={(i, v) => handleArrayChange('responsibilities', i, v)}
                            placeholder="e.g. Build scalable APIs"
                            label="Responsibility"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-6">
                        <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Key Skills</h2>
                        <ArrayInput
                            items={formData.key_skills}
                            max={MAX.key_skills}
                            onAdd={() => addArrayItem('key_skills')}
                            onRemove={(i) => removeArrayItem('key_skills', i)}
                            onChange={(i, v) => handleArrayChange('key_skills', i, v)}
                            placeholder="e.g. React"
                            label="Skill"
                        />
                    </div>

                    <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-6">
                        <div className="flex items-center gap-3 text-emerald-500 pb-2 border-b border-border">
                            <HiOutlineCommandLine className="w-6 h-6" />
                            <h2 className="text-lg font-bold text-foreground">AI Screening Pipeline</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {PIPELINE_STEPS.map(step => {
                                const active = formData.interview_pipeline.includes(step.id);
                                return (
                                    <button
                                        key={step.id}
                                        type="button"
                                        onClick={() => togglePipelineStep(step.id)}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${active
                                                ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500'
                                                : 'border-border text-muted-foreground opacity-50 hover:opacity-80 hover:border-muted-foreground/30'
                                            }`}
                                    >
                                        <HiOutlineCheckCircle className={`w-6 h-6 ${active ? 'opacity-100' : 'opacity-20'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{step.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 pb-20">
                    <button type="button" onClick={() => router.back()}
                        className="px-10 py-4 rounded-xl bg-card border border-border hover:bg-secondary font-bold text-sm transition-all text-foreground">
                        Discard
                    </button>
                    <button type="submit" disabled={submitting}
                        className="px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-3 disabled:opacity-50">
                        {submitting ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {mode === 'edit' ? 'Saving...' : 'Posting...'}</>
                        ) : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}
