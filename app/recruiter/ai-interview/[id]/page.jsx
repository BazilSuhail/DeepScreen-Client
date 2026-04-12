"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  HiOutlineChevronLeft,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineListBullet,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import AIAssistantPanel from "@/components/ai-interview/recruiter/AIAssistantPanel";

export default function RecruiterAIInterviewDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [activeTab, setActiveTab] = useState("config");

  const [form, setForm] = useState({
    title: "",
    description: "",
    system_prompt: "",
    context_for_ai: "",
    evaluation_criteria: {},
    number_of_questions: 5,
    duration_minutes: 20,
    passing_score: 65,
    questions: [],
  });

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'config' || tab === 'assistant') setActiveTab(tab);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/ai-interviews/${id}/`);
        setInterview(data);
        setForm({
          title: data.title,
          description: data.description || "",
          system_prompt: data.system_prompt || "",
          context_for_ai: data.context_for_ai || "",
          evaluation_criteria: data.evaluation_criteria || {},
          number_of_questions: data.number_of_questions,
          duration_minutes: data.duration_minutes,
          passing_score: data.passing_score,
          questions: data.questions || [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBack = () => {
    setNavigating(true);
    router.back();
  };

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/ai-interviews/${id}/`, form);
      setInterview({ ...interview, ...res });
      alert("Interview configuration updated");
    } catch (e) {
      alert(e.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const applyAIConfig = (config) => {
    setForm((prev) => ({
      ...prev,
      title: config.title || prev.title,
      description: config.description || prev.description,
      system_prompt: config.system_prompt || prev.system_prompt,
      context_for_ai: config.context_for_ai || prev.context_for_ai,
      evaluation_criteria: config.evaluation_criteria || prev.evaluation_criteria,
      questions: config.questions || prev.questions,
      number_of_questions: config.number_of_questions || prev.number_of_questions,
      duration_minutes: config.duration_minutes || prev.duration_minutes,
      passing_score: config.passing_score ?? prev.passing_score,
    }));
  };

  if (loading || navigating)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
      </div>
    );

  return (
    <div className="w-full px-4 md:px-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-colors font-bold text-[10px] uppercase tracking-widest group"
        >
          <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Back to Interviews
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                {interview.job_title}
              </span>
              <h1 className="text-4xl font-bold">
                {interview.title?.length > 15 ? `${interview.title.slice(0, 15)}...` : interview.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/recruiter/ai-interview/${id}/sessions`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary/30 border border-border hover:border-emerald-500/30 font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              <HiOutlineUserGroup className="w-4 h-4" /> View Sessions
            </Link>
            <div className="flex items-center bg-secondary/30 p-1.5 rounded-xl border border-border">
              <button
                onClick={() => setActiveTab("config")}
                className={`px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === "config" ? "bg-card dark:bg-card text-emerald-500 shadow-xl shadow-black/10" : "text-muted-foreground hover:text-emerald-500"}`}
              >
                LLM Configuration
              </button>
              <button
                onClick={() => setActiveTab("assistant")}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === "assistant" ? "bg-card dark:bg-card text-emerald-500 shadow-xl shadow-black/10" : "text-muted-foreground hover:text-emerald-500"}`}
              >
                <HiOutlineSparkles className="w-4 h-4" /> AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* ── Tabs Content ──────────────────────────────────────────────── */}
      {activeTab === "assistant" ? (
        <AIAssistantPanel
          form={form}
          interview={interview}
          onApplyConfig={applyAIConfig}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Prompting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border border-border rounded-2xl p-10 space-y-8"
            >
              <div className="flex items-center gap-3 border-b border-border pb-6">
                <HiOutlineSparkles className="w-6 h-6 text-emerald-500" />
                <h3 className="text-xl font-bold">System Intelligence</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">
                    Master Interviewer Prompt
                  </label>
                  <textarea
                    value={form.system_prompt}
                    onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                    rows={6}
                    placeholder="Instructions for the AI on how to conduct the interview..."
                    className="w-full p-8 rounded-xl bg-secondary/20 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium leading-relaxed"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">
                    Job Context (Hidden from Candidate)
                  </label>
                  <textarea
                    value={form.context_for_ai}
                    onChange={(e) => setForm({ ...form, context_for_ai: e.target.value })}
                    rows={4}
                    placeholder="Add specific details about the job, culture, or project that the AI should keep in mind during evaluation..."
                    className="w-full p-8 rounded-xl bg-secondary/20 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium leading-relaxed"
                  />
                </div>
              </div>
            </motion.div>

            {/* Evaluation Criteria */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass border border-border rounded-2xl p-10 space-y-8"
            >
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-3">
                  <HiOutlineCheckCircle className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-xl font-bold">Scoring Metrics</h3>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Metric name (e.g. Communication):");
                    if (name) setForm({ ...form, evaluation_criteria: { ...form.evaluation_criteria, [name]: 0.2 } });
                  }}
                  className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest hover:underline"
                >
                  <HiOutlinePlusCircle className="w-4 h-4" /> Add Metric
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(form.evaluation_criteria).map(([name, weight]) => (
                  <div key={name} className="flex items-center justify-between p-6 rounded-xl bg-secondary/30 border border-border">
                    <div className="space-y-1">
                      <span className="text-sm font-bold uppercase tracking-tight">{name.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${Math.round(weight * 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold opacity-40">{Math.round(weight * 100)}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const next = { ...form.evaluation_criteria };
                        delete next[name];
                        setForm({ ...form, evaluation_criteria: next });
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {Object.keys(form.evaluation_criteria).length === 0 && (
                  <p className="col-span-full text-center py-6 text-muted-foreground text-xs font-medium">
                    Define criteria like "Communication", "Technical Depth", etc. to guide the AI evaluator.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Question Pool */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass border border-border rounded-2xl p-10 space-y-8"
            >
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-3">
                  <HiOutlineListBullet className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-xl font-bold">Question Pool</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...form.questions, "New question text..."];
                      setForm({ ...form, questions: next });
                    }}
                    className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest hover:underline"
                  >
                    <HiOutlinePlusCircle className="w-4 h-4" /> Add Manually
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {form.questions.map((q, idx) => (
                  <div key={idx} className="group flex items-start gap-6 p-6 rounded-xl bg-secondary/20 border border-border hover:border-emerald-500/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-[10px] font-bold opacity-30 shrink-0">
                      {idx + 1}
                    </div>
                    <textarea
                      value={q}
                      onChange={(e) => {
                        const next = [...form.questions];
                        next[idx] = e.target.value;
                        setForm({ ...form, questions: next });
                      }}
                      className="flex-1 bg-transparent outline-none text-sm font-medium leading-relaxed pt-2 resize-none h-auto"
                      rows={2}
                    />
                    <button
                      onClick={() => {
                        const next = form.questions.filter((_, i) => i !== idx);
                        setForm({ ...form, questions: next });
                      }}
                      className="p-3 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {form.questions.length === 0 && (
                  <div className="py-12 text-center space-y-4 border-2 border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground text-sm font-medium">
                      No specific questions defined. The AI will generate questions dynamically if the pool is empty.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-10">
            {/* Settings */}
            <div className="glass border border-border rounded-2xl p-10 space-y-8 sticky top-10">
              <h3 className="text-xl font-bold border-b border-border pb-6">
                Session Parameters
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Passing Score (%)</label>
                  <input
                    type="number"
                    value={form.passing_score}
                    onChange={(e) => setForm({ ...form, passing_score: +e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border outline-none font-bold text-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Questions Count</label>
                  <input
                    type="number"
                    value={form.number_of_questions}
                    onChange={(e) => setForm({ ...form, number_of_questions: +e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border outline-none font-bold text-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Time Limit (Min)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border outline-none font-bold text-xl"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-6 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {saving ? "Syncing..." : <><HiOutlineSparkles className="w-5 h-5" /> Save Configuration</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
