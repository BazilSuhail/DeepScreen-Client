'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { 
    HiOutlineBriefcase, 
    HiOutlineMapPin, 
    HiOutlineCurrencyDollar,
    HiOutlineChevronLeft,
    HiOutlineCheckCircle,
    HiOutlineListBullet,
    HiOutlineCommandLine,
    HiOutlinePlusCircle,
    HiOutlineXMark
} from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

export default function CreateJobPage() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        job_title: '',
        organization: '',
        department: '',
        location: '',
        job_type: 'Full-time',
        experience_level: 'Mid-level',
        salary_range: '',
        job_description: '',
        responsibilities: [''],  // Initialize with one empty field
        requirements: [''],      // Initialize with one empty field
        key_skills: [''],        // Initialize with one empty field
        interview_pipeline: ['shortlist', 'coding', 'ai_interview', 'real_interview'],
        status: 'open'
    });

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const data = await api.get('/organizations/');
                setOrganizations(data);
                if (data.length > 0) setFormData(prev => ({ ...prev, organization: data[0].org_id }));
            } catch (err) {
                setError('Failed to load organizations');
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, []);

    const handleArrayChange = (field, index, value) => {
        const newList = [...formData[field]];
        newList[index] = value;
        setFormData({ ...formData, [field]: newList });
    };

    const addArrayItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (field, index) => {
        const newList = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newList });
    };

    const togglePipelineStep = (step) => {
        const pipeline = [...formData.interview_pipeline];
        if (pipeline.includes(step)) {
            setFormData({ ...formData, interview_pipeline: pipeline.filter(s => s !== step) });
        } else {
            setFormData({ ...formData, interview_pipeline: [...pipeline, step] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        
        // Filter out empty strings from array fields
        const cleanedData = {
            ...formData,
            responsibilities: formData.responsibilities.filter(item => item.trim() !== ''),
            requirements: formData.requirements.filter(item => item.trim() !== ''),
            key_skills: formData.key_skills.filter(item => item.trim() !== '')
        };

        try {
            await api.post('/jobs/', cleanedData);
            router.push('/recruiter/jobs');
        } catch (err) {
            console.error('Job creation error:', err);
            if (err.errors) {
                // Get the first error message from the dictionary
                const firstErrorField = Object.keys(err.errors)[0];
                const firstErrorMessage = err.errors[firstErrorField];
                setError(`${firstErrorField}: ${Array.isArray(firstErrorMessage) ? firstErrorMessage[0] : firstErrorMessage}`);
            } else {
                setError(err.message || 'Failed to post job');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.back()}
                    className="p-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border transition-all"
                >
                    <HiOutlineChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Post New Role</h1>
                    <p className="text-muted-foreground">Hire top talent with DeepScreen's AI screening</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold">{error}</div>}

                {/* Section 1: Basic Info */}
                <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-8">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <HiOutlineBriefcase className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Position Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Job Title</label>
                            <input 
                                required value={formData.job_title}
                                onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                                className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                placeholder="e.g. Senior Software Engineer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Organization</label>
                            <select 
                                required value={formData.organization}
                                onChange={(e) => setFormData({...formData, organization: e.target.value})}
                                className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                            >
                                {organizations.map(org => (
                                    <option key={org.org_id} value={org.org_id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Location</label>
                            <input 
                                required value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                placeholder="e.g. Remote or San Francisco, CA"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Salary Range</label>
                            <input 
                                value={formData.salary_range}
                                onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                                className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                placeholder="e.g. $120k - $160k"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Job Description</label>
                        <textarea 
                            required rows="6" value={formData.job_description}
                            onChange={(e) => setFormData({...formData, job_description: e.target.value})}
                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                            placeholder="Describe the role, team, and company culture..."
                        />
                    </div>
                </div>

                {/* Section 2: Interview Pipeline */}
                <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-8">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <HiOutlineCommandLine className="w-6 h-6" />
                        <h2 className="text-xl font-bold">AI Screening Pipeline</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'shortlist', name: 'AI Shortlist' },
                            { id: 'coding', name: 'Coding Test' },
                            { id: 'ai_interview', name: 'AI Interview' },
                            { id: 'real_interview', name: 'Human Interview' }
                        ].map(step => (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => togglePipelineStep(step.id)}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    formData.interview_pipeline.includes(step.id)
                                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-600"
                                    : "border-border text-muted-foreground grayscale opacity-50"
                                }`}
                            >
                                <HiOutlineCheckCircle className={`w-6 h-6 ${formData.interview_pipeline.includes(step.id) ? "opacity-100" : "opacity-20"}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{step.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 3: Lists (Skills, Responsibilities, etc) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Key Skills</h2>
                            <button type="button" onClick={() => addArrayItem('key_skills')} className="text-emerald-500"><HiOutlinePlusCircle className="w-6 h-6" /></button>
                        </div>
                        <div className="space-y-3">
                            {formData.key_skills.map((skill, i) => (
                                <div key={i} className="relative">
                                    <input 
                                        value={skill}
                                        onChange={(e) => handleArrayChange('key_skills', i, e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border outline-none focus:border-emerald-500 pr-10"
                                        placeholder="e.g. React"
                                    />
                                    {formData.key_skills.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem('key_skills', i)} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50 hover:opacity-100">
                                            <HiOutlineXMark className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Requirements</h2>
                            <button type="button" onClick={() => addArrayItem('requirements')} className="text-emerald-500"><HiOutlinePlusCircle className="w-6 h-6" /></button>
                        </div>
                        <div className="space-y-3">
                            {formData.requirements.map((req, i) => (
                                <div key={i} className="relative">
                                    <input 
                                        value={req}
                                        onChange={(e) => handleArrayChange('requirements', i, e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border outline-none focus:border-emerald-500 pr-10"
                                        placeholder="e.g. 5+ years experience"
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem('requirements', i)} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50 hover:opacity-100">
                                            <HiOutlineXMark className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* NEW SECTION: Responsibilities */}
                <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Responsibilities</h2>
                        <button type="button" onClick={() => addArrayItem('responsibilities')} className="text-emerald-500">
                            <HiOutlinePlusCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.responsibilities.map((resp, i) => (
                            <div key={i} className="relative">
                                <input 
                                    value={resp}
                                    onChange={(e) => handleArrayChange('responsibilities', i, e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border outline-none focus:border-emerald-500 pr-10"
                                    placeholder="e.g. Develop and maintain web applications"
                                />
                                {formData.responsibilities.length > 1 && (
                                    <button type="button" onClick={() => removeArrayItem('responsibilities', i)} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50 hover:opacity-100">
                                        <HiOutlineXMark className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pb-20">
                    <button 
                        type="button" onClick={() => router.back()}
                        className="px-10 py-4 rounded-2xl bg-secondary hover:bg-secondary/80 font-black text-sm transition-all"
                    >
                        Discard
                    </button>
                    <button 
                        type="submit" disabled={submitting}
                        className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {submitting ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</>
                        ) : (
                            'Post Job'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}