'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HiOutlineCommandLine, HiOutlineClock, HiOutlineChartBar,
  HiOutlineUser, HiOutlineHashtag,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import FormError from '@/components/auth/FormError';
import OrgSubpageBanner, { ORG_PAGE_CLASS } from '@/components/organizations/OrgSubpageBanner';
import OrgSubpageSkeleton from '@/components/organizations/OrgSubpageSkeleton';

export default function OrgAssessmentsPage() {
  const { slug } = useParams();
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/organizations/${slug}/configs/`)
      .then(setConfigs)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <OrgSubpageSkeleton variant="list" />;

  if (error) {
    return (
      <div className={ORG_PAGE_CLASS}>
        <OrgSubpageBanner slug={slug} current="assesments" icon={HiOutlineCommandLine} title="Coding Assessments" subtitle="Assessments could not be loaded" />
        <FormError title="Assessments unavailable" message="We could not load your coding assessments. Refresh the page to try again." />
      </div>
    );
  }

  const items = configs?.assessments || [];
  const totalQuestions = items.reduce((sum, a) => sum + (a.questions_count || 0), 0);
  const avgPass = items.length ? Math.round(items.reduce((sum, a) => sum + (a.passing_score || 0), 0) / items.length) : 0;

  return (
    <div className={ORG_PAGE_CLASS}>
      <OrgSubpageBanner
        slug={slug}
        current="assesments"
        icon={HiOutlineCommandLine}
        title="Coding Assessments"
        subtitle={`${items.length} ${items.length === 1 ? 'assessment' : 'assessments'} configured`}
        footer="Create an assessment, then attach it to a job so candidates complete it."
        emptyText="No assessments yet. Create one to evaluate candidate skills."
        stats={items.length ? [
          { label: 'Configured', value: items.length, icon: HiOutlineCommandLine, hint: 'Coding assessments set up for your organization' },
          { label: 'Total questions', value: totalQuestions, icon: HiOutlineHashtag, hint: 'Questions across all assessments' },
          { label: 'Avg. passing score', value: `${avgPass}%`, icon: HiOutlineChartBar, hint: 'Average passing score across assessments' },
        ] : null}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={HiOutlineCommandLine}
          title="No Assessments Yet"
          text="Create a coding assessment to evaluate candidate skills."
        />
      ) : (
        <ul className="grid gap-3">
          {items.map((a, i) => (
            <motion.li key={a.assessment_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-purple-500/30 lg:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <HiOutlineCommandLine className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 break-words font-semibold text-foreground">{a.title}</h3>
                    <span className="shrink-0 rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-500">Configured</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {a.job_title && <span>Job: {a.job_title}</span>}
                    {a.created_by?.name && <span className="flex items-center gap-1"><HiOutlineUser className="h-3 w-3" aria-hidden="true" />{a.created_by.name}</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />{a.duration_minutes}min</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden="true" />Pass: {a.passing_score}%</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineHashtag className="h-3.5 w-3.5" aria-hidden="true" />{a.questions_count} Q</span>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
