'use client';

import { api } from '@/utils/api';

import { motion } from 'motion/react';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlineUser,
} from 'react-icons/hi2';
import AuthGridBackground from '@/components/auth/AuthGridBackground';
import ErrorState from '@/components/dashboard/ErrorState';
import { ChatThreadBodySkeleton } from '@/components/skeletons/chats/ChatSkeleton';
import { base } from '@/constants/motion';
import { card, errorClass, focusRing, iconButton, iconTile } from '@/components/ui/styles';

// Shared pieces of the candidate and recruiter chat screens.

export function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
  (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

// Initials when there is a name, a person icon when there is not (never "?" or "Unknown").
export function Avatar({ name, className = 'h-11 w-11 text-sm' }) {
  const initials = initialsOf(name);
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 ${className}`}
    >
      {initials || <HiOutlineUser className="h-1/2 w-1/2" />}
    </span>
  );
}

export const paneClass = `${card} flex min-h-0 min-w-0 flex-col overflow-hidden`;

// Row in a conversation list. `active` draws the sliding indicator (unique layoutId per screen).
export function ConversationRow({ name, subtitle, subtitleIcon: SubIcon, preview, time, unread = 0, active, layoutId, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'true' : undefined}
      className={`relative flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/60 ${focusRing} focus-visible:ring-inset focus-visible:ring-offset-0 ${
        active ? 'bg-emerald-50/70 dark:bg-emerald-500/10' : ''
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="absolute inset-y-2 left-0 w-1 rounded-full bg-emerald-500"
          aria-hidden="true"
        />
      )}
      <Avatar name={name} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={`truncate text-sm ${unread > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>{name || '—'}</span>
          {time && <span className="shrink-0 text-[11px] text-muted-foreground">{formatTime(time)}</span>}
        </span>
        {subtitle && (
          <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {SubIcon && <SubIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            <span className="truncate">{subtitle}</span>
          </span>
        )}
        {preview && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{preview}</span>}
      </span>
      {unread > 0 && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold text-white">
          <span className="sr-only">Unread: </span>
          {unread}
        </span>
      )}
    </button>
  );
}

export function EmptyPane({ title, text }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
      <AuthGridBackground />
      <div className="relative z-10 px-8 text-center">
        <span className={`${iconTile} mx-auto h-14 w-14 border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400`}>
          <HiOutlineChatBubbleLeftRight className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-semibold">{title}</h2>
        {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}

export function ChatView({
  messages,
  messagesLoading,
  msgError,
  actionError,
  messageInput,
  setMessageInput,
  sending,
  handleSendMessage,
  handleDeleteMessage,
  messagesEndRef,
  userId,
  otherUserName,
  otherUserSub,
  otherUserSubIcon: SubIcon,
  onRetryMessages,
  onBack,
}) {
  const groupedItems = groupByDate(messages);

  return (
    <>
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2.5 sm:px-4">
        <button type="button" onClick={onBack} className={`${iconButton} -ml-1 lg:hidden`} aria-label="Back to conversations">
          <HiOutlineArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <Avatar name={otherUserName} className="h-10 w-10 text-sm" />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{otherUserName || '—'}</h2>
          {otherUserSub && (
            <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              {SubIcon && <SubIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
              <span className="truncate">{otherUserSub}</span>
            </p>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-muted/30 px-3 py-4 sm:px-6">
        {msgError && (
          <div className="mx-auto mb-4 w-full max-w-3xl">
            <ErrorState title={msgError} onRetry={onRetryMessages} />
          </div>
        )}
        {messagesLoading ? (
          <ChatThreadBodySkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className={`${iconTile} h-12 w-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
              <HiOutlineChatBubbleLeftRight className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-sm font-semibold">No messages yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">Send a message to start the conversation.</p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            {groupedItems.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} className="my-2 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{formatDateLabel(item.date)}</span>
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  </div>
                );
              }
              const msg = item.message;
              const isMe = String(userId || '') === String(msg.sender_id || '');
              return <MessageBubble key={msg.id} msg={msg} isMe={isMe} senderName={otherUserName} onDelete={handleDeleteMessage} />;
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="shrink-0 border-t border-border bg-card p-3 sm:px-4">
        {actionError && (
          <p role="alert" className={`mx-auto mb-2 w-full max-w-3xl ${errorClass}`}>
            {actionError}
          </p>
        )}
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
          <textarea
            rows={1}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message"
            aria-label="Message"
            disabled={sending}
            className="max-h-40 min-h-11 min-w-0 flex-1 resize-none rounded-md border border-emerald-200 bg-card px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-emerald-500 disabled:opacity-50 dark:border-white/10 dark:bg-background"
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
            aria-label="Send message"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition-[background-color,translate,scale] duration-150 hover:bg-emerald-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none ${focusRing}`}
          >
            {sending ? (
              <HiOutlineArrowPath className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <HiOutlinePaperAirplane className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="mx-auto mt-1.5 hidden w-full max-w-3xl text-[11px] text-muted-foreground sm:block">
          Enter to send · Shift+Enter for a new line
        </p>
      </form>
    </>
  );
}

function MessageBubble({ msg, isMe, senderName, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={base}
      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
    >
      {!isMe && <Avatar name={senderName} className="h-7 w-7 text-[10px]" />}
      <div className={`group flex min-w-0 max-w-[85%] items-center gap-1 sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
        <div className={`flex min-w-0 flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          <div
            className={`whitespace-pre-wrap break-words rounded-lg px-3.5 py-2 text-sm leading-relaxed ${
              isMe
                ? 'rounded-br-sm bg-emerald-600 text-white'
                : 'rounded-bl-sm border border-border bg-card text-foreground'
            } ${msg.isOptimistic ? 'opacity-70' : ''}`}
          >
            {msg.content}
          </div>
          <div className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
            <span>{formatTimeFull(msg.timestamp)}</span>
            {isMe &&
              (msg.isOptimistic ? (
                <span title="Sending">
                  <HiOutlineCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">Sending</span>
                </span>
              ) : (
                <span title="Sent">
                  <HiOutlineCheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span className="sr-only">Sent</span>
                </span>
              ))}
          </div>
        </div>
        {isMe && !msg.isOptimistic && (
          <button
            type="button"
            onClick={() => onDelete(msg)}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,opacity,translate,scale] duration-150 hover:bg-red-50 hover:text-red-600 active:scale-[0.97] motion-reduce:transform-none md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 dark:hover:bg-red-500/10 dark:hover:text-red-400 ${focusRing}`}
            aria-label="Delete message"
          >
            <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Marks the other person's unread messages as read. The server marks one message per request and rewrites the
// whole room on save, so requests go one at a time (parallel calls would overwrite each other's read_by).
export async function markThreadRead(applicationId, messages, userId) {
  const me = String(userId || '');
  if (!me) return;
  const unread = messages.filter((m) => String(m.sender_id || '') !== me && !(m.read_by || []).map(String).includes(me));
  for (const m of unread) {
    try {
      await api.post(`/chat_rooms/${applicationId}/mark_read/`, { message_id: m.id });
    } catch {
      return; // badge refreshes on the next poll; nothing for the user to act on
    }
  }
}
