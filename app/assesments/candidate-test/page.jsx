"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    HiOutlineLightningBolt,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineClock,
    HiOutlineTerminal,
    HiOutlinePlay,
    HiOutlineCloudUpload,
    HiOutlineInformationCircle,
    HiOutlineMenuAlt2,
    HiOutlineChip,
    HiOutlineChartBar,
    HiOutlineShieldCheck
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

/**
 * 📊 MOCK DATA CONFIGURATION
 * Centralized data protocols for the assessment.
 */
const MOCK_TEST_PROTOCOL = {
    test_id: "DS-EXAM-299",
    title: "Full-Stack Neural Proficiency Test",
    total_time_seconds: 3600,
    metrics: [
        { label: "Duration", value: "60 mins", icon: HiOutlineClock },
        { label: "Complexity", value: "Hard", icon: HiOutlineChip },
        { label: "Test Cases", value: "3 Vectors", icon: HiOutlineTerminal },
        { label: "Environment", value: "Node/JS", icon: HiOutlineLightningBolt }
    ],
    problem: {
        id: "Q-702",
        title: "Matrix Path Optimization",
        points: 500,
        difficulty: "Hard",
        description: `
### Challenge Objective
You are given an $m x n$ grid filled with non-negative numbers. Find a path from the top-left to the bottom-right which minimizes the sum of all numbers along its path.

**Note:** You can only move either down or right at any point in time.

### Input Format
- A 2D array of integers \`grid[m][n]\`.

### Output Format
- Return a single integer representing the minimum path sum.

### Sample Case
\`\`\`javascript
Input: grid = [[1,3,1],[1,5,1],[4,2,1]]
Output: 7
Explanation: Path 1→3→1→1→1 minimizes the sum.
\`\`\`
        `,
        initial_code: "/**\n * @param {number[][]} grid\n * @return {number}\n */\nvar minPathSum = function(grid) {\n    // Implement your neural logic here\n    \n};",
        test_vectors: [
            { id: 1, name: "Base Scenario", input: "[[1,3,1],[1,5,1],[4,2,1]]", expected: "7" },
            { id: 2, name: "Row Major Vector", input: "[[1,2,3],[4,5,6]]", expected: "12" },
            { id: 3, name: "Unbalanced Grid", input: "[[1,2],[1,1],[4,2]]", expected: "5" }
        ],
        mock_output_stream: [
            "Initializing Node.js Virtualization Container...",
            "Loading Neural Core Engine v4.2...",
            "Compiling syntax tree...",
            "Memory allocated: 256MB",
            "Starting execution of 3 test vectors...",
            "Executing Test Case #1: Passed (12ms)",
            "Executing Test Case #2: Passed (8ms)",
            "Executing Test Case #3: Calculating..."
        ]
    }
};

// --- REUSABLE SUB-COMPONENTS ---

const BriefingCard = ({ icon: Icon, label, value }) => (
    <div className="p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className="text-emerald-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-lg font-black text-slate-900">{value}</p>
    </div>
);

const ConsoleLine = ({ text }) => (
    <div className="flex gap-3 mb-1 font-mono text-[12px]">
        <span className="text-emerald-500/50">›</span>
        <span className="text-slate-400">{text}</span>
    </div>
);

const TestResultRow = ({ res, index }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-emerald-500/20 transition-all animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 150}ms` }}>
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-500 tracking-tighter uppercase">Vector #{res.id}</span>
                <span className="text-[10px] font-bold text-slate-300">{res.name}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 mt-1 truncate max-w-[180px]">In: {res.input}</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase tracking-widest ${res.status === 'passed' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {res.status}
                </span>
                <span className="text-[9px] font-bold text-slate-600">8ms</span>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${res.status === 'passed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {res.status === 'passed' ? <HiOutlineCheck size={18} /> : <HiOutlineX size={18} />}
            </div>
        </div>
    </div>
);

// --- MAIN ASSESSMENT COMPONENT ---

export default function CandidateTest() {
    const [testStarted, setTestStarted] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [code, setCode] = useState(MOCK_TEST_PROTOCOL.problem.initial_code);
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [timeLeft, setTimeLeft] = useState(MOCK_TEST_PROTOCOL.total_time_seconds);
    const [consoleOutput, setConsoleOutput] = useState([]);

    // Timer logic
    useEffect(() => {
        let timer;
        if (testStarted && !submitted && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [testStarted, submitted, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    /**
     * Executes code simulation by streaming mock output lines
     * and revealing test results.
     */
    const handleRunCode = () => {
        if (running) return;
        setRunning(true);
        setResults(null);
        setConsoleOutput([]);

        let lineIndex = 0;
        const streamInterval = setInterval(() => {
            if (lineIndex < MOCK_TEST_PROTOCOL.problem.mock_output_stream.length) {
                setConsoleOutput(prev => [...prev, MOCK_TEST_PROTOCOL.problem.mock_output_stream[lineIndex]]);
                lineIndex++;
            } else {
                clearInterval(streamInterval);
                setResults(MOCK_TEST_PROTOCOL.problem.test_vectors.map(tv => ({
                    ...tv,
                    status: Math.random() > 0.2 ? 'passed' : 'failed'
                })));
                setConsoleOutput(prev => [...prev.slice(0, -1), "Executing Test Case #3: Passed (14ms)", "All vectors processed.", "Neural health: 100%"]);
                setRunning(false);
            }
        }, 300);
    };

    const handleSubmit = () => {
        if (!window.confirm("FINAL COMMIT: This will finalize your responses. Proceed?")) return;
        setSubmitted(true);
    };

    // --- RENDER: ENTRY SCREEN ---
    if (!testStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-poppins selection:bg-emerald-100">
                <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-[40px] p-12 shadow-2xl space-y-10 animate-in zoom-in-95 duration-500">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto border border-emerald-100 italic font-black text-2xl text-emerald-500 shadow-xl shadow-emerald-500/10 transition-transform hover:scale-105 duration-300">
                            DS
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Mission Deck: Assessment</h1>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{MOCK_TEST_PROTOCOL.test_id}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-[32px] p-8 space-y-8 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                <HiOutlineInformationCircle className="text-emerald-500" />
                                Pre-Flight Intelligence
                            </h3>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">STABLE CONNECTION</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {MOCK_TEST_PROTOCOL.metrics.map((m, i) => (
                                <BriefingCard key={i} {...m} />
                            ))}
                        </div>

                        <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Rules</p>
                            <ul className="text-slate-500 text-[13px] font-medium space-y-3">
                                <li className="flex items-start gap-3">
                                    <HiOutlineShieldCheck className="text-emerald-500 shrink-0 mt-0.5" />
                                    <span>Browser environment is continuously tracked for anomalous activity.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <HiOutlineCheck className="text-emerald-500 shrink-0 mt-0.5" />
                                    <span>Logic accuracy and time efficiency both contribute to neural score.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => setTestStarted(true)}
                        className="w-full bg-slate-900 text-white h-16 rounded-[24px] font-black text-sm tracking-tight shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <span>Initiate Logic Protocol</span>
                        <HiOutlinePlay size={20} className="text-emerald-400" />
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: FINAL RESULTS SCREEN ---
    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 font-poppins">
                <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in duration-1000">
                    <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                        <HiOutlineCheck size={48} className="text-white" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Transmission Secured</h1>
                        <p className="text-slate-500 font-medium">Your logic protocol has been submitted for neural indexing.</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 grid grid-cols-2 gap-8 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                            <p className="text-3xl font-black text-emerald-600">98.4%</p>
                        </div>
                        <div className="space-y-1 border-l border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">ELITE</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/candidate/dashboard')}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: ACTIVE TEST WORKSPACE ---
    return (
        <div className="min-h-screen bg-slate-900 font-poppins text-slate-300 uppercase-none selection:bg-emerald-500/20">

            {/* Nav Header */}
            <div className="h-16 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-emerald-500/10">DS</div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 leading-none mb-1">LIVE ASSESSMENT</span>
                            <span className="text-xs font-bold text-white leading-none">{MOCK_TEST_PROTOCOL.test_id}</span>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-white/10"></div>
                    <h2 className="text-sm font-bold text-white/90 tracking-tight">{MOCK_TEST_PROTOCOL.problem.title}</h2>
                </div>

                <div className="flex items-center gap-8">
                    <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border transition-all duration-500 ${timeLeft < 300 ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "bg-white/5 border-white/10 text-white"}`}>
                        <HiOutlineClock className={timeLeft < 300 ? "animate-pulse" : "text-emerald-500"} />
                        <span className="text-sm font-black tabular-nums tracking-wider">{formatTime(timeLeft)}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-8 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                    >
                        <HiOutlineCloudUpload size={18} />
                        Deploy Solution
                    </button>
                </div>
            </div>

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">

                {/* Left: Challenge Specifications */}
                <div className="w-[35%] border-r border-white/5 bg-[#0f1117] flex flex-col">
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-slate-900/80 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500">
                        <HiOutlineMenuAlt2 />
                        <span>Question Specification</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                {MOCK_TEST_PROTOCOL.problem.difficulty}
                            </span>
                            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
                                <HiOutlineChartBar size={14} />
                                <span>{MOCK_TEST_PROTOCOL.problem.points} POINTS</span>
                            </div>
                        </div>
                        <div className="prose prose-invert prose-emerald max-w-none">
                            <div className="whitespace-pre-wrap leading-relaxed text-slate-400 text-[15px] font-medium opacity-80 italic">
                                {MOCK_TEST_PROTOCOL.problem.description}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Logic & Execution Workspace */}
                <div className="flex-1 flex flex-col bg-[#08090d]">
                    {/* Editor Area */}
                    <div className="flex-1 relative flex flex-col">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-900/40">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <HiOutlineChip />
                                <span>IDE Workspace: neural_logic.js</span>
                            </div>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 w-full bg-transparent p-10 font-mono text-[15px] leading-relaxed text-emerald-400 outline-none resize-none selection:bg-emerald-500/20 custom-scrollbar"
                            spellCheck="false"
                        />
                    </div>

                    {/* Simulation & Result Plane */}
                    <div className="h-[40%] border-t border-white/5 bg-[#0a0b10] flex flex-col group overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-900/50">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <HiOutlineTerminal />
                                <span>Execution Console</span>
                            </div>
                            <button
                                onClick={handleRunCode}
                                disabled={running}
                                className="flex items-center gap-3 bg-emerald-500 text-slate-900 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
                            >
                                {running ? <AiOutlineLoading3Quarters className="animate-spin" /> : <HiOutlinePlay />}
                                Run Test Vectors
                            </button>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                            {/* Scrolling Console Output */}
                            <div className="w-1/2 overflow-y-auto p-8 custom-scrollbar border-r border-white/5 bg-black/20">
                                {consoleOutput.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-40">
                                        <HiOutlineTerminal size={32} className="mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting execution command</p>
                                    </div>
                                ) : (
                                    consoleOutput.map((line, i) => <ConsoleLine key={i} text={line} />)
                                )}
                            </div>

                            {/* Validation Metrics */}
                            <div className="w-1/2 p-8 overflow-y-auto custom-scrollbar bg-slate-950/30">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Validation Protocol Status</h4>
                                    {results && (
                                        <span className="text-[9px] font-black text-emerald-500 uppercase">
                                            {results.filter(r => r.status === 'passed').length}/{results.length} PASSED
                                        </span>
                                    )}
                                </div>
                                {!results && !running ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-40">
                                        <HiOutlineChartBar size={32} className="mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Metrics data empty</p>
                                    </div>
                                ) : running ? (
                                    <div className="flex items-center justify-center h-full">
                                        <AiOutlineLoading3Quarters className="animate-spin text-emerald-500/20 text-3xl" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {results.map((res, i) => (
                                            <TestResultRow key={i} res={res} index={i} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}