'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlinePlus, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineTrash,
    HiOutlineListBullet, HiOutlineCommandLine, HiOutlineChatBubbleBottomCenterText,
    HiOutlineInformationCircle,
} from 'react-icons/hi2';
import AssessmentEditor from '@/components/assessments/AssessmentEditor';

export default function ProblemForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const updateCoding = (field, val) => {
        set('coding_details', { ...form.coding_details, [field]: val });
    };

    const updateMCQ = (field, val) => {
        set('mcq_details', { ...form.mcq_details, [field]: val });
    };

    const addTestCase = () => {
        const tcs = [...(form.coding_details?.testCases || [])];
        tcs.push({ input: '', expectedOutput: '', isHidden: false });
        updateCoding('testCases', tcs);
    };

    const removeTestCase = (idx) => {
        const tcs = form.coding_details.testCases.filter((_, i) => i !== idx);
        updateCoding('testCases', tcs);
    };

    const addMCQOption = () => {
        const opts = [...(form.mcq_details?.options || [])];
        opts.push({ text: '', isCorrect: false });
        updateMCQ('options', opts);
    };

    const removeMCQOption = (idx) => {
        const opts = form.mcq_details.options.filter((_, i) => i !== idx);
        updateMCQ('options', opts);
    };

    return (
        <div className="space-y-8 bg-card p-8 rounded-[2.5rem] border border-border/50 shadow-sm relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Question Title</label>
                    <input value={form.title} onChange={e => set('title', e.target.value)} required
                        className="w-full px-6 py-4 rounded-[1.2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-all text-lg font-bold"
                        placeholder="e.g. Implement Two Sum" />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Question Type</label>
                    <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-border">
                        {[
                            { id: 'coding', icon: HiOutlineCommandLine, label: 'Coding' },
                            { id: 'mcq', icon: HiOutlineListBullet, label: 'MCQ' },
                            { id: 'subjective', icon: HiOutlineChatBubbleBottomCenterText, label: 'Subjective' },
                        ].map(t => (
                            <button key={t.id} type="button" onClick={() => set('type', t.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${
                                    form.type === t.id ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-600' : 'text-muted-foreground hover:bg-white/50'
                                }`}>
                                <t.icon className="w-4 h-4" /> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Difficulty</label>
                        <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
                            className="w-full px-6 py-4 rounded-[1.2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none appearance-none font-bold">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Marks</label>
                        <input type="number" value={form.marks} onChange={e => set('marks', Number(e.target.value))}
                            className="w-full px-6 py-4 rounded-[1.2rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none font-bold" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Description / Problem Statement</label>
                <AssessmentEditor value={form.description} onChange={val => set('description', val)} rows={6}
                    placeholder="Provide a detailed description of the question..." />
            </div>

            <AnimatePresence mode="wait">
                {form.type === 'coding' && (
                    <motion.div key="coding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 flex gap-4 text-emerald-700 dark:text-emerald-400">
                            <HiOutlineInformationCircle className="w-6 h-6 shrink-0 mt-0.5" />
                            <div className="space-y-3">
                                <h4 className="font-bold">How to Write Test Cases for the Standard Evaluator</h4>
                                <ul className="text-sm space-y-2 list-disc pl-4 marker:text-emerald-500/50">
                                    <li><strong>Input format:</strong> Provide raw standard input (stdin). E.g., for an array `1 2 3 4` on one line, or multiple lines if required.</li>
                                    <li><strong>Output format:</strong> Provide the exact expected output string. The evaluator compares the candidate's standard output (stdout) line-by-line with your expected output.</li>
                                    <li><strong>Hidden cases:</strong> Mark edge cases as hidden. Candidates can't see the input/output of hidden cases, but they affect the final score.</li>
                                    <li><strong>Languages:</strong> The system automatically supports C, C++, JavaScript (Node), and Python 3. The candidate writes a program that reads stdin and writes to stdout.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">Test Cases (Standard I/O)</label>
                                <button type="button" onClick={addTestCase} className="text-xs text-emerald-500 font-black uppercase flex items-center gap-1 hover:underline">
                                    <HiOutlinePlus className="w-4 h-4" /> Add Case
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {(form.coding_details?.testCases || []).map((tc, idx) => (
                                    <div key={idx} className="p-6 rounded-[1.5rem] bg-secondary/20 border border-border space-y-4 relative group">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold opacity-30 uppercase">Standard Input (stdin)</label>
                                                <textarea value={tc.input} onChange={e => {
                                                    const next = [...form.coding_details.testCases];
                                                    next[idx].input = e.target.value;
                                                    updateCoding('testCases', next);
                                                }} className="w-full bg-secondary/50 rounded-xl p-3 text-xs font-mono border border-border outline-none focus:border-emerald-500" rows="3" placeholder="e.g. 5\n1 2 3 4 5" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold opacity-30 uppercase">Expected Output (stdout)</label>
                                                <textarea value={tc.expectedOutput} onChange={e => {
                                                    const next = [...form.coding_details.testCases];
                                                    next[idx].expectedOutput = e.target.value;
                                                    updateCoding('testCases', next);
                                                }} className="w-full bg-secondary/50 rounded-xl p-3 text-xs font-mono border border-border outline-none focus:border-emerald-500" rows="3" placeholder="e.g. 15" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={tc.isHidden} onChange={e => {
                                                    const next = [...form.coding_details.testCases];
                                                    next[idx].isHidden = e.target.checked;
                                                    updateCoding('testCases', next);
                                                }} className="rounded border-border text-emerald-600 focus:ring-emerald-500" />
                                                <span className="text-[10px] font-black uppercase opacity-60">Hidden Test Case</span>
                                            </label>
                                            <button onClick={() => removeTestCase(idx)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500">
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {form.type === 'mcq' && (
                    <motion.div key="mcq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Question Options</label>
                                    <p className="text-xs text-muted-foreground">Select the checkbox to mark an option as correct.</p>
                                </div>
                                <button type="button" onClick={addMCQOption} className="px-4 py-2 rounded-xl bg-emerald-600/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600/20 transition-all">
                                    <HiOutlinePlus className="w-3.5 h-3.5" /> Add Option
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {(form.mcq_details?.options || []).map((opt, idx) => (
                                    <div key={idx} className={`group flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all ${opt.isCorrect ? 'bg-emerald-600/5 border-emerald-500/30' : 'bg-secondary/20 border-border hover:border-emerald-500/20'}`}>
                                        <div className="relative">
                                            <input type="checkbox" checked={opt.isCorrect} onChange={e => {
                                                const next = [...form.mcq_details.options];
                                                if (!form.mcq_details.multipleCorrect && e.target.checked) {
                                                    next.forEach(o => o.isCorrect = false);
                                                }
                                                next[idx].isCorrect = e.target.checked;
                                                updateMCQ('options', next);
                                            }} className="w-7 h-7 rounded-xl border-2 border-border text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer transition-all" />
                                            {opt.isCorrect && <motion.div layoutId="correct-indicator" className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <AssessmentEditor compact rows={2} value={opt.text} onChange={val => {
                                                const next = [...form.mcq_details.options];
                                                next[idx].text = val;
                                                updateMCQ('options', next);
                                            }} placeholder={`Enter Option ${idx + 1}...`} />
                                        </div>
                                        <button onClick={() => removeMCQOption(idx)} className="p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <HiOutlineXMark className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <label className="flex items-center gap-4 p-6 rounded-[1.5rem] bg-secondary/30 border border-border cursor-pointer hover:bg-secondary/50 transition-all">
                                    <input type="checkbox" checked={form.mcq_details.multipleCorrect} onChange={e => updateMCQ('multipleCorrect', e.target.checked)}
                                        className="w-5 h-5 rounded border-border text-emerald-600 focus:ring-emerald-500" />
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest block">Multiple Selection</span>
                                        <span className="text-xs text-muted-foreground">Allow candidates to select more than one answer.</span>
                                    </div>
                                </label>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Answer Explanation (Optional)</label>
                                    <AssessmentEditor value={form.mcq_details.explanation || ''} onChange={val => updateMCQ('explanation', val)} rows={3}
                                        placeholder="Explain why these answers are correct..." />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {form.type === 'subjective' && (
                    <motion.div key="subjective" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-40 px-2">Model Answer / Grading Criteria</label>
                            <AssessmentEditor value={form.subjective_details?.modelAnswer || ''} onChange={val => set('subjective_details', { ...form.subjective_details, modelAnswer: val })} rows={4}
                                placeholder="Describe what a perfect answer should contain for the AI evaluator..." />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {initial.error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-2 mb-4">
                    <HiOutlineXMark className="w-4 h-4" /> {initial.error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                <button type="button" onClick={onCancel}
                    className="px-8 py-4 rounded-[1.2rem] bg-secondary hover:bg-secondary/80 font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
                <button type="button" onClick={() => onSave(form)} disabled={saving}
                    className="px-8 py-4 rounded-[1.2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineCheckCircle className="w-5 h-5" />}
                    Save Question
                </button>
            </div>
        </div>
    );
}
