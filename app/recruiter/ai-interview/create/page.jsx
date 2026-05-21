"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineChevronLeft,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineCog6Tooth,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePaperAirplane,
  HiOutlineArrowPath,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineHashtag,
  HiOutlineBars3BottomLeft,
  HiOutlineMapPin,
  HiOutlineListBullet,
  HiOutlineDocumentCheck,
} from "react-icons/hi2";
import EmptyState from "@/components/dashboard/EmptyState";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import FormError from "@/components/auth/FormError";

const WIZARD_STEPS = [
  { key: "job", label: "Select job", icon: HiOutlineBriefcase, hint: "Choose the job this interview is for" },
  { key: "method", label: "Creation method", icon: HiOutlineCog6Tooth, hint: "Pick AI-guided or manual setup" },
  { key: "generate", label: "AI generate", icon: HiOutlineSparkles, hint: "Describe what you want the interview to cover" },
  { key: "review", label: "Review & confirm", icon: HiOutlineCheckCircle, hint: "Check the details before saving" },
];

const fieldLabel = "block pl-1 text-xs font-semibold text-muted-foreground";
const fieldHint = "pl-1 text-xs text-muted-foreground/70";
const inputClass = "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500/50";

function SectionHeader({ icon: Icon, tone, title, subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function CreateAIInterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState("job");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [method, setMethod] = useState(null);

  // Manual form
  const [form, setForm] = useState({
    title: "",
    description: "",
    system_prompt: "",
    context_for_ai: "",
    evaluation_criteria: {
      technical_depth: 0.4,
      problem_solving: 0.3,
      communication: 0.3,
    },
    number_of_questions: 5,
    duration_minutes: 20,
    passing_score: 65,
    questions: [],
  });

  // AI Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Save
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchJobs = async () => {
    try {
      const data = await api.get("/jobs/recruiter/");
      setJobs(data);
      setJobsError("");
    } catch (e) {
      console.error(e);
      setJobsError("We could not load your jobs. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const retryJobs = () => {
    setLoading(true);
    setJobsError("");
    fetchJobs();
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.get("/jobs/recruiter/");
        if (!active) return;
        setJobs(data);
        setJobsError("");
      } catch (e) {
        if (!active) return;
        console.error(e);
        setJobsError("We could not load your jobs. Check your connection and try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const startChatGeneration = async () => {
    setChatMessages([
      {
        role: "assistant",
        content: `I'll help you design the perfect AI interview for **${selectedJob.job_title}**. Let me ask you a few questions first.\n\nWhat would you like to name this interview?`,
      },
    ]);
    setMethod("ai");
    setStep("generate");
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: "user", content: chatInput.trim() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);
    setChatError("");

    try {
      const res = await api.post("/ai-interviews/generate/chat/", {
        job_id: selectedJob.job_id,
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (res.type === "config") {
        setGeneratedConfig(res.config);
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Perfect! I've generated the interview configuration. Let me show you the preview.",
            isComplete: true,
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.content },
        ]);
      }
    } catch (e) {
      setChatError(e.message || "Failed to generate");
      setChatMessages(chatMessages);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const payload = {
      job: selectedJob.job_id,
      ...(generatedConfig || form),
    };
    try {
      const res = await api.post("/ai-interviews/generate/confirm/", payload);
      router.push(`/recruiter/ai-interview/${res.interview_id}`);
    } catch (e) {
      if (e.status === 409) {
        setSaveError(
          "An interview already exists for this job. Please select a different job.",
        );
      } else {
        setSaveError(e.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleManualCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const res = await api.post("/ai-interviews/generate/confirm/", {
        job: selectedJob.job_id,
        ...form,
      });
      router.push(`/recruiter/ai-interview/${res.interview_id}`);
    } catch (e) {
      setSaveError(e.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const activeConfig = generatedConfig || form;

  if (loading) return <PageSkeleton stats={0} cards={2} />;

  const saveErrorBlock = saveError ? (
    <FormError
      title={method === "manual" ? "Could not create the interview" : "Could not save the interview"}
      message={saveError}
    />
  ) : null;

  return (
    <div className="mx-auto grid w-full max-w-[1600px] min-w-0 grid-cols-1 items-start gap-6 px-4 pb-24 pt-6 md:px-8 lg:grid-cols-4 lg:gap-10">
      {/* LEFT COLUMN: step navigation */}
      <aside className="min-w-0 space-y-6 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6 lg:col-span-1">
        <button
          type="button"
          onClick={() => (step === "job" ? router.back() : setStep("job"))}
          title={step === "job" ? "Go back to the previous page" : "Start again from job selection"}
          className="group flex items-center gap-2 pl-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-emerald-400"
        >
          <HiOutlineChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          {step === "job" ? "Back" : "Change setup"}
        </button>

        <ol className="flex flex-col gap-2.5">
          {WIZARD_STEPS.map((s, i) => {
            const isActive = step === s.key;
            const isDone = ["job", "method", "generate", "review"].indexOf(step) > i;
            return (
              <li key={s.key} className="flex w-full flex-col">
                <div
                  title={s.hint}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-300 ${
                    isActive
                      ? "border-emerald-500/40 bg-emerald-500/[0.07] font-semibold text-emerald-400"
                      : isDone
                        ? "border-emerald-500/10 bg-emerald-500/[0.02] text-emerald-500/70"
                        : "border-transparent text-muted-foreground opacity-50"
                  }`}
                >
                  <s.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-left text-sm">{s.label}</span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`ml-6 my-1 h-5 w-0.5 border-l-2 ${
                      isDone ? "border-solid border-emerald-500/30" : "border-dashed border-border"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {selectedJob && (
          <div className="space-y-2 border-t border-border/60 pt-5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" /> Target job
            </span>
            <div title={selectedJob.job_title} className="truncate rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-2 text-sm font-semibold text-emerald-400">
              {selectedJob.job_title}
            </div>
          </div>
        )}
      </aside>

      {/* RIGHT COLUMN: current step */}
      <div className="min-w-0 space-y-6 lg:col-span-3">
        {jobsError && (
          <div className="space-y-3">
            <FormError title="Something went wrong" message={jobsError} />
            <button
              type="button"
              onClick={retryJobs}
              title="Load your jobs again"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
            >
              <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP: Job Selection */}
          {step === "job" && (
            <motion.div
              key="job"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <SectionHeader
                  icon={HiOutlineBriefcase}
                  tone="bg-emerald-500/10 text-emerald-500"
                  title="Select a job"
                  subtitle="Pick the job this AI interview will screen candidates for."
                />
              </div>

              {jobs.length === 0 && !jobsError ? (
                <EmptyState
                  icon={HiOutlineBriefcase}
                  title="No jobs to attach yet"
                  text="Post a job first, then come back here to add an AI interview to it."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {jobs.map((job) => (
                    <button
                      type="button"
                      key={job.job_id}
                      onClick={() => {
                        setSelectedJob(job);
                        setStep("method");
                      }}
                      title={`Use ${job.job_title} for this interview`}
                      className={`flex min-w-0 items-start gap-4 rounded-xl border p-5 text-left transition-all duration-300 lg:p-6 ${
                        selectedJob?.job_id === job.job_id
                          ? "border-emerald-500 bg-emerald-500/5"
                          : "border-border bg-card hover:border-emerald-500/40"
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                        <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="truncate text-base font-semibold">{job.job_title}</h3>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{job.location || "Remote"}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP: Method Selection */}
          {step === "method" && selectedJob && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <SectionHeader
                icon={HiOutlineCog6Tooth}
                tone="bg-emerald-500/10 text-emerald-500"
                title="Choose how to build it"
                subtitle={<>Set up the interview for <span className="font-semibold text-emerald-400">{selectedJob.job_title}</span></>}
              />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <button
                  type="button"
                  onClick={startChatGeneration}
                  title="Answer a few questions and let the AI draft the interview"
                  className="group flex min-w-0 flex-col gap-4 rounded-xl border border-emerald-500/30 bg-card p-5 text-left transition-all hover:border-emerald-500/60 lg:p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <HiOutlineSparkles className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold">AI-guided setup</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Chat with the AI design consultant. It drafts questions, criteria and instructions for you to review.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod("manual");
                    setStep("review");
                  }}
                  title="Fill in the interview details yourself"
                  className="group flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-emerald-500/40 lg:p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <HiOutlinePencilSquare className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold">Manual setup</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Write the title, interviewer instructions and question limits yourself.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP: AI Chat Generation */}
          {step === "generate" && method === "ai" && selectedJob && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid h-auto grid-cols-1 gap-4 lg:h-[80vh] lg:grid-cols-5"
            >
              {/* LEFT: chat */}
              <div className="col-span-1 flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card lg:col-span-3 lg:h-full">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineChatBubbleLeftRight className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                    <span className="text-sm font-semibold">AI design consultant</span>
                  </div>
                  {generatedConfig && (
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedConfig(null);
                        setChatMessages([]);
                        setStep("method");
                      }}
                      title="Discard this draft and start over"
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Start over
                    </button>
                  )}
                </div>

                <div ref={chatContainerRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-black/[0.08] p-4 lg:p-5">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-md ${
                          msg.role === "user"
                            ? "rounded-tr-none border-emerald-500 bg-emerald-600 text-white"
                            : "rounded-tl-none border-border/80 bg-secondary text-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/80 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                        Thinking through your answer...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Bottom input or review action */}
                {generatedConfig ? (
                  <div className="shrink-0 border-t border-border bg-secondary/20 p-4">
                    <button
                      type="button"
                      onClick={() => setStep("review")}
                      title="Open the full draft for review"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500"
                    >
                      <HiOutlineEye className="h-4 w-4" aria-hidden="true" /> Review the draft
                    </button>
                  </div>
                ) : (
                  <div className="shrink-0 space-y-3 border-t border-border bg-secondary/10 p-4">
                    {chatError && <FormError title="The assistant could not reply" message={chatError} />}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendChatMessage();
                      }}
                      className="flex gap-3"
                    >
                      <input
                        type="text"
                        aria-label="Message to the AI consultant"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="e.g. Focus on React hooks and testing"
                        className="min-w-0 flex-1 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500/50"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        title="Send your message"
                        aria-label="Send message"
                        className="flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-white transition-all hover:bg-emerald-500 disabled:opacity-30"
                      >
                        <HiOutlinePaperAirplane className="h-4 w-4 rotate-90" aria-hidden="true" />
                      </button>
                    </form>
                    <p className={fieldHint}>Describe the topics, difficulty or criteria you want the AI to cover.</p>
                  </div>
                )}
              </div>

              {/* RIGHT: live preview */}
              {activeConfig && (
                <div className="col-span-1 min-w-0 space-y-5 overflow-y-auto rounded-xl border border-border bg-card p-5 lg:col-span-2 lg:h-full lg:p-6">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <HiOutlineHashtag className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Interview preview
                    </span>
                    <span title={activeConfig.title} className="max-w-[60%] truncate rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-400">
                      {activeConfig.title || "Drafting title..."}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div title="Time limit" className="space-y-1 rounded-xl border border-border bg-secondary/40 p-3 text-center">
                      <HiOutlineClock className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Duration</span>
                      <span className="block text-sm font-semibold">{activeConfig.duration_minutes} min</span>
                    </div>
                    <div title="Number of questions" className="space-y-1 rounded-xl border border-border bg-secondary/40 p-3 text-center">
                      <HiOutlineDocumentText className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Questions</span>
                      <span className="block text-sm font-semibold">{activeConfig.number_of_questions}</span>
                    </div>
                    <div title="Score needed to pass" className="space-y-1 rounded-xl border border-border bg-secondary/40 p-3 text-center">
                      <HiOutlineShieldCheck className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Passing score</span>
                      <span className="block text-sm font-semibold text-emerald-400">{activeConfig.passing_score}%</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP: Review & Finalize */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {method === "manual" ? (
                <form onSubmit={handleManualCreate} className="space-y-6 rounded-xl border border-border bg-card p-5 lg:p-6">
                  <SectionHeader
                    icon={HiOutlinePencilSquare}
                    tone="bg-blue-500/10 text-blue-500"
                    title="Set up manually"
                    subtitle="Adjust the rules and limits, then save the interview."
                  />

                  <div className="space-y-2">
                    <label htmlFor="ai-title" className={fieldLabel}>Interview title</label>
                    <input
                      id="ai-title"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Core React engineering screen"
                      className={inputClass}
                    />
                    <p className={fieldHint}>Candidates see this title on their interview list.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ai-description" className={fieldLabel}>Short description</label>
                    <textarea
                      id="ai-description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="A sentence or two about what this interview covers"
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ai-prompt" className={fieldLabel}>Interviewer instructions</label>
                    <textarea
                      id="ai-prompt"
                      required
                      value={form.system_prompt}
                      onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                      placeholder="Tell the AI how to run the interview and score answers..."
                      rows={5}
                      className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
                    />
                    <p className={fieldHint}>The AI follows these rules for every candidate. Candidates do not see them.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="ai-questions" className={fieldLabel}>Number of questions</label>
                      <input
                        id="ai-questions"
                        type="number"
                        value={form.number_of_questions}
                        onChange={(e) => setForm({ ...form, number_of_questions: +e.target.value })}
                        className={`${inputClass} font-mono`}
                      />
                      <p className={fieldHint}>How many questions each candidate answers.</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="ai-duration" className={fieldLabel}>Time limit (minutes)</label>
                      <input
                        id="ai-duration"
                        type="number"
                        value={form.duration_minutes}
                        onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })}
                        className={`${inputClass} font-mono`}
                      />
                      <p className={fieldHint}>The longest the interview can run.</p>
                    </div>
                  </div>

                  {saveErrorBlock}

                  <button
                    type="submit"
                    disabled={saving}
                    title="Save this interview for the selected job"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                    {saving ? "Saving interview..." : "Create interview"}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <SectionHeader
                    icon={HiOutlineDocumentCheck}
                    tone="bg-emerald-500/10 text-emerald-500"
                    title="Review your interview"
                    subtitle="Check the generated details before saving. You can regenerate if something is off."
                  />

                  <div className="space-y-6 rounded-xl border border-border bg-card p-5 lg:p-6">
                    <div className="space-y-2 border-b border-border pb-4">
                      <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <HiOutlineSparkles className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span className="break-words">{activeConfig.title}</span>
                      </h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">{activeConfig.description}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <HiOutlineClock className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Time limit</span>
                          <span className="text-sm font-semibold">{activeConfig.duration_minutes} minutes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <HiOutlineListBullet className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Questions</span>
                          <span className="text-sm font-semibold">{activeConfig.number_of_questions} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <HiOutlineShieldCheck className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Passing score</span>
                          <span className="text-sm font-semibold text-emerald-400">{activeConfig.passing_score}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 rounded-xl border border-border bg-secondary/20 p-5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <HiOutlineBars3BottomLeft className="h-4 w-4" aria-hidden="true" /> Interviewer instructions
                      </span>
                      <p className="max-h-[160px] overflow-y-auto whitespace-pre-wrap pr-2 font-mono text-xs leading-relaxed text-muted-foreground">
                        {activeConfig.system_prompt}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <HiOutlineCheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Scoring criteria and weights
                      </span>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {Object.entries(activeConfig.evaluation_criteria || {}).map(([key, val]) => (
                          <div key={key} title={`${key.replace(/_/g, " ")} weight`} className="flex flex-col justify-between gap-1.5 rounded-xl border border-border bg-secondary/30 p-4">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="text-xl font-semibold text-emerald-400">{Math.round(val * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {saveErrorBlock}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedConfig(null);
                        setChatMessages([]);
                        setStep("generate");
                      }}
                      title="Discard this draft and generate a new one"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3.5 text-sm font-semibold transition-all hover:bg-secondary/80"
                    >
                      <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      title="Save this interview for the selected job"
                      className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                      {saving ? "Saving interview..." : "Confirm & save"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
