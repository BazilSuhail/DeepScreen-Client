'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlineBriefcase, 
    HiOutlineMapPin, 
    HiOutlineCurrencyDollar, 
    HiOutlineMagnifyingGlass,
    HiOutlineFunnel,
    HiOutlineBuildingOffice2,
    HiOutlineXMark,
    HiOutlineChevronRight,
    HiOutlineDocumentDuplicate
} from 'react-icons/hi2';

export default function CandidateJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsData, resumesData] = await Promise.all([
                    api.get('/jobs/'),
                    api.get('/resumes/me/')
                ]);
                setJobs(jobsData);
                setResumes(resumesData);
                if (resumesData.length > 0) setSelectedResumeId(resumesData[0].resume_id);
            } catch (err) {
                setError('Failed to load jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApply = async () => {
        if (!selectedResumeId) {
            setError('Please select or create a resume first');
            return;
        }
        setApplying(true);
        setError('');
        try {
            await api.post('/applications/', {
                job: selectedJob.job_id,
                resume: selectedResumeId
            });
            setSuccess('Application submitted successfully!');
            setTimeout(() => {
                setSelectedJob(null);
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.job_title.toLowerCase().includes(search.toLowerCase()) ||
        job.organization_details?.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black">Find Your Next Role</h1>
                    <p className="text-muted-foreground mt-1">Explore opportunities matched with your skills</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 rounded-2xl bg-secondary/50 border border-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                            placeholder="Search jobs, companies..."
                        />
                    </div>
                    <button className="p-3 rounded-2xl bg-secondary border border-emerald-500/10 text-muted-foreground">
                        <HiOutlineFunnel className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                    <motion.div
                        key={job.job_id}
                        whileHover={{ y: -5 }}
                        className="glass p-6 rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        
                        <div className="flex gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-card border border-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 shadow-lg">
                                {job.organization_details?.logo_url ? (
                                    <img src={job.organization_details.logo_url} alt="Logo" className="w-full h-full object-contain p-2 rounded-2xl" />
                                ) : (
                                    <HiOutlineBuildingOffice2 className="w-8 h-8" />
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-emerald-500 transition-colors">
                                            {job.job_title}
                                        </h3>
                                        <p className="font-bold text-emerald-600/80 text-sm mt-0.5">{job.organization_details?.name}</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                        {job.job_type}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-xl border border-border">
                                        <HiOutlineMapPin className="w-4 h-4" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-xl border border-border">
                                        <HiOutlineCurrencyDollar className="w-4 h-4" />
                                        {job.salary_range || 'Competitive'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-8 pt-4 border-t border-emerald-500/5">
                                    <div className="flex gap-2">
                                        {job.key_skills.slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="text-[10px] font-bold text-muted-foreground px-2 py-1 rounded-lg bg-secondary/30">
                                                {skill}
                                            </span>
                                        ))}
                                        {job.key_skills.length > 3 && (
                                            <span className="text-[10px] font-bold text-muted-foreground px-2 py-1">
                                                +{job.key_skills.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setSelectedJob(job)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                                    >
                                        Apply Now
                                        <HiOutlineChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredJobs.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-2 border-border mt-10">
                        <HiOutlineBriefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Jobs Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search filters or check back later.</p>
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedJob(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-card border border-emerald-500/10 rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-emerald-500/5 flex justify-between items-center bg-emerald-500/5">
                                <div>
                                    <h2 className="text-2xl font-black">Apply for Role</h2>
                                    <p className="text-emerald-600 font-bold">{selectedJob.job_title} at {selectedJob.organization_details?.name}</p>
                                </div>
                                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                                    <HiOutlineXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">{error}</div>}
                                {success && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold">{success}</div>}

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Select Your Resume</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {resumes.map((resume) => (
                                            <div 
                                                key={resume.resume_id}
                                                onClick={() => setSelectedResumeId(resume.resume_id)}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                                    selectedResumeId === resume.resume_id 
                                                    ? "border-emerald-500 bg-emerald-500/5" 
                                                    : "border-border hover:border-emerald-500/30"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <HiOutlineDocumentDuplicate className={`w-6 h-6 ${selectedResumeId === resume.resume_id ? "text-emerald-500" : "text-muted-foreground"}`} />
                                                    <div>
                                                        <p className="font-bold text-sm">{resume.candidate_name || 'Untitled Resume'}</p>
                                                        <p className="text-[10px] opacity-60">Uploaded {new Date(resume.upload_date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {selectedResumeId === resume.resume_id && (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                        <HiOutlineChevronRight className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {resumes.length === 0 && (
                                            <div className="p-8 text-center border-dashed border-2 border-border rounded-3xl">
                                                <p className="text-sm text-muted-foreground mb-4">You don't have any resumes yet.</p>
                                                <button className="text-emerald-500 font-black text-sm hover:underline">Create One Now</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-emerald-500/5 bg-emerald-500/5 flex justify-end gap-4">
                                <button 
                                    onClick={() => setSelectedJob(null)}
                                    className="px-8 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 font-bold transition-all border border-border"
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={applying || resumes.length === 0}
                                    onClick={handleApply}
                                    className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {applying ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
