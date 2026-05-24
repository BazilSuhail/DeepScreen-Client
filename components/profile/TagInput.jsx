'use client';

import { useState } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

// Chip input: type a value, then press Enter or comma to add it. Click x to remove a chip.
export default function TagInput({ value = [], onChange, placeholder, max = 30 }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const next = draft.trim();
    if (next && value.length < max && !value.some((v) => v.toLowerCase() === next.toLowerCase())) {
      onChange([...value, next]);
    }
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-emerald-200 bg-card px-2.5 py-1.5 transition-colors focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30 dark:border-white/10 dark:bg-background">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-0.5 rounded-sm bg-emerald-100 py-0.5 pl-2 pr-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="inline-flex h-6 w-6 items-center justify-center rounded-sm transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:text-red-400"
          >
            <HiOutlineXMark className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length ? '' : placeholder}
        aria-label={placeholder}
        className="min-h-8 min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
}
