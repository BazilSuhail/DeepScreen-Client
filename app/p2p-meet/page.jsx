"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiVideoCamera, HiPlus, HiOutlineCalendar, HiOutlineVideoCamera, HiShieldCheck } from "react-icons/hi";
import { MdKeyboard } from "react-icons/md";
import Link from "next/link";

export default function P2PMeetLanding() {
    return (
        <div className="min-h-screen bg-white pt-20 font-poppins text-slate-900 overflow-hidden">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-8 py-16 lg:py-24 grid lg:grid-cols-2 items-center gap-16">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.1] text-slate-900">
                            Secure P2P video calls <span className="text-emerald-500 italic">without servers</span>.
                        </h1>
                        <p className="text-sm font-[700] text-slate-400 max-w-lg leading-relaxed uppercase tracking-wider">
                            Experience true peer-to-peer communication. No data stored, no middlemen. Just you and your peer, directly connected.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link href="/interview">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 rounded-xl text-white font-[700] flex items-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all text-[11px] uppercase tracking-widest"
                            >
                                <HiPlus size={16} />
                                Start Meeting
                            </motion.button>
                        </Link>
                    </div>

                    <div className="w-full h-[1px] bg-slate-100"></div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <HiShieldCheck className="text-emerald-600" size={20} />
                            </div>
                            <div>
                                <p className="text-slate-900 font-bold text-sm">End-to-End Encrypted</p>
                                <p className="text-slate-500 text-xs font-medium">Direct peer connection, no server storage</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <HiVideoCamera className="text-emerald-600" size={20} />
                            </div>
                            <div>
                                <p className="text-slate-900 font-bold text-sm">HD Video & Audio</p>
                                <p className="text-slate-500 text-xs font-medium">Crystal clear communication with low latency</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-slate-100"></div>

                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-emerald-500 font-black text-xs uppercase tracking-widest hover:underline transition-all">
                            Learn more
                        </Link>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Powered by PeerJS</span>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-[60px] blur-3xl transform -rotate-6 transition-transform group-hover:rotate-0 duration-1000"></div>

                    <div className="relative bg-white border border-slate-200 rounded-[32px] p-6 overflow-hidden shadow-2xl">
                        <div className="relative aspect-video rounded-[24px] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-[1.01] transition-transform duration-700">
                            <div className="absolute inset-0 bg-grid-slate-500/[0.03] bg-[size:25px_25px]"></div>
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-xl border border-slate-100">
                                    <HiOutlineVideoCamera size={28} className="animate-pulse" />
                                </div>
                                <p className="text-slate-400 font-[700] text-[9px] uppercase tracking-[0.3em]">Connection Ready</p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
                                    P2P Meeting <span className="text-emerald-500 italic">Beta</span>
                                </h3>
                                <p className="text-slate-400 font-[700] text-[9px] uppercase tracking-widest">Protocol: WebRTC</p>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2].map(i => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-[700] text-slate-500 uppercase`}>
                                        {i}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Floating UI elements */}
                    <div className="absolute -top-10 -right-10 bg-white border border-slate-100 p-6 rounded-3xl shadow-xl animate-bounce-slow">
                        <HiShieldCheck className="text-emerald-500 mb-2" size={24} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encrypted</p>
                        <p className="text-slate-900 font-black text-sm">100% Secure</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
