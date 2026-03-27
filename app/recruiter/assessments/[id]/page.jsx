'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    HiOutlineChevronLeft, HiOutlinePlus, HiOutlineXMark,
    HiOutlinePencilSquare, HiOutlineTrash, HiOutlineBeaker,
    HiOutlineCheckCircle, HiOutlineListBullet, HiOutlineCommandLine,
    HiOutlineChatBubbleBottomCenterText, HiOutlineMagnifyingGlass,
    HiOutlineSparkles, HiOutlineInformationCircle
} from 'react-icons/hi2';

const DIFFICULTY_COLORS = {
    easy:   'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    hard:   'bg-red-500/10 text-red-400 border-red-500/20',
};

const EMPTY_PROBLEM = {
    title: '', 
    description: '', 
    type: 'coding',
    difficulty: 'medium',
    marks: 10,
    order_number: 0,
    coding_details: {
        languages: [
            { languageId: 71, languageName: 'Python' },
            { languageId: 63, languageName: 'JavaScript' },
            { languageId: 54, languageName: 'C++' },
            { languageId: 50, languageName: 'C' }
        ],
        testCases: [{ input: '', expectedOutput: '', isHidden: false }]
    },
    mcq_details: {
        options: [{ text: '', isCorrect: false }],
        multipleCorrect: false,
        explanation: ''
    },
    subjective_details: {
        guideLines: '',
        modelAnswer: ''
    }
};

function ProblemForm({ initial, onSave, onCancel, saving }) {
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
                            { id: 'subjective', icon: HiOutlineChatBubbleBottomCenterText, label: 'Subjective' }
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
                <textarea rows="6" value={form.description} onChange={e => set('description', e.target.value)}
                    className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none resize-none font-medium leading-relaxed"
                    placeholder="Provide a detailed description of the question..." />
            </div>

            {/* Type Specific Sections */}
            <AnimatePresence mode="wait">
                {form.type === 'coding' && (
                    <motion.div key="coding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        
                        {/* Recruiter Guide for Test Cases */}
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
                                        <input value={opt.text} onChange={e => {
                                            const next = [...form.mcq_details.options];
                                            next[idx].text = e.target.value;
                                            updateMCQ('options', next);
                                        }} className="flex-1 bg-transparent outline-none font-bold text-lg placeholder:opacity-30" placeholder={`Enter Option ${idx + 1}...`} />
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
                                    <textarea 
                                        value={form.mcq_details.explanation || ''} 
                                        onChange={e => updateMCQ('explanation', e.target.value)}
                                        placeholder="Explain why these answers are correct..."
                                        className="w-full p-6 rounded-[1.5rem] bg-secondary/20 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium h-[100px] resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {form.type === 'subjective' && (
                    <motion.div key="subjective" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-40 px-2">Model Answer / Grading Criteria</label>
                            <textarea rows="4" value={form.subjective_details?.modelAnswer || ''} onChange={e => set('subjective_details', { ...form.subjective_details, modelAnswer: e.target.value })}
                                className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border focus:border-emerald-500 outline-none resize-none font-medium"
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

function ProblemBankModal({ onSelect, onClose }) {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchBank = async () => {
            try {
                const data = await api.get('/assessments/questions/pool/');
                setProblems(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBank();
    }, []);

    const filtered = problems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-3xl h-[80vh] flex flex-col bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-border bg-emerald-500/5 shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Organization Question Bank</h2>
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-all"><HiOutlineXMark className="w-6 h-6" /></button>
                    </div>
                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for existing questions..."
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-background border border-border focus:border-emerald-500 outline-none transition-all" />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" /></div>
                    ) : filtered.map(p => (
                        <div key={p.question_id} className="p-6 rounded-[1.5rem] bg-secondary/20 border border-border flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                            <div>
                                <h4 className="font-bold">{p.title}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${DIFFICULTY_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                                    <span className="text-[10px] font-black uppercase opacity-40">{p.type} · {p.marks} Marks</span>
                                </div>
                            </div>
                            <button onClick={() => onSelect(p)} className="px-5 py-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">
                                Add to Assessment
                            </button>
                        </div>
                    ))}
                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-12 opacity-40 font-bold uppercase tracking-widest">No questions found</div>
                    )}
                </div>
            </motion.div>
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
    const [editingProblem, setEditingProblem] = useState(null); 
    const [savingProblem, setSavingProblem] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isBankOpen, setIsBankOpen] = useState(false);

    const [meta, setMeta] = useState({ title: '', description: '', duration_minutes: 90, passing_score: 70 });

    const load = async () => {
        try {
            const data = await api.get(`/assessments/${id}/`);
            setAssessment(data);
            setMeta({ title: data.title, description: data.description || '', duration_minutes: data.duration_minutes, passing_score: data.passing_score });
            // Questions are fetched directly from the JSONB questions_data field
            setProblems(data.questions || []);
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
            await api.patch(`/assessments/${id}/`, meta);
            setSuccess('Assessment settings updated!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            setError(e.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleSaveProblem = async (form) => {
        setSavingProblem(true);
        try {
            const payload = { ...form };
            if (payload.type !== 'coding') delete payload.coding_details;
            if (payload.type !== 'mcq') delete payload.mcq_details;
            if (payload.type !== 'subjective') delete payload.subjective_details;

            if (form.question_id) {
                // Update existing
                const res = await api.patch(`/assessments/${id}/questions/${form.question_id}/`, payload);
                setProblems(res.assessment.questions);
            } else {
                // Create new and add
                const res = await api.post(`/assessments/${id}/questions/add/`, payload);
                setProblems(res.assessment.questions);
            }
            setEditingProblem(null);
            setSuccess('Question saved successfully!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            const msg = e.message || 'Failed to save question';
            setError(msg);
            if (editingProblem) {
                setEditingProblem(prev => ({ ...prev, error: msg }));
            }
        } finally { setSavingProblem(false); }
    };

    const handleSelectFromBank = async (bankProb) => {
        setSavingProblem(true);
        try {
            // Add from pool using question_id
            const res = await api.post(`/assessments/${id}/questions/add/`, { question_id: bankProb.question_id });
            setProblems(res.assessment.questions);
            setIsBankOpen(false);
            setSuccess('Question added from bank!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (e) {
            setError(e.message || 'Failed to add question from bank');
        } finally { setSavingProblem(false); }
    };

    const handleDeleteProblem = async (questionId) => {
        if (!confirm('Remove this question from the assessment? (It remains in the org pool)')) return;
        try {
            const res = await api.post(`/assessments/${id}/questions/remove/`, { question_id: questionId });
            setProblems(res.assessment.questions);
        } catch { alert('Failed to remove question'); }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.push('/recruiter/assessments')} className="p-4 rounded-2xl bg-secondary border border-border transition-all hover:bg-emerald-500/10 hover:text-emerald-500 group">
                        <HiOutlineChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gradient leading-none">Assessment Workspace</h1>
                        <p className="text-muted-foreground font-medium mt-1">Configure your evaluation flow and questions</p>
                    </div>
                </div>
            </div>

            {error && <div className="p-6 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-3">
                <HiOutlineXMark className="w-6 h-6" /> {error}
            </div>}
            {success && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center gap-3">
                <HiOutlineCheckCircle className="w-6 h-6" /> {success}
            </motion.div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Metadata */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass p-8 rounded-[3rem] border border-emerald-500/10 space-y-8 sticky top-24">
                        <div className="flex items-center gap-3 text-emerald-500">
                            <HiOutlineBeaker className="w-6 h-6" />
                            <h2 className="font-black text-sm uppercase tracking-widest">General Settings</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Assessment Title</label>
                                <input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                                    className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Instructions</label>
                                <textarea rows="4" value={meta.description} onChange={e => setMeta(m => ({ ...m, description: e.target.value }))}
                                    className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none resize-none font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Duration (m)</label>
                                    <input type="number" value={meta.duration_minutes} onChange={e => setMeta(m => ({ ...m, duration_minutes: Number(e.target.value) }))}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Pass (%)</label>
                                    <input type="number" value={meta.passing_score} onChange={e => setMeta(m => ({ ...m, passing_score: Number(e.target.value) }))}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none font-bold" />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSaveMeta} disabled={saving}
                            className="w-full py-5 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Update Settings
                        </button>
                    </div>
                </div>

                {/* Right: Problems */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Assessment Structure</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setIsBankOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary border border-border font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/5 hover:text-emerald-500 transition-all">
                                <HiOutlineSparkles className="w-4 h-4" /> From Bank
                            </button>
                            <button onClick={() => setEditingProblem({ ...EMPTY_PROBLEM, order_number: problems.length })}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                                <HiOutlinePlus className="w-4 h-4" /> New Question
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {problems.length === 0 && !editingProblem && (
                            <div className="py-32 text-center glass rounded-[4rem] border-dashed border-2 border-border/50">
                                <HiOutlineBeaker className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter opacity-40">Workspace Empty</h3>
                                <p className="text-muted-foreground font-medium mt-2">Add at least one question to this assessment</p>
                            </div>
                        )}

                        {problems.map((p, i) => (
                            <div key={p.question_id || i} className="relative group">
                                {editingProblem?.question_id === p.question_id && p.question_id ? (
                                    <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                                ) : (
                                    <div className="glass border border-emerald-500/10 rounded-[2.5rem] p-8 flex items-center justify-between gap-6 hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-lg font-black italic text-emerald-600 shrink-0">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold">{p.title}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${DIFFICULTY_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase opacity-40">
                                                        {p.type === 'coding' && <HiOutlineCommandLine className="w-3.5 h-3.5" />}
                                                        {p.type === 'mcq' && <HiOutlineListBullet className="w-3.5 h-3.5" />}
                                                        {p.type === 'subjective' && <HiOutlineChatBubbleBottomCenterText className="w-3.5 h-3.5" />}
                                                        {p.type} · {p.marks} Marks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => setEditingProblem(p)} className="p-4 rounded-2xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-border transition-all">
                                                <HiOutlinePencilSquare className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteProblem(p.question_id)} className="p-4 rounded-2xl bg-secondary hover:bg-red-500/10 hover:text-red-400 border border-border transition-all">
                                                <HiOutlineTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {editingProblem && !editingProblem.question_id && (
                            <ProblemForm initial={editingProblem} onSave={handleSaveProblem} onCancel={() => setEditingProblem(null)} saving={savingProblem} />
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isBankOpen && (
                    <ProblemBankModal onSelect={handleSelectFromBank} onClose={() => setIsBankOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
