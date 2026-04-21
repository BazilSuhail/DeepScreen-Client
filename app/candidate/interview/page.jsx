'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineClock,
  HiOutlineInformationCircle,
  HiOutlineArrowRight,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2';
import Link from 'next/link';

export default function CandidateInterviewPage() {
  const [interviews, setInterviews] = useState([]);
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

  return (
    <div className="w-full px-4 md:px-6">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <HiOutlineVideoCamera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Interviews</h1>
              <p className="text-muted-foreground mt-0.5">
                Prepare for your live technical sessions with top companies.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {interviews.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full py-20 glass rounded-3xl border border-border text-center"
                >
                  <HiOutlineCalendar className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-20" />
                  <h3 className="text-2xl font-bold mb-2">No interviews yet</h3>
                  <p className="text-muted-foreground">
                    Keep applying! Your scheduled live sessions will appear here.
                  </p>
                </motion.div>
              ) : (
                interviews.map((session, index) => (
                  <motion.div
                    key={session.room_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group glass rounded-2xl border border-border hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5 flex flex-col"
                  >
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-5">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                          <HiOutlineVideoCamera className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            isUpcoming(session.scheduled_at)
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-4 group-hover:text-emerald-500 transition-colors">
                        {session.job_application_details?.job_details?.job_title || session.title || 'Technical Interview'}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <HiOutlineBuildingOffice2 className="w-4 h-4 shrink-0" />
                          <span className="text-sm">
                            {session.job_application_details?.job_details?.organization_details?.name || 'Hiring Company'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                          <span className="text-sm">
                            {session.scheduled_at
                              ? new Date(session.scheduled_at).toLocaleDateString(undefined, {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Date TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <HiOutlineClock className="w-4 h-4 shrink-0" />
                          <span className="text-sm">
                            {session.scheduled_at
                              ? new Date(session.scheduled_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Time TBD'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-5 border-t border-border">
                        {session.access_token ? (
                          <Link
                            href={`/interview/join/${session.access_token}`}
                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                          >
                            Join Interview
                            <HiOutlineArrowRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <div className="w-full py-3 bg-amber-500/10 text-amber-500 font-semibold rounded-xl flex items-center justify-center gap-2 border border-amber-500/20 text-sm">
                            <HiOutlineInformationCircle className="w-4 h-4" />
                            Waiting for Schedule
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
    
    </div>
  );
}
