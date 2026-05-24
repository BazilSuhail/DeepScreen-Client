"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AIInterviewCreateSkeleton from "@/components/skeletons/recruiter/AIInterviewCreateSkeleton";
import {
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
  HiOutlineMapPin,
  HiOutlineListBullet,
  HiOutlineDocumentCheck,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineChartBar,
  HiOutlineMicrophone,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import {
  EmptyState,
  ErrorAlert,
  cardClass,
  focusRing,
  hintClass,
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
} from "@/components/ai-interview/recruiter/AIInterviewListUi";
import { dangerButton, iconTile, sectionTitle } from "@/components/ui/styles";
import { base, fadeUp, stagger } from "@/constants/motion";
import {
  formatServerError,
  normalizeCriteria,
  toEditableConfig,
  toPayload,
} from "@/components/ai-interview/recruiter/interviewConfig";

const WIZARD_STEPS = [
  { key: "job", label: "Select job", icon: HiOutlineBriefcase },
  { key: "method", label: "Creation method", icon: HiOutlineCog6Tooth },
  { key: "generate", label: "Draft with AI", icon: HiOutlineSparkles },
  { key: "review", label: "Review & save", icon: HiOutlineCheckCircle },
];

const STEP_HEADINGS = {
  job: "Pick the job this AI interview will screen candidates for.",
  method: "Choose how you want to build the interview.",
  generate: "Answer a few questions and the assistant drafts the interview for you.",
  review: "Check the details, then save the interview.",
};


const formatCriterion = (key) => {
  const text = key.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const tileTone = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

function SectionHeader({ icon: Icon, title, text }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className={`${iconTile} h-8 w-8 ${tileTone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className={`${sectionTitle} text-emerald-950 dark:text-foreground`}>{title}</h2>
        {text && <p className={hintClass}>{text}</p>}
      </div>
    </div>
  );
}

function Stepper({ currentStep, vertical = false }) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.key === currentStep);
  return (
    <ol aria-label="Progress" className={vertical ? "space-y-2" : "grid grid-cols-2 gap-2 sm:grid-cols-4"}>
      {WIZARD_STEPS.map((s, i) => {
        const isCurrent = i === currentIndex;
        const isDone = i < currentIndex;
        return (
          <li
            key={s.key}
            aria-current={isCurrent ? "step" : undefined}
            className={`flex min-w-0 items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition-colors ${
              isCurrent
                ? "border-emerald-500 bg-emerald-500/10 font-semibold text-emerald-800 dark:text-emerald-400"
                : isDone
                  ? "border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-500/25 dark:bg-card dark:text-foreground"
                  : "border-emerald-100 bg-card text-emerald-800/70 dark:border-white/10 dark:text-muted-foreground"
            }`}
          >
            <s.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{s.label}</span>
            {isDone && (
              <>
                <HiOutlineCheckCircle className="ml-auto h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span className="sr-only">(completed)</span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ConfigSummary({ config }) {
  const criteria = normalizeCriteria(config.evaluation_criteria);
  return (
    <div className="space-y-6">
      <div className="min-w-0 space-y-2">
        <h2 className="break-words text-xl font-semibold text-emerald-950 dark:text-foreground">
          {config.title || "Untitled interview"}
        </h2>
        {config.description && (
          <p className="text-sm leading-relaxed text-emerald-800/80 dark:text-muted-foreground">{config.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Time limit", value: `${config.duration_minutes ?? "—"} min`, icon: HiOutlineClock },
          { label: "Questions", value: `${config.number_of_questions ?? "—"}`, icon: HiOutlineListBullet },
          { label: "Passing score", value: `${config.passing_score ?? "—"}%`, icon: HiOutlineShieldCheck },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
            <span className={`${iconTile} h-8 w-8 ${tileTone}`}>
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-emerald-800/70 dark:text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold tabular-nums text-emerald-950 dark:text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {config.system_prompt && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-foreground">
            <HiOutlineDocumentText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Interviewer instructions
          </p>
          <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-emerald-100 bg-emerald-50/50 p-4 font-mono text-xs leading-relaxed text-emerald-950 dark:border-white/10 dark:bg-background dark:text-foreground">
            {config.system_prompt}
          </p>
        </div>
      )}

      {criteria.length > 0 && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-foreground">
            <HiOutlineChartBar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Scoring weights
          </p>
          <ul className="space-y-3">
            {criteria.map(({ name, weight }, idx) => {
              const pct = Math.round(weight * 100);
              return (
                <li key={`${name}-${idx}`} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-emerald-900 dark:text-foreground">{formatCriterion(name)}</span>
                    <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-white/10" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function NumberField({ id, label, hint, value, onChange }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        required
        aria-describedby={`${id}-hint`}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className={`${inputClass} font-mono`}
      />
      <p id={`${id}-hint`} className={hintClass}>{hint}</p>
    </div>
  );
}

const INITIAL_FORM = {
  title: "",
  description: "",
  system_prompt: "",
  context_for_ai: "",
  evaluation_criteria: [
    { name: "Technical depth", weight: 0.4 },
    { name: "Problem solving", weight: 0.3 },
    { name: "Communication", weight: 0.3 },
  ],
  number_of_questions: 5,
  duration_minutes: 20,
  passing_score: 65,
  questions: [],
  proctoring_policy: {},
};

export default function CreateAIInterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState("job");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [method, setMethod] = useState(null);

  // Manual form
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState("");

  // AI chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [chatError, setChatError] = useState("");
  const chatContainerRef = useRef(null);

  // Save
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.get("/jobs/recruiter/");
        if (!active) return;
        setJobs(Array.isArray(data) ? data : []);
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
  }, [attempt]);

  const retryJobs = () => {
    setLoading(true);
    setJobsError("");
    setAttempt((n) => n + 1);
  };

  const hasDraft = Boolean(generatedConfig);
  // Runs `action` now, or after the user confirms discarding the current draft.
  const [pendingDiscard, setPendingDiscard] = useState(null);
  const withDiscard = (action) => (hasDraft ? setPendingDiscard(() => action) : action());
  const confirmLeave = () => {
    if (!hasDraft) return true;
    setPendingDiscard(() => () => router.push("/recruiter/ai-interview"));
    return false;
  };

  const resetDraft = () => {
    setGeneratedConfig(null);
    setChatMessages([]);
    setChatInput("");
    setChatError("");
  };

  const goToJobStep = () => withDiscard(() => {
    resetDraft();
    setMethod(null);
    setSaveError("");
    setStep("job");
  });

  const goToMethodStep = () => withDiscard(() => {
    resetDraft();
    setMethod(null);
    setSaveError("");
    setStep("method");
  });

  const pickJob = (job) => {
    setSelectedJob(job);
    setSaveError("");
    setStep("method");
  };

  const startChatGeneration = () => withDiscard(() => {
    resetDraft();
    setChatMessages([
      {
        role: "assistant",
        content: `I'll help you design the perfect AI interview for ${selectedJob?.job_title || "this job"}. Let me ask you a few questions first.\n\nWhat would you like to name this interview?`,
      },
    ]);
    setMethod("ai");
    setStep("generate");
  });

  const chooseManual = () => {
    setMethod("manual");
    setSaveError("");
    setStep("review");
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const previousMessages = chatMessages;
    const updatedMessages = [...chatMessages, { role: "user", content: text }];
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

      if (res?.type === "config" && res.config) {
        setGeneratedConfig(toEditableConfig(res.config));
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Perfect! I've generated the interview configuration. Review the draft when you are ready.",
          },
        ]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", content: res?.content ?? "" }]);
      }
    } catch (e) {
      console.error(e);
      // Restore the message so the user does not lose what they typed.
      setChatMessages(previousMessages);
      setChatInput(text);
      setChatError(formatServerError(e, "Failed to generate a reply. Try sending your message again."));
    } finally {
      setChatLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const payload = {
      job: selectedJob.job_id,
      ...toPayload(generatedConfig || form),
    };
    try {
      const res = await api.post("/ai-interviews/generate/confirm/", payload);
      router.push(`/recruiter/ai-interview/${res.interview_id}`);
    } catch (e) {
      if (e?.status === 409) {
        setSaveError("An interview already exists for this job. Go back and pick a different job.");
      } else {
        setSaveError(formatServerError(e, "Failed to save the interview. Try again."));
      }
      setSaving(false);
    }
  };

  const handleManualCreate = async (e) => {
    e.preventDefault();
    const validNumber = (n) => Number.isInteger(n) && n >= 1;
    if (!validNumber(form.number_of_questions) || !validNumber(form.duration_minutes)) {
      setFormError("Enter the number of questions and the time limit as whole numbers, at least 1.");
      return;
    }
    setFormError("");
    setSaving(true);
    setSaveError("");
    try {
      const res = await api.post("/ai-interviews/generate/confirm/", {
        job: selectedJob.job_id,
        ...toPayload(form),
      });
      router.push(`/recruiter/ai-interview/${res.interview_id}`);
    } catch (e) {
      setSaveError(formatServerError(e, "Failed to create the interview. Try again."));
      setSaving(false);
    }
  };

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const backControl = (
    <button type="button" onClick={goToJobStep} className={`${secondaryButton} w-full sm:w-auto`}>
      <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> Change job
    </button>
  );

  const saveErrorBlock = (
    <ErrorAlert
      title={method === "manual" ? "Could not create the interview" : "Could not save the interview"}
      message={saveError}
    />
  );

  // Desktop-only live summary of whatever has been configured so far.
  const draft = generatedConfig || (method === "manual" ? form : null);
  const shown = (v, suffix = "") => (v === "" || v == null ? "Not set" : `${v}${suffix}`);
  const summaryRows = [
    { label: "Job", value: shown(selectedJob?.job_title), icon: HiOutlineBriefcase },
    { label: "Location", value: selectedJob ? selectedJob.location || "Remote" : "Not set", icon: HiOutlineMapPin },
    { label: "Method", value: method === "ai" ? "AI-guided" : method === "manual" ? "Manual" : "Not set", icon: HiOutlineCog6Tooth },
    { label: "Title", value: shown(draft?.title || null), icon: HiOutlineDocumentText },
    { label: "Questions", value: shown(draft?.number_of_questions), icon: HiOutlineListBullet },
    { label: "Time limit", value: shown(draft?.duration_minutes, " min"), icon: HiOutlineClock },
    { label: "Passing score", value: shown(draft?.passing_score, "%"), icon: HiOutlineShieldCheck },
    { label: "Scoring criteria", value: draft ? draft.evaluation_criteria.length : "Not set", icon: HiOutlineChartBar },
  ];

  if (loading) return <AIInterviewCreateSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        back={{ href: "/recruiter/ai-interview", label: "AI interviews", onBeforeLeave: confirmLeave }}
        icon={HiOutlineMicrophone}
        eyebrow="AI interview"
        title="Create AI interview"
        description={STEP_HEADINGS[step]}
        meta={
          selectedJob && step !== "job" ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-sm bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-white/5 dark:text-foreground">
              <HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{selectedJob.job_title}</span>
            </span>
          ) : null
        }
        actions={step === "job" ? null : backControl}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-8 2xl:col-span-9">
          <div className="lg:hidden">
            <Stepper currentStep={step} />
          </div>

          <ErrorAlert message={jobsError} onRetry={retryJobs} />

          <AnimatePresence mode="wait" initial={false}>
            {/* STEP: Job selection */}
            {step === "job" && !jobsError && (
              <motion.section
                key="job"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={base}
                aria-label="Select a job"
              >
                <SectionHeader icon={HiOutlineBriefcase} title="Select a job" text={STEP_HEADINGS.job} />
                {jobs.length === 0 ? (
                  <EmptyState
                    icon={HiOutlineBriefcase}
                    title="No jobs to attach yet"
                    text="Post a job first, then come back here to add an AI interview to it."
                    action={
                      <Link href="/recruiter/jobs/create" className={primaryButton}>
                        <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Post a job
                      </Link>
                    }
                  />
                ) : (
                  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {jobs.map((job, idx) => (
                      <motion.li key={job.job_id ?? idx} {...fadeUp} transition={{ ...base, delay: Math.min(idx, 8) * stagger }}>
                        <button
                          type="button"
                          onClick={() => pickJob(job)}
                          aria-label={`Use ${job.job_title || "this job"} for the interview`}
                          className={`group flex min-h-16 w-full min-w-0 items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-emerald-500 lg:p-5 ${
                            selectedJob?.job_id === job.job_id
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                              : "border-emerald-100 bg-card dark:border-white/10"
                          } ${focusRing}`}
                        >
                          <span className={`${iconTile} h-11 w-11 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400`}>
                            <HiOutlineBriefcase className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1 space-y-1">
                            <span className="block truncate text-base font-semibold text-emerald-950 dark:text-foreground">
                              {job.job_title || "Untitled job"}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-emerald-800/80 dark:text-muted-foreground">
                              <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate">{job.location || "Remote"}</span>
                            </span>
                          </span>
                          <HiOutlineChevronRight className="h-5 w-5 shrink-0 text-emerald-600 transition-[translate] group-hover:translate-x-0.5 dark:text-emerald-400" aria-hidden="true" />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.section>
            )}

            {/* STEP: Method */}
            {step === "method" && selectedJob && (
              <motion.section
                key="method"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={base}
                aria-label="Choose a creation method"
              >
                <SectionHeader icon={HiOutlineCog6Tooth} title="Creation method" text={STEP_HEADINGS.method} />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={startChatGeneration}
                  className={`group flex min-w-0 flex-col gap-4 rounded-lg border-2 border-emerald-500/40 bg-card p-5 text-left transition-colors hover:border-emerald-500 lg:p-6 ${focusRing}`}
                >
                  <span className={`${iconTile} h-11 w-11 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400`}>
                    <HiOutlineSparkles className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="space-y-1.5">
                    <span className="block text-lg font-semibold text-emerald-950 dark:text-foreground">AI-guided setup</span>
                    <span className="block text-sm leading-relaxed text-emerald-800/80 dark:text-muted-foreground">
                      Chat with the AI design consultant. It drafts questions, criteria and instructions for you to review.
                    </span>
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Start chat <HiOutlineChevronRight className="h-4 w-4 transition-[translate] group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={chooseManual}
                  className={`group flex min-w-0 flex-col gap-4 rounded-lg border border-emerald-100 bg-card p-5 text-left transition-colors hover:border-emerald-400 dark:border-white/10 dark:hover:border-white/25 lg:p-6 ${focusRing}`}
                >
                  <span className={`${iconTile} h-11 w-11 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400`}>
                    <HiOutlinePencilSquare className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="space-y-1.5">
                    <span className="block text-lg font-semibold text-emerald-950 dark:text-foreground">Manual setup</span>
                    <span className="block text-sm leading-relaxed text-emerald-800/80 dark:text-muted-foreground">
                      Write the title, interviewer instructions and question limits yourself.
                    </span>
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-foreground">
                    Write it myself <HiOutlineChevronRight className="h-4 w-4 transition-[translate] group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </button>
                </div>
              </motion.section>
            )}

            {/* STEP: AI chat */}
            {step === "generate" && method === "ai" && selectedJob && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={base}
                className="grid grid-cols-1 gap-5"
              >
                <section aria-label="Chat with the AI design consultant" className={`${cardClass} flex min-w-0 flex-col overflow-hidden`}>
                  <div className="flex items-center justify-between gap-3 border-b border-emerald-100 p-4 dark:border-white/10">
                    <h2 className="flex items-center gap-2.5 text-sm font-semibold text-emerald-950 dark:text-foreground">
                      <HiOutlineChatBubbleLeftRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      AI design consultant
                    </h2>
                    {hasDraft && (
                      <button type="button" onClick={goToMethodStep} className={`${secondaryButton} px-3 py-1.5 text-xs`}>
                        <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Start over
                      </button>
                    )}
                  </div>

                  <div
                    ref={chatContainerRef}
                    role="log"
                    aria-live="polite"
                    aria-label="Conversation"
                    className="h-[55vh] min-h-[320px] space-y-4 overflow-y-auto bg-emerald-50/50 p-4 lg:h-[60vh] dark:bg-background/60"
                  >
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "rounded-tr-sm bg-emerald-600 text-white"
                              : "rounded-tl-sm border border-emerald-100 bg-card text-emerald-950 dark:border-white/10 dark:text-foreground"
                          }`}
                        >
                          <span className="sr-only">{msg.role === "user" ? "You: " : "Consultant: "}</span>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-card px-4 py-2.5 text-xs font-medium text-emerald-800 dark:border-white/10 dark:text-muted-foreground">
                          <span className="flex gap-1" aria-hidden="true">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 motion-reduce:animate-none" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms] motion-reduce:animate-none" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms] motion-reduce:animate-none" />
                          </span>
                          Thinking through your answer...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 border-t border-emerald-100 p-4 dark:border-white/10">
                    {chatError && <ErrorAlert title="The assistant could not reply" message={chatError} />}
                    {hasDraft ? (
                      <button
                        type="button"
                        onClick={() => setStep("review")}
                        className={`${primaryButton} w-full`}
                      >
                        <HiOutlineEye className="h-4 w-4" aria-hidden="true" /> Review the draft
                      </button>
                    ) : (
                      <>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            sendChatMessage();
                          }}
                          className="flex gap-3"
                        >
                          <label htmlFor="ai-chat-input" className="sr-only">Message to the AI consultant</label>
                          <input
                            id="ai-chat-input"
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="e.g. Focus on React hooks and testing"
                            aria-describedby="ai-chat-hint"
                            className={`${inputClass} min-w-0 flex-1 py-3`}
                          />
                          <button
                            type="submit"
                            disabled={chatLoading || !chatInput.trim()}
                            aria-label="Send message"
                            className={`${primaryButton} shrink-0 px-4`}
                          >
                            <HiOutlinePaperAirplane className="h-4 w-4 rotate-90" aria-hidden="true" />
                          </button>
                        </form>
                        <p id="ai-chat-hint" className={hintClass}>
                          Describe the topics, difficulty or criteria you want the AI to cover.
                        </p>
                      </>
                    )}
                  </div>
                </section>

                <section aria-label="Draft preview" className={`${cardClass} min-w-0 p-5 lg:p-6`}>
                  {generatedConfig ? (
                    <ConfigSummary config={generatedConfig} />
                  ) : (
                    <EmptyState
                      icon={HiOutlineDocumentCheck}
                      title="Your draft will appear here"
                      text="Answer the consultant's questions and the interview details will show up in this panel."
                    />
                  )}
                </section>
              </motion.div>
            )}

            {/* STEP: Review (AI draft) */}
            {step === "review" && method === "ai" && generatedConfig && (
              <motion.div key="review-ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={base} className="space-y-6">
                <section aria-label="Draft summary" className={`${cardClass} p-5 lg:p-6`}>
                  <ConfigSummary config={generatedConfig} />
                </section>

                {saveErrorBlock}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={startChatGeneration}
                    disabled={saving}
                    className={`${secondaryButton} sm:order-1`}
                  >
                    <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Regenerate
                  </button>
                  <button type="button" onClick={handleSave} disabled={saving} className={`${primaryButton} lg:hidden`}>
                    <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                    {saving ? "Saving interview..." : "Confirm & save"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: Review (manual form) */}
            {step === "review" && method === "manual" && (
              <motion.form
                key="review-manual"
                id="ai-manual-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={base}
                onSubmit={handleManualCreate}
                className={`${cardClass} space-y-6 p-5 lg:p-6`}
              >
                <SectionHeader icon={HiOutlinePencilSquare} title="Interview details" text="Set the rules and limits, then save the interview." />

                <div className="space-y-2">
                  <label htmlFor="ai-title" className={labelClass}>Interview title</label>
                  <input
                    id="ai-title"
                    required
                    aria-describedby="ai-title-hint"
                    value={form.title}
                    onChange={(e) => updateForm({ title: e.target.value })}
                    placeholder="e.g. Core React engineering screen"
                    className={inputClass}
                  />
                  <p id="ai-title-hint" className={hintClass}>Candidates see this title on their interview list.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="ai-description" className={labelClass}>Short description</label>
                  <textarea
                    id="ai-description"
                    value={form.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    placeholder="A sentence or two about what this interview covers"
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="ai-prompt" className={labelClass}>Interviewer instructions</label>
                  <textarea
                    id="ai-prompt"
                    required
                    aria-describedby="ai-prompt-hint"
                    value={form.system_prompt}
                    onChange={(e) => updateForm({ system_prompt: e.target.value })}
                    placeholder="Tell the AI how to run the interview and score answers..."
                    rows={5}
                    className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
                  />
                  <p id="ai-prompt-hint" className={hintClass}>The AI follows these rules for every candidate. Candidates do not see them.</p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <NumberField
                    id="ai-questions"
                    label="Number of questions"
                    hint="How many questions each candidate answers."
                    value={form.number_of_questions}
                    onChange={(v) => updateForm({ number_of_questions: v })}
                  />
                  <NumberField
                    id="ai-duration"
                    label="Time limit (minutes)"
                    hint="The longest the interview can run."
                    value={form.duration_minutes}
                    onChange={(v) => updateForm({ duration_minutes: v })}
                  />
                </div>

                <ErrorAlert message={formError} />
                {saveErrorBlock}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:hidden">
                  <button type="submit" disabled={saving} className={primaryButton}>
                    <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                    {saving ? "Saving interview..." : "Create interview"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <aside aria-label="Interview summary" className="hidden space-y-6 lg:sticky lg:top-6 lg:col-span-4 lg:block lg:self-start 2xl:col-span-3">
          <section className={`${cardClass} p-5`}>
            <SectionHeader icon={HiOutlineListBullet} title="Progress" text="Four steps from job to saved interview." />
            <Stepper currentStep={step} vertical />
          </section>

          <section className={`${cardClass} p-5`}>
            <SectionHeader icon={HiOutlineDocumentCheck} title="Summary" text="Updates as you configure the interview." />
            <dl className="divide-y divide-emerald-100 border-y border-emerald-100 dark:divide-white/10 dark:border-white/10">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                    <row.icon className="h-4 w-4" aria-hidden="true" /> {row.label}
                  </dt>
                  <dd title={String(row.value)} className="min-w-0 truncate font-semibold tabular-nums text-emerald-950 dark:text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5">
              {step === "review" && method === "manual" ? (
                <button type="submit" form="ai-manual-form" disabled={saving} className={`${primaryButton} w-full`}>
                  <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                  {saving ? "Saving interview..." : "Create interview"}
                </button>
              ) : step === "review" && method === "ai" && generatedConfig ? (
                <button type="button" onClick={handleSave} disabled={saving} className={`${primaryButton} w-full`}>
                  <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                  {saving ? "Saving interview..." : "Confirm & save"}
                </button>
              ) : (
                <p className={`${hintClass} flex items-start gap-2`}>
                  <HiOutlineInformationCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  The save button appears here at the review step.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
      <ConfirmDialog
        open={pendingDiscard !== null}
        title="Discard the current draft?"
        description="This cannot be undone."
        confirmLabel="Discard draft"
        confirmClassName={dangerButton}
        onConfirm={() => {
          const action = pendingDiscard;
          setPendingDiscard(null);
          action();
        }}
        onCancel={() => setPendingDiscard(null)}
      />
    </div>
  );
}
