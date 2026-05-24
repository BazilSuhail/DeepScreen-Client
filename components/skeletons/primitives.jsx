// Building blocks for page skeletons. Each page gets its own skeleton in components/skeletons/<area>/
// that mirrors its real layout block for block, so nothing shifts when data arrives.

export function Bone({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-sm bg-muted motion-reduce:animate-none ${className}`} />;
}

// Screen-reader wrapper: announce loading once, hide the shapes.
export function SkeletonPage({ label = "Loading", className = "", children }) {
  return (
    <output aria-busy="true" className={`block ${className}`}>
      <span className="sr-only">{label}</span>
      {children}
    </output>
  );
}

export function SkeletonCard({ className = "", children }) {
  return <div className={`rounded-lg border border-emerald-100 bg-card p-5 dark:border-white/10 ${className}`}>{children}</div>;
}

// Mirrors <PageHeader>: optional back link, icon tile, title, description, actions.
export function SkeletonHeader({ back = false, actions = 0, icon = true }) {
  return (
    <div className="space-y-4">
      {back && <Bone className="h-5 w-20" />}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          {icon && <Bone className="h-12 w-12" />}
          <div className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-8 w-64 max-w-[60vw]" />
            <Bone className="h-4 w-80 max-w-[70vw]" />
          </div>
        </div>
        {actions > 0 && (
          <div className="flex gap-2">
            {Array.from({ length: actions }, (_, i) => (
              <Bone key={i} className="h-11 w-32 rounded-md" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mirrors a compact <DashboardBanner> (same surface, padding and rows: badge, icon + title, subtitle, actions).
export function SkeletonBanner({ actions = 1 }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5 md:p-6 dark:border-white/5 dark:bg-emerald-dark">
      <div className="space-y-4">
        <div className="space-y-2">
          <Bone className="h-6 w-40" />
          <div className="flex items-center gap-3">
            <Bone className="h-11 w-11 rounded-md" />
            <Bone className="h-8 w-64 max-w-[60vw]" />
          </div>
          <Bone className="h-3 w-80 max-w-[70vw]" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: actions }, (_, i) => (
            <Bone key={i} className="h-11 w-36 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Mirrors a row of stat tiles.
export function SkeletonStats({ count = 4, className = "grid grid-cols-2 gap-4 lg:grid-cols-4" }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3">
          <div className="flex items-center justify-between">
            <Bone className="h-3 w-20" />
            <Bone className="h-8 w-8" />
          </div>
          <Bone className="h-7 w-16" />
        </SkeletonCard>
      ))}
    </div>
  );
}

// Mirrors a list of rows inside a card.
export function SkeletonList({ rows = 5, avatar = true }) {
  return (
    <SkeletonCard className="divide-y divide-border p-0">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          {avatar && <Bone className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-1/3" />
            <Bone className="h-3 w-1/2" />
          </div>
          <Bone className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </SkeletonCard>
  );
}
