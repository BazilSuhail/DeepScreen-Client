import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

// Mirrors /recruiter/ai-interview/sessions/[sessionId]: header, report column (stats, chart, feedback, transcript)
// and the score + candidate + decision aside.
export default function AIInterviewSessionSkeleton() {
  return (
    <SkeletonPage label="Loading candidate report" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4 lg:col-start-9 2xl:col-span-3 2xl:col-start-10">
          <SkeletonCard className="flex flex-col items-center gap-3 lg:p-6">
            <Bone className="h-12 w-12" />
            <Bone className="h-10 w-24" />
            <Bone className="h-6 w-20" />
          </SkeletonCard>
          <SkeletonCard className="space-y-3 lg:p-6">
            <Bone className="h-4 w-28" />
            {Array.from({ length: 5 }, (_, i) => <Bone key={i} className="h-5 w-full" />)}
          </SkeletonCard>
        </div>
        <div className="space-y-6 lg:col-span-8 lg:col-start-1 lg:row-start-1 2xl:col-span-9">
          <SkeletonStats count={3} className="grid grid-cols-2 gap-4 md:grid-cols-3" />
          <SkeletonCard className="space-y-4 lg:p-6">
            <Bone className="h-4 w-40" />
            <Bone className="h-56 w-full rounded-md" />
          </SkeletonCard>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => (
              <SkeletonCard key={i} className="space-y-3 lg:p-6">
                <Bone className="h-4 w-32" />
                {Array.from({ length: 3 }, (_, j) => <Bone key={j} className="h-4 w-full" />)}
              </SkeletonCard>
            ))}
          </div>
          <SkeletonCard className="space-y-3 lg:p-6">
            <Bone className="h-4 w-36" />
            {Array.from({ length: 4 }, (_, i) => <Bone key={i} className="h-12 w-full rounded-md" />)}
          </SkeletonCard>
        </div>
      </div>
    </SkeletonPage>
  );
}
