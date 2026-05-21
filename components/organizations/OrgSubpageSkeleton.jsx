// Placeholder for organization subpages. Mirrors OrgSubpageBanner, then the stat row and body for `variant`.
import { ORG_PAGE_CLASS } from '@/components/organizations/OrgSubpageBanner';

function Bar({ className }) {
  return <div className={`animate-pulse rounded-md bg-secondary/60 ${className}`} />;
}

function BannerSkeleton() {
  return (
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
        <div className="w-full space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 lg:w-72">
          <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/10" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-9 w-full animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full space-y-3">
          <Bar className="h-3 w-1/3" />
          <Bar className="h-9 w-1/2" />
        </div>
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-secondary/60" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 lg:p-6">
      <div className="space-y-2">
        <Bar className="h-5 w-40" />
        <Bar className="h-3 w-56" />
      </div>
      <Bar className="h-64 w-full" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 lg:p-5">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-secondary/60" />
      <div className="w-full space-y-2">
        <Bar className="h-3 w-3/4" />
        <Bar className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 3 }, (_, i) => <RowSkeleton key={i} />)}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div className="space-y-2">
        <Bar className="h-5 w-40" />
        <Bar className="h-3 w-full" />
      </div>
      <Bar className="h-11 w-full" />
      <Bar className="h-11 w-full" />
    </div>
  );
}

// stats: number of stat cards (0 for none). variant: 'charts' | 'list' | 'team'.
export default function OrgSubpageSkeleton({ stats = 0, variant = 'list' }) {
  return (
    <div role="status" aria-busy="true" className={ORG_PAGE_CLASS}>
      <span className="sr-only">Loading...</span>
      <BannerSkeleton />

      {stats > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: stats }, (_, i) => <StatSkeleton key={i} />)}
        </div>
      )}

      {variant === 'charts' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      )}

      {variant === 'list' && <ListSkeleton />}

      {variant === 'team' && (
        <>
          <RowSkeleton />
          <div className="grid gap-6 lg:grid-cols-3">
            <FormSkeleton />
            <div className="lg:col-span-2"><ListSkeleton /></div>
          </div>
        </>
      )}
    </div>
  );
}
