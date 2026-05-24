import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /recruiter/jobs: header, three stat tiles, tip line, filter bar, job card grid.
export default function JobsListSkeleton() {
  return (
    <SkeletonPage label="Loading jobs" className="space-y-6">
      <SkeletonHeader actions={1} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonCard key={i} className="flex items-center gap-4">
            <Bone className="h-11 w-11" />
            <div className="flex-1 space-y-2">
              <Bone className="h-6 w-12" />
              <Bone className="h-3 w-24" />
            </div>
          </SkeletonCard>
        ))}
      </div>
      <Bone className="h-11 w-full rounded-md" />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Bone className="h-8 w-8" />
          <Bone className="h-4 w-32" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Bone className="h-11 w-72 max-w-full rounded-md" />
          <Bone className="h-11 w-64 max-w-full rounded-md" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} className="space-y-4 p-0">
            <div className="flex items-start gap-3 p-5 pb-0">
              <Bone className="h-11 w-11" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-1/2" />
              </div>
              <Bone className="h-5 w-14" />
            </div>
            <div className="grid grid-cols-2 gap-3 px-5">
              {Array.from({ length: 5 }, (_, j) => (
                <Bone key={j} className="h-4 w-full" />
              ))}
            </div>
            <div className="flex gap-2 border-t border-border p-3">
              <Bone className="h-11 flex-1 rounded-md" />
              <Bone className="h-11 w-11 rounded-md" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
