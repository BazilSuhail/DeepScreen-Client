"use client";

import React, { useState } from 'react';
import {
    HiOutlineLightningBolt,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineCheck,
    HiOutlineChevronLeft,
    HiOutlineBriefcase,
    HiOutlineCode,
    HiOutlineBeaker,
    HiOutlineCog,
    HiOutlineSave,
    HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// Mock Data Structure
const MOCK_ASSESSMENT_DATA = {
    job_id: "JOB-402-NEURAL",
    job_title: "Senior Full Stack Architect",
    existing_problems: [
        {
            id: "Q1",
            title: "Reversed Linked Node Optimization",
            difficulty: "Medium",
            points: 100,
            time_limit: "45 mins"
        },
        {
            id: "Q2",
            title: "Async Data Streaming Protocol",
            difficulty: "Hard",
            points: 200,
            time_limit: "60 mins"
        }
    ]
};

export default function RecruiterSetup() {
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [problems, setProblems] = useState(MOCK_ASSESSMENT_DATA.existing_problems);

    const [newProblem, setNewProblem] = useState({
        title: "",
        difficulty: "Medium",
        time_limit: "30",
        description: "",
        input_format: "",
        output_format: "",
        constraints: "",
        test_cases: [{ input: "", output: "", is_hidden: false }]
    });

    const handleAddTestCase = () => {
        setNewProblem(prev => ({
            ...prev,
            test_cases: [...prev.test_cases, { input: "", output: "", is_hidden: false }]
        }));
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setStatus("Protocol Committed Successfully");
            setProblems([...problems, { ...newProblem, id: `Q${problems.length + 1}` }]);
            setTimeout(() => setStatus(""), 3000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 font-poppins selection:bg-emerald-100 selection:text-emerald-700">
            <div className="max-w-7xl mx-auto space-y-10 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs tracking-widest uppercase">
                            <HiOutlineBriefcase />
                            <span>{MOCK_ASSESSMENT_DATA.job_id}</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                            Assessment Architect
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Configure coding challenges for <span className="text-emerald-600 font-bold">{MOCK_ASSESSMENT_DATA.job_title}</span></p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                            <HiOutlineCog size={18} />
                            Global Config
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <AiOutlineLoading3Quarters className="animate-spin" /> : <HiOutlineSave size={20} />}
                            <span>{saving ? "Syncing..." : "Commit Protocol"}</span>
                        </button>
                    </div>
                </div>

                {status && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
                        <HiOutlineCheck className="text-emerald-500" />
                        <span className="text-emerald-700 text-sm font-bold">{status}</span>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-8">

                    {/* Sidebar: Existing Challenges */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest">Active Pool</h3>
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">{problems.length} Challenges</span>
                            </div>

                            <div className="space-y-3">
                                {problems.map((p, i) => (
                                    <div key={i} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-500/20 hover:bg-white transition-all cursor-pointer">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-slate-900 leading-tight">{p.title}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${p.difficulty === 'Hard' ? 'text-red-500' : 'text-emerald-500'}`}>{p.difficulty}</span>
                                                    <span className="text-[9px] font-bold text-slate-400">{p.time_limit}</span>
                                                </div>
                                            </div>
                                            <HiOutlineTrash className="text-slate-300 hover:text-red-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest hover:border-emerald-500/20 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
                                <HiOutlinePlus />
                                Add Challenge Preset
                            </button>
                        </div>

                        <div className="bg-emerald-500 rounded-[32px] p-8 text-white space-y-4 shadow-xl shadow-emerald-500/20">
                            <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <HiOutlineQuestionMarkCircle />
                                Neural Pro Tip
                            </h4>
                            <p className="text-emerald-50 text-xs font-medium leading-relaxed">
                                Mix difficulty levels to better analyze the candidate's cognitive scaling. Start with a logic warm-up followed by algorithmic optimization.
                            </p>
                        </div>
                    </div>

                    {/* Main Content: Architect Area */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm space-y-10">

                            {/* Core Identity */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <HiOutlineLightningBolt className="text-emerald-500" />
                                    Challenge Identity
                                </h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Problem Title</label>
                                        <input
                                            value={newProblem.title}
                                            onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500/20 transition-all"
                                            placeholder="e.g. Memory-Safe Buffer Allocation"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Difficulty Vector</label>
                                        <select
                                            value={newProblem.difficulty}
                                            onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                                        >
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Time Threshold (Mins)</label>
                                        <input
                                            type="number"
                                            value={newProblem.time_limit}
                                            onChange={(e) => setNewProblem({ ...newProblem, time_limit: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                                            placeholder="30"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Logic Specification */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <HiOutlineCode className="text-emerald-500" />
                                    Logic Specification
                                </h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Problem Statement (MD Supported)</label>
                                        <textarea
                                            rows="8"
                                            value={newProblem.description}
                                            onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-8 py-6 text-sm font-medium outline-none focus:bg-white focus:border-emerald-500/20 transition-all resize-none"
                                            placeholder="Explain the technical requirement and expected logic..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Test Cases */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <HiOutlineBeaker className="text-emerald-500" />
                                        Validation Layer
                                    </h2>
                                    <button
                                        onClick={handleAddTestCase}
                                        className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        + ADD TEST CASE
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {newProblem.test_cases.map((tc, idx) => (
                                        <div key={idx} className="grid grid-cols-2 gap-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100 relative group">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Input</label>
                                                <input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono" placeholder="stdin" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected Output</label>
                                                <input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono" placeholder="stdout" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 hidden group-hover:flex">
                                                <button className="bg-red-500 text-white p-1 rounded-lg text-xs shadow-lg"><HiOutlineX /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function HiOutlineX() {
    return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}