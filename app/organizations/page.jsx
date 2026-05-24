'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlinePlus, HiOutlineBuildingOffice2, HiOutlineMapPin,
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineChevronRight, HiOutlineCheckBadge,
} from 'react-icons/hi2';
import { api } from '@/utils/api';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import { cardInteractive, iconTile, primaryButton } from '@/components/ui/styles';
import { ORG_PAGE, Chip, StatTile, industryBadge, itemMotion } from '@/components/organizations/orgUi';
import OrganizationsListSkeleton from '@/components/skeletons/organizations/OrganizationsListSkeleton';

function OrgCard({ org, i }) {
  return (
    <motion.li {...itemMotion(i)}>
      <Link href={`/organizations/${org.slug}`} title={`Open ${org.name}`} className={`group flex h-full flex-col gap-4 p-5 ${cardInteractive}`}>
        <div className="flex items-start gap-3">
          <span className={`${iconTile} h-11 w-11 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
            <HiOutlineBuildingOffice2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <h2 className="truncate text-base font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{org.name}</h2>
            <div className="flex flex-wrap gap-1.5">
              {industryBadge(org.industry)}
              {org.is_verified && <Chip tone="emerald" icon={HiOutlineCheckBadge}>Verified</Chip>}
            </div>
          </div>
          <HiOutlineChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-[translate] group-hover:translate-x-0.5" aria-hidden="true" />
        </div>

        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{org.location || '—'}</span>
        </p>

        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <HiOutlineUsers className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold tabular-nums">{org.members_count ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">Members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineBriefcase className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold tabular-nums">{org.active_jobs_count ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">Active jobs</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}

export default function OrganizationsListPage() {
  const [orgs, setOrgs] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchOrgs = async () => {
      try {
        const data = await api.get('/organizations/');
        if (!cancelled) setOrgs(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) { setOrgs([]); setError(true); }
      }
    };
    fetchOrgs();
    return () => { cancelled = true; };
  }, [attempt]);

  if (orgs === null) return <OrganizationsListSkeleton />;

  const count = orgs.length;
  const totalMembers = orgs.reduce((sum, o) => sum + (o.members_count || 0), 0);
  const totalActive = orgs.reduce((sum, o) => sum + (o.active_jobs_count || 0), 0);

  const newOrg = (
    <Link href="/organizations/create" title="Set up a new organization" className={primaryButton}>
      <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> New organization
    </Link>
  );

  return (
    <div className={ORG_PAGE}>
      <PageHeader
        icon={HiOutlineBuildingOffice2}
        eyebrow="Workspace"
        title="Your organizations"
        description={count === 0
          ? 'Create your organization to start posting jobs.'
          : 'Open an organization to manage its jobs, assessments, interviews and team.'}
        actions={newOrg}
      />

      {count === 0 ? (
        error ? (
          <ErrorState title="Could not load your organizations" message="Check your connection and try again." onRetry={() => { setOrgs(null); setError(false); setAttempt((n) => n + 1); }} />
        ) : (
          <EmptyState
            icon={HiOutlineBuildingOffice2}
            title="No organization yet"
            text="Create your organization to start recruiting with AI-powered assessments and interviews."
            action={
              <Link href="/organizations/create" className={primaryButton}>
                <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create your organization
              </Link>
            }
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile i={0} label="Organizations" value={count} icon={HiOutlineBuildingOffice2} hint="Organizations you belong to" />
            <StatTile i={1} label="Members" value={totalMembers} icon={HiOutlineUsers} tone="teal" hint="Members across all organizations" />
            <StatTile i={2} label="Active jobs" value={totalActive} icon={HiOutlineBriefcase} tone="amber" hint="Active jobs across all organizations" />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {orgs.map((org, i) => (
              <OrgCard key={org.org_id ?? org.slug} org={org} i={i} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
