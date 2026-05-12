'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import {
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineClock,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineXMark,
  HiOutlineInformationCircle,
  HiOutlineCamera,
  HiOutlineMicrophone,
  HiOutlineComputerDesktop,
  HiOutlineDocumentText,
  HiOutlineLink,
} from 'react-icons/hi2';

export default function CandidateInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const data = await api.get('/interviews/candidate/');
      setInterviews(data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const isUpcoming = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) > new Date();
  };

  const upcoming = interviews.filter(i => isUpcoming(i.scheduled_at));
  const past = interviews.filter(i => !isUpcoming(i.scheduled_at));

  if (loading) return (
    <div className="space-y-6 px-12">
      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
      <div className="grid grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-[2rem] animate-pulse" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 px-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-semibold">Interviews</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
          <HiOutlineVideoCamera className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Interviews</h1>
          <p className="text-muted-foreground mt-1">Prepare for your live technical sessions with top companies</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Interviews', value: interviews.length, icon: HiOutlineVideoCamera, color: 'from-rose-500/10 to-rose-600/5 text-rose-500' },
          { label: 'Upcoming', value: upcoming.length, icon: HiOutlineCalendar, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500' },
          { label: 'Past', value: past.length, icon: HiOutlineClock, color: 'from-muted-foreground/30 to-muted-foreground/10 text-muted-foreground' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {interviews.length === 0 ? (
        <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
          <HiOutlineCalendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h2 className="text-xl font-bold text-foreground mb-2">No interviews yet</h2>
          <p className="text-muted-foreground">Keep applying! Your scheduled live sessions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Upcoming ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcoming.map((session, index) => (
                  <motion.div key={session.room_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                    onClick={() => setSelected(session)}
                    className="bg-card border border-border rounded-[2rem] hover:border-emerald-500/30 transition-all group flex flex-col cursor-pointer"
                  >
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 flex items-center justify-center text-emerald-500">
                          <HiOutlineVideoCamera className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                          {session.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground mb-4 group-hover:text-emerald-500 transition-colors">
                        {session.job_application_details?.job_details?.job_title || session.title || 'Technical Interview'}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <HiOutlineBuildingOffice2 className="w-4 h-4 shrink-0" />
                          <span className="text-sm">{session.job_application_details?.job_details?.organization_details?.name || 'Hiring Company'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                          <span className="text-sm">{session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <HiOutlineClock className="w-4 h-4 shrink-0" />
                          <span className="text-sm">{session.scheduled_at ? new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground/60 flex items-center gap-2">
                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                Past ({past.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {past.map((session, index) => (
                  <motion.div key={session.room_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                    onClick={() => setSelected(session)}
                    className="bg-card border border-border rounded-[2rem] opacity-70 hover:opacity-100 transition-all group flex flex-col cursor-pointer"
                  >
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-secondary flex items-center justify-center text-muted-foreground">
                          <HiOutlineVideoCamera className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest border border-border">
                          {session.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground mb-4">
                        {session.job_application_details?.job_details?.job_title || session.title || 'Technical Interview'}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <HiOutlineBuildingOffice2 className="w-4 h-4 shrink-0" />
                          <span className="text-sm">{session.job_application_details?.job_details?.organization_details?.name || 'Hiring Company'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                          <span className="text-sm">{session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : 'Date TBD'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="relative bg-card border border-border rounded-[2rem] p-8 max-w-lg w-full shadow-2xl"
          >
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
              <HiOutlineXMark className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-5">
              <HiOutlineVideoCamera className="w-7 h-7" />
            </div>

            <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest border border-rose-500/20 mb-3 inline-block">
              {selected.status}
            </span>

            <h2 className="text-2xl font-bold text-foreground mb-4">
              {selected.job_application_details?.job_details?.job_title || selected.title || 'Technical Interview'}
            </h2>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <HiOutlineBuildingOffice2 className="w-4 h-4 shrink-0" />
                <span className="text-sm">{selected.job_application_details?.job_details?.organization_details?.name || 'Hiring Company'}</span>
              </div>
              {selected.scheduled_at && (
                <>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{new Date(selected.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <HiOutlineClock className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{new Date(selected.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </>
              )}
              {selected.created_at && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HiOutlineInformationCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Created: {new Date(selected.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {selected.started_at && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HiOutlineClock className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Started: {new Date(selected.started_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {selected.ended_at && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Ended: {new Date(selected.ended_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

            {selected.candidate_instructions && (
              <div className="p-4 rounded-xl bg-muted border border-border mb-6">
                <div className="flex items-center gap-2 mb-2 text-rose-500">
                  <HiOutlineDocumentText className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Instructions</span>
                </div>
                <p className="text-sm text-muted-foreground">{selected.candidate_instructions}</p>
              </div>
            )}

            {(selected.camera_required !== undefined || selected.mic_required !== undefined || selected.screen_share_enabled !== undefined) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selected.camera_required !== undefined && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${selected.camera_required ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                    <HiOutlineCamera className="w-3.5 h-3.5" /> {selected.camera_required ? 'Camera On' : 'Camera Off'}
                  </span>
                )}
                {selected.mic_required !== undefined && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${selected.mic_required ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                    <HiOutlineMicrophone className="w-3.5 h-3.5" /> {selected.mic_required ? 'Mic On' : 'Mic Off'}
                  </span>
                )}
                {selected.screen_share_enabled !== undefined && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${selected.screen_share_enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                    <HiOutlineComputerDesktop className="w-3.5 h-3.5" /> {selected.screen_share_enabled ? 'Screen Share On' : 'Screen Share Off'}
                  </span>
                )}
              </div>
            )}

            {selected.link_expires_at && (
              <div className="flex items-center gap-3 text-muted-foreground mb-6">
                <HiOutlineLink className="w-4 h-4 shrink-0" />
                <span className="text-sm">Link expires: {new Date(selected.link_expires_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}

            {selected.link_visited && (
              <div className="flex items-center gap-3 text-muted-foreground mb-6">
                <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">Link visited {selected.link_visited_at ? new Date(selected.link_visited_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
            )}

            <a href={`deepscreen://interview/${selected.room_id}`}
              className="block w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm text-center transition-all shadow-lg shadow-rose-600/20">
              Open in DeepScreen Desktop
            </a>
          </motion.div>
        </div>
      )}
    </div>
  );
}
