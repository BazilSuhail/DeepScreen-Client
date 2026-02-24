'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineClock, HiOutlineCheckCircle, HiOutlineBeaker,
    HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineArrowUpTray,
    HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { CodeEditor } from '@/components/CodeEditorMonaco';

const LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'go', 'rust'];

const DIFFICULTY_COLORS = {
    easy: 'bg-emerald-500/10 text-emerald-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    hard: 'bg-red-500/10 text-red-400',
};

// ── Timer ────────────────────────────────────────────────────────────────────
function Timer({ startedAt, durationMinutes }) {
    const [remaining, setRemaining] = useState(null);

    useEffect(() => {
        if (!startedAt) return;
        const deadline = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
        const tick = () => setRemaining(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startedAt, durationMinutes]);

    if (remaining === null) return null;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    const urgent = remaining < 300; // last 5 min

    return (
        <div className={`flex items-center gap-2 font-black tabular-nums text-lg px-4 py-2 rounded-xl ${urgent ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-emerald-500 bg-emerald-500/10'}`}>
            <HiOutlineClock className="w-5 h-5" />
            {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
    );
}

export default function TakeAssessmentPage() {
    const { id: submissionId } = useParams();
    const router = useRouter();

    const [data, setData] = useState(null);     // { assessment, problems, submission }
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);  // post-submit result

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});  // { problem_id: { code, language } }
    const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'editor'

    // Load submission details
    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/assessments/take/${submissionId}/`);
                setData(res);
                // Pre-fill answers from saved state if any
                if (res.submission.answers) setAnswers(res.submission.answers);
            } catch (e) {
                setError('Failed to load assessment. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        if (submissionId) load();
    }, [submissionId]);

    // Start / resume the assessment
    const handleStart = async () => {
        setStarting(true);
        try {
            await api.post('/assessments/start/', { submission_id: submissionId });
            // Reload to get updated started_at
            const res = await api.get(`/assessments/take/${submissionId}/`);
            setData(res);
        } catch (e) {
            setError(e.message || 'Failed to start assessment');
        } finally {
            setStarting(false);
        }
    };

    const setAnswer = (problemId, field, val) => {
        setAnswers(prev => ({
            ...prev,
            [problemId]: { ...(prev[problemId] || { code: '', language: 'python' }), [field]: val },
        }));
    };

    const handleSubmit = async () => {
        if (!confirm('Submit your assessment? You cannot change answers after submission.')) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await api.post(`/assessments/submit/${submissionId}/`, { answers });
            setResult(res);
        } catch (e) {
            setError(e.message || 'Submission failed. Please retry.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[100vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
    );

    if (error && !data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
            <HiOutlineExclamationTriangle className="w-12 h-12 text-red-400" />
            <p className="text-xl font-bold text-red-400">{error}</p>
            <button onClick={() => router.back()} className="px-6 py-3 rounded-2xl bg-secondary font-bold">Go Back</button>
        </div>
    );

    const { assessment, problems = [], submission } = data || {};
    const problem = problems[currentIdx];
    const ans = answers[problem?.problem_id] || { code: '', language: problem?.allowed_languages?.[0] || 'python' };

    // ── Post-submit result screen ─────────────────────────────────────────────
    if (result) {
        const sub = result.submission;
        const res = result.result;
        const passed = sub.status === 'passed';

        return (
            <div className="max-w-2xl mx-auto p-8 space-y-8 min-h-[60vh] flex flex-col justify-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className={`glass border rounded-[3rem] p-10 text-center space-y-4 ${passed ? 'border-emerald-500/30' : 'border-red-500/20'}`}>
                    <div className={`text-6xl font-black ${passed ? 'text-emerald-500' : 'text-red-400'}`}>
                        {res.percentage.toFixed(0)}%
                    </div>
                    <h2 className={`text-2xl font-black ${passed ? 'text-emerald-500' : 'text-red-400'}`}>
                        {passed ? '🎉 Assessment Passed!' : 'Assessment Submitted'}
                    </h2>
                    <p className="text-muted-foreground">
                        {passed
                            ? 'Excellent work! The recruiter will be notified.'
                            : `You scored ${res.percentage.toFixed(0)}% — passing score is ${assessment.passing_score}%.`}
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="glass p-4 rounded-2xl border border-emerald-500/10">
                            <div className="text-2xl font-black">{res.total_score}</div>
                            <div className="text-xs opacity-50 mt-1">Points Earned</div>
                        </div>
                        <div className="glass p-4 rounded-2xl border border-emerald-500/10">
                            <div className="text-2xl font-black">{res.max_score}</div>
                            <div className="text-xs opacity-50 mt-1">Max Points</div>
                        </div>
                        <div className="glass p-4 rounded-2xl border border-emerald-500/10">
                            <div className="text-2xl font-black">{sub.time_taken_minutes ?? '—'}</div>
                            <div className="text-xs opacity-50 mt-1">Minutes Used</div>
                        </div>
                    </div>
                    <button onClick={() => router.push('/candidate/applications')}
                        className="mt-4 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all">
                        View My Applications
                    </button>
                </motion.div>
            </div>
        );
    }

    // ── Pre-start screen ──────────────────────────────────────────────────────
    if (submission?.status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto p-8 space-y-6 flex flex-col justify-center min-h-[70vh]">
                <div className="glass border border-emerald-500/10 rounded-[3rem] p-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <HiOutlineBeaker className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">{assessment?.title}</h1>
                            <p className="text-sm text-muted-foreground">{assessment?.duration_minutes} minutes · {problems.length} problems</p>
                        </div>
                    </div>
                    {assessment?.description && (
                        <p className="text-muted-foreground leading-relaxed">{assessment.description}</p>
                    )}
                    <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
                        <strong>Important:</strong> Once you start, the timer begins and cannot be paused. Make sure you have a stable internet connection.
                    </div>
                    {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>}
                    <button onClick={handleStart} disabled={starting}
                        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                        {starting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineCheckCircle className="w-6 h-6" />}
                        {starting ? 'Starting...' : 'Begin Assessment'}
                    </button>
                </div>
            </div>
        );
    }

    // ── Taking screen ─────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border glass shrink-0">
                <div className="flex items-center gap-4">
                    <span className="font-black text-sm truncate max-w-[200px]">{assessment?.title}</span>
                    <div className="hidden md:flex items-center gap-1">
                        {problems.map((p, i) => (
                            <button key={p.problem_id} onClick={() => setCurrentIdx(i)}
                                className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${i === currentIdx ? 'bg-emerald-600 text-white' :
                                        answers[p.problem_id]?.code ? 'bg-emerald-500/10 text-emerald-500' :
                                            'bg-secondary text-muted-foreground'
                                    }`}>{i + 1}</button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Timer startedAt={submission?.started_at} durationMinutes={assessment?.duration_minutes} />
                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all">
                        {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineArrowUpTray className="w-4 h-4" />}
                        Submit All
                    </button>
                </div>
            </div>

            {error && (
                <div className="mx-6 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm shrink-0">{error}</div>
            )}

            {/* Main workspace */}
            {problem && (
                <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Left: Problem */}
                    <div className="overflow-y-auto p-6 border-r border-border space-y-5">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-xs font-black">{currentIdx + 1}</span>
                            <h2 className="font-black text-xl">{problem.title}</h2>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${DIFFICULTY_COLORS[problem.difficulty]}`}>{problem.difficulty}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{problem.points} pts</span>
                        </div>

                        <div className="prose prose-sm prose-invert max-w-none">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{problem.problem_statement}</p>
                        </div>

                        {problem.input_format && (
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-40">Input Format</p>
                                <p className="text-sm text-muted-foreground">{problem.input_format}</p>
                            </div>
                        )}
                        {problem.output_format && (
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-40">Output Format</p>
                                <p className="text-sm text-muted-foreground">{problem.output_format}</p>
                            </div>
                        )}
                        {problem.constraints && (
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-40">Constraints</p>
                                <pre className="text-xs bg-secondary p-3 rounded-xl font-mono">{problem.constraints}</pre>
                            </div>
                        )}

                        {/* Sample test cases */}
                        {problem.public_test_cases?.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-black uppercase tracking-widest opacity-40">Examples</p>
                                {problem.public_test_cases.map((tc, i) => (
                                    <div key={i} className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold opacity-40">Input {i + 1}</p>
                                            <pre className="text-xs bg-secondary p-3 rounded-xl font-mono">{tc.input}</pre>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold opacity-40">Expected Output</p>
                                            <pre className="text-xs bg-secondary p-3 rounded-xl font-mono">{tc.expected_output}</pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between pt-4">
                            <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-secondary text-sm font-bold disabled:opacity-30 transition-all">
                                <HiOutlineChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <button disabled={currentIdx === problems.length - 1} onClick={() => setCurrentIdx(i => i + 1)}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-secondary text-sm font-bold disabled:opacity-30 transition-all">
                                Next <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Editor */}
                    <div className="flex flex-col overflow-hidden p-4 gap-3">
                        {/* Language selector */}
                        <div className="flex gap-2 flex-wrap shrink-0">
                            {(problem.allowed_languages?.length ? problem.allowed_languages : LANGUAGES).map(lang => (
                                <button key={lang} onClick={() => setAnswer(problem.problem_id, 'language', lang)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${ans.language === lang
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                            : 'bg-secondary text-muted-foreground border-border'
                                        }`}>{lang}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 min-h-0">
                            <CodeEditor
                                value={ans.code}
                                language={ans.language}
                                onChange={val => setAnswer(problem.problem_id, 'code', val)}
                            />
                        </div>
                        <div className="shrink-0 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{ans.code ? `${ans.code.split('\n').length} lines` : 'Empty'}</span>
                            {ans.code && <span className="text-emerald-500 font-bold">✓ Answer saved</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
