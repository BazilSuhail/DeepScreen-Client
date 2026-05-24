import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /recruiter/applications: header, three stat tiles, tip, role card grid.
export default function ApplicationsListSkeleton() {
  return (
    <SkeletonPage label="Loading applications" className="space-y-6">
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
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <Bone className="h-4 w-28" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} className="space-y-4 p-0">
            <div className="flex items-start gap-3 p-5 pb-0">
              <Bone className="h-11 w-11" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-3/4" />
                <Bone className="h-5 w-24" />
              </div>
            </div>
            <div className="flex gap-4 border-t border-border px-5 py-3">
              <Bone className="h-4 w-24" />
              <Bone className="h-4 w-20" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
