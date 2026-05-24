'use client';

import { HiOutlineExclamationCircle, HiOutlineXMark } from 'react-icons/hi2';

// Error banner for forms. Pass `title` for the headline and `message` for the detail.
// `onDismiss` is optional; when given, a close button is shown.
export default function FormError({ title = 'Something went wrong', message, onDismiss }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-5 flex items-start gap-3 rounded-md border border-red-500/25 bg-red-500/10 p-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-red-500/15">
        <HiOutlineExclamationCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">{title}</p>
        <p className="mt-0.5 break-words text-xs leading-relaxed text-red-700/80 dark:text-red-300/70">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="-m-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-red-600/70 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-red-500/10 hover:text-red-700 dark:text-red-300/60 dark:hover:text-red-300"
        >
          <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
