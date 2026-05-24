'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import ErrorState from '@/components/dashboard/ErrorState';
import ChatSkeleton, { ChatListSkeleton } from '@/components/skeletons/chats/ChatSkeleton';
import { badge, secondaryButton } from '@/components/ui/styles';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineBriefcase,
} from 'react-icons/hi2';
import { ChatView, ConversationRow, EmptyPane, markThreadRead, paneClass } from '../_components/ChatParts';

function CandidateChatContent() {
  const { user, loading: authLoading } = useAuth();
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
  const [actionError, setActionError] = useState('');
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
      // Clear this conversation's badge locally, then tell the server.
      setRooms((prev) => prev.map((x) => (x.application_id === room.application_id ? { ...x, unread_count: 0 } : x)));
      markThreadRead(room.application_id, response.messages || [], userId);
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
    setActionError('');
    activeRoomIdRef.current = room.application_id;
    fetchMessages(room);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => fetchMessages(room, false), 5000);
  };
  // Latest selectRoom, so the deep-link effect below can call it without re-running on every render
  const selectRoomRef = useRef(null);
  useEffect(() => { selectRoomRef.current = selectRoom; });

  useEffect(() => {
    // Wait for auth to resolve; a null user while loading is not "signed out".
    if (authLoading) return;
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
  }, [user, authLoading, router]);

  const initialRoomId = searchParams?.get('id');
  useEffect(() => {
    if (!initialRoomId || rooms.length === 0 || selectedRoom) return;
    const match = rooms.find(r => String(r.application_id) === initialRoomId);
    if (!match) return;
    // Deep link from ?id=: select the room once rooms arrive. Deferred so the state update is not synchronous in the effect.
    const timer = setTimeout(() => selectRoomRef.current(match), 0);
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
    setActionError('');

    try {
      const response = await api.post(`/chat_rooms/${selectedRoom.application_id}/send/`, {
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
    if (!selectedRoom) return;
    setActionError('');
    try {
      await api.post(`/chat_rooms/${selectedRoom.application_id}/delete_message/`, {
        message_id: msg.id,
      });
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    } catch (err) {
      console.error('Delete failed', err);
      setActionError('Could not delete that message. Try again.');
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.recruiter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = rooms.reduce((sum, room) => sum + (Number(room.unread_count) || 0), 0);

  if (authLoading || !user) return <ChatSkeleton />;

  return (
    <div className="flex h-dvh min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 lg:gap-6 lg:px-8 lg:py-6 2xl:px-10">
      <PageHeader
        className={selectedRoom ? 'hidden lg:block' : ''}
        back={{ href: '/candidate', label: 'Dashboard' }}
        icon={HiOutlineChatBubbleLeftRight}
        eyebrow="Messages"
        title="Conversations with recruiters"
        description="Replies from recruiters appear here. Keep your answers short and specific."
        meta={
          !loading && !error ? (
            <>
              <span className={`${badge} bg-muted text-muted-foreground`}>
                <HiOutlineChatBubbleLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                {rooms.length} {rooms.length === 1 ? 'conversation' : 'conversations'}
              </span>
              {unreadCount > 0 && (
                <span className={`${badge} bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
                  <HiOutlineChatBubbleOvalLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {unreadCount} unread
                </span>
              )}
            </>
          ) : null
        }
        actions={
          <button type="button" onClick={fetchRooms} disabled={loading} className={secondaryButton}>
            <HiOutlineArrowPath className={`h-4 w-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <div className="flex min-h-0 min-w-0 flex-1 gap-4">
        {/* Conversation list */}
        <section aria-label="Conversations" className={`${paneClass} ${selectedRoom ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 lg:flex-none`}>
          <div className="shrink-0 border-b border-border p-3">
            <label className="relative block">
              <span className="sr-only">Search conversations</span>
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by recruiter or job"
                className="min-h-11 w-full rounded-md border border-emerald-100 bg-muted/40 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-emerald-500 dark:border-white/10"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {error && (
              <div className="p-3">
                <ErrorState title="Could not load conversations" message={error} onRetry={fetchRooms} />
              </div>
            )}

            {loading ? (
              <ChatListSkeleton />
            ) : filteredRooms.length === 0 && !error ? (
              <div className="flex h-full min-h-64">
                <EmptyPane
                  title={searchQuery ? 'No chats match your search' : 'No active chats'}
                  text={searchQuery ? undefined : "When you're shortlisted, conversations appear here."}
                />
              </div>
            ) : (
              filteredRooms.map((room) => (
                <ConversationRow
                  key={room.application_id}
                  name={room.recruiter_name}
                  subtitle={room.job_title}
                  subtitleIcon={HiOutlineBriefcase}
                  preview={(room.chat_room_exists ? 'Continue conversation' : 'Send your first message')}
                  time={room.last_message_at}
                  unread={Number(room.unread_count) || 0}
                  active={selectedRoom?.application_id === room.application_id}
                  layoutId="candidate-chat-active"
                  onSelect={() => selectRoom(room)}
                />
              ))
            )}
          </div>
        </section>

        {/* Thread */}
        <section aria-label="Conversation" className={`${paneClass} ${selectedRoom ? 'flex' : 'hidden lg:flex'} flex-1`}>
          {selectedRoom ? (
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
              otherUserName={selectedRoom.recruiter_name}
              otherUserSub={selectedRoom.job_title}
              otherUserSubIcon={HiOutlineBriefcase}
              onRetryMessages={() => fetchMessages(selectedRoom)}
              onBack={() => {
                setSelectedRoom(null);
                activeRoomIdRef.current = null;
                if (pollingRef.current) clearInterval(pollingRef.current);
              }}
            />
          ) : (
            <EmptyPane title="No conversation selected" text="Pick a conversation to read replies." />
          )}
        </section>
      </div>
    </div>
  );
}

export default function CandidateChatPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <CandidateChatContent />
    </Suspense>
  );
}
