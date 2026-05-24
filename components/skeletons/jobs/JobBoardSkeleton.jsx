import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// One job card in the results grid.
export function JobCardSkeleton() {
  return (
    <SkeletonCard className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <Bone className="h-12 w-12" />
        <Bone className="h-5 w-20" />
      </div>
      <div className="space-y-2">
        <Bone className="h-5 w-3/4" />
        <Bone className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-5/6" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Bone className="h-6 w-24" />
        <Bone className="h-6 w-20" />
        <Bone className="h-6 w-16" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <Bone className="h-4 w-24" />
        <Bone className="h-4 w-20" />
      </div>
    </SkeletonCard>
  );
}

// Results only: toolbar + card grid. Rendered inside the real page while jobs load.
export function JobResultsSkeleton({ count = 6 }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-5 w-28" />
        <Bone className="h-11 w-44 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:grid-cols-4">
        {Array.from({ length: count }, (_, i) => <JobCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

// Mirrors /jobs: header, search bar, filter aside + results grid.
export default function JobBoardSkeleton() {
  return (
    <SkeletonPage label="Loading jobs" className="space-y-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28 2xl:px-10">
      <SkeletonHeader />
      <SkeletonCard className="flex flex-col gap-3 p-3 md:flex-row">
        <Bone className="h-11 flex-1 rounded-md" />
        <Bone className="h-11 flex-1 rounded-md" />
        <Bone className="h-11 w-full rounded-md md:w-32" />
      </SkeletonCard>
      <div className="flex flex-col gap-6 lg:flex-row">
        <SkeletonCard className="w-full shrink-0 space-y-5 lg:w-72 lg:self-start">
          <Bone className="h-5 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, i) => <Bone key={i} className="h-10 w-24 rounded-md" />)}
          </div>
          <Bone className="h-10 w-36 rounded-md" />
        </SkeletonCard>
        <div className="min-w-0 flex-1">
          <JobResultsSkeleton />
        </div>
      </div>
    </SkeletonPage>
  );
}
