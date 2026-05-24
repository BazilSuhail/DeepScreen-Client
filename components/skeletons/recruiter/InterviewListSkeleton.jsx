import { Bone, SkeletonCard, SkeletonBanner, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

// Mirrors /recruiter/interview: header, next-step strip, 3 stat tiles, view switch, card grid.
export default function InterviewListSkeleton() {
  return (
    <SkeletonPage label="Loading live interviews" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonBanner actions={1} />
      <Bone className="h-12 w-full rounded-lg" />
      <SkeletonStats count={3} className="grid grid-cols-2 gap-4 sm:grid-cols-3" />
      <Bone className="h-12 w-full rounded-lg sm:w-80" />
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <div className="space-y-2">
          <Bone className="h-4 w-36" />
          <Bone className="h-3 w-56" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="space-y-4">
            <div className="flex items-start gap-3">
              <Bone className="h-11 w-11" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-2/3" />
                <Bone className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              <Bone className="h-7 w-20" />
              <Bone className="h-7 w-28" />
            </div>
            <Bone className="h-11 w-full rounded-md" />
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
