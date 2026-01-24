'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { 
    HiOutlineDocumentText, 
    HiOutlineBuildingOffice2, 
    HiOutlineClock, 
    HiOutlineCheckCircle,
    HiOutlineChartBar,
    HiOutlineChevronRight,
    HiOutlineExclamationCircle,
    HiOutlineArrowPath
} from 'react-icons/hi2';

export default function CandidateApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const data = await api.get('/applications/my/');
                setApplications(data);
            } catch (err) {
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-500/10 text-blue-500';
            case 'shortlisted': return 'bg-emerald-500/10 text-emerald-500';
            case 'rejected': return 'bg-red-500/10 text-red-500';
            case 'hired': return 'bg-purple-500/10 text-purple-500';
            case 'offered': return 'bg-amber-500/10 text-amber-500';
            default: return 'bg-secondary text-muted-foreground';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">My Applications</h1>
                    <p className="text-muted-foreground mt-1">Track your progress across all applied positions</p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {applications.map((app, i) => (
                    <motion.div
                        key={app.application_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass p-6 rounded-[2rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 border border-emerald-500/10 shrink-0">
                                {app.job_details?.organization_details?.logo_url ? (
                                    <img src={app.job_details.organization_details.logo_url} alt="Logo" className="w-full h-full object-contain p-2 rounded-2xl" />
                                ) : (
                                    <HiOutlineBuildingOffice2 className="w-8 h-8" />
                                )}
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-emerald-500 transition-colors">
                                    {app.job_details?.job_title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineBuildingOffice2 className="w-4 h-4" />
                                        {app.job_details?.organization_details?.name}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineClock className="w-4 h-4" />
                                        Applied {new Date(app.applied_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 md:gap-8 w-full md:w-auto">
                            <div className="text-right flex-1 md:flex-none">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">Current Stage</label>
                                <span className="font-bold text-sm flex items-center gap-1.5 justify-end">
                                    {app.current_stage === 'rejected' ? (
                                        <HiOutlineExclamationCircle className="w-4 h-4 text-red-500" />
                                    ) : app.current_stage === 'shortlisted' ? (
                                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <HiOutlineArrowPath className="w-4 h-4 text-blue-500 animate-spin-slow" />
                                    )}
                                    <span className="capitalize">{app.current_stage.replace('_', ' ')}</span>
                                </span>
                            </div>

                            <div className="text-right flex-1 md:flex-none min-w-[80px]">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">Match Score</label>
                                {app.shortlist_score ? (
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500" 
                                                style={{ width: `${app.shortlist_score * 100}%` }}
                                            />
                                        </div>
                                        <span className="font-black text-emerald-500">{(app.shortlist_score * 100).toFixed(0)}%</span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold text-muted-foreground italic">Processing...</span>
                                )}
                            </div>

                            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-center min-w-[100px] ${getStatusColor(app.status)}`}>
                                {app.status}
                            </div>

                            <button className="p-3 rounded-xl bg-secondary hover:bg-emerald-500 hover:text-white transition-all">
                                <HiOutlineChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {applications.length === 0 && !loading && (
                    <div className="py-20 text-center glass rounded-[3rem] border-dashed border-2 border-border mt-10">
                        <HiOutlineDocumentText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Applications Yet</h3>
                        <p className="text-muted-foreground mt-2 mb-8">You haven't applied to any jobs yet. Start exploring opportunities!</p>
                        <button className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20">
                            Find Jobs
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
