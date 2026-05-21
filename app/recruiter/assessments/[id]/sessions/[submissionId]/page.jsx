"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/utils/api";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineChevronLeft,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMinusCircle,
  HiOutlinePlayCircle,
  HiOutlineDocumentText,
  HiOutlineCommandLine,
  HiOutlineListBullet,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineCodeBracket,
  HiOutlineAcademicCap,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineEye,
  HiOutlineEnvelope,
  HiOutlineCalendarDays,
  HiOutlineHashtag,
  HiOutlineBeaker,
  HiOutlineChartBar,
  HiOutlineArrowPath,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import BarChart from "@/components/display/BarChart";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import FormError from "@/components/auth/FormError";

const STATUS_META = {
  pending: {
    icon: HiOutlineMinusCircle,
    label: "Pending",
    className: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  in_progress: {
    icon: HiOutlinePlayCircle,
    label: "In progress",
    className: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  submitted: {
    icon: HiOutlineDocumentText,
    label: "Submitted",
    className: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  evaluated: {
    icon: HiOutlineCheckCircle,
    label: "Evaluated",
    className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
};

const Q_STATUS_META = {
  passed: {
    icon: HiOutlineCheckCircle,
    className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  partial: {
    icon: HiOutlineClock,
    className: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  failed: {
    icon: HiOutlineXCircle,
    className: "text-red-500 bg-red-500/10 border-red-500/20",
  },
  no_answer: {
    icon: HiOutlineMinusCircle,
    className: "text-muted-foreground bg-secondary/50 border-border",
  },
  error: {
    icon: HiOutlineExclamationTriangle,
    className: "text-red-500 bg-red-500/10 border-red-500/20",
  },
  no_tests: {
    icon: HiOutlineExclamationTriangle,
    className: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
};

const sectionLabel = "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground";

function SectionHeader({ icon: Icon, tone, title, hint }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

function TypeIcon({ type }) {
  switch (type) {
    case "coding":
      return <HiOutlineCommandLine className="w-4 h-4" aria-hidden="true" />;
    case "mcq":
      return <HiOutlineListBullet className="w-4 h-4" aria-hidden="true" />;
    case "subjective":
      return <HiOutlineChatBubbleBottomCenterText className="w-4 h-4" aria-hidden="true" />;
    default:
      return <HiOutlineBeaker className="w-4 h-4" aria-hidden="true" />;
  }
}

function TypeBadge({ type }) {
  const meta = {
    coding: {
      label: "Coding",
      className: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    },
    mcq: {
      label: "MCQ",
      className: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    },
    subjective: {
      label: "Subjective",
      className: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  };
  const m = meta[type] || {
    label: type,
    className: "text-muted-foreground bg-secondary/50 border-border",
  };
  return (
    <span
      title={`Question type: ${m.label}`}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${m.className}`}
    >
      <TypeIcon type={type} /> {m.label}
    </span>
  );
}

function ScoreRingBig({ percentage, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circ = radius * 2 * Math.PI;
  const offset = percentage != null ? circ - (percentage / 100) * circ : circ;
  const color =
    percentage >= 80 ? "#10b981" : percentage >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title="Overall score">
      <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {percentage != null && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold" style={{ color }}>
          {percentage != null ? `${Math.round(percentage)}%` : "—"}
        </span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
          Score
        </span>
      </div>
    </div>
  );
}

function getCandidateInitial(name, email) {
  if (name && name.length > 0) {
    const parts = name.split(" ");
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  }
  return email ? email[0].toUpperCase() : "?";
}

function TestCaseResult({ tc, index }) {
  const [showHidden, setShowHidden] = useState(false);
  const isHidden = tc.isHidden;
  const passed = tc.passed;

  if (isHidden && !showHidden) {
    return (
      <motion.div
        layout
        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border"
      >
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground" aria-hidden="true">
          #
        </div>
        <span className="flex-1 text-xs font-semibold text-muted-foreground">
          Hidden test case {index + 1}
        </span>
        <button
          type="button"
          onClick={() => setShowHidden(true)}
          title="Show the input and output of this hidden test"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-[9px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-emerald-500 transition-all"
        >
          <HiOutlineEye className="w-3 h-3" aria-hidden="true" /> Reveal
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`p-3 rounded-xl border ${passed ? "bg-emerald-500/5 border-emerald-500/15" : "bg-red-500/5 border-red-500/15"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${passed ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}
            title={passed ? "Passed" : "Failed"}
          >
            {passed ? (
              <HiOutlineCheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <HiOutlineXCircle className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </div>
          <span className="text-xs font-semibold">
            {isHidden ? "Hidden test" : "Test"} case {index + 1}
          </span>
          {isHidden && (
            <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded">
              Hidden
            </span>
          )}
        </div>
        {tc.executionTime && (
          <span className="text-[10px] font-mono text-muted-foreground" title="Execution time">
            {tc.executionTime}s
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 rounded-lg bg-background/50 border border-border/50">
          <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            Input
          </div>
          <div className="text-muted-foreground truncate">
            {tc.input || "(empty)"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-background/50 border border-border/50">
          <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            Expected
          </div>
          <div className="text-muted-foreground truncate">
            {tc.expectedOutput || "(empty)"}
          </div>
        </div>
        {!passed && (
          <div className="col-span-2 p-2 rounded-lg bg-background/50 border border-border/50">
            <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              Actual output
            </div>
            <div className="text-red-500 truncate">
              {tc.actualOutput || "(no output)"}
            </div>
          </div>
        )}
      </div>
      {tc.error && (
        <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
          {tc.error}
        </div>
      )}
    </motion.div>
  );
}

function QuestionDetailCard({ question, result, answers, index }) {
  const [expanded, setExpanded] = useState(false);
  const qStatus = Q_STATUS_META[result?.status] || Q_STATUS_META.no_answer;
  const StatusIcon = qStatus.icon;
  const isPassed = result?.status === "passed";
  const isPartial = result?.status === "partial";
  const answer = answers?.[question.question_id];

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        title={expanded ? "Hide details" : "Show answers and test results"}
        className="w-full p-5 lg:p-6 flex items-center gap-4 text-left transition-colors hover:bg-secondary/20"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-semibold shrink-0 ${
            isPassed
              ? "bg-emerald-500/10 text-emerald-500"
              : isPartial
                ? "bg-amber-500/10 text-amber-500"
                : result?.status === "failed"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-secondary text-muted-foreground"
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm truncate max-w-[250px] md:max-w-[400px]">
              {question.title}
            </h4>
            <TypeBadge type={question.type} />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold">{result?.score ?? 0}</span> /{" "}
              {result?.max_score ?? question.marks ?? 10} marks
            </span>
            {result?.passed_count !== undefined && (
              <span className="text-xs text-muted-foreground">
                {result.passed_count}/{result.total_count} tests passed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            title={`Question status: ${result?.status || "no answer"}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border ${qStatus.className}`}
          >
            <StatusIcon className="w-3 h-3" aria-hidden="true" /> {result?.status || "no_answer"}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
            aria-hidden="true"
          >
            <HiOutlineChevronLeft className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-5 pt-2 border-t border-border space-y-4">
              {/* Question Description (HTML) */}
              {question.description && (
                <div
                  className="text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-xl p-4 prose-content"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              )}

              {/* ── Coding Details ── */}
              {question.type === "coding" && (
                <div className="space-y-3">
                  {result?.test_results?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <HiOutlineCodeBracket className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <span className={sectionLabel}>
                          Test results ({result.passed_count}/
                          {result.total_count})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {result.test_results.map((tc, i) => (
                          <TestCaseResult key={i} tc={tc} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {answer?.code && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <HiOutlineCodeBracket className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <span className={sectionLabel}>
                          Candidate code (
                          {answer.language_id
                            ? `Lang ID: ${answer.language_id}`
                            : ""}
                          )
                        </span>
                      </div>
                      <div className="bg-[#0d1117] text-[#c9d1d9] rounded-xl p-4 overflow-x-auto">
                        <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
                          {answer.code}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── MCQ Details ── */}
              {question.type === "mcq" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <HiOutlineListBullet className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className={sectionLabel}>
                      Answer review
                    </span>
                  </div>
                  {question.mcq_details?.options?.map((opt, i) => {
                    const selected = result?.selected_options?.includes(i);
                    const correct = result?.correct_options?.includes(i);
                    const isWrongSelection = selected && !correct;
                    const isMissedCorrect = !selected && correct;

                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                          isWrongSelection
                            ? "bg-red-500/5 border-red-500/20 text-red-400"
                            : isMissedCorrect
                              ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                              : correct
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                                : "bg-secondary/30 border-border text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                            isWrongSelection
                              ? "border-red-500 bg-red-500/20"
                              : isMissedCorrect
                                ? "border-amber-500 bg-amber-500/20"
                                : correct
                                  ? "border-emerald-500 bg-emerald-500/20"
                                  : "border-border"
                          }`}
                        >
                          {selected && (
                            <HiOutlineCheckCircle className="w-3 h-3" aria-hidden="true" />
                          )}
                          {!selected && correct && (
                            <HiOutlineXCircle className="w-3 h-3" aria-hidden="true" />
                          )}
                        </div>
                        <span className="flex-1">{opt.text}</span>
                        {correct && (
                          <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Subjective Details ── */}
              {question.type === "subjective" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <HiOutlineChatBubbleBottomCenterText className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className={sectionLabel}>
                      Candidate response
                    </span>
                  </div>
                  {answer?.textualAnswer ? (
                    <div className="bg-secondary/30 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {answer.textualAnswer}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground/70 italic bg-secondary/30 rounded-xl p-4">
                      No answer provided
                    </div>
                  )}
                  {result?.note && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400">
                      <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {result.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SubmissionDetailPage() {
  const router = useRouter();
  const { id, submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!submissionId) return;
    api
      .get(`/assessments/submissions/${submissionId}/`)
      .then((data) => { setSubmission(data); setError(""); })
      .catch(() => setError("We could not load this candidate's session. Check your connection and try again."))
      .finally(() => setLoading(false));
  }, [submissionId, attempt]);

  const retry = () => {
    setLoading(true);
    setError("");
    setAttempt((n) => n + 1);
  };

  const { questions, results } = useMemo(() => {
    if (!submission) return { questions: [], results: {} };
    const qs = submission.questions_data || [];
    const rs = submission.question_results || {};
    return { questions: qs, results: rs };
  }, [submission]);

  const barChartData = useMemo(() => {
    return questions.map((q, i) => {
      const r = results[q.question_id];
      return {
        label: `Q${i + 1}`,
        applicants: r?.score ?? 0,
        assessments: r?.max_score ?? q.marks ?? 10,
        interviews: 0,
      };
    });
  }, [questions, results]);

  if (loading) return <PageSkeleton stats={4} cards={2} />;

  if (error && !submission)
    return (
      <div className="mx-auto w-full min-w-0 space-y-4 px-4 pb-16 pt-10 md:px-8">
        <FormError title="Could not load this session" message={error} />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={retry} title="Load this session again"
            className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary">
            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
          <button type="button" onClick={() => router.push(`/recruiter/assessments/${id}/sessions`)} title="Back to the sessions list"
            className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary/80">
            <HiOutlineChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to sessions
          </button>
        </div>
      </div>
    );

  if (!submission) return null;

  const StatusIcon =
    STATUS_META[submission?.status]?.icon || HiOutlineMinusCircle;
  const statusClass =
    STATUS_META[submission?.status]?.className ||
    "text-muted-foreground bg-secondary/50 border-border";

  const stats = [
    {
      label: "Total score",
      value: `${submission.total_score ?? 0}`,
      sub: `/ ${submission.max_score ?? 0}`,
      icon: HiOutlineAcademicCap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      hint: "Points earned out of the maximum",
    },
    {
      label: "Percentage",
      value: `${submission.percentage != null ? Math.round(submission.percentage) : 0}%`,
      sub:
        submission.percentage >= (submission.assessment_pass ?? 70)
          ? "Passed"
          : "Failed",
      subColor:
        submission.percentage >= (submission.assessment_pass ?? 70)
          ? "text-emerald-500"
          : "text-red-500",
      icon: HiOutlineHashtag,
      color:
        submission.percentage >= 80
          ? "text-emerald-500"
          : submission.percentage >= 60
            ? "text-amber-500"
            : "text-red-500",
      bg: "bg-emerald-500/10",
      hint: "Score as a percentage of the maximum",
    },
    {
      label: "Time taken",
      value: submission.time_taken ? `${submission.time_taken_minutes}m` : "—",
      sub: submission.assessment_duration
        ? `of ${submission.assessment_duration}m`
        : "",
      icon: HiOutlineClock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      hint: "Time spent against the time limit",
    },
    {
      label: "Questions",
      value: questions.length,
      sub: `${Object.keys(results).filter((k) => results[k]?.status === "passed").length} passed`,
      icon: HiOutlineBeaker,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      hint: "Questions in this assessment",
    },
  ];

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 pt-10 md:px-8">
      {error && <FormError title="Something went wrong" message={error} />}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <button
            type="button"
            onClick={() => router.push(`/recruiter/assessments/${id}/sessions`)}
            title="Back to the sessions list"
            aria-label="Back to the sessions list"
            className="group mt-1 shrink-0 rounded-xl border border-border bg-secondary p-3 transition-all hover:bg-emerald-500/10 hover:text-emerald-500"
          >
            <HiOutlineChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg font-semibold text-white shadow-lg shadow-emerald-600/20"
                title="Candidate initials"
              >
                {getCandidateInitial(
                  submission.candidate_name,
                  submission.candidate_email,
                )}
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {submission.candidate_name || "Unknown candidate"}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <HiOutlineEnvelope className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="break-all">{submission.candidate_email}</span>
                  </span>
                  <span
                    title={`Session status: ${STATUS_META[submission.status]?.label || submission.status}`}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${statusClass}`}
                  >
                    <StatusIcon className="w-3 h-3" aria-hidden="true" />
                    {STATUS_META[submission.status]?.label || submission.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {submission.assessment_title && (
                <span className="inline-flex items-center gap-1" title="Assessment">
                  <HiOutlineBeaker className="w-3.5 h-3.5" aria-hidden="true" />
                  {submission.assessment_title}
                </span>
              )}
              {submission.job_title && (
                <span className="inline-flex items-center gap-1" title="Job opening">
                  <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  {submission.job_title}
                </span>
              )}
              {submission.submitted_at && (
                <span className="inline-flex items-center gap-1" title="Submitted on">
                  <HiOutlineCalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                  {new Date(submission.submitted_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <ScoreRingBig percentage={submission.percentage} size={88} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* ── Stats Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              title={stat.hint}
              className="rounded-xl border border-border bg-card p-4 lg:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} aria-hidden="true" />
                </span>
              </div>
              <motion.span
                key={stat.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`block text-2xl font-semibold lg:text-3xl ${stat.color}`}
              >
                {stat.value}
              </motion.span>
              {stat.sub && (
                <p
                  className={`mt-2 text-[10px] font-semibold ${stat.subColor || "text-muted-foreground/70"}`}
                >
                  {stat.sub}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Score Chart ────────────────────────────────────────── */}
        {barChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-5 lg:p-6"
          >
            <div className="mb-4">
              <SectionHeader
                icon={HiOutlineChartBar}
                tone="bg-emerald-500/10 text-emerald-500"
                title="Per-question scores"
                hint="Points earned against the maximum for each question"
              />
            </div>
            <div className="h-64 md:h-72">
              <BarChart data={barChartData} />
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-widest">
              <span className="inline-flex items-center gap-1.5" title="Points the candidate earned">
                <span className="w-3 h-3 rounded bg-[#10b981]" aria-hidden="true" /> Earned
              </span>
              <span className="inline-flex items-center gap-1.5" title="Maximum points for the question">
                <span className="w-3 h-3 rounded bg-[#6ee7b7]" aria-hidden="true" /> Max
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Per-Question Breakdown ─────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={HiOutlineDocumentText}
          tone="bg-blue-500/10 text-blue-500"
          title="Question breakdown"
          hint="Open a question to see the answer and test results"
        />

        <AnimatePresence>
          {questions.length === 0 && (
            <EmptyState
              icon={HiOutlineInformationCircle}
              title="No questions found"
              text="This assessment has no questions configured. Add questions in the assessment editor."
            />
          )}
          {questions.map((q, i) => (
            <QuestionDetailCard
              key={q.question_id || i}
              question={q}
              result={results[q.question_id]}
              answers={submission.answers}
              index={i}
            />
          ))}
        </AnimatePresence>
      </section>

      <style>{`
                .prose-content h1 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content h2 { font-size: 1.125rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content h3 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content p  { font-size: 0.875rem; line-height: 1.625; margin: 0.5rem 0; color: var(--muted-foreground); }
                .prose-content ul { list-style: none; padding-left: 0; margin: 0.5rem 0; }
                .prose-content ul > li { position: relative; padding-left: 1.5rem; font-size: 0.875rem; line-height: 1.625; }
                .prose-content ul > li::before { content: ''; position: absolute; left: 0; top: 0.6em; width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.45; }
                .prose-content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
                .prose-content li { font-size: 0.875rem; line-height: 1.625; }
                .prose-content a  { color: #10b981; text-decoration: underline; text-underline-offset: 2px; }
                .prose-content a:hover { opacity: 0.8; }
                .prose-content pre {
                    background: color-mix(in srgb, var(--secondary) 80%, transparent);
                    border: 1px solid var(--border);
                    border-radius: 1rem;
                    padding: 1.25rem;
                    margin: 0.75rem 0;
                    overflow-x: auto;
                }
                .prose-content code {
                    font-family: ui-monospace, monospace;
                    font-size: 0.75rem;
                    line-height: 1.625;
                    color: var(--foreground);
                }
                .prose-content pre code {
                    color: var(--foreground);
                }
                .prose-content hr {
                    border: none;
                    border-top: 2px solid;
                    border-color: var(--border);
                    opacity: 0.5;
                    margin: 1rem 0;
                }
                .prose-content blockquote {
                    border-left: 3px solid #10b981;
                    padding-left: 1rem;
                    margin: 0.75rem 0;
                    color: var(--muted-foreground);
                    font-style: italic;
                }
                .prose-content img { max-width: 100%; border-radius: 0.75rem; margin: 0.75rem 0; }
            `}</style>
    </div>
  );
}
