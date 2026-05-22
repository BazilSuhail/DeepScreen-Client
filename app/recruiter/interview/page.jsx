'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import {
  HiOutlinePlus,
  HiOutlineVideoCamera,
  HiOutlineCog6Tooth,
  HiOutlineCalendar,
  HiOutlineBuildingOffice2,
  HiOutlineUserGroup,
  HiOutlinePlayCircle,
  HiOutlineLightBulb,
  HiOutlineBriefcase,
  HiOutlineSignal,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import InterviewSessionListCard from '@/components/interview/InterviewSessionListCard';
import InterviewJobListCard from '@/components/interview/InterviewJobListCard';
import {
  ListEmptyState,
  ListErrorState,
  ListStatTile,
  listBtnPrimary,
} from '@/components/interview/InterviewListParts';

const VIEWS = [
  { id: 'setup', label: 'Interview setup', icon: HiOutlineCog6Tooth },
  { id: 'sessions', label: 'Sessions', icon: HiOutlineCalendar },
];

export default function RecruiterInterviewDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState('setup');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [interviewsData, jobsData] = await Promise.all([
          api.get('/interviews/recruiter/'),
          api.get('/interviews/recruiter/jobs/'),
        ]);
        if (!active) return;
        setInterviews(Array.isArray(interviewsData) ? interviewsData : []);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (err) {
        if (!active) return;
        console.error('Error fetching interview data:', err);
        setError('We could not load your interviews. Check your connection and try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  const activeCount = interviews.filter(
    (i) => i.status === 'scheduled' || i.status === 'in_progress',
  ).length;

  const nextStep =
    jobs.length === 0
      ? 'Next step: post a job, then set up its interview template.'
      : interviews.length === 0
        ? 'Next step: schedule a session to create a live link for a candidate.'
        : 'Next step: share session links with candidates ahead of their start time.';

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      {/* The banner renders while loading too. Only its data-dependent badge and footer wait for the data. */}
      <DashboardBanner
        loading={loading}
        icon={HiOutlineVideoCamera}
        badge={loading ? undefined : { label: `${activeCount} active now`, icon: HiOutlinePlayCircle }}
        title="Live interviews"
        subtitle="Set up each job once, then share session links with candidates."
        aside={
          loading ? (
            <div className="flex flex-wrap gap-2">
              <BannerBlock className="h-11 w-40 rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Link href="/recruiter/interview/create" className={listBtnPrimary}>
                <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
                Schedule interview
              </Link>
            </div>
          )
        }
        footer={
          !loading && !error ? (
            <span className="flex items-start gap-2">
              <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
              <span>{nextStep}</span>
            </span>
          ) : null
        }
      />

      {loading && <PageSkeleton stats={3} cards={2} banner={false} />}

      {!loading && (
        <>
          {error && <ListErrorState message={error} onRetry={retry} />}

          {!error && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <ListStatTile icon={HiOutlineBriefcase} value={jobs.length} label="Jobs" hint="Posted jobs" />
              <ListStatTile icon={HiOutlineSignal} value={activeCount} label="Active sessions" hint="Scheduled or live" />
              <ListStatTile icon={HiOutlineUserGroup} value={interviews.length} label="Total sessions" hint="All booked sessions" />
            </div>
          )}

          <fieldset
            aria-label="Choose a view"
            className="m-0 grid w-full min-w-0 grid-cols-2 gap-1 rounded-xl border border-emerald-100 bg-emerald-50 p-1 sm:inline-grid sm:w-auto dark:border-white/10 dark:bg-white/5"
          >
            {VIEWS.map(({ id, label, icon: Icon }) => {
              const selected = view === id;
              const count = id === 'sessions' ? interviews.length : 0;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  aria-controls={`panel-${id}`}
                  onClick={() => setView(id)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                    selected
                      ? 'bg-white text-emerald-950 shadow-sm dark:bg-white/10 dark:text-foreground'
                      : 'text-emerald-800/80 hover:text-emerald-950 dark:text-muted-foreground dark:hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                  {count > 0 && (
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-800 dark:bg-white/10 dark:text-foreground">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </fieldset>

          {view === 'setup' ? (
            <section id="panel-setup" aria-label="Interview setup" className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-emerald-800/80 dark:text-muted-foreground">
                <HiOutlineCog6Tooth className="h-4 w-4 shrink-0" aria-hidden="true" />
                One reusable template per job, applied to every session.
              </p>
              {jobs.length === 0 ? (
                !error && (
                  <ListEmptyState
                    icon={HiOutlineBuildingOffice2}
                    title="No jobs yet"
                    text="Post a job first, then come back here to set up its interview template."
                    action={
                      <Link href="/recruiter/jobs/create" className={listBtnPrimary}>
                        <HiOutlinePlus className="h-5 w-5" aria-hidden="true" />
                        Post a job
                      </Link>
                    }
                  />
                )
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {jobs.map((job, index) => (
                    <InterviewJobListCard key={job.job_id ?? index} job={job} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section id="panel-sessions" aria-label="Sessions" className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-emerald-800/80 dark:text-muted-foreground">
                <HiOutlineCalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                Live sessions booked with candidates.
              </p>
              {interviews.length === 0 ? (
                !error && (
                  <ListEmptyState
                    icon={HiOutlineCalendar}
                    title="No sessions yet"
                    text="Schedule an interview to create a live session link for a candidate."
                    action={
                      <Link href="/recruiter/interview/create" className={listBtnPrimary}>
                        <HiOutlinePlus className="h-5 w-5" aria-hidden="true" />
                        Schedule interview
                      </Link>
                    }
                  />
                )
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {interviews.map((interview, index) => (
                    <InterviewSessionListCard key={interview.room_id ?? index} interview={interview} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
