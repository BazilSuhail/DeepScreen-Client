import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

function SectionSkeleton({ lines = 4 }) {
  return (
    <SkeletonCard className="space-y-4">
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <Bone className="h-5 w-40" />
      </div>
      {Array.from({ length: lines }, (_, i) => (
        <Bone key={i} className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </SkeletonCard>
  );
}

// Mirrors /jobs/[id]: header with back + chips, content column, sticky apply aside.
export default function JobDetailSkeleton() {
  return (
    <SkeletonPage label="Loading job" className="space-y-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28 2xl:px-10">
      <SkeletonHeader back actions={1} />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, i) => <Bone key={i} className="h-7 w-28" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8 2xl:col-span-9">
          <SectionSkeleton lines={6} />
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
        <div className="space-y-6 lg:col-span-4 lg:self-start 2xl:col-span-3">
          <SkeletonCard className="space-y-3">
            <Bone className="h-11 w-full rounded-md" />
            <Bone className="h-3 w-3/4" />
          </SkeletonCard>
          <SkeletonCard className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Bone className="h-8 w-8" />
                <div className="flex-1 space-y-1.5">
                  <Bone className="h-3 w-16" />
                  <Bone className="h-4 w-28" />
                </div>
              </div>
            ))}
          </SkeletonCard>
          <SkeletonCard className="space-y-3">
            <div className="flex items-center gap-3">
              <Bone className="h-12 w-12" />
              <Bone className="h-5 w-32" />
            </div>
            <Bone className="h-3 w-1/2" />
          </SkeletonCard>
        </div>
      </div>
    </SkeletonPage>
  );
}
