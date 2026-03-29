'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
    HiOutlinePlus,
    HiOutlineBeaker,
    HiOutlineXMark,
    HiOutlineSparkles,
    HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import { AssessmentSetupCard } from '@/components/assessments/AssessmentCard';

export default function RecruiterAssessmentsPage() {
    const router = useRouter();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            const assessData = await api.get('/assessments/');
            setAssessments(assessData);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to synchronize assessment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleArchive = async (id) => {
        if (!confirm('Archive this assessment? Active candidates will still be able to complete it.')) return;
        try {
            await api.patch(`/assessments/${id}/`, { is_active: false });
            setAssessments(prev => prev.map(a => a.assessment_id === id ? { ...a, is_active: false } : a));
            setSuccessMsg('Assessment moved to archives.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setError('Archive operation failed');
        }
    };

    const filteredAssessments = assessments.filter(a => 
        a.title.toLowerCase().includes(search.toLowerCase()) || 
        a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.job_title?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500" />
                <HiOutlineBeaker className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gradient leading-none">Assessments</h1>
                    <p className="text-muted-foreground font-medium pl-1">Build, manage, and assign technical evaluations</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search assessments..."
                            className="pl-12 pr-6 py-3.5 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all w-full md:w-64 font-medium" />
                    </div>
                    <button
                        onClick={() => router.push('/recruiter/assessments/create')}
                        className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-emerald-600/20 active:scale-95"
                    >
                        <HiOutlinePlus className="w-5 h-5" /> Create New
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-3">
                    <HiOutlineXMark className="w-6 h-6" /> {error}
                </div>
            )}
            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center gap-3">
                    <HiOutlineSparkles className="w-6 h-6" /> {successMsg}
                </motion.div>
            )}

            {/* List Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {filteredAssessments.map((a, i) => (
                    <AssessmentSetupCard
                        key={a.assessment_id}
                        assessment={a}
                        index={i}
                        onEdit={(assessment) => router.push(`/recruiter/assessments/${assessment.assessment_id}`)}
                        onDelete={handleArchive}
                    />
                ))}
                {filteredAssessments.length === 0 && (
                    <div className="col-span-full py-32 text-center glass rounded-[4rem] border-dashed border-2 border-border/50">
                        <HiOutlineBeaker className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-10" />
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter opacity-20">No Results Found</h3>
                        <p className="text-muted-foreground font-medium mt-2">Create a new assessment to begin evaluating candidates</p>
                    </div>
                )}
            </div>

        </div>
    );
}
