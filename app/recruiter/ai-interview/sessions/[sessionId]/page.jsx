'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { base, fadeUp, stagger } from '@/constants/motion';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AIInterviewSessionSkeleton from '@/components/skeletons/recruiter/AIInterviewSessionSkeleton';
import {
  HiOutlineArrowPath, HiOutlineBars3BottomLeft, HiOutlineCheckCircle, HiOutlineChartBar,
  HiOutlineClipboardDocumentList, HiOutlineClock, HiOutlineCog6Tooth, HiOutlineDocumentText,
  HiOutlineExclamationTriangle, HiOutlineIdentification, HiOutlineLightBulb, HiOutlineShieldExclamation,
  HiOutlineSparkles, HiOutlineStar, HiOutlineTrophy, HiOutlineXCircle, HiOutlineQuestionMarkCircle,
  HiOutlineUserGroup, HiOutlineUser, HiOutlineEnvelope, HiOutlineBriefcase, HiOutlineHashtag, HiOutlineSignal, HiOutlineBookOpen,
} from 'react-icons/hi2';
import {
  Card, EmptyState, ErrorState, IconTile, NotFoundLink, Pill, SectionTitle,
  StatTile, StatusBadge, btnDanger, btnPrimary, btnSecondary, hintClass, inputClass, labelClass,
  isTerminatedSession,
} from '@/components/ai-interview/recruiter/AIInterviewDetailUi';
import { CriteriaChart } from '@/components/ai-interview/recruiter/AIInterviewDetailCharts';
import TranscriptPanel from '@/components/ai-interview/recruiter/AIInterviewDetailTranscript';
import ProctorPanel from '@/components/ai-interview/recruiter/ProctorPanel';

const ROOT = 'w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10';
const DEFAULT_PASSING_SCORE = 65;

function BulletList({ items, empty, icon: Icon, tone }) {
  if (!items.length) {
    return <p className="text-sm italic text-emerald-800/70 dark:text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className="flex items-start gap-3 text-sm text-emerald-900 dark:text-foreground">
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} aria-hidden="true" />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SessionDetail() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [deciding, setDeciding] = useState(false);
  const [decision, setDecision] = useState(null);
  const [decisionMsg, setDecisionMsg] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [rejectOthers, setRejectOthers] = useState(false);
  const [pendingDecision, setPendingDecision] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.get(`/ai-interviews/session/${sessionId}/`);
        if (cancelled) return;
        setSession(data);
        setLoadError('');
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setLoadError('We could not load this candidate report. Check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError('');
    setAttempt((n) => n + 1);
  };

  // Opens the confirm dialog; runDecision is called once the user confirms.
  const handleDecision = (action) => {
    if (!deciding) setPendingDecision(action);
  };

  const runDecision = async (action) => {
    if (deciding) return;
    const advancing = action === 'select';
    setDeciding(true);
    setDecisionError('');
    try {
      await api.post(`/ai-interviews/sessions/${sessionId}/decide/`, {
        action,
        notes: decisionMsg || null,
        reject_others: advancing ? rejectOthers : false,
      });
      setDecision(action);
    } catch (e) {
      setDecisionError(e?.message || `Could not ${advancing ? 'advance' : 'reject'} this candidate. Try again.`);
    } finally {
      setDeciding(false);
    }
  };

  const terminated = session ? isTerminatedSession(session) : false;
  const title = session ? session.candidate_email || session.candidate_name || 'Candidate report' : 'Candidate report';

  const interviewId = session?.interview_details?.interview_id ?? session?.interview;
  // Never history-back: a report opened directly would leave the app.
  const backHref = interviewId ? `/recruiter/ai-interview/${interviewId}/sessions` : '/recruiter/ai-interview';

  const banner = (
    <PageHeader
      back={{ href: backHref, label: interviewId ? 'Back to candidates' : 'Back to AI interviews' }}
      icon={HiOutlineIdentification}
      eyebrow="Candidate report"
      title={title}
      description={session?.job_title ? `Interview report for ${session.job_title}` : 'Candidate interview report'}
      meta={
        session ? (
          <>
            <StatusBadge status={session.status} />
            {terminated && <Pill tone="red" icon={HiOutlineShieldExclamation}>Guardrail flagged</Pill>}
          </>
        ) : null
      }
    />
  );

  if (loading) return <AIInterviewSessionSkeleton />;

  if (!session) {
    return (
      <div className={ROOT}>
        {banner}
        {loadError ? (
          <ErrorState title="Could not load the report" message={loadError} onRetry={retry} />
        ) : (
          <EmptyState
            icon={HiOutlineDocumentText}
            title="Session not found"
            text="This candidate report may have been removed. Go back to the candidates list."
            action={<NotFoundLink href="/recruiter/ai-interview" label="Back to AI interviews" />}
          />
        )}
      </div>
    );
  }

  const isCompleted = session.status === 'completed' || session.status === 'evaluated';
  const conversationHistory = Array.isArray(session.conversation_history) ? session.conversation_history : [];
  const userMessageCount = conversationHistory.filter((m) => m?.role === 'user').length;
  const criteriaScores = session.detailed_criteria_scores || {};
  const candidateReport = session.candidate_report;
  const criteriaReports = Array.isArray(candidateReport?.criteria_reports) ? candidateReport.criteria_reports : [];
  const summaryBlocks = Array.isArray(session.summary_blocks) ? session.summary_blocks : [];
  const strengths = Array.isArray(session.strengths) ? session.strengths : [];
  const weaknesses = Array.isArray(session.weaknesses) ? session.weaknesses : [];
  const passingScore = session.interview_config?.passing_score ?? DEFAULT_PASSING_SCORE;
  const score = session.overall_score ?? session.score ?? null;
  const passed = !terminated && score != null && score >= passingScore;

  const decisionBlock = decision ? (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch">
      <div className="flex items-start gap-3">
        <IconTile icon={HiOutlineCheckCircle} tone="emerald" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-950 dark:text-foreground">
            Candidate {decision === 'select' ? 'advanced' : 'rejected'}
          </p>
          <p className={hintClass}>Your decision is saved. You can keep reviewing this report.</p>
        </div>
      </div>
      <button type="button" onClick={() => router.push(backHref)} className={`${btnSecondary} w-fit lg:w-full`}>
        Back to candidates
      </button>
    </Card>
  ) : null;

  const infoRows = [
    { label: 'Name', value: session.candidate_name, icon: HiOutlineUser },
    { label: 'Email', value: session.candidate_email, icon: HiOutlineEnvelope },
    { label: 'Job', value: session.job_title, icon: HiOutlineBriefcase },
    { label: 'Session', value: sessionId, icon: HiOutlineHashtag },
  ].filter((row) => row.value != null && row.value !== '');

  return (
    <div className={ROOT}>
      {banner}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        {/* Summary column: first on mobile, top of the right column on desktop. */}
        <div className="min-w-0 space-y-6 lg:col-span-4 lg:col-start-9 lg:row-start-1 2xl:col-span-3 2xl:col-start-10">
          {!terminated && (
            <Card className="flex flex-col items-center justify-center gap-2 text-center">
              <IconTile
                icon={passed ? HiOutlineCheckCircle : HiOutlineXCircle}
                tone={passed ? 'emerald' : 'red'}
                size="lg"
              />
              <p className="font-mono text-4xl font-semibold tabular-nums text-emerald-950 dark:text-foreground">
                {score ?? '—'}
                <span className="text-lg font-normal text-emerald-800/70 dark:text-muted-foreground">/100</span>
              </p>
              {score != null ? (
                <Pill tone={passed ? 'emerald' : 'red'} icon={passed ? HiOutlineCheckCircle : HiOutlineXCircle}>
                  {passed ? 'Passed' : 'Failed'}
                </Pill>
              ) : (
                <Pill tone="neutral" icon={HiOutlineClock}>Not scored yet</Pill>
              )}
              <p className={`${hintClass} tabular-nums`}>Passing score: {passingScore}%</p>
            </Card>
          )}

          <Card>
            <SectionTitle icon={HiOutlineIdentification} title="Candidate" description="Who took this interview" />
            <dl className="divide-y divide-emerald-100 border-y border-emerald-100 text-sm dark:divide-white/10 dark:border-white/10">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                    <row.icon className="h-4 w-4" aria-hidden="true" /> {row.label}
                  </dt>
                  <dd title={String(row.value)} className="min-w-0 truncate font-semibold text-emerald-950 dark:text-foreground">{row.value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <HiOutlineSignal className="h-4 w-4" aria-hidden="true" /> Status
                </dt>
                <dd className="min-w-0"><StatusBadge status={session.status} /></dd>
              </div>
            </dl>
          </Card>

          <ProctorPanel key={sessionId} sessionId={sessionId} />
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-8 lg:col-start-1 lg:row-span-2 lg:row-start-1 2xl:col-span-9">
          {(session.question_count != null || session.duration_taken_minutes != null || session.interview_config?.passing_score != null) && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                { icon: HiOutlineQuestionMarkCircle, label: 'Questions asked', value: session.question_count, hint: 'Questions asked in this session' },
                { icon: HiOutlineClock, label: 'Time taken', value: session.duration_taken_minutes != null ? `${session.duration_taken_minutes} min` : null, hint: 'Time taken for this session' },
                { icon: HiOutlineUserGroup, label: 'Passing score', value: `${passingScore}%`, hint: 'Score needed to pass' },
              ].map((tile, i) => (
                <motion.div key={tile.label} {...fadeUp} transition={{ ...base, delay: Math.min(i, 8) * stagger }} className="min-w-0">
                  <StatTile icon={tile.icon} label={tile.label} hint={tile.hint} value={<span className="tabular-nums">{tile.value ?? '—'}</span>} />
                </motion.div>
              ))}
            </div>
          )}

          {terminated ? (
            <Card className="border-red-200 bg-red-50/60 dark:border-red-500/25 dark:bg-red-500/5">
              <div className="flex items-start gap-4">
                <IconTile icon={HiOutlineShieldExclamation} tone="red" size="lg" />
                <div className="min-w-0 space-y-2">
                  <h2 className="text-base font-semibold text-red-800 dark:text-red-300">Interview terminated by a guardrail</h2>
                  <p className="break-words text-sm text-emerald-900 dark:text-foreground">
                    {session.guardrail_reason || 'A policy violation was detected during the interview.'}
                  </p>
                  <p className={hintClass}>No evaluation was performed. The interview ended when the guardrail fired.</p>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card className="min-w-0">
                <SectionTitle
                  icon={HiOutlineChartBar}
                  title="Criteria breakdown"
                  description={`Each bar is one criterion, out of 100. Dashed line marks the ${passingScore} pass mark.`}
                />
                {Object.keys(criteriaScores).length ? (
                  <div className="overflow-x-auto">
                    <CriteriaChart criteriaScores={criteriaScores} passingScore={passingScore} />
                  </div>
                ) : (
                  <EmptyState icon={HiOutlineChartBar} title="No criteria scores yet" text="Criteria scores appear once the interview has been evaluated." />
                )}
              </Card>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <SectionTitle icon={HiOutlineStar} title="Key strengths" description="What the candidate did well" />
                  <BulletList items={strengths} empty="No strengths recorded." icon={HiOutlineCheckCircle} tone="text-emerald-600 dark:text-emerald-400" />
                </Card>
                <Card>
                  <SectionTitle icon={HiOutlineExclamationTriangle} tone="red" title="Areas to improve" description="Gaps the evaluator noticed" />
                  <BulletList items={weaknesses} empty="No weaknesses recorded." icon={HiOutlineXCircle} tone="text-red-600 dark:text-red-400" />
                </Card>
              </div>

              {session.overall_feedback && (
                <Card>
                  <SectionTitle icon={HiOutlineBars3BottomLeft} title="Overall assessment" description="The evaluator's summary" />
                  <p className="break-words text-sm leading-relaxed text-emerald-900 dark:text-foreground">{session.overall_feedback}</p>
                </Card>
              )}

              {criteriaReports.length > 0 && (
                <section aria-labelledby="improvement-heading" className="space-y-4">
                  <SectionTitle
                    icon={HiOutlineSparkles}
                    tone="violet"
                    title="Improvement report"
                    description="What went well, what to work on, and where to learn more."
                    headingLevel="h2"
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {criteriaReports.map((cr, i) => {
                      const crScore = Number(cr?.score);
                      const crPassed = Number.isFinite(crScore) && crScore >= passingScore;
                      const resources = Array.isArray(cr?.resources) ? cr.resources : [];
                      return (
                        <motion.div key={`${cr?.criterion ?? 'criterion'}-${i}`} {...fadeUp} transition={{ ...base, delay: Math.min(i, 8) * stagger }} className="min-w-0">
                        <Card className="h-full space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="min-w-0 break-words text-sm font-semibold capitalize text-emerald-950 dark:text-foreground">
                              {cr?.criterion?.replace(/_/g, ' ') || 'Criterion'}
                            </h3>
                            {Number.isFinite(crScore) && (
                              <Pill tone={crPassed ? 'emerald' : 'red'} icon={crPassed ? HiOutlineCheckCircle : HiOutlineXCircle} className="tabular-nums">
                                {crScore}/100
                              </Pill>
                            )}
                          </div>
                          {cr?.feedback && <p className="text-sm leading-relaxed text-emerald-900/80 dark:text-foreground">{cr.feedback}</p>}
                          {cr?.how_to_improve && (
                            <div className="space-y-2 border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <HiOutlineLightBulb className="h-4 w-4" aria-hidden="true" /> How to improve
                              </span>
                              <p className="text-sm leading-relaxed text-emerald-950 dark:text-foreground">{cr.how_to_improve}</p>
                            </div>
                          )}
                          {resources.length > 0 && (
                            <div className="space-y-2">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/70 dark:text-muted-foreground">
                                <HiOutlineBookOpen className="h-4 w-4" aria-hidden="true" /> Resources
                              </span>
                              <ul className="space-y-2">
                                {resources.map((r, ri) => (
                                  <li key={`${ri}-${r}`} className="flex items-start gap-2 text-sm text-emerald-900/80 dark:text-foreground">
                                    <HiOutlineQuestionMarkCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                                    <span className="min-w-0 break-words">{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                  {candidateReport?.overall_improvement_plan && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/25 dark:bg-emerald-500/10 lg:p-6">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        <HiOutlineTrophy className="h-4 w-4" aria-hidden="true" /> Overall improvement plan
                      </p>
                      <p className="text-sm leading-relaxed text-emerald-950 dark:text-foreground">{candidateReport.overall_improvement_plan}</p>
                    </div>
                  )}
                </section>
              )}

              {summaryBlocks.length > 0 && (
                <Card>
                  <SectionTitle icon={HiOutlineClipboardDocumentList} title="Session summaries" description="One summary for every block of five questions." />
                  <ol className="space-y-3">
                    {summaryBlocks.map((block, i) => (
                      <li key={`${block?.block ?? i}-${i}`} className="border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="mb-1 text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                          Block {block?.block} · Questions {block?.question_range}
                        </p>
                        <p className="text-sm leading-relaxed text-emerald-900/80 dark:text-foreground">{block?.summary}</p>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}
            </>
          )}

          {conversationHistory.length > 0 && <TranscriptPanel messages={conversationHistory} />}

          {session.status === 'in_progress' && (
            <Card className="border-amber-200 bg-amber-50 text-center dark:border-amber-500/25 dark:bg-amber-500/5">
              <div className="flex flex-col items-center gap-2">
                <IconTile icon={HiOutlineClock} tone="yellow" size="lg" />
                <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Interview in progress</h2>
                <p className="max-w-md text-sm text-emerald-900/80 dark:text-foreground">
                  The candidate has not finished this interview yet. Results will appear here once they do.
                </p>
                <p className="text-xs font-semibold tabular-nums text-emerald-800/70 dark:text-muted-foreground">
                  {userMessageCount} answer{userMessageCount !== 1 ? 's' : ''} so far
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Actions: last on mobile (after the report), sticky under the summary on desktop. */}
        {(decisionBlock || (isCompleted && !decision)) && (
          <div className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:self-start 2xl:col-span-3 2xl:col-start-10">
            {isCompleted && !decision && (
              <Card className="space-y-5">
                <SectionTitle icon={HiOutlineCog6Tooth} title="Recruiter decision" description="Advance or reject this candidate. You will be asked to confirm." />

                {decisionError && <ErrorState title="Could not save the decision" message={decisionError} />}

                <div className="space-y-2">
                  <label htmlFor="decision-notes" className={labelClass}>Decision notes (optional)</label>
                  <textarea
                    id="decision-notes"
                    value={decisionMsg}
                    onChange={(e) => setDecisionMsg(e.target.value)}
                    placeholder="Why you are advancing or rejecting this candidate"
                    rows={3}
                    className={`${inputClass} resize-y py-3`}
                  />
                  <p className={hintClass}>Notes are saved with the decision.</p>
                </div>

                <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 rounded-md pr-2">
                  <input
                    type="checkbox"
                    checked={rejectOthers}
                    onChange={(e) => setRejectOthers(e.target.checked)}
                    className="h-5 w-5 rounded-sm border-emerald-300 text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/20 dark:bg-background"
                  />
                  <span className="text-sm font-semibold text-emerald-900 dark:text-foreground">Reject all other candidates when advancing this one</span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <button type="button" onClick={() => handleDecision('select')} disabled={deciding} className={`${btnPrimary} flex-1`}>
                    {deciding ? (
                      <><HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Saving...</>
                    ) : (
                      <><HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> Select and advance</>
                    )}
                  </button>
                  <button type="button" onClick={() => handleDecision('reject')} disabled={deciding} className={`${btnDanger} flex-1 sm:flex-none`}>
                    <HiOutlineXCircle className="h-4 w-4" aria-hidden="true" /> Reject candidate
                  </button>
                </div>
              </Card>
            )}

            {decisionBlock}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={pendingDecision !== null}
        title={pendingDecision === 'select' ? 'Advance this candidate?' : 'Reject this candidate?'}
        description={
          pendingDecision === 'select'
            ? rejectOthers
              ? 'Advance this candidate and reject every other candidate for this job?'
              : 'Advance this candidate to the next stage?'
            : 'Reject this candidate?'
        }
        confirmLabel={pendingDecision === 'select' ? 'Advance candidate' : 'Reject candidate'}
        confirmClassName={pendingDecision === 'select' ? btnPrimary : btnDanger}
        onConfirm={() => {
          const action = pendingDecision;
          setPendingDecision(null);
          runDecision(action);
        }}
        onCancel={() => setPendingDecision(null)}
      />
    </div>
  );
}
