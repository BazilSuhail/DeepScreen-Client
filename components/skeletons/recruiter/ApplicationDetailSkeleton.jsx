import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /recruiter/applications/[id]: header, stats + filter aside, candidate list.
export default function ApplicationDetailSkeleton() {
  return (
    <SkeletonPage label="Loading applicants" className="space-y-6">
      <SkeletonHeader back actions={1} />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4 2xl:col-span-3">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonCard key={i} className="flex items-center gap-3 p-4">
                <Bone className="h-10 w-10" />
                <div className="space-y-1.5">
                  <Bone className="h-5 w-8" />
                  <Bone className="h-3 w-16" />
                </div>
              </SkeletonCard>
            ))}
          </div>
          <SkeletonCard className="space-y-3 p-4">
            <Bone className="h-11 w-full rounded-md" />
            <Bone className="h-3 w-12" />
            {Array.from({ length: 5 }, (_, i) => (
              <Bone key={i} className="h-9 w-full rounded-md" />
            ))}
          </SkeletonCard>
        </div>
        <div className="space-y-4 lg:col-span-8 2xl:col-span-9">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8" />
            <Bone className="h-4 w-28" />
          </div>
          <div className="grid gap-3 2xl:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} className="space-y-4">
                <div className="flex items-start gap-3">
                  <Bone className="h-9 w-9" />
                  <Bone className="h-11 w-11" />
                  <div className="flex-1 space-y-2">
                    <Bone className="h-4 w-1/3" />
                    <Bone className="h-3 w-1/2" />
                  </div>
                  <Bone className="h-5 w-20" />
                </div>
                <div className="flex gap-2 border-t border-border pt-4">
                  <Bone className="h-11 w-28 rounded-md" />
                  <Bone className="h-11 w-24 rounded-md" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
