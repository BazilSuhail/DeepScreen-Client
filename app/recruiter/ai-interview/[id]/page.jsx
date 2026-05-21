"use client";

import React, { Suspense, useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  HiOutlineCog6Tooth,
  HiOutlineArrowPath,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";
import AIAssistantPanel from "@/components/ai-interview/recruiter/AIAssistantPanel";
import EmptyState from "@/components/dashboard/EmptyState";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import FormError from "@/components/auth/FormError";

const fieldLabel = "block pl-1 text-xs font-semibold text-muted-foreground";
const fieldHint = "pl-1 text-xs text-muted-foreground/70";
const inputClass = "w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500/50";
const sectionClass = "space-y-6 rounded-xl border border-border bg-card p-5 lg:p-6";
const linkAction = "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-500 transition-colors hover:bg-emerald-500/10";

function SectionHeader({ icon: Icon, tone, title, subtitle, action = null }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function RecruiterAIInterviewDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [navigating, setNavigating] = useState(false);
  const [activeTab, setActiveTab] = useState(() => (searchParams.get("tab") === "assistant" ? "assistant" : "config"));

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
        setLoadError("");
      } catch (e) {
        console.error(e);
        setLoadError("We could not load this interview. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    setAttempt((n) => n + 1);
  };

  const handleBack = () => {
    setNavigating(true);
    router.back();
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await api.patch(`/ai-interviews/${id}/`, form);
      setInterview({ ...interview, ...res });
      alert("Interview configuration updated");
    } catch (e) {
      setSaveError(e.message || "Failed to update");
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

  if (loading || navigating) return <PageSkeleton stats={0} cards={2} />;

  if (!interview) {
    return (
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-6 px-4 pb-20 pt-6 md:px-8">
        {loadError ? (
          <>
            <FormError title="Could not load the interview" message={loadError} />
            <button
              type="button"
              onClick={retry}
              title="Load this interview again"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
            >
              <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          </>
        ) : (
          <EmptyState
            icon={HiOutlineDocumentText}
            title="Interview not found"
            text="It may have been removed. Go back to your AI interviews list."
          />
        )}
      </div>
    );
  }

  const criteriaEntries = Object.entries(form.evaluation_criteria);

  return (
    <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-6 px-4 pb-24 pt-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleBack}
          title="Go back to the previous page"
          className="group flex w-fit items-center gap-2 pl-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-emerald-400"
        >
          <HiOutlineChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          Back to interviews
        </button>

        <div className="flex min-w-0 flex-col gap-5 rounded-xl border border-border bg-card p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span title="Job" className="max-w-full truncate rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                {interview.job_title}
              </span>
              <span className="font-mono text-xs text-muted-foreground/70">ID: {id}</span>
            </div>
            <h1 className="break-words text-2xl font-semibold tracking-tight lg:text-3xl">{interview.title}</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={`/recruiter/ai-interview/${id}/sessions`}
              title="See every candidate who took this interview"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 px-5 py-3 text-xs font-semibold text-foreground transition-all hover:border-emerald-500/40"
            >
              <HiOutlineUserGroup className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> View sessions
            </Link>

            <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1">
              <button
                type="button"
                onClick={() => setActiveTab("config")}
                aria-pressed={activeTab === "config"}
                title="Edit questions, criteria and session limits"
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "config" ? "border border-border/40 bg-card text-emerald-400 shadow" : "text-muted-foreground hover:text-emerald-400"
                }`}
              >
                <HiOutlineCog6Tooth className="h-4 w-4" aria-hidden="true" /> Configuration
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("assistant")}
                aria-pressed={activeTab === "assistant"}
                title="Chat with an AI assistant to refine this interview"
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "assistant" ? "border border-border/40 bg-card text-emerald-400 shadow" : "text-muted-foreground hover:text-emerald-400"
                }`}
              >
                <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> AI assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      {saveError && <FormError title="Could not save your changes" message={saveError} />}

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "assistant" ? (
          <motion.div
            key="assistant"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 items-start gap-6 xl:grid-cols-4"
          >
            <div className="min-w-0 xl:col-span-3">
              <AIAssistantPanel
                form={form}
                interview={interview}
                onApplyConfig={applyAIConfig}
              />
            </div>

            {/* Live manifest sidebar */}
            <aside className="min-w-0 space-y-6 rounded-xl border border-border bg-card p-5 lg:p-6 xl:sticky xl:top-6 xl:col-span-1">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <HiOutlineHashtag className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Live summary
                </span>
                <span title="Matches the form" className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Synced
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-muted-foreground">Working title</span>
                <div title={form.title} className="truncate rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm font-semibold">
                  {form.title || "Untitled interview"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-xs font-semibold text-muted-foreground">Time limit</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{form.duration_minutes} min</span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineDocumentText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-xs font-semibold text-muted-foreground">Questions</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{form.number_of_questions}</span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-xs font-semibold text-muted-foreground">Passing score</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{form.passing_score}%</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <HiOutlineStar className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> Scoring criteria
                </span>
                <div className="max-h-[140px] space-y-2 overflow-y-auto pr-1">
                  {criteriaEntries.map(([name, weight]) => (
                    <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/20 p-3 text-xs">
                      <span title={name.replace(/_/g, " ")} className="max-w-[60%] truncate font-semibold capitalize text-muted-foreground">{name.replace(/_/g, " ")}</span>
                      <span className="font-semibold text-emerald-400">{Math.round(weight * 100)}%</span>
                    </div>
                  ))}
                  {criteriaEntries.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">No scoring criteria yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <HiOutlineBars3BottomLeft className="h-3.5 w-3.5" aria-hidden="true" /> Interviewer instructions
                </span>
                <div className="max-h-[120px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border/80 bg-secondary/20 p-3.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {form.system_prompt || "No instructions yet. Ask the assistant to draft them."}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                title="Save the form values to this interview"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-500 disabled:opacity-50"
              >
                <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </aside>
          </motion.div>
        ) : (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3"
          >
            <div className="min-w-0 space-y-6 lg:col-span-2">
              {/* Prompting */}
              <section className={sectionClass}>
                <SectionHeader
                  icon={HiOutlineSparkles}
                  tone="bg-emerald-500/10 text-emerald-500"
                  title="Interviewer prompt"
                  subtitle="How the AI runs the interview and what it looks for"
                />
                <div className="space-y-2">
                  <label htmlFor="system-prompt" className={fieldLabel}>Master interviewer prompt</label>
                  <textarea
                    id="system-prompt"
                    value={form.system_prompt}
                    onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                    rows={6}
                    placeholder="Instructions for the AI on how to conduct the interview..."
                    className={`${inputClass} resize-y font-mono text-xs leading-relaxed sm:text-sm`}
                  />
                  <p className={fieldHint}>The AI follows these rules for every candidate.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="context-for-ai" className={fieldLabel}>Job context (hidden from candidates)</label>
                  <textarea
                    id="context-for-ai"
                    value={form.context_for_ai}
                    onChange={(e) => setForm({ ...form, context_for_ai: e.target.value })}
                    rows={4}
                    placeholder="Details about the job, team or project the AI should keep in mind..."
                    className={`${inputClass} resize-y leading-relaxed`}
                  />
                  <p className={fieldHint}>Used for scoring only. Candidates never see this.</p>
                </div>
              </section>

              {/* Scoring criteria */}
              <section className={sectionClass}>
                <SectionHeader
                  icon={HiOutlineCheckCircle}
                  tone="bg-emerald-500/10 text-emerald-500"
                  title="Scoring criteria"
                  subtitle="Each criterion's weight shapes the overall score"
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        const name = prompt("Metric name (e.g. Communication):");
                        if (name) setForm({ ...form, evaluation_criteria: { ...form.evaluation_criteria, [name]: 0.2 } });
                      }}
                      title="Add a new scoring criterion"
                      className={linkAction}
                    >
                      <HiOutlinePlusCircle className="h-4 w-4" aria-hidden="true" /> Add criterion
                    </button>
                  }
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {criteriaEntries.map(([name, weight]) => (
                    <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 p-4">
                      <div className="min-w-0 flex-1 space-y-2">
                        <span className="block truncate text-xs font-semibold capitalize">{name.replace(/_/g, " ")}</span>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${weight * 100}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-emerald-400">{weight * 100}%</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        title={`Remove ${name.replace(/_/g, " ")}`}
                        aria-label={`Remove ${name.replace(/_/g, " ")}`}
                        onClick={() => {
                          const next = { ...form.evaluation_criteria };
                          delete next[name];
                          setForm({ ...form, evaluation_criteria: next });
                        }}
                        className="shrink-0 rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {criteriaEntries.length === 0 && (
                    <div className="md:col-span-2">
                      <EmptyState
                        icon={HiOutlineCheckCircle}
                        title="No scoring criteria yet"
                        text={'Add criteria such as "Communication" or "Technical depth" to guide the AI evaluator.'}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Question pool */}
              <section className={sectionClass}>
                <SectionHeader
                  icon={HiOutlineListBullet}
                  tone="bg-blue-500/10 text-blue-500"
                  title="Question pool"
                  subtitle="Questions the AI can ask. Leave empty to let it generate them."
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...form.questions, "New question text..."];
                        setForm({ ...form, questions: next });
                      }}
                      title="Add an empty question to the pool"
                      className={linkAction}
                    >
                      <HiOutlinePlusCircle className="h-4 w-4" aria-hidden="true" /> Add question
                    </button>
                  }
                />

                <div className="space-y-3">
                  {form.questions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-4 transition-all hover:border-emerald-500/20">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary font-mono text-xs font-semibold text-muted-foreground">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <textarea
                        aria-label={`Question ${idx + 1}`}
                        value={q}
                        onChange={(e) => {
                          const next = [...form.questions];
                          next[idx] = e.target.value;
                          setForm({ ...form, questions: next });
                        }}
                        className="min-w-0 flex-1 resize-none bg-transparent pt-1 text-sm leading-relaxed outline-none"
                        rows={2}
                      />
                      <button
                        type="button"
                        title={`Remove question ${idx + 1}`}
                        aria-label={`Remove question ${idx + 1}`}
                        onClick={() => {
                          const next = form.questions.filter((_, i) => i !== idx);
                          setForm({ ...form, questions: next });
                        }}
                        className="shrink-0 rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {form.questions.length === 0 && (
                    <EmptyState
                      icon={HiOutlineListBullet}
                      title="No questions in the pool"
                      text="The AI will generate questions dynamically for each candidate."
                    />
                  )}
                </div>
              </section>
            </div>

            {/* Session parameters */}
            <aside className="min-w-0 space-y-6 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6 lg:p-6">
              <SectionHeader
                icon={HiOutlineAdjustmentsHorizontal}
                tone="bg-emerald-500/10 text-emerald-500"
                title="Session parameters"
                subtitle="Limits applied to every candidate"
              />

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="passing-score" className={fieldLabel}>Passing score (%)</label>
                  <input
                    id="passing-score"
                    type="number"
                    value={form.passing_score}
                    onChange={(e) => setForm({ ...form, passing_score: +e.target.value })}
                    className={`${inputClass} font-mono`}
                  />
                  <p className={fieldHint}>Candidates at or above this score pass.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="questions-count" className={fieldLabel}>Questions count</label>
                  <input
                    id="questions-count"
                    type="number"
                    value={form.number_of_questions}
                    onChange={(e) => setForm({ ...form, number_of_questions: +e.target.value })}
                    className={`${inputClass} font-mono`}
                  />
                  <p className={fieldHint}>How many questions each session asks.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="time-limit" className={fieldLabel}>Time limit (minutes)</label>
                  <input
                    id="time-limit"
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })}
                    className={`${inputClass} font-mono`}
                  />
                  <p className={fieldHint}>Total time allowed for one interview.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                title="Save these settings and the prompts"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : <><HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> Save configuration</>}
              </button>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RecruiterAIInterviewDetail() {
  return (
    <Suspense fallback={<PageSkeleton stats={0} cards={2} />}>
      <RecruiterAIInterviewDetailContent />
    </Suspense>
  );
}
