import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

// Mirrors /recruiter/ai-interview/[id]: header with back + 2 actions, 4 stat tiles, tab bar, 8/4 config grid.
export default function AIInterviewDetailSkeleton() {
  return (
    <SkeletonPage label="Loading interview" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back actions={2} />
      <SkeletonStats count={4} />
      <Bone className="h-12 w-80 max-w-full rounded-lg" />
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8 2xl:col-span-9">
          {Array.from({ length: 2 }, (_, i) => (
            <SkeletonCard key={i} className="space-y-4 lg:p-6">
              <div className="flex items-center gap-3">
                <Bone className="h-9 w-9" />
                <div className="space-y-2">
                  <Bone className="h-4 w-40" />
                  <Bone className="h-3 w-56" />
                </div>
              </div>
              <Bone className="h-11 w-full rounded-md" />
              <Bone className="h-32 w-full rounded-md" />
            </SkeletonCard>
          ))}
        </div>
        <SkeletonCard className="space-y-4 lg:col-span-4 lg:p-6 2xl:col-span-3">
          <Bone className="h-4 w-36" />
          {Array.from({ length: 3 }, (_, i) => <Bone key={i} className="h-11 w-full rounded-md" />)}
          <Bone className="h-24 w-full rounded-md" />
        </SkeletonCard>
      </div>
    </SkeletonPage>
  );
}
