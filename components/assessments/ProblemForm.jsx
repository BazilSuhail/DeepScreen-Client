'use client';

import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlinePlus, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineTrash,
    HiOutlineListBullet, HiOutlineCommandLine, HiOutlineChatBubbleBottomCenterText,
    HiOutlineInformationCircle,
} from 'react-icons/hi2';
import AssessmentEditor from '@/components/assessments/AssessmentEditor';
import { base, spring } from '@/constants/motion';
import { primaryButton, secondaryButton, focusRing } from '@/components/ui/styles';

const fieldClass = `w-full min-h-11 px-3.5 py-2.5 rounded-md bg-secondary/30 border border-border focus:border-emerald-500 outline-none transition-colors ${focusRing}`;
const fieldLabel = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const tabSwap = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: base };

export default function ProblemForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial);
    const uid = useId();

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const updateCoding = (field, val) => {
        set('coding_details', { ...form.coding_details, [field]: val });
    };

    const updateMCQ = (field, val) => {
        set('mcq_details', { ...form.mcq_details, [field]: val });
    };

    // Copy on write: test cases/options are shared with the parent's question, so never mutate them in place.
    const setTestCase = (idx, field, val) =>
        updateCoding('testCases', form.coding_details.testCases.map((tc, i) => (i === idx ? { ...tc, [field]: val } : tc)));

    const setOption = (idx, patch, clearOthers = false) =>
        updateMCQ('options', form.mcq_details.options.map((o, i) => (i === idx ? { ...o, ...patch } : clearOthers ? { ...o, isCorrect: false } : o)));

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
        <div className="space-y-8 bg-card p-5 sm:p-8 rounded-lg border border-border/50 shadow-sm relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <label htmlFor={`${uid}-title`} className={fieldLabel}>Question Title</label>
                    <input id={`${uid}-title`} value={form.title} onChange={e => set('title', e.target.value)} required
                        className={`${fieldClass} text-base font-semibold`}
                        placeholder="e.g. Implement Two Sum" />
                </div>

                <div className="space-y-2">
                    <span className={fieldLabel}>Question Type</span>
                    <div className="flex gap-1 p-1 bg-secondary/50 rounded-md border border-border">
                        {[
                            { id: 'coding', icon: HiOutlineCommandLine, label: 'Coding' },
                            { id: 'mcq', icon: HiOutlineListBullet, label: 'MCQ' },
                            { id: 'subjective', icon: HiOutlineChatBubbleBottomCenterText, label: 'Subjective' },
                        ].map(t => (
                            <button key={t.id} type="button" onClick={() => set('type', t.id)}
                                className={`relative flex-1 flex min-w-0 items-center justify-center gap-1.5 min-h-10 px-2 rounded-sm text-xs font-semibold uppercase transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none ${focusRing} ${
                                    form.type === t.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground'
                                }`}>
                                {form.type === t.id && (
                                    <motion.span layoutId={`${uid}-type-tab`} transition={spring} aria-hidden="true"
                                        className="absolute inset-0 rounded-sm bg-card shadow-sm" />
                                )}
                                <t.icon className="relative w-4 h-4 shrink-0" aria-hidden="true" /> <span className="relative truncate">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor={`${uid}-difficulty`} className={fieldLabel}>Difficulty</label>
                        <select id={`${uid}-difficulty`} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
                            className={`${fieldClass} appearance-none font-semibold`}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor={`${uid}-marks`} className={fieldLabel}>Marks</label>
                        <input id={`${uid}-marks`} type="number" value={form.marks} onChange={e => set('marks', Number(e.target.value))}
                            className={`${fieldClass} font-semibold`} />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <span id={`${uid}-desc`} className={fieldLabel}>Description / Problem Statement</span>
                <AssessmentEditor labelledBy={`${uid}-desc`} value={form.description} onChange={val => set('description', val)} rows={6}
                    placeholder="Provide a detailed description of the question..." />
            </div>

            <AnimatePresence mode="wait">
                {form.type === 'coding' && (
                    <motion.div key="coding" {...tabSwap} className="space-y-6">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-md p-4 sm:p-6 flex gap-4 text-emerald-700 dark:text-emerald-400">
                            <HiOutlineInformationCircle className="w-6 h-6 shrink-0 mt-0.5" />
                            <div className="space-y-3">
                                <h4 className="font-semibold">How to Write Test Cases for the Standard Evaluator</h4>
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
                                <span className={fieldLabel}>Test Cases (Standard I/O)</span>
                                <button type="button" onClick={addTestCase} className={`min-h-10 px-2 rounded-md text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase flex items-center gap-1 hover:underline ${focusRing}`}>
                                    <HiOutlinePlus className="w-4 h-4" /> Add Case
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {(form.coding_details?.testCases || []).map((tc, idx) => (
                                    <div key={idx} className="p-4 sm:p-6 rounded-md bg-secondary/20 border border-border space-y-4 relative group">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label htmlFor={`${uid}-tc-${idx}-in`} className="text-[10px] font-semibold text-muted-foreground uppercase">Standard Input (stdin)</label>
                                                <textarea id={`${uid}-tc-${idx}-in`} value={tc.input} onChange={e => setTestCase(idx, 'input', e.target.value)} className="w-full bg-secondary/50 rounded-md p-3 text-xs font-mono border border-border outline-none focus:border-emerald-500" rows="3" placeholder="e.g. 5\n1 2 3 4 5" />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor={`${uid}-tc-${idx}-out`} className="text-[10px] font-semibold text-muted-foreground uppercase">Expected Output (stdout)</label>
                                                <textarea id={`${uid}-tc-${idx}-out`} value={tc.expectedOutput} onChange={e => setTestCase(idx, 'expectedOutput', e.target.value)} className="w-full bg-secondary/50 rounded-md p-3 text-xs font-mono border border-border outline-none focus:border-emerald-500" rows="3" placeholder="e.g. 15" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={tc.isHidden} onChange={e => setTestCase(idx, 'isHidden', e.target.checked)} className="rounded border-border text-emerald-600 focus:ring-emerald-500" />
                                                <span className="text-[10px] font-semibold uppercase text-muted-foreground">Hidden Test Case</span>
                                            </label>
                                            <button type="button" onClick={() => removeTestCase(idx)} aria-label={`Remove test case ${idx + 1}`} className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 ${focusRing}`}>
                                                <HiOutlineTrash className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {form.type === 'mcq' && (
                    <motion.div key="mcq" {...tabSwap} className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Question Options</span>
                                    <p className="text-xs text-muted-foreground">Select the checkbox to mark an option as correct.</p>
                                </div>
                                <button type="button" onClick={addMCQOption} className={`shrink-0 min-h-10 px-3 py-2 rounded-md bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase flex items-center gap-2 hover:bg-emerald-600/20 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none ${focusRing}`}>
                                    <HiOutlinePlus className="w-3.5 h-3.5" /> Add Option
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {(form.mcq_details?.options || []).map((opt, idx) => (
                                    <div key={idx} className={`group flex items-center gap-3 sm:gap-6 p-4 sm:p-6 rounded-md border-2 transition-colors ${opt.isCorrect ? 'bg-emerald-600/5 border-emerald-500/30' : 'bg-secondary/20 border-border hover:border-emerald-500/20'}`}>
                                        <div className="relative">
                                            <input type="checkbox" checked={opt.isCorrect} onChange={e => setOption(idx, { isCorrect: e.target.checked }, !form.mcq_details.multipleCorrect && e.target.checked)} className="w-7 h-7 rounded-sm border-2 border-border text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer transition-all" />
                                            {opt.isCorrect && <motion.div layoutId={`${uid}-correct-${idx}`} transition={spring} className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <AssessmentEditor compact rows={2} value={opt.text} onChange={val => setOption(idx, { text: val })} placeholder={`Enter Option ${idx + 1}...`} />
                                        </div>
                                        <button type="button" onClick={() => removeMCQOption(idx)} aria-label={`Remove option ${idx + 1}`} className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 ${focusRing}`}>
                                            <HiOutlineXMark className="w-5 h-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <label aria-label="Multiple Selection" className="flex items-center gap-4 p-4 sm:p-6 rounded-md bg-secondary/30 border border-border cursor-pointer hover:bg-secondary/50 transition-colors">
                                    <input type="checkbox" checked={form.mcq_details.multipleCorrect} onChange={e => updateMCQ('multipleCorrect', e.target.checked)}
                                        className="w-5 h-5 rounded border-border text-emerald-600 focus:ring-emerald-500" />
                                    <div className="space-y-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider block">Multiple Selection</span>
                                        <span className="text-xs text-muted-foreground">Allow candidates to select more than one answer.</span>
                                    </div>
                                </label>

                                <div className="space-y-2">
                                    <span id={`${uid}-expl`} className={fieldLabel}>Answer Explanation (Optional)</span>
                                    <AssessmentEditor labelledBy={`${uid}-expl`} value={form.mcq_details.explanation || ''} onChange={val => updateMCQ('explanation', val)} rows={3}
                                        placeholder="Explain why these answers are correct..." />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {form.type === 'subjective' && (
                    <motion.div key="subjective" {...tabSwap} className="space-y-6">
                        <div className="space-y-2">
                            <span id={`${uid}-model`} className={fieldLabel}>Model Answer / Grading Criteria</span>
                            <AssessmentEditor labelledBy={`${uid}-model`} value={form.subjective_details?.modelAnswer || ''} onChange={val => set('subjective_details', { ...form.subjective_details, modelAnswer: val })} rows={4}
                                placeholder="Describe what a perfect answer should contain for the AI evaluator..." />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {initial.error && (
                <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-2 mb-4">
                    <HiOutlineXMark className="w-4 h-4" /> {initial.error}
                </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-border mt-8">
                <button type="button" onClick={onCancel}
                    className={secondaryButton}>Cancel</button>
                <button type="button" onClick={() => onSave(form)} disabled={saving}
                    className={primaryButton}>
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin motion-reduce:animate-none" /> : <HiOutlineCheckCircle className="w-5 h-5" />}
                    Save Question
                </button>
            </div>
        </div>
    );
}
