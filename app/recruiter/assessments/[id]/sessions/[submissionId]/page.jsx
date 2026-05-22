"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/utils/api";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineUserCircle,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMinusCircle,
  HiOutlineDocumentText,
  HiOutlineCommandLine,
  HiOutlineListBullet,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineCodeBracket,
  HiOutlineAcademicCap,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineCalendarDays,
  HiOutlineHashtag,
  HiOutlineBeaker,
  HiOutlineChartBar,
  HiOutlineChevronDown,
  HiOutlineInformationCircle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronLeft,
} from "react-icons/hi2";
import BarChart from "@/components/display/BarChart";
import DashboardBanner, { BannerBlock } from "@/components/dashboard/DashboardBanner";
import PageSkeleton from "@/components/dashboard/PageSkeleton";
import AssessmentNotice from "@/components/assessments/AssessmentNotice";
import { formatDate, hasScore, sanitizeHtml, scoreTone } from "@/components/assessments/SubmissionHelpers";
import {
  SectionTitle,
  StatCard,
  StatusBadge,
  QuestionStatusBadge,
  TypeBadge,
  ScoreRing,
  Alert,
  EmptyState,
  card,
  btnSecondary,
  focusRing,
} from "@/components/assessments/SubmissionUi";

const TYPE_ICON = {
  coding: HiOutlineCommandLine,
  mcq: HiOutlineListBullet,
  subjective: HiOutlineChatBubbleBottomCenterText,
};

const sectionLabel = "flex items-center gap-2 text-xs font-medium text-emerald-800/70 dark:text-slate-400";
const codeLabel = "font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-800/70 dark:text-slate-400";

function TestCaseResult({ tc, index }) {
  const [showHidden, setShowHidden] = useState(false);
  const isHidden = Boolean(tc?.isHidden);
  const passed = Boolean(tc?.passed);

  if (isHidden && !showHidden) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-semibold text-emerald-900/80 dark:bg-white/10 dark:text-slate-300" aria-hidden="true">
          #
        </span>
        <span className="flex-1 text-sm font-medium text-emerald-900 dark:text-foreground">Hidden test case {index + 1}</span>
        <button
          type="button"
          onClick={() => setShowHidden(true)}
          aria-label={`Reveal hidden test case ${index + 1}`}
          className={`${btnSecondary} min-h-11 px-3 text-xs`}
        >
          <HiOutlineEye className="h-4 w-4" aria-hidden="true" /> Reveal
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-3.5 ${passed ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5" : "border-red-200 bg-red-50/60 dark:border-red-500/20 dark:bg-red-500/5"}`}>
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {passed ? (
            <HiOutlineCheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <HiOutlineXCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
          )}
          <span className="text-sm font-semibold text-emerald-950 dark:text-foreground">
            {isHidden ? "Hidden test" : "Test"} case {index + 1}
          </span>
          <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${passed ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"}`}>
            {passed ? "Passed" : "Failed"}
          </span>
          {isHidden && (
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-900/80 dark:bg-white/10 dark:text-slate-300">Hidden</span>
          )}
        </div>
        {tc?.executionTime != null && tc.executionTime !== "" && (
          <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-800/70 dark:text-slate-400" title="Execution time">
            <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" /> {tc.executionTime}s
          </span>
        )}
      </div>
      <dl className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-100 bg-white p-2.5 dark:border-white/10 dark:bg-white/5">
          <dt className={codeLabel}>Input</dt>
          <dd className="mt-0.5 break-all whitespace-pre-wrap text-emerald-900 dark:text-foreground">{tc?.input || "(empty)"}</dd>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-white p-2.5 dark:border-white/10 dark:bg-white/5">
          <dt className={codeLabel}>Expected</dt>
          <dd className="mt-0.5 break-all whitespace-pre-wrap text-emerald-900 dark:text-foreground">{tc?.expectedOutput || "(empty)"}</dd>
        </div>
        {!passed && (
          <div className="rounded-lg border border-emerald-100 bg-white p-2.5 sm:col-span-2 dark:border-white/10 dark:bg-white/5">
            <dt className={codeLabel}>Actual output</dt>
            <dd className="mt-0.5 break-all whitespace-pre-wrap text-red-700 dark:text-red-400">{tc?.actualOutput || "(no output)"}</dd>
          </div>
        )}
      </dl>
      {tc?.error && (
        <div role="note" className="mt-2.5 rounded-lg border border-red-200 bg-red-50 p-2.5 font-mono text-xs whitespace-pre-wrap text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {tc.error}
        </div>
      )}
    </div>
  );
}

function QuestionDetailCard({ question, result, answers, index }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = `question-panel-${index}`;
  const answer = answers?.[question?.question_id];
  const status = result?.status;
  const isPassed = status === "passed";
  const isPartial = status === "partial";
  const isFailed = status === "failed";
  const TypeIcon = TYPE_ICON[question?.type] || HiOutlineBeaker;

  return (
    <div className={`${card} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className={`flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-emerald-50/60 sm:p-5 dark:hover:bg-white/5 ${focusRing}`}
      >
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold ${
            isPassed
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
              : isPartial
                ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                : isFailed
                  ? "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                  : "bg-emerald-50 text-emerald-900 dark:bg-white/10 dark:text-foreground"
          }`}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="max-w-full truncate text-sm font-semibold text-emerald-950 md:max-w-[420px] dark:text-foreground">
              {question?.title || "Untitled question"}
            </span>
            <TypeBadge type={question?.type} icon={TypeIcon} />
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-800/70 dark:text-slate-400">
            <span>
              <span className="font-semibold text-emerald-950 dark:text-foreground">{result?.score ?? 0}</span> /{" "}
              {result?.max_score ?? question?.marks ?? 10} marks
            </span>
            {result?.passed_count !== undefined && (
              <span>
                {result.passed_count}/{result.total_count ?? 0} tests passed
              </span>
            )}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <QuestionStatusBadge status={status} />
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-800/70 dark:text-slate-400"
            aria-hidden="true"
          >
            <HiOutlineChevronDown className="h-5 w-5" />
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-emerald-100 px-4 pb-5 pt-4 sm:px-5 dark:border-white/10">
              {question?.description && (
                <div
                  className="prose-content rounded-xl bg-emerald-50/60 p-4 text-sm leading-relaxed text-emerald-900/80 dark:bg-white/5 dark:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.description) }}
                />
              )}

              {question?.type === "coding" && (
                <div className="space-y-4">
                  {Array.isArray(result?.test_results) && result.test_results.length > 0 && (
                    <div className="space-y-2.5">
                      <p className={sectionLabel}>
                        <HiOutlineCodeBracket className="h-4 w-4" aria-hidden="true" />
                        Test results ({result.passed_count ?? 0}/{result.total_count ?? result.test_results.length})
                      </p>
                      {result.test_results.map((tc, i) => (
                        <TestCaseResult key={i} tc={tc} index={i} />
                      ))}
                    </div>
                  )}

                  {answer?.code ? (
                    <div className="space-y-2.5">
                      <p className={sectionLabel}>
                        <HiOutlineCodeBracket className="h-4 w-4" aria-hidden="true" />
                        Candidate code{answer.language_id ? ` · language ID ${answer.language_id}` : ""}
                      </p>
                      <div className="overflow-x-auto rounded-xl bg-emerald-950 p-4 dark:bg-[#0d1117]">
                        <pre className="font-mono text-xs leading-relaxed whitespace-pre text-emerald-50">{answer.code}</pre>
                      </div>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 rounded-xl bg-emerald-50/60 p-4 text-sm italic text-emerald-800/70 dark:bg-white/5 dark:text-slate-400">
                      <HiOutlineInformationCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> No code submitted
                    </p>
                  )}
                </div>
              )}

              {question?.type === "mcq" && (
                <div className="space-y-2">
                  <p className={sectionLabel}>
                    <HiOutlineListBullet className="h-4 w-4" aria-hidden="true" />
                    Answer review
                  </p>
                  {(question.mcq_details?.options || []).map((opt, i) => {
                    const selected = result?.selected_options?.includes(i);
                    const correct = result?.correct_options?.includes(i);
                    const isWrongSelection = selected && !correct;
                    const isMissedCorrect = !selected && correct;
                    const label = isWrongSelection
                      ? "Wrong choice"
                      : isMissedCorrect
                        ? "Correct answer, not selected"
                        : correct
                          ? "Correct"
                          : selected
                            ? "Selected"
                            : "Not selected";

                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                          isWrongSelection
                            ? "border-red-200 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-300"
                            : isMissedCorrect
                              ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300"
                              : correct
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300"
                                : "border-emerald-100 bg-white text-emerald-900/80 dark:border-white/10 dark:bg-card dark:text-slate-400"
                        }`}
                      >
                        {selected ? (
                          <HiOutlineCheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                        ) : (
                          <HiOutlineMinusCircle className="h-5 w-5 shrink-0 opacity-60" aria-hidden="true" />
                        )}
                        <span className="min-w-0 flex-1">{opt?.text}</span>
                        <span className="shrink-0 text-xs font-medium">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {question?.type === "subjective" && (
                <div className="space-y-3">
                  <p className={sectionLabel}>
                    <HiOutlineChatBubbleBottomCenterText className="h-4 w-4" aria-hidden="true" />
                    Candidate response
                  </p>
                  {answer?.textualAnswer ? (
                    <div className="rounded-xl bg-emerald-50/60 p-4 text-sm leading-relaxed whitespace-pre-wrap text-emerald-900 dark:bg-white/5 dark:text-foreground">
                      {answer.textualAnswer}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 rounded-xl bg-emerald-50/60 p-4 text-sm italic text-emerald-800/70 dark:bg-white/5 dark:text-slate-400">
                      <HiOutlineInformationCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> No answer provided
                    </p>
                  )}
                  {result?.note && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
                      <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {result.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SubmissionDetailPage() {
  const { id, submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!submissionId) return;
    let active = true;

    api
      .get(`/assessments/submissions/${submissionId}/`)
      .then((data) => {
        if (!active) return;
        setSubmission(data);
        setError("");
      })
      .catch(() => {
        if (active) setError("We could not load this candidate's session. Check your connection and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [submissionId, attempt]);

  const retry = () => {
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  const questions = useMemo(() => submission?.questions_data || [], [submission]);
  const results = useMemo(() => submission?.question_results || {}, [submission]);

  const barChartData = useMemo(() => questions.map((q, i) => {
    const r = results[q?.question_id];
    return {
      label: `Q${i + 1}`,
      applicants: r?.score ?? 0,
      assessments: r?.max_score ?? q?.marks ?? 10,
      interviews: 0,
    };
  }), [questions, results]);

  const submittedLabel = formatDate(submission?.submitted_at, {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  // One banner for every state, so the header stays put while data loads or fails.
  const banner = (
    <DashboardBanner
      loading={loading}
      icon={HiOutlineUserCircle}
      title={loading ? "Loading session" : submission ? (submission.candidate_name || "Unknown candidate") : "Session unavailable"}
      subtitle={submission ? (submission.candidate_email || "No email on file") : undefined}
      footer={submission && !loading ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-emerald-800/70 dark:text-slate-400">
          <StatusBadge status={submission.status} />
          {submission.assessment_title && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <HiOutlineBeaker className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{submission.assessment_title}</span>
            </span>
          )}
          {submission.job_title && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{submission.job_title}</span>
            </span>
          )}
          {submittedLabel && (
            <span className="inline-flex items-center gap-1">
              <HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Submitted {submittedLabel}
            </span>
          )}
        </div>
      ) : undefined}
      aside={loading ? (
        <div className="flex gap-2"><BannerBlock className="h-11 w-44 rounded-xl" /></div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <Link href={`/recruiter/assessments/${id}/sessions`} className={btnSecondary}>
            <HiOutlineChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to sessions
          </Link>
          {submission && <ScoreRing percentage={submission.percentage} size={80} strokeWidth={6} caption="Score" />}
        </div>
      )}
    />
  );

  if (loading || !submission) {
    return (
      <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
        {banner}
        {loading
          ? <PageSkeleton stats={4} cards={2} banner={false} />
          : <AssessmentNotice title="Could not load this session" message={error || "Something went wrong. Try again."} onRetry={retry} />}
      </div>
    );
  }

  const scored = hasScore(submission.percentage);
  const passMark = submission.assessment_pass ?? 70;
  const passed = scored && submission.percentage >= passMark;
  const tone = scoreTone(submission.percentage);
  const passedCount = Object.values(results).filter((r) => r?.status === "passed").length;

  const stats = [
    {
      label: "Total score",
      value: submission.total_score ?? 0,
      sub: `of ${submission.max_score ?? 0} points`,
      subClass: "text-emerald-800/70 dark:text-slate-400",
      icon: HiOutlineAcademicCap,
      valueClass: "text-emerald-950 dark:text-foreground",
    },
    {
      label: "Percentage",
      value: scored ? `${Math.round(submission.percentage)}%` : "—",
      sub: !scored ? (
        <span className="inline-flex items-center gap-1"><HiOutlineMinusCircle className="h-3.5 w-3.5" aria-hidden="true" /> Not scored yet</span>
      ) : passed ? (
        <span className="inline-flex items-center gap-1"><HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> Passed, pass mark {passMark}%</span>
      ) : (
        <span className="inline-flex items-center gap-1"><HiOutlineXCircle className="h-3.5 w-3.5" aria-hidden="true" /> Below pass mark {passMark}%</span>
      ),
      subClass: !scored ? "text-emerald-800/70 dark:text-slate-400" : passed ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
      icon: HiOutlineHashtag,
      iconText: tone.text,
      valueClass: tone.text,
    },
    {
      label: "Time taken",
      value: submission.time_taken_minutes != null ? `${submission.time_taken_minutes} min` : "—",
      sub: submission.assessment_duration ? `of ${submission.assessment_duration} min allowed` : undefined,
      subClass: "text-emerald-800/70 dark:text-slate-400",
      icon: HiOutlineClock,
      valueClass: "text-emerald-950 dark:text-foreground",
    },
    {
      label: "Questions",
      value: questions.length,
      sub: `${passedCount} passed`,
      subClass: "text-emerald-800/70 dark:text-slate-400",
      icon: HiOutlineBeaker,
      valueClass: "text-emerald-950 dark:text-foreground",
    },
  ];

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      {banner}

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 0.05} />
          ))}
        </div>

        {barChartData.length > 0 && (
          <section aria-labelledby="chart-heading" className={`${card} p-5 lg:p-6`}>
            <div id="chart-heading">
              <SectionTitle icon={HiOutlineChartBar} title="Per-question scores" hint="Points earned against the maximum for each question" />
            </div>
            <div className="mt-4 h-64 md:h-72">
              <BarChart data={barChartData} />
            </div>
            <ul className="mt-3 flex items-center justify-center gap-6 text-xs font-medium text-emerald-900/80 dark:text-slate-300">
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#10b981]" aria-hidden="true" /> Earned
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#6ee7b7]" aria-hidden="true" /> Max
              </li>
            </ul>
          </section>
        )}
      </div>

      <section aria-labelledby="breakdown-heading" className="space-y-4">
        <div id="breakdown-heading">
          <SectionTitle icon={HiOutlineDocumentText} title="Question breakdown" count={questions.length} hint="Open a question to see the answer and test results" />
        </div>

        {questions.length === 0 ? (
          <EmptyState
            icon={HiOutlineInformationCircle}
            title="No questions found"
            text="This assessment has no questions yet. Add them in the assessment editor."
            action={(
              <Link href={`/recruiter/assessments/${id}`} className={btnSecondary}>
                Open assessment editor
              </Link>
            )}
          />
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionDetailCard
                key={q?.question_id || `q-${i}`}
                question={q}
                result={results[q?.question_id]}
                answers={submission.answers}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      <style>{`
        .prose-content h1 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
        .prose-content h2 { font-size: 1.125rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
        .prose-content h3 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
        .prose-content p  { font-size: 0.875rem; line-height: 1.625; margin: 0.5rem 0; }
        .prose-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .prose-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .prose-content li { font-size: 0.875rem; line-height: 1.625; }
        .prose-content a  { color: #059669; text-decoration: underline; text-underline-offset: 2px; }
        .prose-content pre {
          background: color-mix(in srgb, var(--secondary) 80%, transparent);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1rem;
          margin: 0.75rem 0;
          overflow-x: auto;
        }
        .prose-content code { font-family: ui-monospace, monospace; font-size: 0.75rem; }
        .prose-content blockquote { border-left: 3px solid #10b981; padding-left: 1rem; margin: 0.75rem 0; font-style: italic; }
        .prose-content img { max-width: 100%; border-radius: 0.75rem; margin: 0.75rem 0; }
      `}</style>
    </div>
  );
}
