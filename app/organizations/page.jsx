'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HiOutlinePlus, HiOutlineBuildingOffice2, HiOutlineMapPin, HiOutlineTag,
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineChevronRight, HiOutlineExclamationCircle,
  HiOutlineSquares2X2, HiOutlineLightBulb,
} from 'react-icons/hi2';
import { api } from '@/utils/api';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';

const today = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const bannerActionClass = 'border-white/15 bg-white/10 text-white hover:bg-white/20';

function Bar({ className }) {
  return <div className={`animate-pulse rounded-md bg-secondary/60 ${className}`} />;
}

function Skeleton() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-7xl min-w-0 space-y-10 px-4 pb-20 md:px-8">
      <span className="sr-only">Loading your organizations...</span>

      {/* Banner */}
      <div className="rounded-3xl bg-emerald-dark p-5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
              <div className="h-8 w-2/3 animate-pulse rounded-md bg-white/10" />
              <div className="h-3 w-1/3 animate-pulse rounded-md bg-white/10" />
            </div>
            <div className="h-9 w-40 animate-pulse rounded-xl bg-white/10" />
          </div>
          <div className="h-24 w-full animate-pulse rounded-2xl bg-white/5 lg:w-72" />
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-secondary/60" />
              <div className="w-full space-y-2">
                <Bar className="h-4 w-2/3" />
                <Bar className="h-3 w-1/3" />
              </div>
            </div>
            <Bar className="h-3 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrgCard({ org }) {
  return (
    <Link
      href={`/organizations/${org.slug}`}
      title={`Open ${org.name}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-emerald-500/30 lg:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <HiOutlineBuildingOffice2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-foreground group-hover:text-emerald-500">{org.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <HiOutlineTag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{org.industry || 'No industry'}</span>
          </p>
        </div>
        <HiOutlineChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" aria-hidden="true" />
      </div>

      <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
        <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{org.location || 'No location set'}</span>
      </p>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <HiOutlineUsers className="h-4 w-4 shrink-0 text-cyan-500" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold tabular-nums text-foreground">{org.members_count ?? 0}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineBriefcase className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold tabular-nums text-foreground">{org.active_jobs_count ?? 0}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Active jobs</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function OrganizationsListPage() {
  const [orgs, setOrgs] = useState(null);
  const [error, setError] = useState(false);

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
  }, []);

  if (orgs === null) return <Skeleton />;

  const count = orgs.length;
  const totalMembers = orgs.reduce((sum, o) => sum + (o.members_count || 0), 0);
  const totalActive = orgs.reduce((sum, o) => sum + (o.active_jobs_count || 0), 0);

  const aside = (
    <div className="w-full min-w-0 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:w-72">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Across all organizations</p>
      <div className="grid grid-cols-2 gap-3">
        <div title="Members across all organizations" className="flex items-center gap-2 text-xs text-slate-200">
          <HiOutlineUsers className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
          <span><span className="font-semibold text-white tabular-nums">{totalMembers}</span> members</span>
        </div>
        <div title="Active jobs across all organizations" className="flex items-center gap-2 text-xs text-slate-200">
          <HiOutlineBriefcase className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
          <span><span className="font-semibold text-white tabular-nums">{totalActive}</span> active jobs</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-10 px-4 pb-20 md:px-8">
      <DashboardBanner
        date={today()}
        icon={HiOutlineSquares2X2}
        title="Your organizations"
        subtitle={`${count} ${count === 1 ? 'organization' : 'organizations'}`}
        actions={[{ label: 'New organization', href: '/organizations/create', icon: HiOutlinePlus, hint: 'Set up a new organization', className: bannerActionClass }]}
        footer={
          <span className="flex items-start gap-2">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>
              {count === 0
                ? 'Next: create your organization to start posting jobs.'
                : 'Open an organization to manage its jobs, assessments, interviews and team.'}
            </span>
          </span>
        }
        aside={aside}
      />

      {count === 0 ? (
        error ? (
          <EmptyState
            icon={HiOutlineExclamationCircle}
            title="Could not load your organizations"
            text="Check your connection and try again."
          />
        ) : (
          <EmptyState
            icon={HiOutlineBuildingOffice2}
            title="No organization yet"
            text="Create your organization to start recruiting with AI-powered assessments and interviews."
            action={
              <Link
                href="/organizations/create"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create your organization
              </Link>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {orgs.map((org) => (
            <OrgCard key={org.org_id ?? org.slug} org={org} />
          ))}
        </div>
      )}
    </div>
  );
}
