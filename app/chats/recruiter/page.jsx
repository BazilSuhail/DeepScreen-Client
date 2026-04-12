'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineMagnifyingGlass,
  HiOutlineEllipsisVertical,
  HiOutlinePaperAirplane,
  HiOutlineTrash,   
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineInformationCircle,
  HiOutlineHome,
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronLeft,
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

function RecruiterChatContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = user?.user_id;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior }), 50);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'RECRUITER') { router.push('/auth/login'); return; }
    fetchJobs();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/chat_rooms/recruiter/jobs/');
      setJobs(response.jobs || []);
    } catch {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

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
    } catch {
      setError('Failed to load applications');
    } finally {
      setAppLoading(false);
    }
  };

  const fetchMessages = async (candidate, showLoader = true) => {
    if (showLoader) setMessagesLoading(true);
    setMsgError('');
    try {
      const response = await api.get(`/chat_rooms/${candidate.application_id}/messages/`);
      setMessages(response.messages || []);
      scrollToBottom('auto');
    } catch {
      setMsgError('Failed to load messages');
    } finally {
      if (showLoader) setMessagesLoading(false);
    }
  };

  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setMessages([]);
    setMsgError('');
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

  const filteredJobs = jobs.filter(job =>
    job.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.role !== 'RECRUITER') return null;

  return (
    <div className="hidden lg:flex h-screen bg-background">
      <aside className="w-[380px] min-w-[380px] bg-background border-r border-border flex flex-col">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/recruiter')}
              className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              title="Dashboard"
            >
              <HiOutlineHome className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Recruitment</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={fetchJobs} className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" title="Refresh">
              <HiOutlineArrowPath className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" title="Options">
              <HiOutlineEllipsisVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-muted-foreground text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          {loading ? (
            <div className="p-4 space-y-1">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-[50px] h-[50px] rounded-full bg-secondary shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-secondary rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <HiOutlineBriefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                {searchQuery ? 'No jobs match your search' : 'No active jobs'}
              </p>
              {!searchQuery && (
                <p className="text-muted-foreground/60 text-xs mt-1">Post a job to start seeing applicant messages</p>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {filteredJobs.map(job => (
                <motion.button
                  key={job.job_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => fetchApplications(job)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/80 transition-all text-left border-b border-border/40 ${
                    selectedJob?.job_id === job.job_id
                      ? 'bg-secondary !border-l-4 !border-l-emerald-500'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="w-[50px] h-[50px] min-w-[50px] rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
                    <HiOutlineBriefcase className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm truncate">{job.job_title || 'Untitled Job'}</h3>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2 font-medium">
                        {job.shortlisted_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <HiOutlineUserGroup className="w-3.5 h-3.5 text-emerald-600/70" />
                      <span className="text-xs text-emerald-600/70 font-medium">
                        {job.shortlisted_count || 0} shortlisted
                      </span>
                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold ml-auto">
                        {job.status || 'active'}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a]">
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
              if (pollingRef.current) clearInterval(pollingRef.current);
            }}
          />
        ) : selectedJob ? (
          <CandidateListView
            applications={applications}
            appLoading={appLoading}
            selectedCandidate={selectedCandidate}
            selectCandidate={selectCandidate}
            onBack={() => {
              setSelectedJob(null);
              setApplications([]);
            }}
            jobTitle={selectedJob.job_title}
          />
        ) : (
          <DefaultView />
        )}
      </main>
    </div>
  );
}

export default function RecruiterChatPage() {
  return (
    <Suspense fallback={
      <div className="hidden lg:flex h-screen bg-background items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    }>
      <RecruiterChatContent />
    </Suspense>
  );
}

function DefaultView() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30">
      <div className="text-center px-8">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
          <HiOutlineBriefcase className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Recruitment Inbox</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          Select a job from the sidebar to view shortlisted candidates and start conversations.
        </p>
      </div>
    </div>
  );
}

function CandidateListView({ applications, appLoading, selectedCandidate, selectCandidate, onBack, jobTitle }) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
          title="Back to jobs"
        >
          <HiOutlineChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold">{jobTitle || 'Candidates'}</h2>
          <p className="text-[11px] text-emerald-600 font-medium">{applications.length} shortlisted</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-smooth bg-background">
        {appLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <HiOutlineUserGroup className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No candidates yet</h3>
            <p className="text-xs text-muted-foreground mt-1">Shortlist applicants to start chatting</p>
          </div>
        ) : (
          <div className="py-2">
            {applications.map(app => (
              <button
                key={app.application_id}
                onClick={() => selectCandidate(app)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/80 transition-all text-left border-b border-border/40 ${
                  selectedCandidate?.application_id === app.application_id
                    ? 'bg-secondary !border-l-4 !border-l-emerald-500'
                    : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="w-[50px] h-[50px] min-w-[50px] rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {app.candidate_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate">{app.candidate_name}</h3>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2 font-medium">
                      {app.last_message_time ? formatTime(app.last_message_time) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{app.candidate_email}</p>
                  {app.last_message && (
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{app.last_message}</p>
                  )}
                </div>
                {app.unread_count > 0 && (
                  <div className="w-[20px] h-[20px] min-w-[20px] rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {app.unread_count > 9 ? '9+' : app.unread_count}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
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

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all lg:hidden"
            title="Back"
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-[42px] h-[42px] min-w-[42px] rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-sm">
            {otherUserName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate">{otherUserName || 'Unknown'}</h2>
            <p className="text-[11px] text-muted-foreground truncate">{otherUserSub}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" title="Voice call">
            <HiOutlinePhone className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" title="Video call">
            <HiOutlineVideoCamera className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" title="Contact info">
            <HiOutlineInformationCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth">
        {msgError && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 text-red-500 text-xs border border-red-500/20">
            <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" />
            {msgError}
          </div>
        )}
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center mb-4 shadow-sm">
              <HiOutlineChatBubbleLeftRight className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No messages yet</h3>
            <p className="text-xs text-muted-foreground mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 max-w-3xl mx-auto">
            {groupedItems.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} className="flex justify-center my-3">
                    <span className="text-[11px] font-medium bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-muted-foreground">
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
                  onDelete={handleDeleteMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="bg-background/95 backdrop-blur-sm border-t border-border px-5 py-3 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message"
              disabled={sending}
              className="w-full pl-5 pr-14 py-3 rounded-full bg-secondary focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-muted-foreground text-sm disabled:opacity-50"
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
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-full transition-all flex items-center justify-center shadow-sm shadow-emerald-600/20"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <HiOutlinePaperAirplane className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </footer>
    </>
  );
}

function MessageBubble({ msg, isMe, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`group relative max-w-[75%] md:max-w-[65%] ${msg.isOptimistic ? 'opacity-70' : ''}`}>
        <div
          className={`px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            isMe
              ? 'bg-emerald-600 text-white rounded-[8px] rounded-br-[4px]'
              : 'bg-background text-foreground rounded-[8px] rounded-bl-[4px] border border-border/50'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMe ? 'text-emerald-200' : 'text-muted-foreground'}`}>
            <span className="text-[10px] leading-none">{formatTimeFull(msg.timestamp)}</span>
            {isMe && <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-300" />}
          </div>
        </div>
        {isMe && (
          <button
            onClick={() => onDelete(msg)}
            className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all"
            title="Delete message"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
