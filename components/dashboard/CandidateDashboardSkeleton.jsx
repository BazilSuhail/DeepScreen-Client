// Placeholder shown while the candidate dashboard loads. Mirrors app/candidate/page.jsx section by section.
function Bar({ className }) {
  return <div className={`animate-pulse rounded-md bg-secondary/60 ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 lg:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full space-y-3">
          <Bar className="h-3 w-1/3" />
          <Bar className="h-9 w-1/2" />
        </div>
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-secondary/60" />
      </div>
      <Bar className="h-3 w-2/3" />
    </div>
  );
}

function ChartSkeleton({ wide = false }) {
  return (
    <div className={`space-y-4 rounded-xl border border-border bg-card p-5 lg:p-6 ${wide ? 'lg:col-span-2' : ''}`}>
      <div className="space-y-2">
        <Bar className="h-5 w-40" />
        <Bar className="h-3 w-56" />
      </div>
      <Bar className="h-64 w-full" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 lg:p-6">
      <div className="space-y-2">
        <Bar className="h-5 w-32" />
        <Bar className="h-3 w-44" />
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-secondary/60" />
          <div className="w-full space-y-2">
            <Bar className="h-3 w-3/4" />
            <Bar className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CandidateDashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full min-w-0 space-y-14 px-5 pb-20 md:px-10 lg:px-12">
      <span className="sr-only">Loading your dashboard...</span>

      {/* Banner */}
      <div className="rounded-3xl bg-emerald-dark p-5 md:p-6 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
              <div className="h-8 w-2/3 animate-pulse rounded-md bg-white/10" />
              <div className="h-3 w-1/2 animate-pulse rounded-md bg-white/10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-9 w-28 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
          <div className="w-full space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:w-72">
            <div className="flex items-center justify-between gap-3">
              <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/10" />
              <div className="h-2.5 w-1/4 animate-pulse rounded bg-white/10" />
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-1.5 flex-1 animate-pulse rounded-full bg-white/10" />
              ))}
            </div>
            <div className="h-8 w-full animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton wide />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <ListSkeleton />
        <ListSkeleton />
        <ListSkeleton />
      </div>
    </div>
  );
}
