// Placeholder layout shown while the dashboard loads. Mirrors the real dashboard so nothing jumps when data arrives.
function Bar({ className }) {
  return <div className={`animate-pulse rounded-md bg-secondary/60 ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 lg:p-6">
      <Bar className="h-3 w-2/3" />
      <Bar className="h-7 w-1/2" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-72 space-y-5 rounded-xl border border-border bg-card p-6 lg:p-8">
      <Bar className="h-5 w-40" />
      <Bar className="h-full w-full" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 lg:p-8">
      <Bar className="h-5 w-32" />
      <Bar className="h-3 w-full" />
      <Bar className="h-3 w-5/6" />
      <Bar className="h-3 w-2/3" />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" className="w-full space-y-8 px-4 pb-12 md:px-6">
      <span className="sr-only">Loading your dashboard...</span>

      {/* Hero */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-h-[200px] space-y-6 rounded-2xl bg-slate-900 p-6 lg:w-[70%] lg:p-10">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-white/10 lg:h-24 lg:w-24" />
            <div className="min-w-0 flex-1 space-y-3">
              <Bar className="h-7 w-2/3 bg-white/10" />
              <Bar className="h-3 w-1/2 bg-white/10" />
              <Bar className="h-3 w-1/3 bg-white/10" />
            </div>
          </div>
        </div>
        <div className="min-h-[200px] space-y-4 rounded-2xl bg-emerald-500/40 p-6 lg:w-[30%] lg:p-8">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/20" />
          <Bar className="h-5 w-2/3 bg-white/20" />
          <Bar className="h-3 w-1/2 bg-white/20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListSkeleton />
        <ListSkeleton />
      </div>
    </div>
  );
}
