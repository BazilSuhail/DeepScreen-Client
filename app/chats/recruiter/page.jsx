'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import EmptyState from '@/components/dashboard/EmptyState';
import AuthGridBackground from '@/components/auth/AuthGridBackground';
import FormError from '@/components/auth/FormError';
import {
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineMagnifyingGlass,
  HiOutlineEllipsisVertical,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlineHome,
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineArrowLeft,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBellAlert,
  HiOutlineLightBulb,
  HiOutlineUser,
} from 'react-icons/hi2';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimeFull(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByDate(messages) {
  const groups = [];
  let currentDate = null;
  for (const msg of messages) {
    const dateKey = new Date(msg.timestamp).toDateString();
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ type: 'date', date: msg.timestamp });
    }
    groups.push({ type: 'message', message: msg });
  }
  return groups;
}

const initialsOf = (name) =>
  (name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

function RecruiterChatContent() {
  const { user } = useAuth();
  const router = useRouter();
  useSearchParams();
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
    if (!user || user.role !== 'RECRUITER') { router.push('/auth/login'); return; }
    (async () => { await loadJobs(); })();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [user, router]);

  const fetchApplications = async (job) => {
    setAppLoading(true);
    setError('');
    try {
      const response = await api.get('/chat_rooms/recruiter/applications/', {
        params: { job_id: job.job_id },
      });
      setApplications(response.applications || []);
      setSelectedJob(job);
      setSelectedCandidate(null);
      setMessages([]);
      activeRoomIdRef.current = null;
      if (pollingRef.current) clearInterval(pollingRef.current);
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
    activeRoomIdRef.current = candidate.application_id;
    fetchMessages(candidate);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => fetchMessages(candidate, false), 5000);
  };

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
    setMsgError('');

    try {
      const response = await api.post(`/chat_rooms/${selectedCandidate.application_id}/send/`, {
        content: optimisticMsg.content,
        message_type: 'text',
      });
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? response.message : m));
    } catch {
      setMsgError('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setMessageInput(optimisticMsg.content);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msg) => {
    if (!selectedCandidate) return;
    try {
      await api.post(`/chat_rooms/${selectedCandidate.application_id}/delete_message/`, {
        message_id: msg.id,
      });
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const retry = () => {
    if (retryJob) fetchApplications(retryJob);
    else fetchJobs();
  };

  const filteredJobs = jobs.filter(job =>
    job.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.role !== 'RECRUITER') return null;

  const initialLoading = loading && jobs.length === 0;
  if (initialLoading) return <PageSkeleton stats={0} />;

  const unreadTotal = applications.reduce((n, a) => n + (a.unread_count || 0), 0);
  const shortlistedTotal = jobs.reduce((n, j) => n + (j.shortlisted_count || 0), 0);
  const selectedJobTitle = selectedJob?.job_title || 'Untitled Job';

  return (
    <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 px-4 pb-8 pt-4 md:px-8">
      <DashboardBanner
        icon={HiOutlineChatBubbleLeftRight}
        title="Messages"
        subtitle={
          selectedJob
            ? `${applications.length} ${applications.length === 1 ? 'conversation' : 'conversations'} for ${selectedJobTitle} · ${unreadTotal} unread`
            : `${shortlistedTotal} shortlisted across ${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} · choose a job to open its conversations`
        }
        badge={unreadTotal > 0 ? { label: `${unreadTotal} unread`, icon: HiOutlineBellAlert } : undefined}
        footer={
          <span className="flex items-start gap-2">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>Keep replies specific to the role. Candidates reply faster when you say what happens next.</span>
          </span>
        }
      />

      {error && (
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <FormError title="Something went wrong" message={error} />
          </div>
          <button
            type="button"
            onClick={retry}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
            title="Try again"
          >
            <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      <div className="grid min-w-0 gap-4 lg:h-[640px] lg:grid-cols-[380px_minmax(0,1fr)]">
        <section
          className={`min-h-[60vh] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card lg:min-h-0 ${
            selectedCandidate ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <button
                onClick={() => router.push('/recruiter')}
                className="rounded-xl p-1.5 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                title="Dashboard"
              >
                <HiOutlineHome className="h-5 w-5" aria-hidden="true" />
              </button>
              <h2 className="truncate text-sm font-semibold">Conversations</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={fetchJobs}
                className="rounded-full p-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                title="Refresh"
              >
                <HiOutlineArrowPath className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                className="rounded-full p-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                title="Options"
              >
                <HiOutlineEllipsisVertical className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="border-b border-border/60 px-4 py-3">
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full rounded-xl bg-secondary py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scroll-smooth">
            {loading ? (
              <ListSkeleton rows={3} />
            ) : filteredJobs.length === 0 ? (
              error ? null : (
                <div className="p-4">
                  <EmptyState
                    icon={HiOutlineBriefcase}
                    title={searchQuery ? 'No jobs match your search' : 'No active jobs'}
                    text={searchQuery ? undefined : 'Post a job to start seeing applicant messages'}
                  />
                </div>
              )
            ) : (
              <div className="py-1">
                {filteredJobs.map((job) => {
                  const isOpen = selectedJob?.job_id === job.job_id;
                  return (
                    <div key={job.job_id} className="border-b border-border/40 last:border-b-0">
                      <button
                        onClick={() => fetchApplications(job)}
                        title={job.job_title || 'Untitled Job'}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60 ${
                          isOpen ? 'bg-secondary/60' : ''
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{job.job_title || 'Untitled Job'}</span>
                          <span className="block text-[11px] capitalize text-muted-foreground">{job.status || 'active'}</span>
                        </span>
                        <span
                          className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                          title={`${job.shortlisted_count || 0} shortlisted`}
                        >
                          <HiOutlineUserGroup className="h-3.5 w-3.5" aria-hidden="true" />
                          {job.shortlisted_count || 0}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pb-1">
                          {appLoading ? (
                            <ListSkeleton rows={3} />
                          ) : applications.length === 0 ? (
                            error ? null : (
                              <div className="p-4">
                                <EmptyState
                                  icon={HiOutlineUserGroup}
                                  title="No candidates yet"
                                  text="Shortlist applicants to start chatting"
                                />
                              </div>
                            )
                          ) : (
                            applications.map((app, i) => (
                              <ConversationRow
                                key={app.application_id}
                                app={app}
                                index={i}
                                active={selectedCandidate?.application_id === app.application_id}
                                jobTitle={selectedJobTitle}
                                onSelect={selectCandidate}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section
          className={`min-h-[60vh] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card lg:min-h-0 ${
            selectedCandidate ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedCandidate ? (
            <ChatView
              messages={messages}
              messagesLoading={messagesLoading}
              msgError={msgError}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sending={sending}
              handleSendMessage={handleSendMessage}
              handleDeleteMessage={handleDeleteMessage}
              messagesEndRef={messagesEndRef}
              userId={userId}
              otherUserName={selectedCandidate.candidate_name}
              otherUserSub={selectedCandidate.candidate_email}
              onBack={() => {
                setSelectedCandidate(null);
                activeRoomIdRef.current = null;
                if (pollingRef.current) clearInterval(pollingRef.current);
              }}
            />
          ) : (
            <DefaultPane />
          )}
        </section>
      </div>
    </div>
  );
}

export default function RecruiterChatPage() {
  return (
    <Suspense fallback={<PageSkeleton stats={0} />}>
      <RecruiterChatContent />
    </Suspense>
  );
}

function DefaultPane() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
      <AuthGridBackground animated />
      <div className="relative z-10 px-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
          <HiOutlineChatBubbleLeftRight className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="text-base font-semibold">No conversation open</h3>
        <p className="mt-1 text-sm text-muted-foreground">Pick a candidate to start the conversation.</p>
      </div>
    </div>
  );
}

function ListSkeleton({ rows = 3 }) {
  return (
    <div role="status" aria-busy="true" className="space-y-1 p-3">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-secondary" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversationRow({ app, index, active, jobTitle, onSelect }) {
  const name = app.candidate_name || 'Unknown candidate';
  const unread = app.unread_count || 0;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSelect(app)}
      title={`${name} · ${jobTitle}`}
      className={`relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60 ${
        active ? 'bg-emerald-500/10' : ''
      }`}
    >
      {active && (
        <motion.span
          layoutId="recruiter-chat-active"
          className="absolute inset-y-2 left-0 w-1 rounded-full bg-emerald-500"
          aria-hidden="true"
        />
      )}
      <span className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        {initialsOf(name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {app.last_message_time ? formatTime(app.last_message_time) : ''}
          </span>
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{jobTitle}</span>
        </span>
        {app.last_message && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground/70">{app.last_message}</span>
        )}
      </span>
      {unread > 0 && (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
          title={`${unread} unread`}
          aria-label={`${unread} unread`}
        />
      )}
    </motion.button>
  );
}

function ChatView({
  messages,
  messagesLoading,
  msgError,
  messageInput,
  setMessageInput,
  sending,
  handleSendMessage,
  handleDeleteMessage,
  messagesEndRef,
  userId,
  otherUserName,
  otherUserSub,
  onBack,
}) {
  const groupedItems = groupByDate(messages);
  const otherInitial = initialsOf(otherUserName);

  return (
    <>
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={onBack}
          className="rounded-xl p-1.5 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground lg:hidden"
          title="Back to conversations"
        >
          <HiOutlineArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {otherInitial}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{otherUserName || 'Unknown'}</h2>
          <p className="truncate text-[11px] text-muted-foreground">{otherUserSub}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scroll-smooth px-4 py-4 md:px-6">
        {msgError && <FormError title="Message problem" message={msgError} />}
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={HiOutlineChatBubbleLeftRight}
            title="No messages yet"
            text="Send a message to start the conversation."
          />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
            {groupedItems.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} className="my-3 flex justify-center">
                    <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      {formatDateLabel(item.date)}
                    </span>
                  </div>
                );
              }
              const msg = item.message;
              const currentUserId = String(userId || '');
              const msgSenderId = String(msg.sender_id || '');
              const currentUserIsMe = currentUserId === msgSenderId;

              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={currentUserIsMe}
                  otherInitial={otherInitial}
                  onDelete={handleDeleteMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-3 md:px-6">
        <form onSubmit={handleSendMessage} className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            rows={1}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message"
            disabled={sending}
            aria-label="Message"
            className="max-h-40 min-w-0 flex-1 resize-none rounded-2xl bg-secondary px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={sending || !messageInput.trim()}
            title="Send message"
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:bg-emerald-600/50"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            ) : (
              <HiOutlinePaperAirplane className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-[11px] text-muted-foreground/70">
          Enter to send · Shift+Enter for a new line
        </p>
      </footer>
    </>
  );
}

function MessageBubble({ msg, isMe, otherInitial, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          isMe ? 'bg-emerald-600 text-white' : 'bg-secondary text-muted-foreground'
        }`}
      >
        {isMe ? <HiOutlineUser className="h-3.5 w-3.5" /> : otherInitial}
      </span>
      <div
        className={`group relative flex max-w-[78%] flex-col md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'} ${
          msg.isOptimistic ? 'opacity-70' : ''
        }`}
      >
        <div
          className={`px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            isMe
              ? 'rounded-2xl rounded-br-md bg-emerald-600 text-white'
              : 'rounded-2xl rounded-bl-md border border-border/60 bg-secondary/50 text-foreground'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
          <span>{formatTimeFull(msg.timestamp)}</span>
          {isMe && msg.isOptimistic && (
            <span title="Sending"><HiOutlineCheck className="h-3.5 w-3.5 opacity-60" aria-hidden="true" /></span>
          )}
        </div>
        {isMe && (
          <button
            onClick={() => onDelete(msg)}
            className="absolute -left-9 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground transition-all hover:text-red-500 lg:opacity-0 lg:group-hover:opacity-100"
            title="Delete message"
            aria-label="Delete message"
          >
            <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
