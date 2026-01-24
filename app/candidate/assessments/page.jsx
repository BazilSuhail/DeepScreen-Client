'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { 
    HiOutlineCommandLine, 
    HiOutlineClock, 
    HiOutlineCheckCircle,
    HiOutlineChevronRight,
    HiOutlineAcademicCap,
    HiOutlinePlay
} from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

export default function CandidateAssessmentsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                // We fetch applications to see which ones require coding assessments
                const data = await api.get('/applications/my/');
                // Filter for jobs that have assessments or applications in coding_pending stage
                setApplications(data);
            } catch (err) {
                setError('Failed to load assessments');
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    const handleStart = async (appId, assessmentId) => {
        try {
            const res = await api.post('/assessments/start/', {
                application: appId,
                assessment: assessmentId
            });
            router.push(`/candidate/assessments/${res.submission_id}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to start assessment');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-black">Technical Assessments</h1>
                <p className="text-muted-foreground mt-1">Showcase your coding skills to recruiters</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {applications.filter(app => app.job_details?.interview_pipeline?.includes('coding')).map((app, i) => (
                    <motion.div
                        key={app.application_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-8 rounded-[2.5rem] border border-emerald-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                                <HiOutlineCommandLine className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{app.job_details?.job_title} - Coding Challenge</h3>
                                <p className="text-emerald-600 font-bold text-sm">{app.job_details?.organization_details?.name}</p>
                                <div className="flex items-center gap-4 mt-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineClock className="w-4 h-4" />
                                        90 Minutes
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineAcademicCap className="w-4 h-4" />
                                        Medium Difficulty
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {app.current_stage === 'coding_passed' ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-500 font-bold rounded-2xl">
                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                    Completed
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleStart(app.application_id, app.job_details?.assessments?.[0]?.assessment_id)}
                                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    <HiOutlinePlay className="w-5 h-5" />
                                    Start Test
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {applications.filter(app => app.job_details?.interview_pipeline?.includes('coding')).length === 0 && (
                    <div className="py-20 text-center glass rounded-[3rem] border-dashed border-2 border-border">
                        <HiOutlineCommandLine className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Pending Assessments</h3>
                        <p className="text-muted-foreground mt-2">Apply for roles that require technical screening to see tests here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
