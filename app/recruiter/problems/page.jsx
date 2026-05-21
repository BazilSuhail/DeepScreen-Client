'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlinePlus,
    HiOutlinePuzzlePiece,
    HiOutlineTag,
    HiOutlineXMark,
    HiOutlineCodeBracket,
    HiOutlineBeaker,
    HiOutlineLightBulb,
    HiOutlineArrowPath,
    HiOutlineInformationCircle,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';

const linkButton = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20';

const fieldLabel = 'flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground';
const fieldInput = 'w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500';
const fieldHint = 'px-1 text-xs text-muted-foreground/70';

const difficultyStyles = {
    easy: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    medium: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
    hard: 'border-red-500/20 bg-red-500/10 text-red-500',
};

export default function RecruiterProblemsPage() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const [attempt, setAttempt] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        problem_statement: '',
        difficulty: 'easy',
        points: 100,
        organization: '',
        public_test_cases: [{}],
        hidden_test_cases: [{}],
        order_number: 1,
        allowed_languages: ['python', 'javascript']
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch orgs first to list problems for current org
                const orgs = await api.get('/organizations/');
                setOrganizations(orgs);
                if (orgs.length > 0) {
                    const data = await api.get(`/assessments/problems/?organization_id=${orgs[0].org_id}`);
                    setProblems(data);
                    setFormData(prev => ({ ...prev, organization: orgs[0].org_id }));
                }
            } catch (err) {
                console.error(err);
                setError('We could not load the problem bank. Check your connection and try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [attempt]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assessments/problems/', formData);
            setIsCreateModalOpen(false);
            // Refresh
            const data = await api.get(`/assessments/problems/?organization_id=${formData.organization}`);
            setProblems(data);
        } catch (err) {
            alert('Failed to create problem');
        }
    };

    if (loading) return <PageSkeleton stats={0} cards={3} />;

    const easyCount = problems.filter(p => p.difficulty === 'easy').length;
    const nextStep = problems.length === 0
        ? 'Next step: create your first coding challenge to reuse across assessments.'
        : 'Next step: add problems to an assessment so candidates can attempt them.';

    return (
        <div className="mx-auto w-full min-w-0 space-y-10 px-4 pb-20 md:px-8">
            <DashboardBanner
                icon={HiOutlineBeaker}
                badge={{ label: `${problems.length} ${problems.length === 1 ? 'problem' : 'problems'}`, icon: HiOutlineCodeBracket }}
                title="Problem Bank"
                subtitle={`${easyCount} easy, ${problems.length - easyCount} medium or hard, ready for your assessments`}
                footer={
                    <span className="flex items-start gap-2">
                        <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                        <span>{nextStep}</span>
                    </span>
                }
            />

            {error && (
                <div className="flex flex-col items-start gap-2">
                    <FormError title="Something went wrong" message={error} />
                    <button type="button" onClick={retry} title="Try loading the problem bank again" className={linkButton}>
                        <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
                    </button>
                </div>
            )}

            <section className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                            <HiOutlinePuzzlePiece className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold tracking-tight">Reusable challenges</h2>
                            <p className="text-xs text-muted-foreground/60">Reusable coding challenges for your assessments</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        title="Write a new coding challenge"
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
                    >
                        <HiOutlinePlus className="h-5 w-5" aria-hidden="true" />
                        Create Problem
                    </button>
                </div>

                {problems.length === 0 ? (
                    !error && (
                        <EmptyState
                            icon={HiOutlineCodeBracket}
                            title="No problems yet"
                            text="Create a coding challenge once, then reuse it in any assessment."
                            action={
                                <button type="button" onClick={() => setIsCreateModalOpen(true)} className={linkButton}>
                                    <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create Problem
                                </button>
                            }
                        />
                    )
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:gap-6">
                        {problems.map((prob, i) => (
                            <motion.div
                                key={prob.problem_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-emerald-500/30 sm:flex-row sm:items-center sm:justify-between lg:p-6"
                            >
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                        <HiOutlineCodeBracket className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-emerald-500">{prob.title}</h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-3">
                                            <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${difficultyStyles[prob.difficulty] || 'border-border bg-muted text-muted-foreground'}`}>
                                                {prob.difficulty}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Points a correct solution earns">
                                                <HiOutlineTag className="h-3 w-3" aria-hidden="true" />
                                                {prob.points} Points
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Create Problem Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="create-problem-title"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
                        >
                            <div className="flex items-center justify-between gap-4 border-b border-border bg-emerald-500/5 p-5 sm:p-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                        <HiOutlineCodeBracket className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <h2 id="create-problem-title" className="text-xl font-semibold">Create Problem</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    aria-label="Close"
                                    title="Close without saving"
                                    className="rounded-xl p-2 transition-all hover:bg-secondary"
                                >
                                    <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="scrollbar-hide flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
                                <div className="space-y-2">
                                    <label htmlFor="problem-title" className={fieldLabel}>
                                        <HiOutlineTag className="h-3.5 w-3.5" aria-hidden="true" /> Problem Title
                                    </label>
                                    <input
                                        id="problem-title"
                                        required value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className={fieldInput}
                                        placeholder="e.g. Reverse a String"
                                    />
                                    <p className={fieldHint}>A short name candidates see in the assessment.</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="problem-statement" className={fieldLabel}>
                                        <HiOutlineInformationCircle className="h-3.5 w-3.5" aria-hidden="true" /> Problem Statement
                                    </label>
                                    <textarea
                                        id="problem-statement"
                                        required rows="4" value={formData.problem_statement}
                                        onChange={(e) => setFormData({...formData, problem_statement: e.target.value})}
                                        className={`${fieldInput} resize-none`}
                                        placeholder="Write a function that..."
                                    />
                                    <p className={fieldHint}>Describe the input, the expected output, and any constraints.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="problem-difficulty" className={fieldLabel}>
                                            <HiOutlineBeaker className="h-3.5 w-3.5" aria-hidden="true" /> Difficulty
                                        </label>
                                        <select
                                            id="problem-difficulty"
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                            className={`${fieldInput} appearance-none`}
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                        <p className={fieldHint}>Easy is a warm-up. Hard tests deep problem solving.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="problem-points" className={fieldLabel}>
                                            <HiOutlineTag className="h-3.5 w-3.5" aria-hidden="true" /> Points
                                        </label>
                                        <input
                                            id="problem-points"
                                            type="number" value={formData.points}
                                            onChange={(e) => setFormData({...formData, points: e.target.value})}
                                            className={fieldInput}
                                        />
                                        <p className={fieldHint}>Points awarded for a correct solution.</p>
                                    </div>
                                </div>
                            </form>

                            <div className="flex flex-col-reverse justify-end gap-3 border-t border-border bg-emerald-500/5 p-5 sm:flex-row sm:p-6">
                                <button
                                    type="button" onClick={() => setIsCreateModalOpen(false)}
                                    title="Discard this problem"
                                    className="rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    title="Save this problem to the bank"
                                    className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
                                >
                                    Save Problem
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
