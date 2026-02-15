import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HiOutlineSparkles, HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default function ShortlistModal({ isOpen, onClose, onConfirm, jobTitle, totalApplicants, loading }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md glass border border-emerald-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <HiOutlineSparkles className="w-6 h-6" />
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <HiOutlineXMark className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <h3 className="text-2xl font-black mb-2">Run AI Shortlist?</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            This will analyze <span className="text-white font-bold">{totalApplicants}</span> candidates for the position:
                            <br />
                            <span className="text-emerald-500 font-bold">"{jobTitle}"</span>
                        </p>

                        <div className="mt-6 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex gap-3">
                            <HiOutlineExclamationTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-500/80 leading-relaxed">
                                AI shortlisting uses vector embeddings to compare resumes against job requirements. This process cannot be undone.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                                ) : (
                                    'Start AI Analysis'
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="w-full py-4 bg-secondary hover:bg-secondary/80 text-muted-foreground font-bold rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
