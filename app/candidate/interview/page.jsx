'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineClock,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineCamera,
  HiOutlineMicrophone,
  HiOutlineComputerDesktop,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineChevronRight,
  HiOutlineLightBulb,
  HiOutlineBriefcase,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import InterviewsSkeleton from '@/components/skeletons/candidate/InterviewsSkeleton';
import { badge, card, cardInteractive, iconTile, primaryButton, secondaryButton } from '@/components/ui/styles';
import { base, fadeUp, stagger } from '@/constants/motion';

const utcDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

const utcTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
};

const utcFull = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
};

const isUpcoming = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) > new Date();
};

const sessionTitle = (s) => s.job_application_details?.job_details?.job_title || s.title || 'Technical Interview';
const sessionCompany = (s) => s.job_application_details?.job_details?.organization_details?.name || 'Hiring Company';

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatusChip({ status, past }) {
  return (
    <span className={`${badge} font-semibold capitalize ${past ? 'bg-muted text-muted-foreground' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
      {past ? <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> : <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />}
      {status || '—'}
    </span>
  );
}

function SessionCard({ session, index, past, onOpen }) {
  return (
    <motion.button
      {...fadeUp}
      transition={{ ...base, delay: Math.min(index, 8) * stagger }}
      type="button"
      onClick={() => onOpen(session)}
      className={`group flex min-w-0 flex-col p-5 text-left lg:p-6 ${cardInteractive}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className={`${iconTile} h-10 w-10 ${past ? 'bg-muted text-muted-foreground' : 'bg-teal-500/10 text-teal-700 dark:text-teal-300'}`}>
          <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
        </span>
        <StatusChip status={session.status} past={past} />
      </div>

      <h3 className="mb-3 truncate text-base font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{sessionTitle(session)}</h3>

      <div className="mb-4 space-y-2 text-sm text-muted-foreground">
        <p className="flex min-w-0 items-center gap-2.5">
          <HiOutlineBuildingOffice2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{sessionCompany(session)}</span>
        </p>
        <p className="flex min-w-0 items-center gap-2.5">
          <HiOutlineCalendar className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{session.scheduled_at ? `${utcDate(session.scheduled_at)} UTC` : 'Date to be confirmed'}</span>
        </p>
        {!past && (
          <p className="flex min-w-0 items-center gap-2.5">
            <HiOutlineClock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{session.scheduled_at ? `${utcTime(session.scheduled_at)} UTC` : 'Time to be confirmed'}</span>
          </p>
        )}
      </div>

      <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
        View details <HiOutlineChevronRight className="h-3.5 w-3.5 transition-[translate] group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </motion.button>
  );
}

function DetailRow({ icon: Icon, children }) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

function DeviceChip({ on, icon: Icon, onLabel, offLabel }) {
  return (
    <span className={`${badge} font-semibold ${on ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {on ? onLabel : offLabel}
    </span>
  );
}

function SessionDetails({ session }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={session.status} past={!isUpcoming(session.scheduled_at)} />
        {session.camera_required !== undefined && <DeviceChip on={session.camera_required} icon={HiOutlineCamera} onLabel="Camera on" offLabel="Camera off" />}
        {session.mic_required !== undefined && <DeviceChip on={session.mic_required} icon={HiOutlineMicrophone} onLabel="Mic on" offLabel="Mic off" />}
        {session.screen_share_enabled !== undefined && <DeviceChip on={session.screen_share_enabled} icon={HiOutlineComputerDesktop} onLabel="Screen share on" offLabel="Screen share off" />}
      </div>

      <div className="space-y-2.5">
        <DetailRow icon={HiOutlineBuildingOffice2}>{sessionCompany(session)}</DetailRow>
        {session.scheduled_at && (
          <>
            <DetailRow icon={HiOutlineCalendar}>{utcDate(session.scheduled_at)} UTC</DetailRow>
            <DetailRow icon={HiOutlineClock}>{utcTime(session.scheduled_at)} UTC</DetailRow>
          </>
        )}
        {session.created_at && <DetailRow icon={HiOutlineInformationCircle}>Created: {utcFull(session.created_at)} UTC</DetailRow>}
        {session.started_at && <DetailRow icon={HiOutlineClock}>Started: {utcFull(session.started_at)} UTC</DetailRow>}
        {session.ended_at && <DetailRow icon={HiOutlineCheckCircle}>Ended: {utcFull(session.ended_at)} UTC</DetailRow>}
        {session.link_expires_at && <DetailRow icon={HiOutlineLink}>Link expires: {utcFull(session.link_expires_at)} UTC</DetailRow>}
        {session.link_visited && (
          <DetailRow icon={HiOutlineCheckCircle}>
            Link visited{session.link_visited_at ? ` ${utcFull(session.link_visited_at)} UTC` : ''}
          </DetailRow>
        )}
      </div>

      {session.candidate_instructions && (
        <div className="rounded-md border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" /> Instructions
          </p>
          <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{session.candidate_instructions}</p>
        </div>
      )}
    </div>
  );
}

export default function CandidateInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [selected, setSelected] = useState(null);
  // Separate from `selected` so the dialog keeps its content while it animates out.
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchInterviews = async () => {
      try {
        const data = await api.get('/interviews/candidate/');
        if (cancelled) return;
        setInterviews(Array.isArray(data) ? data : []);
        setFailed(false);
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching interviews:', error);
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchInterviews();
    return () => { cancelled = true; };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setFailed(false);
    setAttempt((n) => n + 1);
  };

  if (loading) return <InterviewsSkeleton />;

  const upcoming = interviews.filter(i => isUpcoming(i.scheduled_at));
  const past = interviews.filter(i => !isUpcoming(i.scheduled_at));
  const open = (session) => { setSelected(session); setDetailOpen(true); };

  const nextStep = interviews.length === 0
    ? 'Keep applying. Recruiters schedule live sessions after shortlisting.'
    : upcoming.length > 0
      ? 'Open your next session a few minutes early and check your camera and mic.'
      : 'Review your past sessions and prepare for the next round.';

  const applicationsLink = (
    <Link href="/candidate/applications" className={secondaryButton}>
      <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> View applications
    </Link>
  );

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <DashboardBanner
        compact
        icon={HiOutlineVideoCamera}
        badge={failed ? null : { label: `${upcoming.length} upcoming · ${past.length} past`, icon: HiOutlineCalendar }}
        title="Your interviews"
        subtitle="Prepare for your live technical sessions with hiring teams."
        actions={[{ label: 'View applications', href: '/candidate/applications', icon: HiOutlineBriefcase }]}
      />

      {failed ? (
        <ErrorState message="We could not load your interviews. Check your connection and try again." onRetry={retry} />
      ) : (
        <>
          <motion.div {...fadeUp} transition={base} className={`flex items-start gap-3 p-4 ${card}`}>
            <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
              <HiOutlineLightBulb className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="pt-1.5 text-sm"><span className="font-semibold">Next step:</span> <span className="text-muted-foreground">{nextStep}</span></p>
          </motion.div>

          {interviews.length === 0 ? (
            <EmptyState
              icon={HiOutlineVideoCamera}
              title="No interviews yet"
              text="Keep applying. Your scheduled live sessions will appear here."
              action={applicationsLink}
            />
          ) : (
            <div className="space-y-8">
              {upcoming.length > 0 && (
                <section className="space-y-4">
                  <SectionHeader icon={HiOutlineCalendar} title="Upcoming" subtitle={`${upcoming.length} scheduled`} />
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {upcoming.map((session, index) => (
                      <SessionCard key={session.room_id} session={session} index={index} past={false} onOpen={open} />
                    ))}
                  </div>
                </section>
              )}

              {past.length > 0 && (
                <section className="space-y-4">
                  <SectionHeader icon={HiOutlineCheckCircle} title="Past" subtitle={`${past.length} already passed`} />
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {past.map((session, index) => (
                      <SessionCard key={session.room_id} session={session} index={index} past onOpen={open} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected ? sessionTitle(selected) : undefined}
        footer={selected && (
          <a href={`deepscreen://interview/join/${selected.access_token}`} className={primaryButton}>
            <HiOutlineComputerDesktop className="h-4 w-4" aria-hidden="true" />
            Open in DeepScreen Desktop
          </a>
        )}
      >
        {selected && <SessionDetails session={selected} />}
      </Modal>
    </div>
  );
}
