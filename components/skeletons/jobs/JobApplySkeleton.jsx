import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /jobs/[id]/apply: header with back, 3-step stepper, step sections + sticky job summary.
export default function JobApplySkeleton() {
  return (
    <SkeletonPage label="Loading application" className="space-y-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28 2xl:px-10">
      <SkeletonHeader back />
      <div className="flex items-center gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-1 items-center gap-3">
            <Bone className="h-10 w-10 rounded-md" />
            <Bone className="hidden h-4 w-16 sm:block" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8 2xl:col-span-9">
          <SkeletonCard className="space-y-5">
            <div className="flex items-center gap-3">
              <Bone className="h-8 w-8" />
              <div className="space-y-1.5">
                <Bone className="h-5 w-28" />
                <Bone className="h-3 w-56 max-w-[60vw]" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => <Bone key={i} className="h-20 w-full rounded-md" />)}
            </div>
          </SkeletonCard>
          {Array.from({ length: 2 }, (_, i) => (
            <SkeletonCard key={i} className="space-y-4">
              <div className="flex items-center gap-3">
                <Bone className="h-8 w-8" />
                <Bone className="h-5 w-24" />
              </div>
              <Bone className="h-16 w-full rounded-md" />
            </SkeletonCard>
          ))}
        </div>
        <div className="space-y-6 lg:col-span-4 2xl:col-span-3">
          <SkeletonCard className="space-y-4">
            <div className="flex items-center gap-3">
              <Bone className="h-12 w-12" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-1/2" />
              </div>
            </div>
            {Array.from({ length: 3 }, (_, i) => <Bone key={i} className="h-4 w-2/3" />)}
          </SkeletonCard>
          <SkeletonCard className="space-y-3">
            <Bone className="h-4 w-32" />
            {Array.from({ length: 3 }, (_, i) => <Bone key={i} className="h-4 w-full" />)}
          </SkeletonCard>
        </div>
      </div>
    </SkeletonPage>
  );
}
