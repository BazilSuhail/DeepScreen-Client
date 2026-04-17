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
  HiOutlineDocumentText,
} from "react-icons/hi2";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 w-full px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <HiOutlineMicrophone className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold">AI Interviews</h1>
          </div>
          <p className="text-muted-foreground font-medium text-sm max-w-xl leading-relaxed">
            Configure, manage, and review AI-powered candidate interviews.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-emerald-500/50 transition-all w-[280px] text-sm font-medium"
            />
          </div>
          <Link
            href="/recruiter/ai-interview/create"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
          >
            <HiOutlinePlus className="w-5 h-5" /> New Interview
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-32 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto text-muted-foreground">
            <HiOutlineMicrophone className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No AI Interviews configured</h3>
            <p className="text-muted-foreground text-sm">
              Create your first automated interview to start screening
              candidates.
            </p>
          </div>
          <Link
            href="/recruiter/ai-interview/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <HiOutlinePlus className="w-5 h-5" /> Setup Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((interview, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              key={interview.interview_id}
              className="glass border border-border rounded-2xl p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1 min-w-0">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                      {interview.job_title || "Interview"}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight group-hover:text-emerald-500 transition-colors leading-tight">
                      {interview.title?.length > 25
                        ? `${interview.title.slice(0, 25)}...`
                        : interview.title}
                    </h3>
                    <p className="text-muted-foreground text-[12px] line-clamp-2 font-medium leading-relaxed">
                      {interview.description?.length > 90
                        ? `${interview.description.slice(0, 90)}...`
                        : interview.description || "No description"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
                    <HiOutlineDocumentText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {interview.number_of_questions}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                      Questions
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
                    <HiOutlineUserGroup className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {interview.session_count || 0}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                      Sessions
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
                    <HiOutlineClock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {interview.duration_minutes}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                      Minutes
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={`/recruiter/ai-interview/${interview.interview_id}`}
                    className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <HiOutlineCog6Tooth className="w-4 h-4" /> Edit
                  </Link>
                  <Link
                    href={`/recruiter/ai-interview/${interview.interview_id}/sessions`}
                    className="flex-1 py-3.5 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
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
