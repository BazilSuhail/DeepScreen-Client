"use client";

import React, { useState, useEffect, useRef } from 'react';
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
    HiOutlineShieldCheck,
    HiOutlinePencilAlt,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineSave,
    HiOutlineCog
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

/**
 * --- CUSTOM MARKDOWN PARSER (FROM SCRATCH) ---
 * No external libraries used. Handles Bullets, Bold, and Headings.
 */
const MarkdownParser = ({ content }) => {
    if (!content) return null;

    const parseInline = (text) => {
        // Handle bold: **text**
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const lines = content.split('\n');
    const elements = [];
    let currentList = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            currentList.push(
                <li key={`li-${index}`} className="flex items-start gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                    <span className="text-slate-600 font-medium leading-relaxed">
                        {parseInline(trimmed.slice(2))}
                    </span>
                </li>
            );
        } else {
            // If we have a list accumulated, push it
            if (currentList.length > 0) {
                elements.push(<ul key={`ul-${index}`} className="mb-6 space-y-1">{currentList}</ul>);
                currentList = [];
            }

            // Headings
            if (trimmed.startsWith('### ')) {
                elements.push(<h3 key={index} className="text-lg font-black text-slate-900 mt-8 mb-3 uppercase tracking-tight">{parseInline(trimmed.slice(4))}</h3>);
            } else if (trimmed.startsWith('## ')) {
                elements.push(<h2 key={index} className="text-xl font-black text-slate-900 mt-10 mb-4 tracking-tighter border-b-2 border-slate-100 pb-2">{parseInline(trimmed.slice(3))}</h2>);
            } else if (trimmed.startsWith('# ')) {
                elements.push(<h1 key={index} className="text-3xl font-black text-slate-900 mt-12 mb-6 tracking-tighter">{parseInline(trimmed.slice(2))}</h1>);
            } else if (trimmed) {
                // Paragraph
                elements.push(<p key={index} className="text-slate-500 text-[15px] leading-relaxed mb-6 font-medium">{parseInline(line)}</p>);
            }
        }
    });

    // Final list flush
    if (currentList.length > 0) {
        elements.push(<ul key="ul-final" className="mb-6">{currentList}</ul>);
    }

    return <div className="markdown-body">{elements}</div>;
};

/**
 * --- RECRUITER SETUP COMPONENTS ---
 */

const TestField = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
        />
    </div>
);

const TestCaseItem = ({ test, onUpdate, onDelete }) => (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm group">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Vector #{test.id}</span>
            <button onClick={() => onDelete(test.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                <HiOutlineTrash size={18} />
            </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Input Data</label>
                <input
                    value={test.input}
                    onChange={(e) => onUpdate(test.id, 'input', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none"
                    placeholder="e.g. [[1,2],[3,4]]"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected Output</label>
                <input
                    value={test.expected}
                    onChange={(e) => onUpdate(test.id, 'expected', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none"
                    placeholder="e.g. 7"
                />
            </div>
        </div>
        <input
            value={test.name}
            onChange={(e) => onUpdate(test.id, 'name', e.target.value)}
            className="w-full bg-transparent border-b border-slate-100 py-1 text-[11px] font-bold text-slate-400 outline-none focus:border-emerald-500 transition-all"
            placeholder="Case name (e.g. Edge Case)"
        />
    </div>
);

/**
 * --- MAIN COMPONENT ---
 */
export default function AssessmentEngine() {
    const [mode, setMode] = useState('recruiter'); // 'candidate' | 'recruiter'
    const [testStarted, setTestStarted] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [consoleOutput, setConsoleOutput] = useState([]);

    // --- SHARED DATA STATE ---
    const [metadata, setMetadata] = useState({
        test_id: "DS-EXAM-299",
        title: "Full-Stack Neural Proficiency Test",
        total_time_seconds: 3600,
        difficulty: "Hard",
        points: 500
    });

    const [description, setDescription] = useState(`
# Matrix Optimization
## Challenge Objective
You are given an **m x n** grid filled with non-negative numbers. Find a path from the top-left to the bottom-right which minimizes the sum of all numbers along its path.

### Core Constraints
- You can only move either **down** or **right**
- The grid consists of positive integers only
- The maximum grid size is 100x100

### Evaluation Criteria
- Technical Accuracy (O(N*M))
- Communication Clarity
- Memory Overhead
    `);

    const [testCases, setTestCases] = useState([
        { id: 1, name: "Base Scenario", input: "[[1,3,1],[1,5,1],[4,2,1]]", expected: "7" },
        { id: 2, name: "Row Major Vector", input: "[[1,2,3],[4,5,6]]", expected: "12" }
    ]);

    const [code, setCode] = useState("/**\n * @param {number[][]} grid\n * @return {number}\n */\nvar minPathSum = function(grid) {\n    // Implement your neural logic here\n    \n};");

    // --- RECRUITER LOGIC ---
    const addTestCase = () => {
        const newId = testCases.length > 0 ? Math.max(...testCases.map(t => t.id)) + 1 : 1;
        setTestCases([...testCases, { id: newId, name: "New Case", input: "", expected: "" }]);
    };

    const updateTestCase = (id, field, value) => {
        setTestCases(testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
    };

    const deleteTestCase = (id) => {
        setTestCases(testCases.filter(tc => tc.id !== id));
    };

    // --- CANDIDATE LOGIC ---
    const handleRunCode = () => {
        if (running) return;
        setRunning(true);
        setResults(null);
        setConsoleOutput(["Initializing Neural Runtime v1.0.4...", "Compiling Virtual Machine...", "Allocating 512MB Swap Space..."]);

        setTimeout(() => {
            setResults(testCases.map(tc => ({
                ...tc,
                status: Math.random() > 0.3 ? 'passed' : 'failed'
            })));
            setConsoleOutput(prev => [...prev, "Executing Test Vectors...", "Stream ending. Health: 100%"]);
            setRunning(false);
        }, 1500);
    };

    const handleSubmit = () => {
        if (window.confirm("DEPLOY SOLUTION: This will finalize your attempt. Proceed?")) {
            setSubmitted(true);
        }
    };

    // --- RENDER: RECRUITER SETUP ---
    if (mode === 'recruiter') {
        return (
            <div className="min-h-screen bg-slate-50 font-poppins flex flex-col h-screen overflow-hidden text-slate-900">
                {/* Header */}
                <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 flex-shrink-0 z-30 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="bg-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-emerald-500/10">DS</div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5 leading-none">Management Studio</p>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Assessment Constructor</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMode('candidate')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            <HiOutlineEye size={18} /> Preview Test
                        </button>
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2">
                            <HiOutlineSave size={18} /> Save Config
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Metadata & Test Cases */}
                    <div className="w-[450px] bg-white border-r border-slate-200 overflow-y-auto p-10 space-y-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <section className="space-y-6">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <HiOutlineCog className="text-emerald-500" /> Basic Information
                            </h3>
                            <TestField label="Deployment ID" value={metadata.test_id} onChange={(val) => setMetadata({ ...metadata, test_id: val })} />
                            <TestField label="Challenge Title" value={metadata.title} onChange={(val) => setMetadata({ ...metadata, title: val })} />
                            <div className="grid grid-cols-2 gap-4">
                                <TestField label="Time (Sec)" type="number" value={metadata.total_time_seconds} onChange={(val) => setMetadata({ ...metadata, total_time_seconds: val })} />
                                <TestField label="Base Points" type="number" value={metadata.points} onChange={(val) => setMetadata({ ...metadata, points: val })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty Metric</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                                    value={metadata.difficulty}
                                    onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value })}
                                >
                                    <option>Entry</option>
                                    <option>Standard</option>
                                    <option>Hard</option>
                                    <option>Neural</option>
                                </select>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    <HiOutlineTerminal className="text-emerald-500" /> Validation Vectors
                                </h3>
                                <button
                                    onClick={addTestCase}
                                    className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                                >
                                    <HiOutlinePlus size={18} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {testCases.map((tc) => (
                                    <TestCaseItem key={tc.id} test={tc} onUpdate={updateTestCase} onDelete={deleteTestCase} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right: Markdown Editor & Preview */}
                    <div className="flex-1 bg-white flex flex-col">
                        <div className="h-14 border-b border-slate-100 px-10 flex items-center bg-slate-50/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <HiOutlinePencilAlt /> Challenge Instructions Editor (Markdown)
                            </span>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                            {/* Editor Pane */}
                            <div className="w-1/2 border-r border-slate-100">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full h-full p-10 font-mono text-sm leading-relaxed text-slate-600 outline-none resize-none bg-white selection:bg-emerald-50"
                                    placeholder="Write your challenge details here..."
                                />
                            </div>
                            {/* Preview Pane */}
                            <div className="w-1/2 bg-slate-50/30 overflow-y-auto p-12">
                                <div className="max-w-2xl mx-auto">
                                    <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-4 block">Candidate View Preview</span>
                                    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
                                        <MarkdownParser content={description} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: CANDIDATE VIEW ---
    if (!testStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-poppins selection:bg-emerald-100">
                <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-[40px] p-12 shadow-2xl space-y-10">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center mx-auto border border-emerald-400 italic font-black text-2xl text-white shadow-xl shadow-emerald-500/20">
                            DS
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{metadata.title}</h1>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{metadata.test_id}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-[32px] p-8 space-y-8 border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-2xl border border-slate-200">
                                <HiOutlineClock className="text-emerald-500 mb-1" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                                <p className="text-lg font-black text-slate-900">{Math.floor(metadata.total_time_seconds / 60)} Mins</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-200">
                                <HiOutlineLightningBolt className="text-emerald-500 mb-1" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</p>
                                <p className="text-lg font-black text-slate-900">{metadata.difficulty}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Requirements</p>
                            <ul className="space-y-2 text-sm font-medium text-slate-600">
                                <li className="flex items-center gap-2">
                                    <HiOutlineShieldCheck className="text-emerald-500" /> Proctoring architecture active
                                </li>
                                <li className="flex items-center gap-2">
                                    <HiOutlineCheck className="text-emerald-500" /> {testCases.length} Logic validation vectors
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setMode('recruiter')}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 h-16 rounded-[24px] font-black text-sm uppercase tracking-widest border border-slate-200 transition-all"
                        >
                            Return to Editor
                        </button>
                        <button
                            onClick={() => setTestStarted(true)}
                            className="flex-[2] bg-slate-900 text-white h-16 rounded-[24px] font-black text-sm tracking-tight shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                        >
                            Initiate Logic Protocol <HiOutlinePlay className="text-emerald-400" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-poppins text-center">
                <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/30">
                    <HiOutlineCheck size={48} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Transmission Secured</h1>
                <p className="text-slate-500 max-w-sm font-medium mb-12">Your assessment session data has been successfully indexed. You may now close this window.</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10"
                >
                    Review Final Data
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 font-poppins text-slate-300">
            {/* Nav Header */}
            <div className="h-16 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="bg-emerald-500 w-9 h-9 rounded-xl flex items-center justify-center text-white font-black italic">DS</div>
                    <div className="h-6 w-px bg-white/10"></div>
                    <h2 className="text-sm font-bold text-white/90">{metadata.title}</h2>
                </div>
                <div className="flex items-center gap-8">
                    <div className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-2xl flex items-center gap-3">
                        <HiOutlineClock className="text-emerald-500" />
                        <span className="text-sm font-black tabular-nums tracking-wider uppercase">Active Session</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-8 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all font-black"
                    >
                        Deploy Solution
                    </button>
                </div>
            </div>

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Left: Challenge Specs */}
                <div className="w-[40%] border-r border-white/5 bg-[#0f1117] flex flex-col overflow-y-auto p-12 custom-scrollbar">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl">
                        <MarkdownParser content={description} />
                    </div>
                </div>

                {/* Right: Workspace */}
                <div className="flex-1 flex flex-col bg-[#08090d]">
                    <div className="flex-1 flex flex-col">
                        <div className="h-10 bg-slate-900/40 border-b border-white/5 px-6 flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <HiOutlineChip /> logic_node_script.js
                            </span>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 w-full bg-transparent p-12 font-mono text-[14px] leading-relaxed text-emerald-400 outline-none resize-none selection:bg-emerald-500/20"
                            spellCheck="false"
                        />
                    </div>

                    <div className="h-[45%] border-t border-white/5 bg-[#0a0b10] flex flex-col">
                        <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/40">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <HiOutlineTerminal /> Results Hub
                            </span>
                            <button
                                onClick={handleRunCode}
                                disabled={running}
                                className="bg-emerald-500 text-slate-900 px-6 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2"
                            >
                                {running ? <AiOutlineLoading3Quarters className="animate-spin" /> : <HiOutlinePlay />}
                                Run Vectors
                            </button>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-1/2 p-10 border-r border-white/5 overflow-y-auto">
                                {consoleOutput.map((line, i) => (
                                    <div key={i} className="font-mono text-[12px] text-slate-500 mb-1 flex gap-2">
                                        <span className="text-emerald-500/30">›</span> {line}
                                    </div>
                                ))}
                            </div>
                            <div className="w-1/2 p-10 space-y-4 overflow-y-auto">
                                {!results ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20">
                                        <HiOutlineChartBar size={40} className="mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting execution data</p>
                                    </div>
                                ) : (
                                    results.map((res, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <div>
                                                <p className="text-[9px] font-black text-emerald-500 uppercase">Vector #{res.id}</p>
                                                <p className="text-xs font-bold text-white">{res.name}</p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${res.status === 'passed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                {res.status}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mode Switcher Floating FAB */}
            <button
                onClick={() => setMode('recruiter')}
                className="fixed bottom-10 right-10 w-16 h-16 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] border-4 border-emerald-500/20"
                title="Back to Editor"
            >
                <HiOutlinePencilAlt size={24} />
            </button>
        </div>
    );
}