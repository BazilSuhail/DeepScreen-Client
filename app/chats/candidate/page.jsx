'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { api } from '@/utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import AuthGridBackground from '@/components/auth/AuthGridBackground';
import FormError from '@/components/auth/FormError';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineEllipsisVertical,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlineHome,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
  HiOutlineArrowLeft,
  HiOutlineBriefcase,
  HiOutlineUserCircle,
} from 'react-icons/hi2';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return 'Today';
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

const initials = (name) =>
  (name || '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

const retryClass =
  'inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-500 transition-colors hover:bg-emerald-500/20';

function Avatar({ name, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/15 font-semibold text-emerald-500 ${className}`}
    >
      {initials(name)}
    </span>
  );
}

function CandidateChatContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = user?.user_id;

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [msgError, setMsgError] = useState('');
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);
  const activeRoomIdRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 50);
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/chat_rooms/candidate/rooms/');
      setRooms(response.rooms || []);
    } catch {
      setError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (room, showLoader = true) => {
    if (showLoader) setMessagesLoading(true);
    setMsgError('');
    try {
      const response = await api.get(`/chat_rooms/${room.application_id}/messages/`);
      // Ignore responses for a conversation that is no longer selected
      if (activeRoomIdRef.current !== room.application_id) return;
      setMessages(response.messages || []);
      scrollToBottom('auto');
    } catch {
      if (activeRoomIdRef.current !== room.application_id) return;
      setMsgError('Failed to load messages');
    } finally {
      if (showLoader && activeRoomIdRef.current === room.application_id) setMessagesLoading(false);
    }
  };

  const selectRoom = (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setMsgError('');
    activeRoomIdRef.current = room.application_id;
    fetchMessages(room);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => fetchMessages(room, false), 5000);
  };

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    // Load the conversation list on mount. The request is async, so state is only set once it resolves.
    let active = true;
    const loadRooms = async () => {
      try {
        const response = await api.get('/chat_rooms/candidate/rooms/');
        if (active) setRooms(response.rooms || []);
      } catch {
        if (active) setError('Failed to load chat rooms');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadRooms();
    return () => {
      active = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [user]);

  const initialRoomId = searchParams?.get('id');
  useEffect(() => {
    if (!initialRoomId || rooms.length === 0 || selectedRoom) return;
    const match = rooms.find(r => String(r.application_id) === initialRoomId);
    if (!match) return;
    // Deep link from ?id=: select the room once rooms arrive. Deferred so the state update is not synchronous in the effect.
    const timer = setTimeout(() => selectRoom(match), 0);
    return () => clearTimeout(timer);
  }, [rooms, initialRoomId, selectedRoom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending || !selectedRoom) return;

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
      const response = await api.post(`/chat_rooms/${selectedRoom.application_id}/send/`, {
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
    if (!selectedRoom) return;
    try {
      await api.post(`/chat_rooms/${selectedRoom.application_id}/delete_message/`, {
        message_id: msg.id,
      });
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.recruiter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = rooms.reduce((sum, room) => sum + (Number(room.unread_count) || 0), 0);

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 px-4 pb-16 md:px-6 lg:px-8">
      <DashboardBanner
        icon={HiOutlineChatBubbleLeftRight}
        badge={unreadCount > 0 ? { label: `${unreadCount} unread`, icon: HiOutlineChatBubbleOvalLeft } : undefined}
        title="Messages"
        subtitle={
          loading
            ? 'Loading your conversations...'
            : `${rooms.length} ${rooms.length === 1 ? 'conversation' : 'conversations'} · ${unreadCount} unread`
        }
        footer="Replies from recruiters appear here. Keep your answers short and specific."
      />

      <div className="flex min-h-[480px] min-w-0 flex-1 flex-col gap-4 h-[calc(100dvh-15rem)] lg:h-[calc(100dvh-19rem)] lg:min-h-[520px] lg:flex-row">
        {/* Conversation list */}
        <section
          className={`${selectedRoom ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card lg:w-[360px] lg:flex-none`}
        >
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <HiOutlineChatBubbleLeftRight className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
              <h2 className="truncate text-sm font-semibold">Conversations</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => router.push('/candidate')}
                className="rounded-full p-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                title="Dashboard"
                aria-label="Dashboard"
              >
                <HiOutlineHome className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={fetchRooms}
                className="rounded-full p-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                title="Refresh"
                aria-label="Refresh"
              >
                <HiOutlineArrowPath className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="rounded-full p-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                title="Options"
                aria-label="Options"
              >
                <HiOutlineEllipsisVertical className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="shrink-0 border-b border-border p-3">
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="w-full rounded-xl bg-secondary py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth">
            {error && (
              <div className="p-4">
                <FormError title="Could not load conversations" message={error} />
                <button type="button" onClick={fetchRooms} className={retryClass}>
                  <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-1 p-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRooms.length === 0 && !error ? (
              <div className="relative flex min-h-[280px] flex-1 items-center justify-center overflow-hidden">
                <AuthGridBackground animated />
                <div className="relative z-10 px-8 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                    <HiOutlineChatBubbleLeftRight className="h-7 w-7 text-emerald-500" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-sm font-semibold">
                    {searchQuery ? 'No chats match your search' : 'No active chats'}
                  </p>
                  {!searchQuery && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      When you&apos;re shortlisted, conversations appear here
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {filteredRooms.map((room, index) => {
                  const active = selectedRoom?.application_id === room.application_id;
                  const unread = Number(room.unread_count) || 0;
                  const name = room.recruiter_name || 'Unknown';
                  return (
                    <motion.button
                      key={room.application_id}
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => selectRoom(room)}
                      title={`${name} · ${room.job_title || 'No job title'}`}
                      className={`relative flex w-full items-center gap-3 border-b border-border/40 px-4 py-3.5 text-left transition-colors hover:bg-secondary/80 ${
                        active ? 'bg-secondary' : ''
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="candidate-chat-active"
                          className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-emerald-500"
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                        />
                      )}
                      <Avatar name={name} className="h-11 w-11 text-sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-semibold">{name}</h3>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {room.last_message_time ? formatTime(room.last_message_time) : ''}
                          </span>
                        </div>
                        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] font-semibold text-emerald-500">
                          <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{room.job_title}</span>
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {room.last_message || (room.chat_room_exists ? 'Continue conversation' : 'Send your first message')}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span
                          title={`${unread} unread`}
                          aria-label={`${unread} unread`}
                          className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Thread */}
        <section
          className={`${selectedRoom ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card`}
        >
          {selectedRoom ? (
            <ChatView
              room={selectedRoom}
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
              otherUserName={selectedRoom.recruiter_name}
              otherUserJob={selectedRoom.job_title}
              onRetryMessages={() => fetchMessages(selectedRoom)}
              onBack={() => {
                setSelectedRoom(null);
                activeRoomIdRef.current = null;
                if (pollingRef.current) clearInterval(pollingRef.current);
              }}
            />
          ) : (
            <DefaultView />
          )}
        </section>
      </div>
    </div>
  );
}

export default function CandidateChatPage() {
  return (
    <Suspense fallback={<PageSkeleton stats={0} cards={2} />}>
      <CandidateChatContent />
    </Suspense>
  );
}

function DefaultView() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
      <AuthGridBackground animated />
      <div className="relative z-10 px-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
          <HiOutlineChatBubbleLeftRight className="h-8 w-8 text-emerald-500" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-semibold">No conversation selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a conversation to read replies.</p>
      </div>
    </div>
  );
}

function ChatView({
  room,
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
  otherUserJob,
  onRetryMessages,
  onBack,
}) {
  const groupedItems = groupByDate(messages);

  return (
    <>
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          title="Back to conversations"
          aria-label="Back to conversations"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={otherUserName} className="h-10 w-10 text-sm" />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{otherUserName || 'Unknown'}</h2>
          <p className="flex min-w-0 items-center gap-1 text-[11px] font-semibold text-emerald-500">
            <HiOutlineBriefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{otherUserJob}</span>
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth px-4 py-4 md:px-6">
        {msgError && (
          <div className="mx-auto mb-4 w-full max-w-3xl">
            <FormError title="Something went wrong" message={msgError} />
            <button type="button" onClick={onRetryMessages} className={retryClass}>
              <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          </div>
        )}
        {messagesLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <HiOutlineChatBubbleLeftRight className="h-7 w-7 text-emerald-500" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold">No messages yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            {groupedItems.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} className="my-2 flex justify-center">
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
                  senderName={otherUserName}
                  onDelete={handleDeleteMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="shrink-0 border-t border-border p-3 md:p-4">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
          <textarea
            rows={2}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message"
            aria-label="Type a message"
            disabled={sending}
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl bg-secondary px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            ) : (
              <HiOutlinePaperAirplane className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mx-auto mt-1.5 w-full max-w-3xl text-[11px] text-muted-foreground/70">
          Press Enter to send, Shift+Enter for a new line.
        </p>
      </form>
    </>
  );
}

function MessageBubble({ msg, isMe, senderName, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
    >
      {isMe ? (
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <HiOutlineUserCircle className="h-4 w-4" />
        </span>
      ) : (
        <Avatar name={senderName} className="h-7 w-7 text-[10px]" />
      )}
      <div className={`group flex min-w-0 max-w-[78%] flex-col md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
        <div className="relative">
          <div
            className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
              isMe
                ? 'rounded-br-sm bg-emerald-600 text-white'
                : 'rounded-bl-sm border border-border bg-card text-foreground'
            } ${msg.isOptimistic ? 'opacity-70' : ''}`}
          >
            {msg.content}
          </div>
          {isMe && (
            <button
              type="button"
              onClick={() => onDelete(msg)}
              className="absolute right-full top-1/2 mr-1 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground opacity-0 transition-all hover:text-red-500 focus-visible:opacity-100 group-hover:opacity-100"
              title="Delete message"
              aria-label="Delete message"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>{formatTimeFull(msg.timestamp)}</span>
          {isMe && (
            msg.isOptimistic ? (
              <span title="Sending" aria-label="Sending">
                <HiOutlineCheck className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            ) : (
              <span title="Sent" aria-label="Sent">
                <HiOutlineCheckCircle className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              </span>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
