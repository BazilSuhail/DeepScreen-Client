'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HiOutlineVideoCamera, HiOutlineClock, HiOutlineCamera,
  HiOutlineMicrophone, HiOutlineComputerDesktop, HiOutlineBriefcase,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import FormError from '@/components/auth/FormError';
import OrgSubpageBanner, { ORG_PAGE_CLASS } from '@/components/organizations/OrgSubpageBanner';
import OrgSubpageSkeleton from '@/components/organizations/OrgSubpageSkeleton';

export default function OrgInterviewsPage() {
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
        <OrgSubpageBanner slug={slug} current="interviews" icon={HiOutlineVideoCamera} title="Live Interview Settings" subtitle="Live interview settings could not be loaded" />
        <FormError title="Live interviews unavailable" message="We could not load your live interview settings. Refresh the page to try again." />
      </div>
    );
  }

  const items = configs?.interview_configs || [];
  const cameraRequired = items.filter((cfg) => cfg.camera_required).length;
  const screenShare = items.filter((cfg) => cfg.screen_share_enabled).length;

  return (
    <div className={ORG_PAGE_CLASS}>
      <OrgSubpageBanner
        slug={slug}
        current="interviews"
        icon={HiOutlineVideoCamera}
        title="Live Interview Settings"
        subtitle={`${items.length} ${items.length === 1 ? 'interview setting' : 'interview settings'} configured`}
        footer="Choose the camera, microphone and screen rules, then schedule live interviews for candidates."
        emptyText="No live interview settings yet. Set them up for your jobs."
        stats={items.length ? [
          { label: 'Configured', value: items.length, icon: HiOutlineVideoCamera, hint: 'Live interview settings saved for your jobs' },
          { label: 'Camera required', value: cameraRequired, icon: HiOutlineCamera, hint: 'Settings that require candidates to turn on a camera' },
          { label: 'Screen share on', value: screenShare, icon: HiOutlineComputerDesktop, hint: 'Settings that let candidates share their screen' },
        ] : null}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={HiOutlineVideoCamera}
          title="No Interview Configs"
          text="Configure live video interview settings for your jobs."
        />
      ) : (
        <ul className="grid gap-3">
          {items.map((cfg, i) => (
            <motion.li key={cfg.config_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-rose-500/30 lg:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 break-words font-semibold text-foreground">{cfg.title}</h3>
                    <span className="shrink-0 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-500">Configured</span>
                  </div>
                  {cfg.job_title && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <HiOutlineBriefcase className="h-3 w-3" aria-hidden="true" />
                      <span>Job: {cfg.job_title}</span>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />{cfg.default_duration_minutes}min</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineCamera className="h-3.5 w-3.5" aria-hidden="true" />{cfg.camera_required ? 'Req' : 'Opt'}</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineMicrophone className="h-3.5 w-3.5" aria-hidden="true" />{cfg.mic_required ? 'Req' : 'Opt'}</span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><HiOutlineComputerDesktop className="h-3.5 w-3.5" aria-hidden="true" />{cfg.screen_share_enabled ? 'Share' : 'No Share'}</span>
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
