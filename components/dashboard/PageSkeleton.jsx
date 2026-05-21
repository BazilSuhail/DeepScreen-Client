// Loading placeholder for dashboard-style pages: a banner block, a stat row, and card blocks.
// Mirrors DashboardBanner and the candidate dashboard grid so nothing jumps when data arrives.
function Bar({ className }) {
  return <div className={`animate-pulse rounded-md bg-secondary/60 ${className}`} />;
}

export default function PageSkeleton({ stats = 3, cards = 4 }) {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full min-w-0 space-y-10 px-4 pb-16 md:px-6 lg:px-8">
      <span className="sr-only">Loading...</span>

      <div className="rounded-3xl bg-emerald-dark p-5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0 space-y-4">
            <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-8 w-2/3 animate-pulse rounded-md bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-white/10" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-9 w-28 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
          <div className="h-32 w-full animate-pulse rounded-2xl bg-white/5 lg:w-64" />
        </div>
      </div>

      {stats > 0 && (
        <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${stats > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {Array.from({ length: stats }, (_, i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-border bg-card p-5 lg:p-6">
              <Bar className="h-3 w-1/3" />
              <Bar className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border bg-card p-5 lg:p-6">
            <div className="space-y-2">
              <Bar className="h-5 w-40" />
              <Bar className="h-3 w-56" />
            </div>
            <Bar className="h-40 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
