import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

// Mirrors app/recruiter/assessments/[id]/sessions: header with back, 4 stats, search + filters, candidate card grid.
export default function AssessmentSessionsSkeleton() {
  return (
    <SkeletonPage label="Loading sessions" className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back />
      <SkeletonStats count={4} />
      <div className="flex flex-col gap-3 lg:flex-row">
        <Bone className="h-11 rounded-md lg:flex-1" />
        <div className="flex gap-1.5 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => <Bone key={i} className="h-11 w-24 shrink-0 rounded-md" />)}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <Bone className="h-5 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="flex items-center gap-4 p-4 sm:p-5">
            <Bone className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3 w-3/4" />
            </div>
            <Bone className="h-[52px] w-[52px] rounded-full" />
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
