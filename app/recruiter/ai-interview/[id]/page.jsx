"use client";

import { Suspense, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { base, fadeUp, spring, stagger } from "@/constants/motion";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AIInterviewDetailSkeleton from "@/components/skeletons/recruiter/AIInterviewDetailSkeleton";
import {
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
  HiOutlineInformationCircle,
  HiOutlineQueueList,
} from "react-icons/hi2";
import { ghostButton as btnGhost } from "@/components/ui/styles";
import AIAssistantPanel from "@/components/ai-interview/recruiter/AIAssistantPanel";
import {
  formatServerError,
  toEditableConfig,
  toPayload,
} from "@/components/ai-interview/recruiter/interviewConfig";
import {
  BTN,
  Card,
  EmptyState,
  ErrorState,
  NotFoundLink,
  Pill,
  SectionTitle,
  StatTile,
  btnDanger,
  btnPrimary,
  btnSecondary,
  hintClass,
  inputClass,
  labelClass,
} from "@/components/ai-interview/recruiter/AIInterviewDetailUi";

const ROOT = "w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10";
const SUBTITLE = "Configure the prompts, scoring and limits for this AI interview.";

const POLICY_FIELDS = [
  { id: "policy-review-serious", key: "review_serious", label: "Serious events before review", hint: "Serious events that flag a session for review.", min: 1, max: 20 },
  { id: "policy-review-strikes", key: "review_strikes", label: "Strikes before review", hint: "Strikes that flag a session for review.", min: 1, max: 100 },
  { id: "policy-concern-serious", key: "concern_serious", label: "Serious events before concern", hint: "Serious events that mark a session as a concern.", min: 1, max: 50 },
];

const numberValue = (value) => (Number.isFinite(value) ? value : "");
const parseNumber = (raw) => (raw === "" ? NaN : Number(raw));

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
      className={`${BTN} relative gap-2 px-4 ${active ? "text-emerald-700 dark:text-emerald-400" : "text-emerald-800/70 hover:text-emerald-950 dark:text-muted-foreground dark:hover:text-foreground"}`}
    >
      {active && (
        <motion.span layoutId="ai-interview-detail-tab" transition={spring} className="absolute inset-0 rounded-md border border-emerald-100 bg-card shadow-sm dark:border-white/10 dark:bg-white/5" aria-hidden="true" />
      )}
      <span className="relative flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
}

function RecruiterAIInterviewDetailContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(() => (searchParams.get("tab") === "assistant" ? "assistant" : "config"));
  const [form, setForm] = useState(() => toEditableConfig());
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [criterionDraft, setCriterionDraft] = useState("");
  const [criterionError, setCriterionError] = useState("");
  const [pending, setPending] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.get(`/ai-interviews/${id}/`);
        if (cancelled) return;
        const nextForm = toEditableConfig(data);
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

  const updateForm = (patch) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const criteria = form.evaluation_criteria;
  const dirty = JSON.stringify(form) !== savedSnapshot;
  const numberErrors = {
    passing_score: rangeError(form.passing_score, 0, 100),
    number_of_questions: rangeError(form.number_of_questions, 1, 50),
    duration_minutes: rangeError(form.duration_minutes, 1, 240),
  };
  const hasNumberErrors = Object.values(numberErrors).some(Boolean);
  const hasPolicyErrors = POLICY_FIELDS.some((f) => {
    const v = form.proctoring_policy[f.key];
    return v !== undefined && v !== "" && rangeError(v, f.min, f.max);
  });
  const hasBlankQuestion = form.questions.some((q) => !q.trim());
  const hasBlankCriterion = criteria.some((c) => !c.name.trim());
  const canSave = dirty && !saving && !hasNumberErrors && !hasPolicyErrors && !hasBlankQuestion && !hasBlankCriterion;

  const handleSave = async () => {
    if (!canSave) return;
    const payload = toPayload(form);
    const snapshot = JSON.stringify(form);
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const res = await api.patch(`/ai-interviews/${id}/`, payload);
      setInterview((prev) => ({ ...prev, ...res }));
      setSavedSnapshot(snapshot);
      setSaved(true);
    } catch (e) {
      setSaveError(formatServerError(e, "Failed to update this interview."));
    } finally {
      setSaving(false);
    }
  };

  // AI drafts only overwrite the fields the model actually returned.
  const applyAIConfig = (config) => {
    setSaved(false);
    const present = Object.fromEntries(Object.entries(config).filter(([, v]) => v != null));
    setForm((prev) => toEditableConfig({ ...prev, ...present }));
  };

  const addCriterion = (e) => {
    e.preventDefault();
    const name = criterionDraft.trim();
    if (!name) {
      setCriterionError("Enter a name for the criterion.");
      return;
    }
    const exists = criteria.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      setCriterionError("A criterion with this name already exists.");
      return;
    }
    updateForm({ evaluation_criteria: [...criteria, { name, weight: 0.2 }] });
    setCriterionDraft("");
    setCriterionError("");
  };

  const updateCriterion = (idx, patch) =>
    updateForm({ evaluation_criteria: criteria.map((c, i) => (i === idx ? { ...c, ...patch } : c)) });

  const updateWeight = (idx, raw) => {
    const pct = raw === "" ? 0 : Math.min(100, Math.max(0, Number(raw)));
    updateCriterion(idx, { weight: pct / 100 });
  };

  const removeCriterion = (idx) =>
    setPending({
      title: `Remove the "${criteria[idx].name || "unnamed"}" criterion?`,
      confirmLabel: "Remove criterion",
      run: () => updateForm({ evaluation_criteria: criteria.filter((_, i) => i !== idx) }),
    });

  const updatePolicy = (key, raw) => {
    const next = { ...form.proctoring_policy };
    if (raw === "") delete next[key];
    else next[key] = Number(raw);
    updateForm({ proctoring_policy: next });
  };

  const addQuestion = () => updateForm({ questions: [...form.questions, ""] });

  const updateQuestion = (idx, value) => {
    const next = [...form.questions];
    next[idx] = value;
    updateForm({ questions: next });
  };

  const removeQuestion = (idx) =>
    setPending({
      title: `Remove question ${idx + 1}?`,
      confirmLabel: "Remove question",
      run: () => updateForm({ questions: form.questions.filter((_, i) => i !== idx) }),
    });

  const saveButton = (
    <button type="button" onClick={handleSave} disabled={!canSave} className={btnPrimary}>
      {saving ? (
        <>
          <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Saving...
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
    <PageHeader
      back={{ href: "/recruiter/ai-interview", label: "All AI interviews" }}
      icon={HiOutlineSparkles}
      eyebrow="AI interview"
      title={bannerTitle}
      description={SUBTITLE}
      meta={
        interview ? (
          <>
            <Pill tone="neutral" icon={HiOutlineHashtag}>Interview ID {id}</Pill>
            {interview.job_title && <Pill tone="emerald" icon={HiOutlineBriefcase}>{interview.job_title}</Pill>}
            {dirty && <Pill tone="yellow" icon={HiOutlineExclamationCircle}>Unsaved changes</Pill>}
          </>
        ) : null
      }
      actions={
        interview ? (
          <>
            <Link href={`/recruiter/ai-interview/${id}/sessions`} className={btnSecondary}>
              <HiOutlineUserGroup className="h-4 w-4" aria-hidden="true" /> View candidates
            </Link>
            {saveButton}
          </>
        ) : null
      }
    />
  );

  if (loading) return <AIInterviewDetailSkeleton />;

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

  const detailRows = [
    { label: "Job", value: interview.job_title || "Not linked", icon: HiOutlineBriefcase },
    { label: "Interview ID", value: id, icon: HiOutlineHashtag },
    { label: "Question pool", value: form.questions.length, icon: HiOutlineQueueList },
    { label: "Status", value: dirty ? "Unsaved changes" : "Saved", icon: dirty ? HiOutlineExclamationCircle : HiOutlineCheckCircle },
  ];

  const statTiles = [
    { label: "Questions", value: Number.isFinite(form.number_of_questions) ? form.number_of_questions : null, icon: HiOutlineDocumentText, hint: "Questions asked per session" },
    { label: "Time limit", value: Number.isFinite(form.duration_minutes) ? `${form.duration_minutes} min` : null, icon: HiOutlineClock, hint: "Total time per interview" },
    { label: "Passing score", value: Number.isFinite(form.passing_score) ? `${form.passing_score}%` : null, icon: HiOutlineShieldCheck, hint: "Score needed to pass" },
    { label: "Scoring criteria", value: criteria.length, icon: HiOutlineChartBar, hint: "Criteria used to score answers" },
  ];

  const configPanel = (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div className="min-w-0 space-y-6 lg:col-span-8 2xl:col-span-9">
        <Card>
          <SectionTitle icon={HiOutlineDocumentText} title="Basics" description="What candidates see about this interview" />
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="interview-title" className={labelClass}>Interview title</label>
              <input
                id="interview-title"
                value={form.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                maxLength={255}
                placeholder="e.g. Core React engineering screen"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interview-description" className={labelClass}>Short description</label>
              <textarea
                id="interview-description"
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                rows={2}
                placeholder="A sentence or two about what this interview covers"
                className={`${inputClass} resize-y py-3 leading-relaxed`}
              />
            </div>
          </div>
        </Card>

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

          {criteria.length === 0 ? (
            <EmptyState
              icon={HiOutlineStar}
              title="No scoring criteria yet"
              text={'Add criteria such as "Communication" or "Technical depth" to guide the AI evaluator.'}
            />
          ) : (
            <ul className="space-y-3">
              {criteria.map((c, idx) => {
                const pct = Math.round(c.weight * 100);
                return (
                  <li key={idx} className="flex flex-col gap-3 border border-emerald-100 bg-emerald-50/60 p-3 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.03]">
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Criterion {idx + 1} name</span>
                      <input
                        value={c.name}
                        onChange={(e) => updateCriterion(idx, { name: e.target.value })}
                        maxLength={60}
                        placeholder="e.g. Communication"
                        className={inputClass}
                      />
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs font-semibold text-emerald-800/80 dark:text-muted-foreground">
                        <span className="sr-only">Weight for criterion {idx + 1}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={100}
                          step={1}
                          value={pct}
                          onChange={(e) => updateWeight(idx, e.target.value)}
                          className={`${inputClass} w-24 font-mono`}
                        />
                        %
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCriterion(idx)}
                        aria-label={`Remove criterion ${idx + 1}`}
                        title={`Remove ${c.name || "criterion"}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-emerald-700/70 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-muted-foreground dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
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
                <li key={idx} className="flex items-start gap-3 border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-card font-mono text-xs font-semibold text-emerald-800 shadow-sm dark:bg-white/5 dark:text-foreground" aria-hidden="true">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Question {idx + 1}</span>
                    <textarea
                      value={q ?? ""}
                      onChange={(e) => updateQuestion(idx, e.target.value)}
                      rows={2}
                      placeholder="Write the question the AI should ask..."
                      className="min-h-11 w-full resize-y rounded-md bg-transparent px-1 py-1.5 text-sm leading-relaxed text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-foreground"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    aria-label={`Remove question ${idx + 1}`}
                    title={`Remove question ${idx + 1}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-emerald-700/70 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-muted-foreground dark:hover:bg-red-500/10 dark:hover:text-red-400"
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

      <div className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:col-span-4 2xl:col-span-3">
      <Card className="space-y-6">
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

      <Card className="space-y-6">
        <SectionTitle
          icon={HiOutlineShieldCheck}
          title="Proctoring thresholds"
          description="Leave blank to use the platform defaults"
        />
        <div className="space-y-5">
          {POLICY_FIELDS.map((field) => {
            const value = form.proctoring_policy[field.key];
            const error = value === undefined ? "" : rangeError(value, field.min, field.max);
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
                  value={value ?? ""}
                  onChange={(e) => updatePolicy(field.key, e.target.value)}
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

      <Card>
        <SectionTitle icon={HiOutlineInformationCircle} title="Details" description="Where this interview is used" />
        <dl className="divide-y divide-emerald-100 border-y border-emerald-100 text-sm dark:divide-white/10 dark:border-white/10">
          {detailRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                <row.icon className="h-4 w-4" aria-hidden="true" /> {row.label}
              </dt>
              <dd title={String(row.value)} className="min-w-0 truncate font-semibold tabular-nums text-emerald-950 dark:text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 grid grid-cols-1 gap-2">
          <Link href={`/recruiter/ai-interview/${id}/sessions`} className={btnSecondary}>
            <HiOutlineUserGroup className="h-4 w-4" aria-hidden="true" /> View candidates
          </Link>
          <button type="button" onClick={() => setActiveTab("assistant")} className={btnGhost}>
            <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" /> Refine with AI assistant
          </button>
        </div>
      </Card>
      </div>
    </div>
  );

  const assistantPanel = (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-8 2xl:col-span-9">
        <AIAssistantPanel form={form} interview={interview} onApplyConfig={applyAIConfig} />
      </div>

      <Card as="aside" className="space-y-5 lg:sticky lg:top-6 lg:col-span-4 2xl:col-span-3">
        <SectionTitle icon={HiOutlineHashtag} title="Live summary" description="Matches the form as you edit it" />

        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-emerald-800/70 dark:text-muted-foreground">Working title</span>
          <p title={form.title} className="truncate border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-foreground">
            {form.title || "Untitled interview"}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-2.5">
          {[
            { label: "Time limit", value: `${form.duration_minutes ?? "—"} min`, icon: HiOutlineClock },
            { label: "Questions", value: form.number_of_questions ?? "—", icon: HiOutlineDocumentText },
            { label: "Passing score", value: `${form.passing_score ?? "—"}%`, icon: HiOutlineShieldCheck },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
              <dt className="flex items-center gap-2 text-xs font-semibold text-emerald-800/70 dark:text-muted-foreground">
                <row.icon className="h-4 w-4" aria-hidden="true" /> {row.label}
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/70 dark:text-muted-foreground">
            <HiOutlineStar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Scoring criteria
          </span>
          {criteria.length === 0 ? (
            <p className={hintClass}>No scoring criteria yet.</p>
          ) : (
            <ul className="max-h-[160px] space-y-2 overflow-y-auto pr-1">
              {criteria.map((c, idx) => (
                <li key={idx} className="flex items-center justify-between gap-3 border border-emerald-100 p-3 text-xs dark:border-white/10">
                  <span className="min-w-0 truncate font-semibold text-emerald-900/80 dark:text-foreground">{c.name || "Unnamed"}</span>
                  <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{Math.round(c.weight * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/70 dark:text-muted-foreground">
            <HiOutlineBars3BottomLeft className="h-3.5 w-3.5" aria-hidden="true" /> Interviewer instructions
          </span>
          <div className="max-h-[140px] overflow-y-auto whitespace-pre-wrap border border-emerald-100 bg-emerald-50/60 p-3.5 font-mono text-[11px] leading-relaxed text-emerald-900/80 dark:border-white/10 dark:bg-white/[0.03] dark:text-foreground">
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
        <output className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Changes saved.
        </output>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statTiles.map((tile, i) => (
          <motion.div key={tile.label} {...fadeUp} transition={{ ...base, delay: Math.min(i, 8) * stagger }} className="min-w-0">
            <StatTile icon={tile.icon} label={tile.label} hint={tile.hint} value={<span className="tabular-nums">{tile.value ?? "—"}</span>} />
          </motion.div>
        ))}
      </div>

      <fieldset aria-label="Interview sections" className="m-0 inline-flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-lg border-0 bg-emerald-100/60 p-1 dark:bg-white/5">
        <TabButton active={activeTab === "config"} onClick={() => setActiveTab("config")} icon={<HiOutlineCog6Tooth className="h-4 w-4" aria-hidden="true" />}>
          Configuration
        </TabButton>
        <TabButton active={activeTab === "assistant"} onClick={() => setActiveTab("assistant")} icon={<HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />}>
          AI assistant
        </TabButton>
      </fieldset>

      {activeTab === "assistant" ? assistantPanel : configPanel}

      <ConfirmDialog
        open={pending !== null}
        title={pending?.title}
        confirmLabel={pending?.confirmLabel}
        confirmClassName={btnDanger}
        onConfirm={() => {
          pending.run();
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

export default function RecruiterAIInterviewDetail() {
  return (
    <Suspense fallback={<AIInterviewDetailSkeleton />}>
      <RecruiterAIInterviewDetailContent />
    </Suspense>
  );
}
