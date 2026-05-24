"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowRight,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineCalendarDays,
  HiOutlineGlobeAlt,
  HiOutlineBarsArrowDown,
  HiOutlineBarsArrowUp,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import { AnimatePresence, motion } from 'motion/react';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import PageHeader from '@/components/ui/PageHeader';
import { JobResultsSkeleton } from '@/components/skeletons/jobs/JobBoardSkeleton';
import { base, fadeUp, spring, stagger } from '@/constants/motion';
import { badge, card, cardInteractive, focusRing, ghostButton, iconTile, secondaryButton } from '@/components/ui/styles';

const SORTS = [
  { id: 'newest', label: 'Newest', icon: HiOutlineBarsArrowDown },
  { id: 'oldest', label: 'Oldest', icon: HiOutlineBarsArrowUp },
];

const formatPosted = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
};

const chipToggle = (active) =>
  `inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-[color,background-color,border-color,translate,scale] duration-150 active:scale-[0.97] motion-reduce:transform-none ${focusRing} ${
    active
      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-300'
      : 'border-emerald-100 bg-card text-muted-foreground hover:border-emerald-300 hover:text-foreground dark:border-white/10 dark:hover:border-emerald-500/40'
  }`;

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  // null = not toggled yet: CSS shows the panel from lg up and hides it on phones (no SSR/viewport mismatch).
  const [showFilters, setShowFilters] = useState(null);
  const filtersVisible = () => showFilters ?? window.matchMedia('(min-width: 1024px)').matches;
  const [sortOrder, setSortOrder] = useState('newest');
  const [filters, setFilters] = useState({
    jobType: [],
    remote: false
  });

  const jobTypes = ['Full-time', 'Freelance', 'Internship', 'Volunteer', 'Contract'];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.get('/jobs/');
        setJobs(data);
      } catch {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchSearch = !searchQuery || job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) || job.organization_details?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLocation = !locationQuery || job.location?.toLowerCase().includes(locationQuery.toLowerCase());
    const matchType = filters.jobType.length === 0 || filters.jobType.includes(job.job_type);
    const matchRemote = !filters.remote || job.location?.toLowerCase().includes('remote');
    return matchSearch && matchLocation && matchType && matchRemote;
  });

  // Client-side sort over the fetched list by posting date; undated jobs go last either way.
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const ta = Date.parse(a.created_at) || 0;
    const tb = Date.parse(b.created_at) || 0;
    if (!ta || !tb) return tb - ta;
    return sortOrder === 'newest' ? tb - ta : ta - tb;
  });

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      if (Array.isArray(current)) {
        return { ...prev, [category]: current.includes(value) ? current.filter(i => i !== value) : [...current, value] };
      }
      return { ...prev, [category]: value };
    });
  };

  const activeFilterCount = filters.jobType.length + (filters.remote ? 1 : 0);

  return (
    <div className="space-y-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28 2xl:px-10">
      <PageHeader
        icon={HiOutlineBriefcase}
        eyebrow="Job board"
        title="Find your next role"
        description="Browse open positions from teams hiring on DeepScreen and apply in a few clicks."
        meta={
          !loading && !error ? (
            <span className={`${badge} bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
              <HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {jobs.length} open {jobs.length === 1 ? 'role' : 'roles'}
            </span>
          ) : null
        }
      />

      {/* Search bar */}
      <motion.div {...fadeUp} transition={{ ...base, delay: stagger }} className={`${card} flex flex-col gap-2 p-2 md:flex-row md:items-center`}>
        <label className="group flex min-h-11 flex-1 items-center gap-3 rounded-md px-3 focus-within:bg-muted/60">
          <HiOutlineMagnifyingGlass className="h-5 w-5 shrink-0 text-muted-foreground group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400" aria-hidden="true" />
          <span className="sr-only">Search job title or company</span>
          <input
            type="search"
            placeholder="Job title, keyword or company"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <span className="hidden h-6 w-px bg-border md:block" aria-hidden="true" />
        <label className="group flex min-h-11 flex-1 items-center gap-3 rounded-md px-3 focus-within:bg-muted/60">
          <HiOutlineMapPin className="h-5 w-5 shrink-0 text-muted-foreground group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400" aria-hidden="true" />
          <span className="sr-only">Location</span>
          <input
            type="search"
            placeholder="City, country or remote"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => setShowFilters(!filtersVisible())}
          aria-expanded={showFilters ?? undefined}
          aria-controls="job-filters"
          className={`${secondaryButton} md:w-auto`}
        >
          <HiOutlineAdjustmentsHorizontal className="h-5 w-5" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </motion.div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters */}
        <AnimatePresence initial={false}>
          {showFilters !== false && (
            <motion.aside
              id="job-filters"
              key="filters"
              aria-label="Filters"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={base}
              className={`w-full shrink-0 lg:sticky lg:top-24 lg:w-72 lg:self-start ${showFilters === null ? 'hidden lg:block' : ''}`}
            >
              <div className={`${card} space-y-6 p-5`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                      <HiOutlineAdjustmentsHorizontal className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h2 className="text-base font-semibold">Filters</h2>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={activeFilterCount === 0}
                      className={`${ghostButton} min-h-10 px-2 text-xs`}
                      onClick={() => setFilters({ jobType: [], remote: false })}
                    >
                      Clear all
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      aria-label="Hide filters"
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground ${focusRing}`}
                    >
                      <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <fieldset className="space-y-3">
                  <legend className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                    Job type
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map(type => {
                      const on = filters.jobType.includes(type);
                      return (
                        <button key={type} type="button" aria-pressed={on} onClick={() => toggleFilter('jobType', type)} className={chipToggle(on)}>
                          {on && <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />}
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <HiOutlineGlobeAlt className="h-4 w-4" aria-hidden="true" />
                    Working mode
                  </legend>
                  <button
                    type="button"
                    aria-pressed={filters.remote}
                    onClick={() => setFilters(prev => ({ ...prev, remote: !prev.remote }))}
                    className={chipToggle(filters.remote)}
                  >
                    {filters.remote && <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />}
                    Remote only
                  </button>
                </fieldset>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results */}
        <section aria-label="Job results" className="min-w-0 flex-1 space-y-4">
          {error && <ErrorState title={error} message="Check your connection and reload the page." />}

          {loading ? (
            <JobResultsSkeleton />
          ) : !error && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  <span className="font-semibold text-foreground">{sortedJobs.length}</span> {sortedJobs.length === 1 ? 'job' : 'jobs'} found
                </p>
                <fieldset className="flex items-center gap-1 rounded-md border border-emerald-100 bg-card p-1 dark:border-white/10">
                  <legend className="sr-only">Sort by date posted</legend>
                  {SORTS.map(({ id, label, icon: Icon }) => {
                    const on = sortOrder === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSortOrder(id)}
                        className={`relative inline-flex min-h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors ${focusRing} ${
                          on ? 'text-emerald-800 dark:text-emerald-300' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {on && (
                          <motion.span layoutId="job-sort" transition={spring} className="absolute inset-0 rounded-sm bg-emerald-50 dark:bg-emerald-500/10" aria-hidden="true" />
                        )}
                        <Icon className="relative h-4 w-4" aria-hidden="true" />
                        <span className="relative">{label}</span>
                      </button>
                    );
                  })}
                </fieldset>
              </div>

              {sortedJobs.length > 0 ? (
                <motion.ul
                  layout
                  className={`grid gap-4 sm:grid-cols-2 ${showFilters !== false ? 'xl:grid-cols-3 min-[1800px]:grid-cols-4' : 'lg:grid-cols-3 2xl:grid-cols-4'}`}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {sortedJobs.map((job, i) => (
                      <motion.li
                        key={job.job_id}
                        layout
                        {...fadeUp}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ ...base, delay: Math.min(i, 8) * stagger }}
                        className="min-w-0"
                      >
                        <JobCard job={job} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              ) : (
                <EmptyState
                  icon={HiOutlineBriefcase}
                  title={jobs.length ? 'No jobs match your filters' : 'No open roles right now'}
                  text={jobs.length ? 'Try a different keyword, location or job type.' : 'New positions appear here as soon as teams post them.'}
                  action={
                    jobs.length && (searchQuery || locationQuery || activeFilterCount) ? (
                      <button
                        type="button"
                        className={secondaryButton}
                        onClick={() => {
                          setSearchQuery('');
                          setLocationQuery('');
                          setFilters({ jobType: [], remote: false });
                        }}
                      >
                        <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                        Clear search and filters
                      </button>
                    ) : undefined
                  }
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function JobCard({ job }) {
  const org = job.organization_details;
  const posted = formatPosted(job.created_at);
  const skills = job.key_skills || [];
  return (
    <Link href={`/jobs/${job.job_id}`} className={`group flex h-full flex-col gap-4 p-5 ${cardInteractive}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`${iconTile} h-12 w-12 overflow-hidden border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-white/10 dark:bg-emerald-500/10 dark:text-emerald-300`}>
          {org?.logo_url ? (
            <Image src={org.logo_url} alt="" width={96} height={96} unoptimized className="h-full w-full bg-white object-contain p-1.5" />
          ) : org?.name ? (
            <span className="text-lg font-semibold">{org.name.charAt(0).toUpperCase()}</span>
          ) : (
            <HiOutlineBriefcase className="h-6 w-6" aria-hidden="true" />
          )}
        </span>
        {job.job_type && (
          <span className={`${badge} border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300`}>
            {job.job_type}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
          {job.job_title || 'Untitled role'}
        </h3>
        <p className="mt-0.5 truncate text-sm font-medium text-emerald-700 dark:text-emerald-400">{org?.name || '—'}</p>
      </div>

      {job.job_description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{job.job_description}</p>
      )}

      {(job.location || job.salary_range) && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {job.location && (
            <li className="flex min-w-0 items-center gap-1.5">
              <HiOutlineMapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span className="truncate">{job.location}</span>
            </li>
          )}
          {job.salary_range && (
            <li className="flex min-w-0 items-center gap-1.5">
              <HiOutlineCurrencyDollar className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span className="truncate">{job.salary_range}</span>
            </li>
          )}
        </ul>
      )}

      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Key skills">
          {skills.slice(0, 3).map((skill) => (
            <li key={skill} className={`${badge} bg-muted text-muted-foreground`}>{skill}</li>
          ))}
          {skills.length > 3 && <li className={`${badge} text-muted-foreground`}>+{skills.length - 3}</li>}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <HiOutlineCalendarDays className="h-4 w-4" aria-hidden="true" />
          {posted ? `Posted ${posted}` : '—'}
        </span>
        <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
          View
          <HiOutlineArrowRight className="h-4 w-4 transition-[translate] duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
