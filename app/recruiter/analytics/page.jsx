"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  HiOutlinePlus,
  HiOutlineBeaker,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { AssessmentSetupCard } from "@/components/assessments/AssessmentCard";

export default function RecruiterAssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const assessData = await api.get("/assessments/");
      setAssessments(assessData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to synchronize assessment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleArchive = async (id) => {
    if (
      !confirm(
        "Archive this assessment? Active candidates will still be able to complete it.",
      )
    )
      return;
    try {
      await api.patch(`/assessments/${id}/`, { is_active: false });
      setAssessments((prev) =>
        prev.map((a) =>
          a.assessment_id === id ? { ...a, is_active: false } : a,
        ),
      );
      setSuccessMsg("Assessment moved to archives.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Archive operation failed");
    }
  };

  const filteredAssessments = assessments.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500" />
          <HiOutlineBeaker className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
      </div>
    );

  return (
    <div className="w-full px-4 md:px-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Assessments
            </h1>
            <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-500/0 rounded-full" />
          </div>
          <div className="h-8 w-px bg-border/60" />
          <span className="text-xs font-semibold text-muted-foreground/50 bg-secondary/40 px-3 py-1.5 rounded-full border border-border/50">
            {filteredAssessments.length} total
          </span>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assessments..."
              className="pl-9 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none transition-all w-full md:w-56 text-sm"
            />
          </div>
          <button
            onClick={() => router.push("/recruiter/assessments/create")}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <HiOutlinePlus className="w-4 h-4" /> Create New
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold flex items-center gap-2.5">
          <HiOutlineXMark className="w-5 h-5" /> {error}
        </div>
      )}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center gap-2.5"
        >
          <HiOutlineSparkles className="w-5 h-5" /> {successMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredAssessments.map((a, i) => (
          <AssessmentSetupCard
            key={a.assessment_id}
            assessment={a}
            index={i}
            onEdit={(assessment) =>
              router.push(`/recruiter/assessments/${assessment.assessment_id}`)
            }
            onDelete={handleArchive}
            onSessions={(assessment) =>
              router.push(
                `/recruiter/assessments/${assessment.assessment_id}/sessions`,
              )
            }
          />
        ))}
        {filteredAssessments.length === 0 && (
          <div className="col-span-full py-24 text-center bg-card border border-dashed border-border rounded-2xl">
            <HiOutlineBeaker className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <h3 className="text-xl font-bold text-muted-foreground/40">
              No Results Found
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Create a new assessment to begin evaluating candidates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
