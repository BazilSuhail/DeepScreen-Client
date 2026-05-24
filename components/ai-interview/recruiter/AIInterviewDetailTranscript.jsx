'use client';

import { useState } from 'react';
import { HiOutlineChatBubbleLeftRight, HiOutlineChevronDown, HiOutlineIdentification, HiOutlineSparkles } from 'react-icons/hi2';
import { IconTile, hintClass } from './AIInterviewDetailUi';

const PREVIEW_COUNT = 4;

const formatTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function TranscriptPanel({ messages }) {
  const [expanded, setExpanded] = useState(false);
  const visible = (messages || []).filter((m) => m && m.role !== 'system');
  if (!visible.length) return null;

  const shown = expanded ? visible : visible.slice(-PREVIEW_COUNT);
  const hiddenCount = visible.length - shown.length;
  const panelId = 'transcript-panel';

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-emerald-100 bg-card shadow-sm dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 p-5 dark:border-white/10 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={HiOutlineChatBubbleLeftRight} tone="blue" />
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-emerald-950 dark:text-foreground">Interview transcript</h2>
            <p className={hintClass}>{visible.length} message{visible.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {visible.length > PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-emerald-700 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
          >
            {expanded ? 'Show recent only' : `Show all ${visible.length}`}
            <HiOutlineChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      <ol id={panelId} className="max-h-[520px] divide-y divide-emerald-100 overflow-y-auto dark:divide-white/10">
        {!expanded && hiddenCount > 0 && (
          <li className="bg-emerald-50/60 px-5 py-2.5 text-center text-xs font-semibold text-emerald-800/70 dark:bg-white/[0.02] dark:text-muted-foreground">
            {hiddenCount} earlier message{hiddenCount !== 1 ? 's' : ''} hidden
          </li>
        )}
        {shown.map((msg, i) => {
          const isInterviewer = msg.role === 'assistant';
          const Icon = isInterviewer ? HiOutlineSparkles : HiOutlineIdentification;
          const time = formatTime(msg.timestamp);
          return (
            <li key={`${msg.timestamp ?? 'na'}-${i}`} className={`flex items-start gap-3 p-4 lg:px-6 ${isInterviewer ? 'bg-emerald-50/60 dark:bg-white/[0.02]' : ''}`}>
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm ${isInterviewer ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400'}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-semibold text-emerald-800/70 dark:text-muted-foreground">
                  {isInterviewer ? 'Interviewer' : 'Candidate'}
                  {time && <span className="font-normal"> · {time}</span>}
                </p>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-emerald-950 dark:text-foreground">{msg.content}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
