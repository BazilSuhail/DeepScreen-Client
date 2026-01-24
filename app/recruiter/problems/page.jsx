'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HiOutlinePlus, 
    HiOutlinePuzzlePiece, 
    HiOutlineTag,
    HiOutlineTrash,
    HiOutlinePencilSquare,
    HiOutlineXMark,
    HiOutlineMagnifyingGlass,
    HiOutlineAcademicCap,
    HiOutlineCodeBracket
} from 'react-icons/hi2';

export default function RecruiterProblemsPage() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    
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
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Problem Bank</h1>
                    <p className="text-muted-foreground mt-1">Reusable coding challenges for your assessments</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Create Problem
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {problems.map((prob, i) => (
                    <motion.div
                        key={prob.problem_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass p-6 rounded-[2rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                                <HiOutlineCodeBracket className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors">{prob.title}</h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                                        prob.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' :
                                        prob.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-red-500/10 text-red-500'
                                    }`}>
                                        {prob.difficulty}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <HiOutlineTag className="w-3 h-3" />
                                        {prob.points} Points
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-3 rounded-xl bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                                <HiOutlinePencilSquare className="w-5 h-5" />
                            </button>
                            <button className="p-3 rounded-xl bg-secondary hover:bg-red-500/10 hover:text-red-500 transition-all">
                                <HiOutlineTrash className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Problem Modal (Simplified for demo) */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-emerald-500/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-emerald-500/5 flex justify-between items-center bg-emerald-500/5">
                                <h2 className="text-2xl font-black">Create Problem</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                                    <HiOutlineXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Problem Title</label>
                                    <input 
                                        required value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. Reverse a String"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Problem Statement</label>
                                    <textarea 
                                        required rows="4" value={formData.problem_statement}
                                        onChange={(e) => setFormData({...formData, problem_statement: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all resize-none"
                                        placeholder="Write a function that..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Difficulty</label>
                                        <select 
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-50 px-2">Points</label>
                                        <input 
                                            type="number" value={formData.points}
                                            onChange={(e) => setFormData({...formData, points: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="p-8 border-t border-emerald-500/5 bg-emerald-500/5 flex justify-end gap-4">
                                <button 
                                    type="button" onClick={() => setIsCreateModalOpen(false)}
                                    className="px-8 py-3 rounded-2xl bg-secondary font-bold border border-border"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreate}
                                    className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20"
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
