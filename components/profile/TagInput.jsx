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
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 focus-within:border-emerald-500">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="transition-colors hover:text-red-500"
          >
            <HiOutlineXMark className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length ? '' : placeholder}
        className="min-w-[120px] flex-1 bg-transparent py-1 text-sm outline-none"
      />
    </div>
  );
}
