'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
    HiOutlineSparkles, HiOutlineHandThumbUp, 
    HiOutlineHandThumbDown, HiOutlineDocumentText 
} from 'react-icons/hi2';

export function SessionResultCard({ session, onDecision, passingScore }) {
    const isPassed = session.overall_score >= passingScore;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-border rounded-[2rem] p-8 hover:border-emerald-500/20 transition-all group"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-emerald-500 font-black text-lg italic">
                        {session.candidate_name?.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-xl font-black italic uppercase tracking-tight">{session.candidate_name}</h4>
                        <p className="text-slate-400 text-xs font-medium">{session.candidate_email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8 lg:border-l lg:border-border lg:pl-8">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">AI Score</span>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xl font-black ${isPassed ? 'text-emerald-500' : 'text-red-400'}`}>
                                {session.overall_score || 0}%
                            </span>
                            {isPassed && <HiOutlineSparkles className="w-4 h-4 text-emerald-500" />}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onDecision(session.session_id, 'reject')}
                            className="p-3 rounded-xl bg-secondary hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all border border-border"
                        >
                            <HiOutlineHandThumbDown className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => onDecision(session.session_id, 'select', true)}
                            className="px-6 h-12 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                        >
                            <HiOutlineHandThumbUp className="w-4 h-4" /> Hire
                        </button>
                    </div>
                </div>
            </div>

            {session.overall_feedback && (
                <div className="mt-6 p-5 rounded-2xl bg-secondary/20 border border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                        <HiOutlineDocumentText className="w-4 h-4" /> AI Summary
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3">
                        {session.overall_feedback}
                    </p>
                </div>
            )}
        </motion.div>
    );
}
