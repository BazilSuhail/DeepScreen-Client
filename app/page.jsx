"use client";

import React from 'react';
import Link from 'next/link';
import { HiOutlineArrowNarrowRight, HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineTerminal } from 'react-icons/hi';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Structural Minimalist Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10 opacity-40"></div>

      <div className="max-w-7xl mx-auto px-12 pt-32 pb-20">
        <div className="grid grid-cols-12 gap-12 items-center">

          {/* Main Hero Section */}
          <div className="col-span-12 lg:col-span-7 space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
              <HiOutlineSparkles className="text-emerald-600 animate-pulse" size={18} />
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">Next Generation Screening</span>
            </div>

            <h1 className="text-[120px] leading-[0.9] font-black tracking-tighter text-slate-900">
              Deep <br />
              <span className="text-emerald-500 italic">Screening</span>
            </h1>

            <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              We leverage neural intelligence to evaluate talent beyond resumes. Pure potential, precisely decoded.
            </p>

            <div className="flex items-center gap-8 pt-6">
              <Link
                href="/auth/register"
                className="group relative px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                Get Secured Access
                <HiOutlineArrowNarrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="/auth/login" className="text-slate-400 hover:text-emerald-600 font-bold transition-all border-b-2 border-transparent hover:border-emerald-500/30 pb-1">
                Member Sign-in
              </Link>
            </div>

            <div className="flex gap-12 pt-12 border-t border-slate-100">
              <div>
                <p className="text-3xl font-black text-slate-900">12k+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Screened Daily</p>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">99.8%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Accuracy Rate</p>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">0.4s</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Latency</p>
              </div>
            </div>
          </div>

          {/* Unique Visual Element */}
          <div className="col-span-12 lg:col-span-5 relative">
            <div className="relative aspect-square bg-slate-50 rounded-[60px] border border-slate-200 shadow-[0_0_100px_rgba(0,0,0,0.02)] flex items-center justify-center p-12 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>

              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-slate-200 flex items-center justify-center text-emerald-500">
                    <HiOutlineShieldCheck size={32} />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-slate-900">DEEP</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em]">System v2.0</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4 animate-[shimmer_2s_infinite]"></div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-1/2 animate-[shimmer_2s_infinite_0.5s]"></div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-300 w-2/3 animate-[shimmer_2s_infinite_1s]"></div>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm transform group-hover:-translate-y-2 transition-transform duration-500">
                  <HiOutlineTerminal className="text-emerald-500" size={24} />
                  <div className="flex-1">
                    <div className="h-2 bg-slate-100 rounded w-1/3 mb-2"></div>
                    <div className="h-2 bg-slate-50 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 max-w-[240px] animate-bounce-slow">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <HiOutlineSparkles size={20} />
              </div>
              <p className="text-sm font-black text-slate-800 leading-tight">AI Talent Verification <br /><span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Enabled</span></p>
            </div>
          </div>

        </div>

        {/* Categories Section */}
        <div className="mt-40 grid grid-cols-4 gap-8">
          {[
            { title: 'Neural Analysis', desc: 'Decoding cognitive patterns' },
            { title: 'Safe Protocols', desc: 'Enterprise grade security' },
            { title: 'Fast Execution', desc: 'Real-time feedback loops' },
            { title: 'Dynamic Match', desc: 'Context aware intelligence' }
          ].map((item, idx) => (
            <div key={idx} className="p-10 border border-slate-100 rounded-[40px] hover:border-emerald-500/20 hover:bg-emerald-50/30 transition-all group">
              <span className="text-emerald-200 font-black text-5xl mb-6 block group-hover:text-emerald-500 transition-colors">0{idx + 1}</span>
              <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}