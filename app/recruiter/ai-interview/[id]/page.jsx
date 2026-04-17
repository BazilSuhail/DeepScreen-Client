"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  HiOutlineChevronLeft,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineListBullet,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineHashtag,
  HiOutlineBars3BottomLeft,
  HiOutlineStar,
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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-emerald-500" />
          <HiOutlineSparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 pb-32 space-y-10 pt-6">
      
      {/* Premium Header Architecture */}
      <div className="flex flex-col gap-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2.5 text-muted-foreground hover:text-emerald-400 transition-colors font-black text-xs uppercase tracking-widest group pl-1"
        >
          <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Interviews
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-secondary/5 border border-border/60 p-6 rounded-2xl shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/[0.07] text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-inner">
                {interview.job_title}
              </span>
              <span className="text-muted-foreground text-xs opacity-50 font-mono">ID: {id}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {interview.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/recruiter/ai-interview/${id}/sessions`}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-secondary/40 border border-border/80 hover:border-emerald-500/40 text-foreground font-black text-xs uppercase tracking-widest transition-all shadow-md"
            >
              <HiOutlineUserGroup className="w-4 h-4 text-muted-foreground" /> View Sessions
            </Link>
            
            <div className="flex items-center bg-black/20 p-1.5 rounded-xl border border-border/80">
              <button
                onClick={() => setActiveTab("config")}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === "config" 
                    ? "bg-card text-emerald-400 shadow-xl border border-border/40" 
                    : "text-muted-foreground hover:text-emerald-400"
                }`}
              >
                LLM Configuration
              </button>
              <button
                onClick={() => setActiveTab("assistant")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === "assistant" 
                    ? "bg-card text-emerald-400 shadow-xl border border-border/40" 
                    : "text-muted-foreground hover:text-emerald-400"
                }`}
              >
                <HiOutlineSparkles className="w-4 h-4" /> AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Workspace Content */}
      <AnimatePresence mode="wait">
        {activeTab === "assistant" ? (
          <motion.div 
            key="assistant"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start"
          >
            {/* Left Primary Window: Conversational Panel */}
            <div className="xl:col-span-3">
              <AIAssistantPanel
                form={form}
                interview={interview}
                onApplyConfig={applyAIConfig}
              />
            </div>

            {/* Right Column Workspace: Live Captured Parameters Sidebar */}
            <div className="xl:col-span-1 glass border border-border/80 rounded-2xl p-6 bg-secondary/5 space-y-6 sticky top-10 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <HiOutlineHashtag className="w-4 h-4 text-emerald-400" /> Live Manifest Monitor
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Synced
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-muted-foreground tracking-wider uppercase block">CURRENT WORKING TITLE</span>
                <div className="text-sm font-bold text-foreground bg-secondary/40 border border-border/60 px-4 py-3 rounded-xl truncate">
                  {form.title || "Untitled Blueprint"}
                </div>
              </div>

              {/* Parameter Metrics Cards */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-secondary/40 p-3.5 rounded-xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineClock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground tracking-tight">Duration Guideline</span>
                  </div>
                  <span className="text-sm font-black font-mono text-emerald-400">{form.duration_minutes}m</span>
                </div>

                <div className="bg-secondary/40 p-3.5 rounded-xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineDocumentText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground tracking-tight">Active Target Prompts</span>
                  </div>
                  <span className="text-sm font-black font-mono text-emerald-400">{form.number_of_questions} Qs</span>
                </div>

                <div className="bg-secondary/40 p-3.5 rounded-xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground tracking-tight">Passing Threshold</span>
                  </div>
                  <span className="text-sm font-black font-mono text-emerald-400">{form.passing_score}%</span>
                </div>
              </div>

              {/* Evaluation Weights Preview */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-black text-muted-foreground tracking-wider uppercase block flex items-center gap-1.5">
                  <HiOutlineStar className="w-3.5 h-3.5 text-emerald-400" /> Evaluation Vector Scales
                </span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {Object.entries(form.evaluation_criteria).map(([name, weight]) => (
                    <div key={name} className="p-3 bg-secondary/20 border border-border rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold uppercase text-[10px] text-muted-foreground truncate max-w-[120px]">{name.replace(/_/g, " ")}</span>
                      <span className="font-black font-mono text-emerald-400">{Math.round(weight * 100)}%</span>
                    </div>
                  ))}
                  {Object.keys(form.evaluation_criteria).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-xs opacity-50 italic">No evaluation vectors parsed.</div>
                  )}
                </div>
              </div>

              {/* System Prompt Instructions Segment Snapshot */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-muted-foreground tracking-wider uppercase block flex items-center gap-1.5">
                  <HiOutlineBars3BottomLeft className="w-3.5 h-3.5" /> Instructions Module Snapshot
                </span>
                <div className="p-3.5 bg-black/30 border border-border/80 rounded-xl text-[11px] font-mono leading-relaxed text-muted-foreground max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                  {form.system_prompt || "No instructions currently injected into prompt framework structure."}
                </div>
              </div>

              {/* Manual Commit Changes Trigger from AI Tab */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs uppercase tracking-widest text-white transition-all shadow-md flex items-center justify-center gap-2"
              >
                {saving ? "Deploying..." : "Commit LLM Updates"}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Classic Static LLM Setup Fields */
          <motion.div 
            key="config"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            <div className="lg:col-span-2 space-y-10">
              {/* Prompting */}
              <div className="glass border border-border rounded-2xl p-8 md:p-10 space-y-8 shadow-xl">
                <div className="flex items-center gap-3 border-b border-border pb-6">
                  <HiOutlineSparkles className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-xl font-extrabold tracking-tight">System Intelligence</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">
                      Master Interviewer Prompt
                    </label>
                    <textarea
                      value={form.system_prompt}
                      onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                      rows={6}
                      placeholder="Instructions for the AI on how to conduct the interview..."
                      className="w-full p-6 rounded-xl bg-secondary/20 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium leading-relaxed font-mono"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">
                      Job Context (Hidden from Candidate)
                    </label>
                    <textarea
                      value={form.context_for_ai}
                      onChange={(e) => setForm({ ...form, context_for_ai: e.target.value })}
                      rows={4}
                      placeholder="Add specific details about the job, culture, or project that the AI should keep in mind during evaluation..."
                      className="w-full p-6 rounded-xl bg-secondary/20 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div className="glass border border-border rounded-2xl p-8 md:p-10 space-y-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div className="flex items-center gap-3">
                    <HiOutlineCheckCircle className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-extrabold tracking-tight">Scoring Metrics</h3>
                  </div>
                  <button
                    onClick={() => {
                      const name = prompt("Metric name (e.g. Communication):");
                      if (name) setForm({ ...form, evaluation_criteria: { ...form.evaluation_criteria, [name]: 0.2 } });
                    }}
                    className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    <HiOutlinePlusCircle className="w-4 h-4" /> Add Metric
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(form.evaluation_criteria).map(([name, weight]) => (
                    <div key={name} className="flex items-center justify-between p-6 rounded-xl bg-secondary/30 border border-border transition-all hover:border-border/100">
                      <div className="space-y-1.5 flex-1 pr-4">
                        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{name.replace(/_/g, " ")}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round(weight)}%` }} />
                          </div>
                          <span className="text-xs font-black font-mono text-emerald-400">{Math.round(weight)}%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const next = { ...form.evaluation_criteria };
                          delete next[name];
                          setForm({ ...form, evaluation_criteria: next });
                        }}
                        className="p-2.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {Object.keys(form.evaluation_criteria).length === 0 && (
                    <p className="col-span-full text-center py-8 text-muted-foreground text-sm font-medium opacity-60">
                      Define criteria like "Communication", "Technical Depth", etc. to guide the AI evaluator.
                    </p>
                  )}
                </div>
              </div>

              {/* Question Pool */}
              <div className="glass border border-border rounded-2xl p-8 md:p-10 space-y-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div className="flex items-center gap-3">
                    <HiOutlineListBullet className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-extrabold tracking-tight">Question Pool</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...form.questions, "New question text..."];
                      setForm({ ...form, questions: next });
                    }}
                    className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    <HiOutlinePlusCircle className="w-4 h-4" /> Add Manually
                  </button>
                </div>

                <div className="space-y-4">
                  {form.questions.map((q, idx) => (
                    <div key={idx} className="group flex items-start gap-5 p-5 rounded-xl bg-secondary/20 border border-border hover:border-emerald-500/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-black font-mono text-muted-foreground opacity-40 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <textarea
                        value={q}
                        onChange={(e) => {
                          const next = [...form.questions];
                          next[idx] = e.target.value;
                          setForm({ ...form, questions: next });
                        }}
                        className="flex-1 bg-transparent outline-none text-sm font-medium leading-relaxed pt-1.5 resize-none h-auto"
                        rows={2}
                      />
                      <button
                        onClick={() => {
                          const next = form.questions.filter((_, i) => i !== idx);
                          setForm({ ...form, questions: next });
                        }}
                        className="p-3 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {form.questions.length === 0 && (
                    <div className="py-12 text-center space-y-4 border-2 border-dashed border-border rounded-xl opacity-60">
                      <p className="text-muted-foreground text-sm font-medium">
                        No specific questions defined. The AI will generate questions dynamically if the pool is empty.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Session Parameters Right Column */}
            <div className="space-y-10">
              <div className="glass border border-border rounded-2xl p-8 md:p-10 space-y-8 sticky top-10 shadow-xl">
                <h3 className="text-xl font-extrabold tracking-tight border-b border-border pb-6">
                  Session Parameters
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 pl-1">Passing Score (%)</label>
                    <input
                      type="number"
                      value={form.passing_score}
                      onChange={(e) => setForm({ ...form, passing_score: +e.target.value })}
                      className="w-full px-5 py-4 rounded-xl bg-secondary/30 border border-border focus:border-emerald-500/50 outline-none font-black text-xl font-mono transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 pl-1">Questions Count</label>
                    <input
                      type="number"
                      value={form.number_of_questions}
                      onChange={(e) => setForm({ ...form, number_of_questions: +e.target.value })}
                      className="w-full px-5 py-4 rounded-xl bg-secondary/30 border border-border focus:border-emerald-500/50 outline-none font-black text-xl font-mono transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 pl-1">Time Limit (Min)</label>
                    <input
                      type="number"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })}
                      className="w-full px-5 py-4 rounded-xl bg-secondary/30 border border-border focus:border-emerald-500/50 outline-none font-black text-xl font-mono transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {saving ? "Syncing..." : <><HiOutlineSparkles className="w-5 h-5" /> Save Configuration</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}