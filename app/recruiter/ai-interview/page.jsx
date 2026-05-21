"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import Link from "next/link";
import { motion } from "motion/react";
import {
  HiOutlineMicrophone,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineSpeakerWave,
} from "react-icons/hi2";
import { HiOutlineDocument } from "react-icons/hi";

export default function RecruiterAIInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get("/ai-interviews/");
        setInterviews(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = interviews.filter(
    (i) =>
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.job_title?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalQuestions = interviews.reduce((sum, i) => sum + (i.number_of_questions || 0), 0);
  const totalSessions = interviews.reduce((sum, i) => sum + (i.session_count || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6 px-12">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">{[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-muted rounded-[2rem] animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-semibold">AI Interviews</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <HiOutlineSpeakerWave className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Interviews</h1>
            <p className="text-muted-foreground mt-1">Configure, manage, and review AI-powered candidate interviews</p>
          </div>
        </div>
        <Link
          href="/recruiter/ai-interview/create"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm"
        >
          <HiOutlinePlus className="w-5 h-5" /> New Interview
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Interviews", value: interviews.length, icon: HiOutlineMicrophone, color: "from-amber-500/10 to-amber-600/5 text-amber-500" },
          { label: "Total Questions", value: totalQuestions, icon: HiOutlineDocument, color: "from-blue-500/10 to-blue-600/5 text-blue-500" },
          { label: "Completed Sessions", value: totalSessions, icon: HiOutlineUserGroup, color: "from-emerald-500/10 to-emerald-600/5 text-emerald-500" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search interviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:border-emerald-500/50 outline-none transition-all text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} of {interviews.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
          <HiOutlineMicrophone className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h2 className="text-xl font-bold text-foreground mb-2">{search ? 'No Results Found' : 'No AI Interviews Configured'}</h2>
          <p className="text-muted-foreground mb-6">Create your first automated interview to start screening candidates.</p>
          <Link
            href="/recruiter/ai-interview/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm"
          >
            <HiOutlinePlus className="w-5 h-5" /> Setup Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((interview, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              key={interview.interview_id}
              className="bg-card border border-border rounded-[2rem] p-6 hover:border-amber-500/30 transition-all group"
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1 min-w-0">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                      {interview.job_title || "Interview"}
                    </span>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-amber-500 transition-colors leading-tight">
                      {interview.title}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-muted border border-border flex flex-col items-center gap-1">
                    <HiOutlineDocument className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold text-foreground">{interview.number_of_questions}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Questions</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted border border-border flex flex-col items-center gap-1">
                    <HiOutlineUserGroup className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold text-foreground">{interview.session_count || 0}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Sessions</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted border border-border flex flex-col items-center gap-1">
                    <HiOutlineClock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold text-foreground">{interview.duration_minutes}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Min</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Link href={`/recruiter/ai-interview/${interview.interview_id}`}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                    <HiOutlineCog6Tooth className="w-4 h-4" /> Edit
                  </Link>
                  <Link href={`/recruiter/ai-interview/${interview.interview_id}/sessions`}
                    className="flex-1 py-3 rounded-xl bg-card border border-border hover:bg-secondary font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <HiOutlineUserGroup className="w-4 h-4" /> Sessions
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
