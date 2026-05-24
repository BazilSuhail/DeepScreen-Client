'use client';

import { useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi2';

const labelClass = 'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

function ReviewList({ label, items, icon: Icon, tone }) {
  if (!items?.length) return null;
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} aria-hidden="true" />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReviewCard({ review }) {
  const { title, job, score, passed, strengths = [], weaknesses = [], feedback, date } = review;
  const [expanded, setExpanded] = useState(false);

  const pill =
    score == null
      ? 'bg-secondary text-muted-foreground'
      : passed
        ? 'bg-emerald-500/10 text-emerald-500'
        : 'bg-amber-500/10 text-amber-500';

  return (
    <article className="space-y-4 rounded-lg border border-border bg-card p-4 lg:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold">{title}</h3>
          {job && <p className="mt-0.5 text-xs text-muted-foreground">{job}</p>}
          {date && <p className="mt-1 text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</p>}
        </div>
        <span className={`shrink-0 rounded-sm px-2.5 py-1 text-xs font-semibold ${pill}`}>
          {score == null ? 'No score' : `Score ${score}`}
        </span>
      </div>

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid gap-5 sm:grid-cols-2">
          <ReviewList label="Strengths" items={strengths} icon={HiOutlineCheckCircle} tone="text-emerald-500" />
          <ReviewList label="Weaknesses" items={weaknesses} icon={HiOutlineExclamationCircle} tone="text-amber-500" />
        </div>
      )}

      {feedback && (
        <div>
          <p className={`text-sm leading-relaxed text-muted-foreground ${expanded ? '' : 'line-clamp-4'}`}>{feedback}</p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-1 inline-flex min-h-10 items-center text-xs font-semibold text-emerald-500 transition-colors hover:text-emerald-400"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </article>
  );
}
