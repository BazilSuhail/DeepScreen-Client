'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { HiOutlineSparkles, HiOutlinePaperAirplane, HiOutlineArrowPath } from 'react-icons/hi2';

function Avatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
      <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function Bubble({ message, onRetry, disabled }) {
  const entrance = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  if (message.role === 'user') {
    return (
      <motion.div {...entrance} className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-md bg-emerald-dark px-3.5 py-2.5 text-sm leading-relaxed text-white">
          {message.content}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div {...entrance} className="flex items-start gap-2.5">
      <Avatar />
      <div className="min-w-0 max-w-[85%] space-y-2">
        <p className="whitespace-pre-wrap break-words rounded-md bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
          {message.content}
        </p>
        {message.failed && (
          <button
            type="button"
            onClick={onRetry}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <HiOutlineArrowPath className="h-3.5 w-3.5" aria-hidden="true" /> Try again
          </button>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div role="status" aria-label="The assistant is typing" className="flex items-start gap-2.5">
      <Avatar />
      <div className="flex items-center gap-1.5 rounded-md bg-muted px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// Chat panel for the AI job setup. Holds only the composer text; the history lives in the parent.
export default function JobAiChat({ messages, pending, onSend, onRetry }) {
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  const submit = () => {
    const text = input.trim();
    if (!text || pending) return;
    setInput('');
    onSend(text);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <section
      aria-label="Chat with the job assistant"
      className="flex h-[65vh] min-h-[420px] min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card lg:h-[680px]"
    >
      <div ref={listRef} role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} onRetry={onRetry} disabled={pending} />
        ))}
        {pending && <TypingIndicator />}
      </div>

      <div className="border-t border-border p-3 md:p-4">
        <div className="flex items-end gap-2">
          <label htmlFor="job-ai-composer" className="sr-only">Message the assistant</label>
          <textarea
            id="job-ai-composer"
            rows={2}
            maxLength={2000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Describe the role, or answer the assistant's question"
            className="min-h-[44px] flex-1 resize-none rounded-md border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 outline-none transition-all focus:border-emerald-500/50 focus:bg-emerald-500/5"
          />
          <button
            type="button"
            onClick={submit}
            disabled={pending || !input.trim()}
            aria-label="Send message"
            title="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-dark text-white transition-all hover:opacity-90 disabled:opacity-40"
          >
            <HiOutlinePaperAirplane className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Enter sends. Shift + Enter adds a new line.</p>
      </div>
    </section>
  );
}
