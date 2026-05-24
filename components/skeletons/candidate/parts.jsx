import { Bone, SkeletonCard } from "@/components/skeletons/primitives";

// Shared shapes for the candidate page skeletons.

export const pagePad = "px-4 py-6 sm:px-6 lg:px-8 2xl:px-10";

// Mirrors a section card: icon tile + title/helper row, then its body.
export function PanelSkeleton({ className = "", action = false, children }) {
  return (
    <SkeletonCard className={`space-y-5 lg:p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bone className="h-8 w-8" />
          <div className="space-y-1.5">
            <Bone className="h-4 w-36" />
            <Bone className="h-3 w-48 max-w-[45vw]" />
          </div>
        </div>
        {action && <Bone className="h-10 w-24 rounded-md" />}
      </div>
      {children}
    </SkeletonCard>
  );
}

// Mirrors divided rows inside a card (icon tile, two lines, optional trailing pill).
export function RowsSkeleton({ rows = 4, trailing = false }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <Bone className="h-10 w-10" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-4 w-2/3" />
            <Bone className="h-3 w-1/2" />
          </div>
          {trailing && <Bone className="h-6 w-20" />}
        </div>
      ))}
    </div>
  );
}

// Mirrors DashboardBanner (badge, title, subtitle, actions, aside card).
export function BannerSkeleton() {
  return (
    <div className="grid gap-6 rounded-lg border border-emerald-100 bg-emerald-50 p-5 md:p-6 lg:grid-cols-[1fr_auto] lg:items-center dark:border-white/5 dark:bg-emerald-dark">
      <div className="space-y-4">
        <Bone className="h-6 w-28" />
        <Bone className="h-8 w-2/3" />
        <Bone className="h-3 w-1/3" />
      </div>
      <Bone className="h-40 w-full rounded-lg lg:w-72" />
    </div>
  );
}

// Mirrors a grid of entity cards (badge row, title, two lines, footer tiles).
export function CardGridSkeleton({ count = 6, className = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} className="space-y-4 lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <Bone className="h-6 w-28" />
            <Bone className="h-10 w-10" />
          </div>
          <Bone className="h-5 w-3/4" />
          <div className="space-y-2">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-2/3" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Bone className="h-16 rounded-md" />
            <Bone className="h-16 rounded-md" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}

// Mirrors a horizontal row of filter / segmented buttons.
export function ChipsSkeleton({ count = 5 }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }, (_, i) => (
        <Bone key={i} className="h-11 w-28 rounded-md" />
      ))}
    </div>
  );
}
