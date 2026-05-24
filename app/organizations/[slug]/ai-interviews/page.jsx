'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import {
  HiOutlineSpeakerWave, HiOutlineClock, HiOutlineChartBar,
  HiOutlineHashtag, HiOutlineQuestionMarkCircle,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import { ORG_PAGE, Chip, OrgSubpageHeader, StatTile } from '@/components/organizations/orgUi';
import OrgConfigCard, { withUnit } from '@/components/organizations/OrgConfigCard';
import OrgConfigsSkeleton from '@/components/skeletons/organizations/OrgConfigsSkeleton';

export default function OrgAIInterviewsPage() {
  const { slug } = useParams();
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    api.get(`/organizations/${slug}/configs/`)
      .then(setConfigs)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, attempt]);

  if (loading) return <OrgConfigsSkeleton />;

  if (error) {
    return (
      <div className={ORG_PAGE}>
        <OrgSubpageHeader slug={slug} current="ai-interviews" title="AI interviews" />
        <ErrorState title="AI interviews unavailable" message="We could not load your AI interviews." onRetry={() => { setLoading(true); setError(false); setAttempt((n) => n + 1); }} />
      </div>
    );
  }

  const items = configs?.ai_interviews || [];
  const totalQuestions = items.reduce((sum, ai) => sum + (ai.number_of_questions || 0), 0);
  const avgPass = items.length ? Math.round(items.reduce((sum, ai) => sum + (ai.passing_score || 0), 0) / items.length) : 0;

  return (
    <div className={ORG_PAGE}>
      <OrgSubpageHeader
        slug={slug}
        current="ai-interviews"
        title="AI interviews"
        description={`${items.length} ${items.length === 1 ? 'AI interview' : 'AI interviews'} configured. Set one up, then attach it to a job so candidates are screened automatically.`}
      />

      {items.length === 0 ? (
        <EmptyState icon={HiOutlineSpeakerWave} title="No AI interviews yet" text="Configure an AI interview to start assessing candidates automatically." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile i={0} label="Configured" value={items.length} icon={HiOutlineSpeakerWave} tone="amber" hint="AI interview setups for your organization" />
            <StatTile i={1} label="Total questions" value={totalQuestions} icon={HiOutlineQuestionMarkCircle} tone="teal" hint="Questions across all AI interviews" />
            <StatTile i={2} label="Avg. passing score" value={`${avgPass}%`} icon={HiOutlineChartBar} hint="Average passing score across AI interviews" />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((ai, i) => {
              const criteria = Object.entries(ai.evaluation_criteria || {});
              return (
                <OrgConfigCard
                  key={ai.interview_id}
                  i={i}
                  icon={HiOutlineSpeakerWave}
                  tone="amber"
                  title={ai.title}
                  jobTitle={ai.job_title}
                  creator={ai.created_by?.name}
                  metrics={[
                    { icon: HiOutlineClock, label: withUnit(ai.duration_minutes, ' min'), title: 'Duration' },
                    { icon: HiOutlineHashtag, label: `${ai.number_of_questions ?? 0} questions`, title: 'Questions' },
                    { icon: HiOutlineChartBar, label: `Pass ${withUnit(ai.passing_score, '%')}`, title: 'Passing score' },
                  ]}
                  footer={criteria.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Evaluation criteria</p>
                      <div className="flex flex-wrap gap-1.5">
                        {criteria.map(([c, w]) => (
                          <Chip key={c} tone="amber">{c}: {Math.round(w * 100)}%</Chip>
                        ))}
                      </div>
                    </div>
                  )}
                />
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
