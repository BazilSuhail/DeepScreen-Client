import { Bone, SkeletonCard, SkeletonBanner, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

// Mirrors /recruiter/ai-interview: header, 3 stat tiles, search row, interview card grid.
export default function AIInterviewListSkeleton() {
  return (
    <SkeletonPage label="Loading AI interviews" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonBanner actions={1} />
      <SkeletonStats count={3} className="grid grid-cols-1 gap-4 sm:grid-cols-3" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Bone className="h-5 w-36" />
        <Bone className="h-11 w-full rounded-md sm:w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="space-y-4">
            <Bone className="h-3 w-28" />
            <Bone className="h-5 w-3/4" />
            <Bone className="h-6 w-24" />
            <div className="grid grid-cols-2 gap-2">
              <Bone className="h-9 rounded-md" />
              <Bone className="h-9 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Bone className="h-11 rounded-md" />
              <Bone className="h-11 rounded-md" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
