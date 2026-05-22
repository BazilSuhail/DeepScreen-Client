'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import {
  HiOutlineArrowLeft, HiOutlineArrowPath, HiOutlineBars3BottomLeft, HiOutlineCheckCircle, HiOutlineChartBar,
  HiOutlineClipboardDocumentList, HiOutlineClock, HiOutlineCog6Tooth, HiOutlineDocumentText,
  HiOutlineExclamationTriangle, HiOutlineIdentification, HiOutlineLightBulb, HiOutlineShieldExclamation,
  HiOutlineSparkles, HiOutlineStar, HiOutlineTrophy, HiOutlineXCircle, HiOutlineQuestionMarkCircle,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import {
  AsideBlocks, Card, DetailSkeleton, EmptyState, ErrorState, IconTile, NotFoundLink, Pill, SectionTitle,
  StatTile, StatusBadge, btnDanger, btnLink, btnPrimary, btnSecondary, hintClass, inputClass, labelClass,
  isTerminatedSession,
} from '@/components/ai-interview/recruiter/AIInterviewDetailUi';
import { CriteriaChart } from '@/components/ai-interview/recruiter/AIInterviewDetailCharts';
import TranscriptPanel from '@/components/ai-interview/recruiter/AIInterviewDetailTranscript';

const ROOT = 'mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8';
const DEFAULT_PASSING_SCORE = 65;

function BulletList({ items, empty, icon: Icon, tone }) {
  if (!items.length) {
    return <p className="text-sm italic text-emerald-800/70 dark:text-slate-400">{empty}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className="flex items-start gap-3 text-sm text-emerald-900 dark:text-slate-200">
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

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/recruiter/ai-interview');
  };

  const handleDecision = async (action) => {
    if (deciding) return;
    const advancing = action === 'select';
    const confirmText = advancing
      ? rejectOthers
        ? 'Advance this candidate and reject every other candidate for this job?'
        : 'Advance this candidate to the next stage?'
      : 'Reject this candidate?';
    if (!window.confirm(confirmText)) return;

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
  const title = session ? session.candidate_email || session.candidate_name || 'Unknown candidate' : 'Candidate report';

  const banner = (
    <DashboardBanner
      loading={loading}
      icon={HiOutlineIdentification}
      title={title}
      subtitle={session?.job_title ? `Interview report for ${session.job_title}` : 'Candidate interview report'}
      aside={loading ? <AsideBlocks count={1} /> : null}
      footer={
        session && !loading ? (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleBack} className={`${btnLink} -ml-2`} aria-label="Back to candidates">
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to candidates
            </button>
            <StatusBadge status={session.status} />
            {terminated && <Pill tone="red" icon={HiOutlineShieldExclamation}>Guardrail flagged</Pill>}
          </div>
        ) : null
      }
    />
  );

  if (loading) {
    return (
      <div className={ROOT}>
        {banner}
        <DetailSkeleton stats={4} blocks={2} />
      </div>
    );
  }

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
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <IconTile icon={HiOutlineCheckCircle} tone="emerald" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-950 dark:text-foreground">
            Candidate {decision === 'select' ? 'advanced' : 'rejected'}
          </p>
          <p className={hintClass}>Your decision is saved. You can keep reviewing this report.</p>
        </div>
      </div>
      <button type="button" onClick={handleBack} className={`${btnSecondary} w-fit`}>
        Back to candidates
      </button>
    </Card>
  ) : null;

  return (
    <div className={ROOT}>
      {banner}

      {terminated ? (
        <Card className="border-red-200 bg-red-50/60 dark:border-red-500/25 dark:bg-red-500/5">
          <div className="flex items-start gap-4">
            <IconTile icon={HiOutlineShieldExclamation} tone="red" size="lg" />
            <div className="min-w-0 space-y-2">
              <h2 className="text-base font-semibold text-red-800 dark:text-red-300">Interview terminated by a guardrail</h2>
              <p className="break-words text-sm text-emerald-900 dark:text-slate-200">
                {session.guardrail_reason || 'A policy violation was detected during the interview.'}
              </p>
              <p className={hintClass}>No evaluation was performed. The interview ended when the guardrail fired.</p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <Card className="flex flex-col items-center justify-center gap-2 text-center lg:col-span-1">
              <IconTile
                icon={passed ? HiOutlineCheckCircle : HiOutlineXCircle}
                tone={passed ? 'emerald' : 'red'}
                size="lg"
              />
              <p className="font-mono text-4xl font-semibold text-emerald-950 dark:text-foreground">
                {score ?? '—'}
                <span className="text-lg font-normal text-emerald-800/70 dark:text-slate-400">/100</span>
              </p>
              {score != null ? (
                <Pill tone={passed ? 'emerald' : 'red'} icon={passed ? HiOutlineCheckCircle : HiOutlineXCircle}>
                  {passed ? 'Passed' : 'Failed'}
                </Pill>
              ) : (
                <Pill tone="neutral" icon={HiOutlineClock}>Not scored yet</Pill>
              )}
              <p className={hintClass}>Passing score: {passingScore}%</p>
            </Card>

            <Card className="min-w-0 lg:col-span-3">
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
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle icon={HiOutlineStar} title="Key strengths" />
              <BulletList items={strengths} empty="No strengths recorded." icon={HiOutlineCheckCircle} tone="text-emerald-600 dark:text-emerald-400" />
            </Card>
            <Card>
              <SectionTitle icon={HiOutlineExclamationTriangle} tone="red" title="Areas to improve" />
              <BulletList items={weaknesses} empty="No weaknesses recorded." icon={HiOutlineXCircle} tone="text-red-600 dark:text-red-400" />
            </Card>
          </div>

          {session.overall_feedback && (
            <Card>
              <SectionTitle icon={HiOutlineBars3BottomLeft} title="Overall assessment" />
              <p className="break-words text-sm leading-relaxed text-emerald-900 dark:text-slate-200">{session.overall_feedback}</p>
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
                    <Card key={`${cr?.criterion ?? 'criterion'}-${i}`} className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="min-w-0 break-words text-sm font-semibold capitalize text-emerald-950 dark:text-foreground">
                          {cr?.criterion?.replace(/_/g, ' ') || 'Criterion'}
                        </h3>
                        {Number.isFinite(crScore) && (
                          <Pill tone={crPassed ? 'emerald' : 'red'} icon={crPassed ? HiOutlineCheckCircle : HiOutlineXCircle}>
                            {crScore}/100
                          </Pill>
                        )}
                      </div>
                      {cr?.feedback && <p className="text-sm leading-relaxed text-emerald-900/80 dark:text-slate-300">{cr.feedback}</p>}
                      {cr?.how_to_improve && (
                        <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <HiOutlineLightBulb className="h-4 w-4" aria-hidden="true" /> How to improve
                          </span>
                          <p className="text-sm leading-relaxed text-emerald-950 dark:text-slate-200">{cr.how_to_improve}</p>
                        </div>
                      )}
                      {resources.length > 0 && (
                        <div className="space-y-2">
                          <span className="block text-xs font-semibold text-emerald-800/70 dark:text-slate-400">Resources</span>
                          <ul className="space-y-2">
                            {resources.map((r, ri) => (
                              <li key={`${ri}-${r}`} className="flex items-start gap-2 text-sm text-emerald-900/80 dark:text-slate-300">
                                <HiOutlineQuestionMarkCircle className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                                <span className="min-w-0 break-words">{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
              {candidateReport?.overall_improvement_plan && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/25 dark:bg-emerald-500/10 lg:p-6">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    <HiOutlineTrophy className="h-4 w-4" aria-hidden="true" /> Overall improvement plan
                  </p>
                  <p className="text-sm leading-relaxed text-emerald-950 dark:text-slate-200">{candidateReport.overall_improvement_plan}</p>
                </div>
              )}
            </section>
          )}

          {summaryBlocks.length > 0 && (
            <Card>
              <SectionTitle icon={HiOutlineClipboardDocumentList} title="Session summaries" description="One summary for every block of five questions." />
              <ol className="space-y-3">
                {summaryBlocks.map((block, i) => (
                  <li key={`${block?.block ?? i}-${i}`} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Block {block?.block} · Questions {block?.question_range}
                    </p>
                    <p className="text-sm leading-relaxed text-emerald-900/80 dark:text-slate-300">{block?.summary}</p>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </>
      )}

      {(session.question_count != null || session.duration_taken_minutes != null || session.interview_config?.passing_score != null) && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatTile icon={HiOutlineQuestionMarkCircle} label="Questions asked" value={session.question_count} hint="Questions asked in this session" />
          <StatTile icon={HiOutlineClock} label="Time taken" value={session.duration_taken_minutes != null ? `${session.duration_taken_minutes} min` : null} hint="Time taken for this session" />
          <StatTile icon={HiOutlineUserGroup} label="Passing score" value={`${passingScore}%`} hint="Score needed to pass" />
        </div>
      )}

      {conversationHistory.length > 0 && <TranscriptPanel messages={conversationHistory} />}

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

          <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 rounded-lg pr-2">
            <input
              type="checkbox"
              checked={rejectOthers}
              onChange={(e) => setRejectOthers(e.target.checked)}
              className="h-5 w-5 rounded border-emerald-300 text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/20 dark:bg-background"
            />
            <span className="text-sm font-semibold text-emerald-900 dark:text-slate-200">Reject all other candidates when advancing this one</span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => handleDecision('select')} disabled={deciding} className={`${btnPrimary} flex-1`}>
              {deciding ? (
                <><HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving...</>
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

      {session.status === 'in_progress' && (
        <Card className="border-yellow-300 bg-yellow-50 text-center dark:border-yellow-500/25 dark:bg-yellow-500/5">
          <div className="flex flex-col items-center gap-2">
            <IconTile icon={HiOutlineClock} tone="yellow" size="lg" />
            <h2 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">Interview in progress</h2>
            <p className="max-w-md text-sm text-emerald-900/80 dark:text-slate-300">
              The candidate has not finished this interview yet. Results will appear here once they do.
            </p>
            <p className="text-xs font-semibold text-emerald-800/70 dark:text-slate-400">
              {userMessageCount} answer{userMessageCount !== 1 ? 's' : ''} so far
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
