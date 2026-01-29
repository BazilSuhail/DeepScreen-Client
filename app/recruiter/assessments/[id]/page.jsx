'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineChevronLeft, HiOutlinePlus, HiOutlineXMark,
    HiOutlinePencilSquare, HiOutlineTrash, HiOutlineBeaker,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';

const DIFFICULTY_COLORS = {
    easy:   'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    hard:   'bg-red-500/10 text-red-400 border-red-500/20',
};

const EMPTY_PROBLEM = {
    title: '', problem_statement: '', difficulty: 'medium',
    order_number: 1, points: 100, time_limit_ms: 2000, memory_limit_mb: 256,
    allowed_languages: ['python', 'javascript', 'java', 'cpp'],
    input_format: '', output_format: '', constraints: '',
    sample_input: '', sample_output: '',
    public_test_cases: [{ input: '', expected_output: '' }],
    hidden_test_cases: [{ input: '', expected_output: '' }],
};

function ProblemForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const setTC = (type, idx, field, val) => {
        const arr = [...form[type]];
        arr[idx] = { ...arr[idx], [field]: val };
        set(type, arr);
    };
    const addTC = (type) => set(type, [...form[type], { input: '', expected_output: '' }]);
    const removeTC = (type, idx) => set(type, form[type].filter((_, i) => i !== idx));

    const toggleLang = (lang) => {
        const langs = form.allowed_languages.includes(lang)
            ? form.allowed_languages.filter(l => l !== lang)
            : [...form.allowed_languages, lang];
        set('allowed_languages', langs);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Title</label>
                    <input value={form.title} onChange={e => set('title', e.target.value)} required
                        className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                        placeholder="Two Sum" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Difficulty</label>
                    <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
                        className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none appearance-none">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Points</label>
                    <input type="number" value={form.points} onChange={e => set('points', Number(e.target.value))}
                        className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Order #</label>
                    <input type="number" value={form.order_number} onChange={e => set('order_number', Number(e.target.value))}
                        className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Time Limit (ms)</label>
                    <input type="number" value={form.time_limit_ms} onChange={e => set('time_limit_ms', Number(e.target.value))}
                        className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest opacity-50">Problem Statement</label>
                <textarea rows="5" value={form.problem_statement} onChange={e => set('problem_statement', e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none resize-none"
                    placeholder="Describe the problem clearly..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['input_format', 'output_format', 'constraints', 'sample_input', 'sample_output'].map(field => (
                    <div key={field} className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">{field.replace(/_/g, ' ')}</label>
                        <textarea rows="2" value={form[field] || ''} onChange={e => set(field, e.target.value)}
                            className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none resize-none" />
                    </div>
                ))}
            </div>

            {/* Languages */}
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-50">Allowed Languages</label>
                <div className="flex gap-2 flex-wrap">
                    {['python', 'javascript', 'java', 'cpp', 'go', 'rust'].map(lang => (
                        <button key={lang} type="button" onClick={() => toggleLang(lang)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                form.allowed_languages.includes(lang)
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                    : 'bg-secondary text-muted-foreground border-border'
                            }`}>
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            {/* Test cases */}
            {[
                { key: 'public_test_cases', label: 'Public Test Cases (visible to candidate)' },
                { key: 'hidden_test_cases', label: 'Hidden Test Cases (used for scoring)' },
            ].map(({ key, label }) => (
                <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">{label}</label>
                        <button type="button" onClick={() => addTC(key)}
                            className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400">
                            <HiOutlinePlus className="w-4 h-4" /> Add
                        </button>
                    </div>
                    {form[key].map((tc, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Input</label>
                                <textarea rows="2" value={tc.input} onChange={e => setTC(key, idx, 'input', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-emerald-500 outline-none text-xs font-mono resize-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Expected Output</label>
                                <textarea rows="2" value={tc.expected_output} onChange={e => setTC(key, idx, 'expected_output', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-emerald-500 outline-none text-xs font-mono resize-none" />
                            </div>
                            {form[key].length > 1 && (
                                <button type="button" onClick={() => removeTC(key, idx)}
                                    className="col-span-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 justify-end">
                                    <HiOutlineXMark className="w-3 h-3" /> Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ))}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl bg-secondary border border-border font-bold text-sm">Cancel</button>
                <button type="button" onClick={() => onSave(form)} disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineCheckCircle className="w-4 h-4" />}
                    Save Problem
                </button>
            </div>
        </div>
    );
}

export default function AssessmentEditPage() {
    const router = useRouter();
    const { id } = useParams();

    const [assessment, setAssessment] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingProblem, setEditingProblem] = useState(null); // null | 'new' | problem object
    const [savingProblem, setSavingProblem] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [meta, setMeta] = useState({ title: '', description: '', duration_minutes: 90, passing_score: 70 });

    const load = async () => {
        try {
            const data = await api.get(`/assessments/${id}/`);
            setAssessment(data);
            setMeta({ title: data.title, description: data.description || '', duration_minutes: data.duration_minutes, passing_score: data.passing_score });
            setProblems(data.problems || []);
        } catch {
            setError('Failed to load assessment');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) load(); }, [id]);

    const handleSaveMeta = async () => {
        setSaving(true);
        try {
            await api.put(`/assessments/${id}/`, meta);
            setSuccess('Assessment saved!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            setError(e.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleSaveProblem = async (form) => {
        setSavingProblem(true);
        try {
            if (form.problem_id) {
                const updated = await api.put(`/assessments/problems/${form.problem_id}/`, form);
                setProblems(p => p.map(pr => pr.problem_id === updated.problem_id ? updated : pr));
            } else {
                const created = await api.post('/assessments/problems/', { ...form, assessment: id });
                setProblems(p => [...p, created]);
            }
            setEditingProblem(null);
            setSuccess('Problem saved!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            setError(e.message || 'Failed to save problem');
        } finally { setSavingProblem(false); }
    };

    const handleDeleteProblem = async (problemId) => {
        if (!confirm('Archive this problem?')) return;
        try {
            await api.delete(`/assessments/problems/${problemId}/`);
            setProblems(p => p.filter(pr => pr.problem_id !== problemId));
        } catch { alert('Failed to remove problem'); }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 rounded-2xl bg-secondary border border-border transition-all hover:bg-secondary/80">
                    <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-black">Edit Assessment</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">{assessment?.title}</p>
                </div>
            </div>

            {error && <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>}
            {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">✅ {success}</motion.div>}

            {/* Metadata */}
            <div className="glass p-6 rounded-[2.5rem] border border-emerald-500/10 space-y-5">
                <h2 className="font-black text-sm uppercase tracking-widest opacity-50">Assessment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Title</label>
                        <input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                            className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Description / Instructions</label>
                        <textarea rows="3" value={meta.description} onChange={e => setMeta(m => ({ ...m, description: e.target.value }))}
                            className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none resize-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Duration (minutes)</label>
                        <input type="number" value={meta.duration_minutes} onChange={e => setMeta(m => ({ ...m, duration_minutes: Number(e.target.value) }))}
                            className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Passing Score (%)</label>
                        <input type="number" value={meta.passing_score} onChange={e => setMeta(m => ({ ...m, passing_score: Number(e.target.value) }))}
                            className="w-full px-5 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleSaveMeta} disabled={saving}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                        Save Details
                    </button>
                </div>
            </div>

            {/* Problems */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black">Problems ({problems.length})</h2>
                    <button onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: problems.length + 1 })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20">
                        <HiOutlinePlus className="w-4 h-4" /> Add Problem
                    </button>
                </div>

                {problems.length === 0 && !editingProblem && (
                    <div className="py-16 text-center glass rounded-[2.5rem] border-dashed border-2 border-border">
                        <HiOutlineBeaker className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <p className="font-bold">No problems yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Add coding problems for candidates to solve</p>
                    </div>
                )}

                {problems.map((p, i) => (
                    <div key={p.problem_id} className="glass border border-emerald-500/10 rounded-[2rem] overflow-hidden">
                        {editingProblem?.problem_id === p.problem_id ? (
                            <div className="p-6">
                                <h3 className="font-black mb-5">Editing: {p.title}</h3>
                                <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                            </div>
                        ) : (
                            <div className="p-5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-xs font-black">{i + 1}</span>
                                    <div>
                                        <p className="font-bold">{p.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${DIFFICULTY_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                                            <span className="text-xs text-muted-foreground">{p.points} pts · {p.public_test_cases?.length || 0} public · {p.hidden_test_cases?.length || 0} hidden</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => setEditingProblem(p)} className="p-2 rounded-xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-border transition-all">
                                        <HiOutlinePencilSquare className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteProblem(p.problem_id)} className="p-2 rounded-xl bg-secondary hover:bg-red-500/10 hover:text-red-400 border border-border transition-all">
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* New problem form */}
                {editingProblem && !editingProblem.problem_id && (
                    <div className="glass border border-emerald-500/20 rounded-[2rem] p-6">
                        <h3 className="font-black mb-5">New Problem</h3>
                        <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                    </div>
                )}
            </div>
        </div>
    );
}
