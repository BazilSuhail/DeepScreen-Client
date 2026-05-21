'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HiOutlineSpeakerWave, HiOutlineClock, HiOutlineChartBar,
  HiOutlineHashtag, HiOutlineUser, HiOutlineQuestionMarkCircle,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import FormError from '@/components/auth/FormError';
import OrgSubpageBanner, { ORG_PAGE_CLASS } from '@/components/organizations/OrgSubpageBanner';
import OrgSubpageSkeleton from '@/components/organizations/OrgSubpageSkeleton';

export default function OrgAIInterviewsPage() {
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
        <OrgSubpageBanner slug={slug} current="ai-interviews" icon={HiOutlineSpeakerWave} title="AI-Powered Interviews" subtitle="AI interviews could not be loaded" />
        <FormError title="AI interviews unavailable" message="We could not load your AI interviews. Refresh the page to try again." />
      </div>
    );
  }

  const items = configs?.ai_interviews || [];
  const totalQuestions = items.reduce((sum, ai) => sum + (ai.number_of_questions || 0), 0);
  const avgPass = items.length ? Math.round(items.reduce((sum, ai) => sum + (ai.passing_score || 0), 0) / items.length) : 0;

  return (
    <div className={ORG_PAGE_CLASS}>
      <OrgSubpageBanner
        slug={slug}
        current="ai-interviews"
        icon={HiOutlineSpeakerWave}
        title="AI-Powered Interviews"
        subtitle={`${items.length} ${items.length === 1 ? 'AI interview' : 'AI interviews'} configured`}
        footer="Set up an AI interview, then attach it to a job so candidates are screened automatically."
        emptyText="No AI interviews yet. Configure one to start assessing candidates automatically."
        stats={items.length ? [
          { label: 'Configured', value: items.length, icon: HiOutlineSpeakerWave, hint: 'AI interview setups for your organization' },
          { label: 'Total questions', value: totalQuestions, icon: HiOutlineQuestionMarkCircle, hint: 'Questions across all AI interviews' },
          { label: 'Avg. passing score', value: `${avgPass}%`, icon: HiOutlineChartBar, hint: 'Average passing score across AI interviews' },
        ] : null}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={HiOutlineSpeakerWave}
          title="No AI Interviews Yet"
          text="Configure an AI interview to start assessing candidates automatically."
        />
      ) : (
        <ul className="grid gap-3">
          {items.map((ai, i) => (
            <motion.li key={ai.interview_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-amber-500/30 lg:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <HiOutlineSpeakerWave className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 break-words font-semibold text-foreground">{ai.title}</h3>
                    <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-500">Configured</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {ai.job_title && <span>Job: {ai.job_title}</span>}
                    {ai.created_by?.name && <span className="flex items-center gap-1"><HiOutlineUser className="h-3 w-3" aria-hidden="true" />{ai.created_by.name}</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />{ai.duration_minutes}min</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineHashtag className="h-3.5 w-3.5" aria-hidden="true" />{ai.number_of_questions} Q</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineChartBar className="h-3.5 w-3.5" aria-hidden="true" />Pass: {ai.passing_score}%</span>
                  </div>
                </div>
              </div>
              {ai.evaluation_criteria && Object.keys(ai.evaluation_criteria).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {Object.entries(ai.evaluation_criteria).map(([c, w]) => (
                    <span key={c} className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      {c}: {Math.round(w * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
