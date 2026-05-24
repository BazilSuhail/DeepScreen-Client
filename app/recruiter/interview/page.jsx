'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '@/utils/api';
import { base, fadeUp, spring, stagger } from '@/constants/motion';
import { focusRing } from '@/components/ui/styles';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import {
  HiOutlinePlus,
  HiOutlineVideoCamera,
  HiOutlineCog6Tooth,
  HiOutlineCalendar,
  HiOutlineBuildingOffice2,
  HiOutlineUserGroup,
  HiOutlineLightBulb,
  HiOutlineBriefcase,
  HiOutlineSignal,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';
import InterviewListSkeleton from '@/components/skeletons/recruiter/InterviewListSkeleton';
import InterviewSessionListCard from '@/components/interview/InterviewSessionListCard';
import InterviewJobListCard from '@/components/interview/InterviewJobListCard';
import {
  ListEmptyState,
  ListErrorState,
  ListStatTile,
  SectionHeading,
  listBtnPrimary,
} from '@/components/interview/InterviewListParts';

const VIEWS = [
  { id: 'setup', label: 'Interview setup', icon: HiOutlineCog6Tooth },
  { id: 'sessions', label: 'Sessions', icon: HiOutlineCalendar },
];

const grid = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';
const panelMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: base,
};

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

  if (loading) return <InterviewListSkeleton />;

  const activeCount = interviews.filter(
    (i) => i.status === 'scheduled' || i.status === 'in_progress',
  ).length;

  const nextStep =
    jobs.length === 0
      ? 'Post a job, then set up its interview template.'
      : interviews.length === 0
        ? 'Schedule a session to create a live link for a candidate.'
        : 'Share session links with candidates ahead of their start time.';

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <DashboardBanner
        compact
        icon={HiOutlineVideoCamera}
        badge={error ? null : { label: `${activeCount} active now`, icon: HiOutlineSignal }}
        title="Live interviews"
        subtitle="Set up each job once, then share session links with candidates."
        actions={[{ label: 'Schedule interview', href: '/recruiter/interview/create', icon: HiOutlinePlus }]}
      />

      {error ? (
        <ListErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <motion.p
            {...fadeUp}
            transition={base}
            className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
          >
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>
              <span className="font-semibold">Next step: </span>
              {nextStep}
            </span>
          </motion.p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <ListStatTile index={0} icon={HiOutlineBriefcase} value={jobs.length} label="Jobs" hint="Posted jobs" />
            <ListStatTile index={1} icon={HiOutlineSignal} value={activeCount} label="Active sessions" hint="Scheduled or live" />
            <ListStatTile index={2} icon={HiOutlineUserGroup} value={interviews.length} label="Total sessions" hint="All booked sessions" />
          </div>

          <fieldset
            aria-label="Choose a view"
            className="m-0 grid w-full min-w-0 grid-cols-2 gap-1 rounded-lg border border-emerald-100 bg-emerald-50 p-1 sm:inline-grid sm:w-auto dark:border-white/10 dark:bg-white/5"
          >
            {VIEWS.map(({ id, label, icon: Icon }) => {
              const selected = view === id;
              const count = id === 'sessions' ? interviews.length : jobs.length;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  aria-controls={`panel-${id}`}
                  onClick={() => setView(id)}
                  className={`relative flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-[color,background-color,translate,scale] active:scale-[0.97] motion-reduce:transform-none ${focusRing} ${
                    selected
                      ? 'text-emerald-900 dark:text-foreground'
                      : 'text-emerald-800/80 hover:text-emerald-900 dark:text-muted-foreground dark:hover:text-foreground'
                  }`}
                >
                  {selected && (
                    <motion.span layoutId="recruiter-interview-view" transition={spring} className="absolute inset-0 rounded-md bg-card shadow-sm dark:bg-white/10" aria-hidden="true" />
                  )}
                  <Icon className="relative h-4 w-4" aria-hidden="true" />
                  <span className="relative">{label}</span>
                  {count > 0 && (
                    <span className="relative rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-800 dark:bg-white/10 dark:text-foreground">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </fieldset>

          <AnimatePresence mode="wait" initial={false}>
            {view === 'setup' ? (
              <motion.section key="setup" id="panel-setup" aria-label="Interview setup" {...panelMotion} className="space-y-4 pt-6 md:pt-10">
                <SectionHeading
                  icon={HiOutlineCog6Tooth}
                  title="Interview templates"
                  text="One reusable template per job, applied to every session."
                />
                {jobs.length === 0 ? (
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
                ) : (
                  <div className={grid}>
                    {jobs.map((job, index) => (
                      <motion.div key={job.job_id ?? index} {...fadeUp} transition={{ ...base, delay: Math.min(index, 8) * stagger }} className="flex min-w-0">
                        <InterviewJobListCard job={job} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            ) : (
              <motion.section key="sessions" id="panel-sessions" aria-label="Sessions" {...panelMotion} className="space-y-4">
                <SectionHeading icon={HiOutlineCalendarDays} title="Sessions" text="Live sessions booked with candidates." />
                {interviews.length === 0 ? (
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
                ) : (
                  <div className={grid}>
                    {interviews.map((interview, index) => (
                      <motion.div key={interview.room_id ?? index} {...fadeUp} transition={{ ...base, delay: Math.min(index, 8) * stagger }} className="flex min-w-0">
                        <InterviewSessionListCard interview={interview} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
