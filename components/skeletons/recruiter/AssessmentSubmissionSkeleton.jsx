import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

// Mirrors app/recruiter/assessments/[id]/sessions/[submissionId]: header with back + score ring,
// 4 stats, question breakdown (8/12) + per-question chart aside (4/12).
export default function AssessmentSubmissionSkeleton() {
  return (
    <SkeletonPage label="Loading candidate session" className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="relative">
        <SkeletonHeader back />
        <Bone className="absolute bottom-0 right-0 hidden h-20 w-20 rounded-full lg:block" />
      </div>
      <SkeletonStats count={4} />
      <div className="grid gap-6 lg:grid-cols-12">
        <SkeletonCard className="space-y-4 lg:order-2 lg:col-span-4 lg:self-start lg:p-6 2xl:col-span-3">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8" />
            <Bone className="h-5 w-36" />
          </div>
          <Bone className="h-64 w-full rounded-md" />
        </SkeletonCard>
        <div className="space-y-4 lg:order-1 lg:col-span-8 2xl:col-span-9">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8" />
            <Bone className="h-5 w-40" />
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} className="flex items-center gap-4 p-4 sm:p-5">
              <Bone className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-1/2" />
                <Bone className="h-3 w-1/4" />
              </div>
              <Bone className="h-6 w-20" />
            </SkeletonCard>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
