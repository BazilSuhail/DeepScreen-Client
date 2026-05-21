'use client';

import { HiOutlineExclamationCircle, HiOutlineXMark } from 'react-icons/hi2';

// Error banner for forms. Pass `title` for the headline and `message` for the detail.
// `onDismiss` is optional; when given, a close button is shown.
export default function FormError({ title = 'Something went wrong', message, onDismiss }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
        <HiOutlineExclamationCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-300">{title}</p>
        <p className="mt-0.5 break-words text-xs leading-relaxed text-red-300/70">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 rounded-md p-1 text-red-300/60 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
