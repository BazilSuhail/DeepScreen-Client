'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { HiOutlineCommandLine, HiOutlineClock, HiOutlineChartBar, HiOutlineHashtag } from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import { ORG_PAGE, OrgSubpageHeader, StatTile } from '@/components/organizations/orgUi';
import OrgConfigCard, { withUnit } from '@/components/organizations/OrgConfigCard';
import OrgConfigsSkeleton from '@/components/skeletons/organizations/OrgConfigsSkeleton';

export default function OrgAssessmentsPage() {
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
        <OrgSubpageHeader slug={slug} current="assesments" title="Coding assessments" />
        <ErrorState title="Assessments unavailable" message="We could not load your coding assessments." onRetry={() => { setLoading(true); setError(false); setAttempt((n) => n + 1); }} />
      </div>
    );
  }

  const items = configs?.assessments || [];
  const totalQuestions = items.reduce((sum, a) => sum + (a.questions_count || 0), 0);
  const avgPass = items.length ? Math.round(items.reduce((sum, a) => sum + (a.passing_score || 0), 0) / items.length) : 0;

  return (
    <div className={ORG_PAGE}>
      <OrgSubpageHeader
        slug={slug}
        current="assesments"
        title="Coding assessments"
        description={`${items.length} ${items.length === 1 ? 'assessment' : 'assessments'} configured. Create an assessment, then attach it to a job so candidates complete it.`}
      />

      {items.length === 0 ? (
        <EmptyState icon={HiOutlineCommandLine} title="No assessments yet" text="Create a coding assessment to evaluate candidate skills." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile i={0} label="Configured" value={items.length} icon={HiOutlineCommandLine} tone="teal" hint="Coding assessments set up for your organization" />
            <StatTile i={1} label="Total questions" value={totalQuestions} icon={HiOutlineHashtag} hint="Questions across all assessments" />
            <StatTile i={2} label="Avg. passing score" value={`${avgPass}%`} icon={HiOutlineChartBar} tone="amber" hint="Average passing score across assessments" />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((a, i) => (
              <OrgConfigCard
                key={a.assessment_id}
                i={i}
                icon={HiOutlineCommandLine}
                tone="teal"
                title={a.title}
                jobTitle={a.job_title}
                creator={a.created_by?.name}
                metrics={[
                  { icon: HiOutlineClock, label: withUnit(a.duration_minutes, ' min'), title: 'Duration' },
                  { icon: HiOutlineChartBar, label: `Pass ${withUnit(a.passing_score, '%')}`, title: 'Passing score' },
                  { icon: HiOutlineHashtag, label: `${a.questions_count ?? 0} questions`, title: 'Questions' },
                ]}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
