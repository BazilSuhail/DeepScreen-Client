"use client";

import { Suspense, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineBars3BottomLeft,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineHashtag,
  HiOutlineListBullet,
  HiOutlinePlusCircle,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineChartBar,
} from "react-icons/hi2";
import AIAssistantPanel from "@/components/ai-interview/recruiter/AIAssistantPanel";
import {
  AsideBlocks,
  BTN,
  Card,
  DetailSkeleton,
  EmptyState,
  ErrorState,
  NotFoundLink,
  Pill,
  SectionTitle,
  btnLink,
  btnPrimary,
  btnSecondary,
  hintClass,
  inputClass,
  labelClass,
} from "@/components/ai-interview/recruiter/AIInterviewDetailUi";

const ROOT = "mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8";
const SUBTITLE = "Configure the prompts, scoring and limits for this AI interview.";

const toForm = (data) => ({
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

const numberValue = (value) => (Number.isFinite(value) ? value : "");
const parseNumber = (raw) => (raw === "" ? NaN : Number(raw));
const labelOf = (key) => String(key).replace(/_/g, " ");

function rangeError(value, min, max) {
  if (!Number.isFinite(value)) return "Enter a number.";
  if (!Number.isInteger(value) || value < min || value > max) return `Use a whole number from ${min} to ${max}.`;
  return "";
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${BTN} gap-2 px-4 ${active ? "border border-emerald-100 bg-white text-emerald-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-400" : "text-emerald-800/70 hover:text-emerald-950 dark:text-slate-400 dark:hover:text-foreground"}`}
    >
      {icon}
      {children}
    </button>
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
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(() => (searchParams.get("tab") === "assistant" ? "assistant" : "config"));
  const [form, setForm] = useState(() => toForm({ title: "" }));
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [criterionDraft, setCriterionDraft] = useState("");
  const [criterionError, setCriterionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.get(`/ai-interviews/${id}/`);
        if (cancelled) return;
        const nextForm = toForm(data);
        setInterview(data);
        setForm(nextForm);
        setSavedSnapshot(JSON.stringify(nextForm));
        setLoadError("");
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setLoadError("We could not load this interview. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    setAttempt((n) => n + 1);
  };

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/recruiter/ai-interview");
  };

  const updateForm = (patch) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const criteriaEntries = Object.entries(form.evaluation_criteria || {});
  const dirty = JSON.stringify(form) !== savedSnapshot;
  const numberErrors = {
    passing_score: rangeError(form.passing_score, 0, 100),
    number_of_questions: rangeError(form.number_of_questions, 1, 50),
    duration_minutes: rangeError(form.duration_minutes, 1, 240),
  };
  const hasNumberErrors = Object.values(numberErrors).some(Boolean);
  const hasBlankQuestion = form.questions.some((q) => !String(q ?? "").trim());
  const canSave = dirty && !saving && !hasNumberErrors && !hasBlankQuestion;

  const handleSave = async () => {
    if (!canSave) return;
    const payload = form;
    const snapshot = JSON.stringify(payload);
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const res = await api.patch(`/ai-interviews/${id}/`, payload);
      setInterview((prev) => ({ ...prev, ...res }));
      setSavedSnapshot(snapshot);
      setSaved(true);
    } catch (e) {
      setSaveError(e?.message || "Failed to update this interview.");
    } finally {
      setSaving(false);
    }
  };

  const applyAIConfig = (config) => {
    setSaved(false);
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

  const addCriterion = (e) => {
    e.preventDefault();
    const name = criterionDraft.trim();
    if (!name) {
      setCriterionError("Enter a name for the criterion.");
      return;
    }
    const exists = criteriaEntries.some(([key]) => key.toLowerCase() === name.toLowerCase());
    if (exists) {
      setCriterionError("A criterion with this name already exists.");
      return;
    }
    updateForm({ evaluation_criteria: { ...form.evaluation_criteria, [name]: 0.2 } });
    setCriterionDraft("");
    setCriterionError("");
  };

  const removeCriterion = (name) => {
    if (!window.confirm(`Remove the "${labelOf(name)}" criterion?`)) return;
    const next = { ...form.evaluation_criteria };
    delete next[name];
    updateForm({ evaluation_criteria: next });
  };

  const addQuestion = () => updateForm({ questions: [...form.questions, ""] });

  const updateQuestion = (idx, value) => {
    const next = [...form.questions];
    next[idx] = value;
    updateForm({ questions: next });
  };

  const removeQuestion = (idx) => {
    if (!window.confirm(`Remove question ${idx + 1}?`)) return;
    updateForm({ questions: form.questions.filter((_, i) => i !== idx) });
  };

  const saveButton = (
    <button type="button" onClick={handleSave} disabled={!canSave} className={btnPrimary}>
      {saving ? (
        <>
          <HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving...
        </>
      ) : (
        <>
          <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> Save changes
        </>
      )}
    </button>
  );

  const bannerTitle = interview ? interview.title || "Untitled interview" : "AI interview";

  const banner = (
    <DashboardBanner
      loading={loading}
      icon={HiOutlineSparkles}
      badge={interview ? { label: `Interview ID ${id}`, icon: HiOutlineHashtag } : undefined}
      title={bannerTitle}
      subtitle={SUBTITLE}
      aside={
        loading ? (
          <AsideBlocks count={2} />
        ) : interview ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link href={`/recruiter/ai-interview/${id}/sessions`} className={btnSecondary}>
              <HiOutlineUserGroup className="h-4 w-4" aria-hidden="true" /> View candidates
            </Link>
            {saveButton}
          </div>
        ) : null
      }
      footer={
        interview && !loading ? (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleBack} className={`${btnLink} -ml-2`} aria-label="Back to AI interviews">
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to AI interviews
            </button>
            {interview.job_title && <Pill tone="emerald" icon={HiOutlineBriefcase}>{interview.job_title}</Pill>}
            {dirty && <Pill tone="yellow" icon={HiOutlineExclamationCircle}>Unsaved changes</Pill>}
          </div>
        ) : null
      }
    />
  );

  if (loading) {
    return (
      <div className={ROOT}>
        {banner}
        <DetailSkeleton sidebar blocks={2} />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className={ROOT}>
        {banner}
        {loadError ? (
          <ErrorState title="Could not load the interview" message={loadError} onRetry={retry} />
        ) : (
          <EmptyState
            icon={HiOutlineDocumentText}
            title="Interview not found"
            text="It may have been removed. Go back to your AI interviews list."
            action={<NotFoundLink href="/recruiter/ai-interview" label="Back to AI interviews" />}
          />
        )}
      </div>
    );
  }

  const configPanel = (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <Card>
          <SectionTitle
            icon={HiOutlineSparkles}
            title="Interviewer prompt"
            description="How the AI runs the interview and what it looks for"
          />
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="system-prompt" className={labelClass}>Master interviewer prompt</label>
              <textarea
                id="system-prompt"
                value={form.system_prompt}
                onChange={(e) => updateForm({ system_prompt: e.target.value })}
                rows={6}
                placeholder="Instructions for the AI on how to conduct the interview..."
                className={`${inputClass} resize-y py-3 font-mono text-xs leading-relaxed sm:text-sm`}
              />
              <p className={hintClass}>The AI follows these rules for every candidate.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="context-for-ai" className={labelClass}>Job context (hidden from candidates)</label>
              <textarea
                id="context-for-ai"
                value={form.context_for_ai}
                onChange={(e) => updateForm({ context_for_ai: e.target.value })}
                rows={4}
                placeholder="Details about the job, team or project the AI should keep in mind..."
                className={`${inputClass} resize-y py-3 leading-relaxed`}
              />
              <p className={hintClass}>Used for scoring only. Candidates never see this.</p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle
            icon={HiOutlineChartBar}
            title="Scoring criteria"
            description="Each criterion's weight shapes the overall score"
          />

          <form onSubmit={addCriterion} className="mb-5 space-y-2">
            <label htmlFor="new-criterion" className={labelClass}>Add a criterion</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="new-criterion"
                value={criterionDraft}
                onChange={(e) => {
                  setCriterionDraft(e.target.value);
                  setCriterionError("");
                }}
                placeholder="e.g. Communication"
                aria-invalid={Boolean(criterionError)}
                aria-describedby={criterionError ? "new-criterion-error" : undefined}
                maxLength={60}
                className={`${inputClass} sm:flex-1`}
              />
              <button type="submit" className={`${btnSecondary} sm:w-auto`}>
                <HiOutlinePlusCircle className="h-4 w-4" aria-hidden="true" /> Add criterion
              </button>
            </div>
            {criterionError && (
              <p id="new-criterion-error" role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">{criterionError}</p>
            )}
          </form>

          {criteriaEntries.length === 0 ? (
            <EmptyState
              icon={HiOutlineStar}
              title="No scoring criteria yet"
              text={'Add criteria such as "Communication" or "Technical depth" to guide the AI evaluator.'}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {criteriaEntries.map(([name, weight]) => {
                const pct = Math.round(Number(weight) * 100);
                return (
                  <li key={name} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="min-w-0 flex-1 space-y-2">
                      <span className="block truncate text-sm font-semibold capitalize text-emerald-950 dark:text-foreground" title={labelOf(name)}>{labelOf(name)}</span>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-200/60 dark:bg-white/10"
                          aria-label={`Weight ${pct}%`}
                        >
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{pct}%</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriterion(name)}
                      aria-label={`Remove ${labelOf(name)} criterion`}
                      title={`Remove ${labelOf(name)}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-emerald-700/70 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle
            icon={HiOutlineListBullet}
            tone="blue"
            title="Question pool"
            description="Questions the AI can ask. Leave empty to let it generate them."
            action={
              <button type="button" onClick={addQuestion} className={btnSecondary}>
                <HiOutlinePlusCircle className="h-4 w-4" aria-hidden="true" /> Add question
              </button>
            }
          />

          {form.questions.length === 0 ? (
            <EmptyState
              icon={HiOutlineListBullet}
              title="No questions in the pool"
              text="The AI will generate questions dynamically for each candidate."
              action={
                <button type="button" onClick={addQuestion} className={btnSecondary}>
                  <HiOutlinePlusCircle className="h-4 w-4" aria-hidden="true" /> Add a question
                </button>
              }
            />
          ) : (
            <ol className="space-y-3">
              {form.questions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white font-mono text-xs font-semibold text-emerald-800 shadow-sm dark:bg-white/5 dark:text-slate-300" aria-hidden="true">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Question {idx + 1}</span>
                    <textarea
                      value={q ?? ""}
                      onChange={(e) => updateQuestion(idx, e.target.value)}
                      rows={2}
                      placeholder="Write the question the AI should ask..."
                      className="min-h-11 w-full resize-y rounded-lg bg-transparent px-1 py-1.5 text-sm leading-relaxed text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-foreground"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    aria-label={`Remove question ${idx + 1}`}
                    title={`Remove question ${idx + 1}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-emerald-700/70 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          )}
          {hasBlankQuestion && (
            <p role="alert" className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">
              Fill in or remove the empty questions before saving.
            </p>
          )}
        </Card>
      </div>

      <Card className="space-y-6 lg:sticky lg:top-6">
        <SectionTitle
          icon={HiOutlineAdjustmentsHorizontal}
          title="Session parameters"
          description="Limits applied to every candidate"
        />
        <div className="space-y-5">
          {[
            { id: "passing-score", label: "Passing score (%)", key: "passing_score", hint: "Candidates at or above this score pass.", min: 0, max: 100 },
            { id: "questions-count", label: "Questions count", key: "number_of_questions", hint: "How many questions each session asks.", min: 1, max: 50 },
            { id: "time-limit", label: "Time limit (minutes)", key: "duration_minutes", hint: "Total time allowed for one interview.", min: 1, max: 240 },
          ].map((field) => {
            const error = numberErrors[field.key];
            const errorId = `${field.id}-error`;
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className={labelClass}>{field.label}</label>
                <input
                  id={field.id}
                  type="number"
                  inputMode="numeric"
                  min={field.min}
                  max={field.max}
                  value={numberValue(form[field.key])}
                  onChange={(e) => updateForm({ [field.key]: parseNumber(e.target.value) })}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className={`${inputClass} font-mono ${error ? "border-red-400 dark:border-red-500/60" : ""}`}
                />
                {error ? (
                  <p id={errorId} className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
                ) : (
                  <p className={hintClass}>{field.hint}</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const assistantPanel = (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-4">
      <div className="min-w-0 xl:col-span-3">
        <AIAssistantPanel form={form} interview={interview} onApplyConfig={applyAIConfig} />
      </div>

      <Card as="aside" className="space-y-5 xl:sticky xl:top-6 xl:col-span-1">
        <SectionTitle icon={HiOutlineHashtag} title="Live summary" description="Matches the form as you edit it" />

        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-emerald-800/70 dark:text-slate-400">Working title</span>
          <p title={form.title} className="truncate rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-foreground">
            {form.title || "Untitled interview"}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-2.5">
          {[
            { label: "Time limit", value: `${form.duration_minutes ?? "—"} min`, icon: HiOutlineClock },
            { label: "Questions", value: form.number_of_questions ?? "—", icon: HiOutlineDocumentText },
            { label: "Passing score", value: `${form.passing_score ?? "—"}%`, icon: HiOutlineShieldCheck },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
              <dt className="flex items-center gap-2 text-xs font-semibold text-emerald-800/70 dark:text-slate-400">
                <row.icon className="h-4 w-4" aria-hidden="true" /> {row.label}
              </dt>
              <dd className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/70 dark:text-slate-400">
            <HiOutlineStar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Scoring criteria
          </span>
          {criteriaEntries.length === 0 ? (
            <p className={hintClass}>No scoring criteria yet.</p>
          ) : (
            <ul className="max-h-[160px] space-y-2 overflow-y-auto pr-1">
              {criteriaEntries.map(([name, weight]) => (
                <li key={name} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 p-3 text-xs dark:border-white/10">
                  <span className="min-w-0 truncate font-semibold capitalize text-emerald-900/80 dark:text-slate-300">{labelOf(name)}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{Math.round(Number(weight) * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/70 dark:text-slate-400">
            <HiOutlineBars3BottomLeft className="h-3.5 w-3.5" aria-hidden="true" /> Interviewer instructions
          </span>
          <div className="max-h-[140px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 font-mono text-[11px] leading-relaxed text-emerald-900/80 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
            {form.system_prompt || "No instructions yet. Ask the assistant to draft them."}
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className={ROOT}>
      {banner}

      {saveError && <ErrorState title="Could not save your changes" message={saveError} />}
      {saved && !saveError && (
        <output className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Changes saved.
        </output>
      )}

      <fieldset aria-label="Interview sections" className="m-0 inline-flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-xl border-0 bg-emerald-100/60 p-1 dark:bg-white/5">
        <TabButton active={activeTab === "config"} onClick={() => setActiveTab("config")} icon={<HiOutlineCog6Tooth className="h-4 w-4" aria-hidden="true" />}>
          Configuration
        </TabButton>
        <TabButton active={activeTab === "assistant"} onClick={() => setActiveTab("assistant")} icon={<HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />}>
          AI assistant
        </TabButton>
      </fieldset>

      {activeTab === "assistant" ? assistantPanel : configPanel}
    </div>
  );
}

export default function RecruiterAIInterviewDetail() {
  return (
    <Suspense
      fallback={
        <div className={ROOT}>
          <DashboardBanner loading icon={HiOutlineSparkles} title="AI interview" subtitle={SUBTITLE} aside={<AsideBlocks count={2} />} />
          <DetailSkeleton sidebar blocks={2} />
        </div>
      }
    >
      <RecruiterAIInterviewDetailContent />
    </Suspense>
  );
}
