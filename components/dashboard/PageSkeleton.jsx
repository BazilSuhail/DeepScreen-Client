// Loading placeholder for dashboard-style pages: an optional banner block, a stat row, and card blocks.
// Mirrors DashboardBanner and the dashboard grid so nothing jumps when data arrives.
// Pass banner={false} when the page already renders its real banner above the loading body.
function Bar({ className }) {
  return <div className={`animate-pulse rounded-md bg-emerald-200/60 dark:bg-white/10 ${className}`} />;
}

export default function PageSkeleton({ stats = 3, cards = 4, banner = true }) {
  return (
    <output aria-busy="true" className={banner ? 'mx-auto block w-full min-w-0 space-y-8 px-4 pb-16 md:px-8' : 'block w-full min-w-0 space-y-8'}>
      <span className="sr-only">Loading...</span>

      {banner && (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 md:p-6 dark:border-transparent dark:bg-emerald-dark">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0 space-y-4">
              <Bar className="h-6 w-32 rounded-full" />
              <Bar className="h-8 w-2/3" />
              <Bar className="h-3 w-1/2" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Bar key={i} className="h-11 w-28 rounded-xl" />
                ))}
              </div>
            </div>
            <Bar className="h-32 w-full rounded-2xl lg:w-64" />
          </div>
        </div>
      )}

      {stats > 0 && (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${stats > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {Array.from({ length: stats }, (_, i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 dark:border-white/10 dark:bg-card">
              <Bar className="h-10 w-10 rounded-xl" />
              <Bar className="h-3 w-1/3" />
              <Bar className="h-7 w-1/2" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 lg:p-6 dark:border-white/10 dark:bg-card">
            <div className="space-y-2">
              <Bar className="h-5 w-40" />
              <Bar className="h-3 w-56" />
            </div>
            <Bar className="h-40 w-full" />
          </div>
        ))}
      </div>
    </output>
  );
}
