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
    HiOutlineCommandLine,
    HiOutlineUserGroup,
    HiOutlineChartBar,
    HiOutlineDocumentText,
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

    const activeAssessments = assessments.filter(a => a.is_active !== false).length;
    const totalQuestions = assessments.reduce((sum, a) => sum + (a.questions_count || 0), 0);
    const totalSessions = assessments.reduce((sum, a) => sum + (a.session_count || 0), 0);

    if (loading) return (
        <div className="space-y-6 px-12">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
            <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
            <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-[2rem] animate-pulse" />)}</div>
        </div>
    );

    return (
        <div className="space-y-6 px-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">Assessments</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                        <HiOutlineCommandLine className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
                        <p className="text-muted-foreground mt-1">Create and manage coding assessments for candidates</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/recruiter/assessments/create')}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm"
                >
                    <HiOutlinePlus className="w-5 h-5" /> Create New
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Assessments', value: assessments.length, icon: HiOutlineBeaker, color: 'from-purple-500/10 to-purple-600/5 text-purple-500' },
                    { label: 'Active', value: activeAssessments, icon: HiOutlineChartBar, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500' },
                    { label: 'Total Sessions', value: totalSessions, icon: HiOutlineUserGroup, color: 'from-blue-500/10 to-blue-600/5 text-blue-500' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-foreground">{stat.value}</div>
                            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold flex items-center gap-2.5">
                    <HiOutlineXMark className="w-5 h-5" /> {error}
                </div>
            )}
            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center gap-2.5">
                    <HiOutlineSparkles className="w-5 h-5" /> {successMsg}
                </motion.div>
            )}

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                    <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search assessments..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:border-emerald-500/50 outline-none transition-all text-sm" />
                </div>
                <span className="text-xs text-muted-foreground">{filteredAssessments.length} of {assessments.length}</span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredAssessments.map((a, i) => (
                    <AssessmentSetupCard
                        key={a.assessment_id}
                        assessment={a}
                        index={i}
                        onEdit={(assessment) => router.push(`/recruiter/assessments/${assessment.assessment_id}`)}
                        onDelete={handleArchive}
                        onSessions={(assessment) => router.push(`/recruiter/assessments/${assessment.assessment_id}/sessions`)}
                    />
                ))}
                {filteredAssessments.length === 0 && (
                    <div className="col-span-full bg-card border border-border rounded-[2rem] p-16 text-center">
                        <HiOutlineBeaker className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                        <h2 className="text-xl font-bold text-foreground mb-2">{search ? 'No Results Found' : 'No Assessments Yet'}</h2>
                        <p className="text-muted-foreground">Create a new assessment to begin evaluating candidates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
