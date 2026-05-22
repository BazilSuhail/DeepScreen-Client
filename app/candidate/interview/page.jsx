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
  HiOutlineXMark,
  HiOutlineInformationCircle,
  HiOutlineCamera,
  HiOutlineMicrophone,
  HiOutlineComputerDesktop,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineChevronRight,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineLightBulb,
  HiOutlineBriefcase,
} from 'react-icons/hi2';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const muted = 'text-emerald-900/70 dark:text-slate-400';
const card = 'rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card';
const linkButton = `inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-500/20 dark:text-emerald-300 ${focusRing}`;
const secondaryButton = `flex min-h-11 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-white ${focusRing}`;

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

function SectionHeader({ icon: Icon, tone, title, subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className={`text-xs ${muted}`}>{subtitle}</p>}
      </div>
    </div>
  );
}

function SessionCard({ session, index, past, onOpen }) {
  const title = session.job_application_details?.job_details?.job_title || session.title || 'Technical Interview';
  const company = session.job_application_details?.job_details?.organization_details?.name || 'Hiring Company';

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      type="button"
      tabIndex={0}
      title="View session details"
      onClick={() => onOpen(session)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(session);
        }
      }}
      className={`group flex min-w-0 cursor-pointer flex-col p-5 text-left transition-colors hover:border-emerald-500/40 lg:p-6 ${card} ${focusRing} ${past ? 'opacity-70 hover:opacity-100' : ''}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${past ? 'bg-emerald-50 text-emerald-700 dark:bg-white/10 dark:text-slate-300' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
          <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${past ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
          {past ? <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> : <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />}
          {session.status}
        </span>
      </div>

      <h3 className="mb-4 truncate text-lg font-semibold transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{title}</h3>

      <div className={`mb-5 space-y-2.5 ${muted}`}>
        <p className="flex min-w-0 items-center gap-2.5 text-sm" title="Hiring company">
          <HiOutlineBuildingOffice2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{company}</span>
        </p>
        <p className="flex min-w-0 items-center gap-2.5 text-sm" title="Date (UTC)">
          <HiOutlineCalendar className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{session.scheduled_at ? utcDate(session.scheduled_at) : 'Date TBD'} UTC</span>
        </p>
        {!past && (
          <p className="flex min-w-0 items-center gap-2.5 text-sm" title="Start time (UTC)">
            <HiOutlineClock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{session.scheduled_at ? utcTime(session.scheduled_at) : 'Time TBD'} UTC</span>
          </p>
        )}
      </div>

      <span className={`mt-auto flex items-center gap-1 text-xs font-semibold ${muted} group-hover:text-emerald-600 dark:group-hover:text-emerald-400`}>
        View details <HiOutlineChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </motion.button>
  );
}

export default function CandidateInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [selected, setSelected] = useState(null);
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

  const upcoming = interviews.filter(i => isUpcoming(i.scheduled_at));
  const past = interviews.filter(i => !isUpcoming(i.scheduled_at));

  const nextStep = interviews.length === 0
    ? 'Next step: keep applying. Recruiters schedule live sessions after shortlisting.'
    : upcoming.length > 0
      ? 'Next step: open your next session a few minutes early and check your camera and mic.'
      : 'Next step: review your past sessions and prepare for the next round.';

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      {/* ═══ Banner (always rendered; data-dependent badge and footer appear after load) ═══ */}
      <DashboardBanner
        loading={loading}
        icon={HiOutlineVideoCamera}
        badge={loading ? undefined : { label: `${upcoming.length} upcoming`, icon: HiOutlineCalendar }}
        title="Your Interviews"
        subtitle="Prepare for your live technical sessions with top companies"
        footer={loading ? null : (
          <span className="flex items-start gap-2">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            <span>{nextStep}</span>
          </span>
        )}
        aside={loading ? (
          <div className="flex gap-2">
            <BannerBlock className="h-11 w-44 rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link href="/candidate/applications" className={secondaryButton}>
              <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> View applications
            </Link>
          </div>
        )}
      />

      {loading ? (
        <PageSkeleton stats={0} cards={2} banner={false} />
      ) : (
        <>
          {failed && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
              <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Something went wrong</p>
                <p className="mt-0.5 text-xs text-red-700/80 dark:text-red-300/70">We could not load your interviews. Check your connection and try again.</p>
              </div>
              <button
                type="button"
                onClick={retry}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/25 dark:text-red-300 ${focusRing}`}
              >
                <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
              </button>
            </div>
          )}

          {!failed && interviews.length === 0 ? (
            <EmptyState
              icon={HiOutlineVideoCamera}
              title="No interviews yet"
              text="Keep applying. Your scheduled live sessions will appear here."
              action={<Link href="/candidate/applications" className={linkButton}><HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /> View applications</Link>}
            />
          ) : interviews.length > 0 && (
            <div className="space-y-10">
              {upcoming.length > 0 && (
                <section className="space-y-5">
                  <SectionHeader icon={HiOutlineCalendar} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Upcoming" subtitle={`${upcoming.length} scheduled`} />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                    {upcoming.map((session, index) => (
                      <SessionCard key={session.room_id} session={session} index={index} past={false} onOpen={setSelected} />
                    ))}
                  </div>
                </section>
              )}

              {past.length > 0 && (
                <section className="space-y-5">
                  <SectionHeader icon={HiOutlineCheckCircle} tone="bg-emerald-50 text-emerald-700 dark:bg-white/10 dark:text-slate-300" title="Past" subtitle={`${past.length} already passed`} />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                    {past.map((session, index) => (
                      <SessionCard key={session.room_id} session={session} index={index} past onOpen={setSelected} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {selected && (
            <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)} onKeyDown={(e) => { if (e.key === "Escape") setSelected(null); }}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.dialog
                open
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={e => e.stopPropagation()}
                className={`relative m-0 border-0 max-h-[95vh] w-full max-w-lg overflow-auto p-5 shadow-2xl sm:p-6 lg:p-8 ${card}`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  title="Close"
                  className={`absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-white/10 dark:text-white ${focusRing}`}
                >
                  <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <HiOutlineVideoCamera className="h-6 w-6" aria-hidden="true" />
                </div>

                <span className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                  <HiOutlineVideoCamera className="h-3.5 w-3.5" aria-hidden="true" />
                  {selected.status}
                </span>

                <h2 className="mb-4 break-words text-2xl font-semibold text-foreground">
                  {selected.job_application_details?.job_details?.job_title || selected.title || 'Technical Interview'}
                </h2>

                <div className="mb-6 space-y-2.5">
                  <div className={`flex min-w-0 items-center gap-3 ${muted}`} title="Hiring company">
                    <HiOutlineBuildingOffice2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-words text-sm">{selected.job_application_details?.job_details?.organization_details?.name || 'Hiring Company'}</span>
                  </div>
                  {selected.scheduled_at && (
                    <>
                      <div className={`flex min-w-0 items-center gap-3 ${muted}`} title="Scheduled date (UTC)">
                        <HiOutlineCalendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 break-words text-sm">{utcDate(selected.scheduled_at)} UTC</span>
                      </div>
                      <div className={`flex min-w-0 items-center gap-3 ${muted}`} title="Scheduled time (UTC)">
                        <HiOutlineClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 break-words text-sm">{utcTime(selected.scheduled_at)} UTC</span>
                      </div>
                    </>
                  )}
                  {selected.created_at && (
                    <div className={`flex min-w-0 items-center gap-3 ${muted}`} title="Created">
                      <HiOutlineInformationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm">Created: {utcFull(selected.created_at)} UTC</span>
                    </div>
                  )}
                  {selected.started_at && (
                    <div className={`flex min-w-0 items-center gap-3 ${muted}`} title="Started">
                      <HiOutlineClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm">Started: {utcFull(selected.started_at)} UTC</span>
                    </div>
                  )}
                  {selected.ended_at && (
                    <div className={`flex min-w-0 items-center gap-3 ${muted}`} title="Ended">
                      <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words text-sm">Ended: {utcFull(selected.ended_at)} UTC</span>
                    </div>
                  )}
                </div>

                {selected.candidate_instructions && (
                  <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">Instructions</span>
                    </div>
                    <p className={`break-words text-sm ${muted}`}>{selected.candidate_instructions}</p>
                  </div>
                )}

                {(selected.camera_required !== undefined || selected.mic_required !== undefined || selected.screen_share_enabled !== undefined) && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {selected.camera_required !== undefined && (
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${selected.camera_required ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'}`}>
                        <HiOutlineCamera className="h-3.5 w-3.5" aria-hidden="true" /> {selected.camera_required ? 'Camera On' : 'Camera Off'}
                      </span>
                    )}
                    {selected.mic_required !== undefined && (
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${selected.mic_required ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'}`}>
                        <HiOutlineMicrophone className="h-3.5 w-3.5" aria-hidden="true" /> {selected.mic_required ? 'Mic On' : 'Mic Off'}
                      </span>
                    )}
                    {selected.screen_share_enabled !== undefined && (
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${selected.screen_share_enabled ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'}`}>
                        <HiOutlineComputerDesktop className="h-3.5 w-3.5" aria-hidden="true" /> {selected.screen_share_enabled ? 'Screen Share On' : 'Screen Share Off'}
                      </span>
                    )}
                  </div>
                )}

                {selected.link_expires_at && (
                  <div className={`mb-6 flex min-w-0 items-center gap-3 ${muted}`} title="Join link expiry">
                    <HiOutlineLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-words text-sm">Link expires: {utcFull(selected.link_expires_at)} UTC</span>
                  </div>
                )}

                {selected.link_visited && (
                  <div className={`mb-6 flex min-w-0 items-center gap-3 ${muted}`} title="Join link visited">
                    <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-words text-sm">Link visited {selected.link_visited_at ? utcFull(selected.link_visited_at) : ''} UTC</span>
                  </div>
                )}

                <a href={`deepscreen://interview/${selected.room_id}`}
                  className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 ${focusRing}`}>
                  <HiOutlineComputerDesktop className="h-4 w-4" aria-hidden="true" />
                  Open in DeepScreen Desktop
                </a>
              </motion.dialog>
            </div>
          )}
        </>
      )}
    </div>
  );
}
