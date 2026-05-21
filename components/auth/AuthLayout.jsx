'use client';

import AuthGridBackground from '@/components/auth/AuthGridBackground';
import AuthShowcase from '@/components/auth/AuthShowcase';

// Shared two-column shell for auth flows. The showcase panel shows on lg and up;
// below lg the grid background stands in for it. Pass `maxWidth` to widen the form column,
// and `showcase` ({ title, body, items }) to change the panel copy.
export default function AuthLayout({ children, maxWidth = 'max-w-md', showcase = {} }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <AuthGridBackground className="lg:hidden" />
      <div className="relative flex min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-16">
        <div className={`w-full ${maxWidth}`}>{children}</div>
      </div>
      <AuthShowcase {...showcase} />
    </div>
  );
}
