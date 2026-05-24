'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import {
  HiOutlineVideoCamera, HiOutlineClock, HiOutlineCamera,
  HiOutlineMicrophone, HiOutlineComputerDesktop,
} from 'react-icons/hi2';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import { ORG_PAGE, OrgSubpageHeader, StatTile } from '@/components/organizations/orgUi';
import OrgConfigCard, { withUnit } from '@/components/organizations/OrgConfigCard';
import OrgConfigsSkeleton from '@/components/skeletons/organizations/OrgConfigsSkeleton';

export default function OrgInterviewsPage() {
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
        <OrgSubpageHeader slug={slug} current="interviews" title="Live interview settings" />
        <ErrorState title="Live interviews unavailable" message="We could not load your live interview settings." onRetry={() => { setLoading(true); setError(false); setAttempt((n) => n + 1); }} />
      </div>
    );
  }

  const items = configs?.interview_configs || [];
  const cameraRequired = items.filter((cfg) => cfg.camera_required).length;
  const screenShare = items.filter((cfg) => cfg.screen_share_enabled).length;

  return (
    <div className={ORG_PAGE}>
      <OrgSubpageHeader
        slug={slug}
        current="interviews"
        title="Live interview settings"
        description={`${items.length} ${items.length === 1 ? 'interview setting' : 'interview settings'} configured. Choose the camera, microphone and screen rules, then schedule live interviews for candidates.`}
      />

      {items.length === 0 ? (
        <EmptyState icon={HiOutlineVideoCamera} title="No interview settings yet" text="Configure live video interview settings for your jobs." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile i={0} label="Configured" value={items.length} icon={HiOutlineVideoCamera} tone="teal" hint="Live interview settings saved for your jobs" />
            <StatTile i={1} label="Camera required" value={cameraRequired} icon={HiOutlineCamera} hint="Settings that require candidates to turn on a camera" />
            <StatTile i={2} label="Screen share on" value={screenShare} icon={HiOutlineComputerDesktop} tone="amber" hint="Settings that let candidates share their screen" />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((cfg, i) => (
              <OrgConfigCard
                key={cfg.config_id}
                i={i}
                icon={HiOutlineVideoCamera}
                tone="teal"
                title={cfg.title}
                jobTitle={cfg.job_title}
                metrics={[
                  { icon: HiOutlineClock, label: withUnit(cfg.default_duration_minutes, ' min'), title: 'Default duration' },
                  { icon: HiOutlineCamera, label: cfg.camera_required ? 'Camera required' : 'Camera optional', title: 'Camera' },
                  { icon: HiOutlineMicrophone, label: cfg.mic_required ? 'Mic required' : 'Mic optional', title: 'Microphone' },
                  { icon: HiOutlineComputerDesktop, label: cfg.screen_share_enabled ? 'Screen share on' : 'No screen share', title: 'Screen share' },
                ]}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
