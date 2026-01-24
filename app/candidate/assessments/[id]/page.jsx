'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import CodeEditor from '@/components/assessments/CodeEditor';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlineClock, 
    HiOutlineCheckCircle, 
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineRocketLaunch,
    HiOutlineQuestionMarkCircle,
    HiOutlineCommandLine,
    HiOutlineCpuChip
} from 'react-icons/hi2';

export default function CodingEnvironmentPage() {
    const { id: submissionId } = useParams();
    const router = useRouter();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeProblemIdx, setActiveProblemIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const res = await api.get(`/assessments/take/${submissionId}/`);
                setData(res);
                
                // Initialize answers if empty
                const initialAnswers = {};
                res.problems.forEach(p => {
                    initialAnswers[p.problem_id] = { code: '', language: 'python' };
                });
                setAnswers(initialAnswers);

                // Setup timer
                if (res.submission.started_at) {
                    const start = new Date(res.submission.started_at).getTime();
                    const duration = res.assessment.duration_minutes * 60 * 1000;
                    const end = start + duration;
                    const now = new Date().getTime();
                    setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [submissionId]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCodeChange = (code) => {
        const problemId = data.problems[activeProblemIdx].problem_id;
        setAnswers(prev => ({
            ...prev,
            [problemId]: { ...prev[problemId], code }
        }));
    };

    const handleSubmit = async () => {
        if (!confirm('Are you sure you want to submit your assessment? This action cannot be undone.')) return;
        setSubmitting(true);
        try {
            await api.post(`/assessments/submit/${submissionId}/`, { answers });
            router.push('/candidate/applications');
        } catch (err) {
            alert('Failed to submit assessment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !data) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    const activeProblem = data.problems[activeProblemIdx];

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 bg-[#1a1a1a] border-b border-white/5 sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <HiOutlineRocketLaunch className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight">{data.assessment.title}</h1>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Problem {activeProblemIdx + 1} of {data.problems.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border ${timeLeft < 300 ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-white/10 bg-white/5'}`}>
                        <HiOutlineClock className="w-5 h-5" />
                        <span className="font-black text-lg tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Finish Test'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Problem Statement */}
                <div className="w-1/3 overflow-y-auto border-r border-white/5 p-8 space-y-8 scrollbar-hide">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 w-fit px-3 py-1 rounded-lg">
                            <HiOutlineQuestionMarkCircle className="w-4 h-4" />
                            Description
                        </div>
                        <h2 className="text-3xl font-black">{activeProblem.title}</h2>
                        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed">
                            {activeProblem.problem_statement}
                        </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-white/5">
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Input Format</h4>
                            <p className="text-sm bg-white/5 p-4 rounded-xl border border-white/5">{activeProblem.input_format}</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Output Format</h4>
                            <p className="text-sm bg-white/5 p-4 rounded-xl border border-white/5">{activeProblem.output_format}</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Constraints</h4>
                            <p className="text-sm font-mono text-emerald-500/80">{activeProblem.constraints}</p>
                        </div>
                    </div>

                    {activeProblem.sample_input && (
                        <div className="space-y-4 pt-8 border-t border-white/5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Example Cases</h4>
                            <div className="bg-black/40 rounded-2xl overflow-hidden border border-white/5">
                                <div className="px-4 py-2 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5">Input</div>
                                <pre className="p-4 text-sm font-mono text-emerald-500/80">{activeProblem.sample_input}</pre>
                                <div className="px-4 py-2 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 border-t">Output</div>
                                <pre className="p-4 text-sm font-mono text-white/80">{activeProblem.sample_output}</pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Editor */}
                <div className="flex-1 flex flex-col bg-[#141414] p-4 gap-4">
                    <div className="flex-1">
                        <CodeEditor 
                            height="100%"
                            language={answers[activeProblem.problem_id]?.language || 'python'}
                            value={answers[activeProblem.problem_id]?.code || ''}
                            onChange={handleCodeChange}
                        />
                    </div>
                    
                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-bold border border-white/5">
                                <HiOutlineCpuChip className="w-4 h-4" />
                                Run Sample Tests
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                disabled={activeProblemIdx === 0}
                                onClick={() => setActiveProblemIdx(prev => prev - 1)}
                                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/5 transition-all"
                            >
                                <HiOutlineChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-black uppercase tracking-widest text-white/40">
                                {activeProblemIdx + 1} / {data.problems.length}
                            </span>
                            <button 
                                disabled={activeProblemIdx === data.problems.length - 1}
                                onClick={() => setActiveProblemIdx(prev => prev + 1)}
                                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/5 transition-all"
                            >
                                <HiOutlineChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
