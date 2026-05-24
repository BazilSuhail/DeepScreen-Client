import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

// Mirrors /recruiter/ai-interview/[id]/sessions: header, 6 stat tiles, chart + summaries, candidate cards.
export default function AIInterviewSessionsSkeleton() {
  return (
    <SkeletonPage label="Loading candidates" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back actions={1} />
      <SkeletonStats count={6} className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6" />
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <SkeletonCard className="space-y-4 lg:col-span-7 lg:p-6 2xl:col-span-8">
          <Bone className="h-4 w-40" />
          <Bone className="h-56 w-full rounded-md" />
        </SkeletonCard>
        <div className="space-y-6 lg:col-span-5 2xl:col-span-4">
          <SkeletonCard className="space-y-4 lg:p-6">
            <Bone className="h-4 w-32" />
            {Array.from({ length: 3 }, (_, i) => <Bone key={i} className="h-6 w-full" />)}
          </SkeletonCard>
          <SkeletonCard className="grid grid-cols-2 gap-4 lg:p-6">
            <Bone className="h-20 rounded-md" />
            <Bone className="h-20 rounded-md" />
          </SkeletonCard>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-6 w-32" />
        <Bone className="hidden h-11 w-72 rounded-md sm:block" />
      </div>
      <div className="grid gap-3 2xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} className="flex items-center gap-3">
            <Bone className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/3" />
              <Bone className="h-3 w-1/2" />
            </div>
            <Bone className="h-11 w-32 rounded-md" />
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
