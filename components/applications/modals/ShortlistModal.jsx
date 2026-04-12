import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HiOutlineSparkles, HiOutlineXMark, HiOutlineExclamationTriangle, HiOutlineCpuChip } from 'react-icons/hi2';

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
                    className="relative w-full max-w-md glass border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <HiOutlineCpuChip className="w-5 h-5" />
                            </div>
                            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                <HiOutlineXMark className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold mb-2">Run AI Shortlist?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This will analyze <span className="text-foreground font-bold">{totalApplicants}</span> candidates for:
                            <br />
                            <span className="text-emerald-500 font-bold">{jobTitle}</span>
                        </p>

                        <div className="mt-5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex gap-2.5">
                            <HiOutlineExclamationTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-yellow-500/80 leading-relaxed">
                                AI shortlisting uses vector embeddings to compare resumes against job requirements. This process cannot be undone.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col gap-2.5">
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                                ) : (
                                    <><HiOutlineSparkles className="w-4 h-4" /> Start AI Analysis</>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="w-full py-3.5 bg-secondary hover:bg-secondary/80 text-muted-foreground font-bold rounded-xl transition-all text-sm"
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
