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
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineCalendarDays,
  HiOutlineHashtag,
  HiOutlineBeaker,
  HiOutlineChartBar,
} from "react-icons/hi2";
import BarChart from "@/components/display/BarChart";

const STATUS_META = {
  pending: {
    icon: HiOutlineMinusCircle,
    label: "Pending",
    className: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  in_progress: {
    icon: HiOutlinePlayCircle,
    label: "In Progress",
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

function TypeIcon({ type }) {
  switch (type) {
    case "coding":
      return <HiOutlineCommandLine className="w-4 h-4" />;
    case "mcq":
      return <HiOutlineListBullet className="w-4 h-4" />;
    case "subjective":
      return <HiOutlineChatBubbleBottomCenterText className="w-4 h-4" />;
    default:
      return <HiOutlineBeaker className="w-4 h-4" />;
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${m.className}`}
    >
      <TypeIcon type={type} /> {m.label}
    </span>
  );
}

function ScoreRingBig({ percentage, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circ = radius * 2 * Math.PI;
  const offset = percentage !== null ? circ - (percentage / 100) * circ : circ;
  const color =
    percentage >= 80 ? "#10b981" : percentage >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {percentage !== null && (
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
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-lg font-black" style={{ color }}>
          {percentage !== null ? `${Math.round(percentage)}%` : "—"}
        </span>
        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
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
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          #
        </div>
        <span className="flex-1 text-xs font-bold text-muted-foreground">
          Hidden Test Case {index + 1}
        </span>
        <button
          onClick={() => setShowHidden(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-emerald-500 transition-all"
        >
          <HiOutlineEye className="w-3 h-3" /> Reveal
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
          >
            {passed ? (
              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
            ) : (
              <HiOutlineXCircle className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="text-xs font-bold">
            {isHidden ? "Hidden Test" : "Test"} Case {index + 1}
          </span>
          {isHidden && (
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded">
              Hidden
            </span>
          )}
        </div>
        {tc.executionTime && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {tc.executionTime}s
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 rounded-lg bg-background/50 border border-border/50">
          <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
            Input
          </div>
          <div className="text-muted-foreground truncate">
            {tc.input || "(empty)"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-background/50 border border-border/50">
          <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
            Expected
          </div>
          <div className="text-muted-foreground truncate">
            {tc.expectedOutput || "(empty)"}
          </div>
        </div>
        {!passed && (
          <div className="col-span-2 p-2 rounded-lg bg-background/50 border border-border/50">
            <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
              Actual Output
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
        onClick={() => setExpanded((e) => !e)}
        className="w-full p-4 md:p-5 flex items-center gap-4 text-left transition-colors hover:bg-secondary/20"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${
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
            <h4 className="font-bold text-sm truncate max-w-[250px] md:max-w-[400px]">
              {question.title}
            </h4>
            <TypeBadge type={question.type} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              <span className="font-bold">{result?.score ?? 0}</span> /{" "}
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
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${qStatus.className}`}
          >
            <StatusIcon className="w-3 h-3" /> {result?.status || "no_answer"}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
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
                        <HiOutlineCodeBracket className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Test Results ({result.passed_count}/
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
                        <HiOutlineCodeBracket className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Candidate Code (
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
                    <HiOutlineListBullet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Answer Review
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
                            <HiOutlineCheckCircle className="w-3 h-3" />
                          )}
                          {!selected && correct && (
                            <HiOutlineXCircle className="w-3 h-3" />
                          )}
                        </div>
                        <span className="flex-1">{opt.text}</span>
                        {correct && (
                          <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
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
                    <HiOutlineChatBubbleBottomCenterText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Candidate Response
                    </span>
                  </div>
                  {answer?.textualAnswer ? (
                    <div className="bg-secondary/30 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {answer.textualAnswer}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground/50 italic bg-secondary/30 rounded-xl p-4">
                      No answer provided
                    </div>
                  )}
                  {result?.note && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400">
                      <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" />
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

  useEffect(() => {
    if (!submissionId) return;
    api
      .get(`/assessments/submissions/${submissionId}/`)
      .then(setSubmission)
      .catch(() => setError("Failed to load submission details"))
      .finally(() => setLoading(false));
  }, [submissionId]);

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

  const StatusIcon =
    STATUS_META[submission?.status]?.icon || HiOutlineMinusCircle;
  const statusClass =
    STATUS_META[submission?.status]?.className ||
    "text-muted-foreground bg-secondary/50 border-border";

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500" />
          <HiOutlineAcademicCap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="w-full px-4 md:px-6 pt-10">
        <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold flex items-center gap-3">
          <HiOutlineExclamationTriangle className="w-6 h-6" /> {error}
        </div>
      </div>
    );

  if (!submission) return null;

  const stats = [
    {
      label: "Total Score",
      value: `${submission.total_score ?? 0}`,
      sub: `/ ${submission.max_score ?? 0}`,
      icon: HiOutlineAcademicCap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Percentage",
      value: `${submission.percentage != null ? Math.round(submission.percentage) : 0}%`,
      sub:
        submission.percentage >= (submission.assessment_pass || 70)
          ? "Passed"
          : "Failed",
      subColor:
        submission.percentage >= (submission.assessment_pass || 70)
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
    },
    {
      label: "Time Taken",
      value: submission.time_taken ? `${submission.time_taken_minutes}m` : "—",
      sub: submission.assessment_duration
        ? `of ${submission.assessment_duration}m`
        : "",
      icon: HiOutlineClock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Questions",
      value: questions.length,
      sub: `${Object.keys(results).filter((k) => results[k]?.status === "passed").length} passed`,
      icon: HiOutlineBeaker,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="w-full px-4 md:px-6 space-y-8 pb-16 pt-10">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push(`/recruiter/assessments/${id}/sessions`)}
            className="p-3 rounded-xl bg-secondary border border-border transition-all hover:bg-emerald-500/10 hover:text-emerald-500 group shrink-0 mt-1"
          >
            <HiOutlineChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-600/20">
                {getCandidateInitial(
                  submission.candidate_name,
                  submission.candidate_email,
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {submission.candidate_name || "Unknown Candidate"}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <HiOutlineEnvelope className="w-3.5 h-3.5" />{" "}
                    {submission.candidate_email}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${statusClass}`}
                  >
                    <StatusIcon className="w-3 h-3" />{" "}
                    {STATUS_META[submission.status]?.label || submission.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              {submission.assessment_title && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineBeaker className="w-3.5 h-3.5" />{" "}
                  {submission.assessment_title}
                </span>
              )}
              {submission.job_title && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />{" "}
                  {submission.job_title}
                </span>
              )}
              {submission.submitted_at && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineCalendarDays className="w-3.5 h-3.5" />
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

      <div className="grid lg:gap-3 lg:grid-cols-2">
        {/* ── Stats Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative overflow-hidden bg-card border border-border rounded-xl p-4 group"
            >
              <div
                className={`absolute top-0 right-0 w-20 h-20 -translate-y-6 translate-x-6 rounded-full ${stat.bg} opacity-30 group-hover:opacity-50 transition-opacity`}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <motion.span
                  key={stat.value}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-2xl lg:text-[45px] font-bold ${stat.color}`}
                >
                  {stat.value}
                </motion.span>
                {stat.sub && (
                  <p
                    className={`text-[10px] font-bold mt-5 ${stat.subColor || "text-muted-foreground/60"}`}
                  >
                    {stat.sub}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Score Chart ────────────────────────────────────────── */}
        {barChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-4  "
          >
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineChartBar className="w-4 h-4 text-emerald-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Per-Question Score Breakdown
              </h3>
            </div>
            <div className="h-64 md:h-72">
              <BarChart data={barChartData} />
            </div>
            <div className="flex items-center justify-center gap-6 mt-3 text-[10px] font-bold uppercase tracking-widest">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#10b981]" /> Earned
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#6ee7b7]" /> Max
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Per-Question Breakdown ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HiOutlineDocumentText className="w-4 h-4 text-emerald-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Question Breakdown
          </h3>
        </div>

        <AnimatePresence>
          {questions.length === 0 && (
            <div className="py-16 text-center bg-card border border-dashed border-border rounded-2xl">
              <HiOutlineBeaker className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <h3 className="text-base font-bold text-muted-foreground/60">
                No Questions Found
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                This assessment has no questions configured
              </p>
            </div>
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
      </div>

      <style>{`
                .prose-content h1 { font-size: 1.25rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content h2 { font-size: 1.125rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
                .prose-content h3 { font-size: 1rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
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
