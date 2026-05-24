'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { api } from '@/utils/api';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import ChatSkeleton, { ChatListSkeleton } from '@/components/skeletons/chats/ChatSkeleton';
import { base } from '@/constants/motion';
import { badge, focusRing, iconTile, secondaryButton } from '@/components/ui/styles';
import {
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBellAlert,
  HiOutlineChevronDown,
  HiOutlineEnvelope,
} from 'react-icons/hi2';
import { ChatView, ConversationRow, EmptyPane, markThreadRead, paneClass } from '../_components/ChatParts';

function RecruiterChatContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAppId = searchParams?.get('id');
  const initialJobId = searchParams?.get('job_id');
  const userId = user?.user_id;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryJob, setRetryJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [msgError, setMsgError] = useState('');
  const [actionError, setActionError] = useState('');
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);
  const activeRoomIdRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior }), 50);
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get('/chat_rooms/recruiter/jobs/');
      setJobs(response.jobs || []);
    } catch {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Resets the error and loading state, then reloads the job list (used by Refresh and Retry).
  const fetchJobs = () => {
    setLoading(true);
    setError('');
    setRetryJob(null);
    loadJobs();
  };

  useEffect(() => {
    // Wait for auth to resolve; a null user while loading is not "signed out".
    if (authLoading) return;
    if (!user || user.role !== 'RECRUITER') { router.push('/auth/login'); return; }
    (async () => { await loadJobs(); })();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [user, authLoading, router]);

  const fetchApplications = async (job) => {
    setAppLoading(true);
    setError('');
    try {
      const response = await api.get('/chat_rooms/recruiter/applications/', {
        params: { job_id: job.job_id },
      });
      const apps = response.applications || [];
      setApplications(apps);
      setSelectedJob(job);
      setSelectedCandidate(null);
      setMessages([]);
      activeRoomIdRef.current = null;
      if (pollingRef.current) clearInterval(pollingRef.current);
      return apps;
    } catch {
      setError('Failed to load applications');
      setRetryJob(job);
    } finally {
      setAppLoading(false);
    }
  };

  const fetchMessages = async (candidate, showLoader = true) => {
    if (showLoader) setMessagesLoading(true);
    setMsgError('');
    try {
      const response = await api.get(`/chat_rooms/${candidate.application_id}/messages/`);
      // Ignore responses for a conversation that is no longer selected
      if (activeRoomIdRef.current !== candidate.application_id) return;
      setMessages(response.messages || []);
      scrollToBottom('auto');
      // Clear this conversation's badge locally, then tell the server.
      setApplications((prev) => prev.map((x) => (x.application_id === candidate.application_id ? { ...x, unread_count: 0 } : x)));
      markThreadRead(candidate.application_id, response.messages || [], userId);
    } catch {
      if (activeRoomIdRef.current !== candidate.application_id) return;
      setMsgError('Failed to load messages');
    } finally {
      if (showLoader && activeRoomIdRef.current === candidate.application_id) setMessagesLoading(false);
    }
  };

  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setMessages([]);
    setMsgError('');
    setActionError('');
    activeRoomIdRef.current = candidate.application_id;
    fetchMessages(candidate);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => fetchMessages(candidate, false), 5000);
  };

  // Latest handlers, so the deep-link effect below can call them without re-running on every render
  const deepLinkRef = useRef({ fetchApplications, selectCandidate, done: false });
  useEffect(() => { Object.assign(deepLinkRef.current, { fetchApplications, selectCandidate }); });

  // Deep link ?job_id=[&id=<application_id>]: open the job, then the conversation. Rooms are keyed by
  // application_id and the server can't map one to its job, so callers must pass job_id.
  useEffect(() => {
    const link = deepLinkRef.current;
    if (link.done || loading || !initialJobId) return;
    link.done = true;
    const job = jobs.find(j => String(j.job_id) === initialJobId);
    if (!job) return;
    (async () => {
      const apps = await link.fetchApplications(job);
      const match = initialAppId && apps?.find(a => String(a.application_id) === initialAppId);
      if (match) link.selectCandidate(match);
    })();
  }, [loading, jobs, initialAppId, initialJobId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending || !selectedCandidate) return;

    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      sender_id: userId,
      content: messageInput,
      timestamp: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setMessageInput('');
    setSending(true);
    setActionError('');

    try {
      const response = await api.post(`/chat_rooms/${selectedCandidate.application_id}/send/`, {
        content: optimisticMsg.content,
        message_type: 'text',
      });
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? response.message : m));
    } catch {
      setActionError('Message not sent. Your text is back in the box, press Send to try again.');
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setMessageInput(optimisticMsg.content);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msg) => {
    if (!selectedCandidate) return;
    setActionError('');
    try {
      await api.post(`/chat_rooms/${selectedCandidate.application_id}/delete_message/`, {
        message_id: msg.id,
      });
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    } catch (err) {
      console.error('Delete failed', err);
      setActionError('Could not delete that message. Try again.');
    }
  };

  const retry = () => {
    if (retryJob) fetchApplications(retryJob);
    else fetchJobs();
  };

  const filteredJobs = jobs.filter(job =>
    job.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !user || user.role !== 'RECRUITER') return <ChatSkeleton />;

  const initialLoading = loading && jobs.length === 0;
  if (initialLoading) return <ChatSkeleton />;

  const unreadTotal = applications.reduce((n, a) => n + (a.unread_count || 0), 0);
  const shortlistedTotal = jobs.reduce((n, j) => n + (j.shortlisted_count || 0), 0);
  const selectedJobTitle = selectedJob?.job_title || 'Untitled job';

  return (
    <div className="flex h-dvh min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 lg:gap-6 lg:px-8 lg:py-6 2xl:px-10">
      <PageHeader
        className={selectedCandidate ? 'hidden lg:block' : ''}
        back={{ href: '/recruiter', label: 'Dashboard' }}
        icon={HiOutlineChatBubbleLeftRight}
        eyebrow="Messages"
        title="Candidate conversations"
        description="Keep replies specific to the role. Candidates reply faster when you say what happens next."
        meta={
          <>
            <span className={`${badge} bg-muted text-muted-foreground`}>
              <HiOutlineUserGroup className="h-3.5 w-3.5" aria-hidden="true" />
              {shortlistedTotal} shortlisted across {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
            </span>
            {selectedJob && (
              <span className={`${badge} bg-muted text-muted-foreground`}>
                <HiOutlineChatBubbleLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                {applications.length} {applications.length === 1 ? 'conversation' : 'conversations'} for {selectedJobTitle}
              </span>
            )}
            {unreadTotal > 0 && (
              <span className={`${badge} bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
                <HiOutlineBellAlert className="h-3.5 w-3.5" aria-hidden="true" />
                {unreadTotal} unread
              </span>
            )}
          </>
        }
        actions={
          <button type="button" onClick={fetchJobs} disabled={loading} className={secondaryButton}>
            <HiOutlineArrowPath className={`h-4 w-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      {error && (
        <div className={selectedCandidate ? 'hidden lg:block' : ''}>
          <ErrorState title="Something went wrong" message={error} onRetry={retry} />
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 gap-4">
        {/* Jobs, each expanding to its candidate conversations */}
        <section aria-label="Conversations" className={`${paneClass} ${selectedCandidate ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 lg:flex-none`}>
          <div className="shrink-0 border-b border-border p-3">
            <label className="relative block">
              <span className="sr-only">Search jobs</span>
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs"
                className="min-h-11 w-full rounded-md border border-emerald-100 bg-muted/40 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-emerald-500 dark:border-white/10"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <ChatListSkeleton rows={4} />
            ) : filteredJobs.length === 0 ? (
              error ? null : (
                <div className="p-3">
                  <EmptyState
                    icon={HiOutlineBriefcase}
                    title={searchQuery ? 'No jobs match your search' : 'No active jobs'}
                    text={searchQuery ? undefined : 'Post a job to start seeing applicant messages.'}
                  />
                </div>
              )
            ) : (
              filteredJobs.map((job) => {
                const isOpen = selectedJob?.job_id === job.job_id;
                return (
                  <div key={job.job_id} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => fetchApplications(job)}
                      aria-expanded={isOpen}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${focusRing} focus-visible:ring-inset focus-visible:ring-offset-0 ${
                        isOpen ? 'bg-muted/60' : ''
                      }`}
                    >
                      <span className={`${iconTile} h-9 w-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                        <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{job.job_title || 'Untitled job'}</span>
                        <span className="block text-xs capitalize text-muted-foreground">{job.status || '—'}</span>
                      </span>
                      <span className={`${badge} bg-muted text-muted-foreground`} title={`${job.shortlisted_count || 0} shortlisted`}>
                        <HiOutlineUserGroup className="h-3.5 w-3.5" aria-hidden="true" />
                        {job.shortlisted_count || 0}
                      </span>
                      <HiOutlineChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-[rotate] duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="apps"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={base}
                          className="overflow-hidden border-t border-border bg-muted/20"
                        >
                          {appLoading ? (
                            <ChatListSkeleton rows={2} />
                          ) : applications.length === 0 ? (
                            error ? null : (
                              <p className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
                                <HiOutlineUserGroup className="h-4 w-4 shrink-0" aria-hidden="true" />
                                No candidates yet. Shortlist applicants to start chatting.
                              </p>
                            )
                          ) : (
                            applications.map((app) => (
                              <ConversationRow
                                key={app.application_id}
                                name={app.candidate_name}
                                subtitle={selectedJobTitle}
                                subtitleIcon={HiOutlineBriefcase}
                                unread={app.unread_count || 0}
                                active={selectedCandidate?.application_id === app.application_id}
                                layoutId="recruiter-chat-active"
                                onSelect={() => selectCandidate(app)}
                              />
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section aria-label="Conversation" className={`${paneClass} ${selectedCandidate ? 'flex' : 'hidden lg:flex'} flex-1`}>
          {selectedCandidate ? (
            <ChatView
              messages={messages}
              messagesLoading={messagesLoading}
              msgError={msgError}
              actionError={actionError}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sending={sending}
              handleSendMessage={handleSendMessage}
              handleDeleteMessage={handleDeleteMessage}
              messagesEndRef={messagesEndRef}
              userId={userId}
              otherUserName={selectedCandidate.candidate_name}
              otherUserSub={selectedCandidate.candidate_email}
              otherUserSubIcon={HiOutlineEnvelope}
              onRetryMessages={() => fetchMessages(selectedCandidate)}
              onBack={() => {
                setSelectedCandidate(null);
                activeRoomIdRef.current = null;
                if (pollingRef.current) clearInterval(pollingRef.current);
              }}
            />
          ) : (
            <EmptyPane title="No conversation open" text="Choose a job, then a candidate, to start the conversation." />
          )}
        </section>
      </div>
    </div>
  );
}

export default function RecruiterChatPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <RecruiterChatContent />
    </Suspense>
  );
}
