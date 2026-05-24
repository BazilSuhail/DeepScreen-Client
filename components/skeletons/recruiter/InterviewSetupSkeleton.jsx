import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// The configuration form card alone; SetupInterviewConfig renders it while its saved config loads.
export function InterviewFormSkeleton({ fields = 4 }) {
  return (
    <SkeletonCard className="space-y-6 lg:p-6">
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <Bone className="h-4 w-40" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-3 w-28" />
            <Bone className="h-11 w-full rounded-md" />
          </div>
        ))}
      </div>
      <Bone className="h-24 w-full rounded-md" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Bone key={i} className="h-16 rounded-md" />
        ))}
      </div>
      <Bone className="h-11 w-full rounded-md" />
    </SkeletonCard>
  );
}

export function InterviewAsideSkeleton() {
  return (
    <SkeletonCard className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <Bone className="h-4 w-32" />
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex gap-2">
          <Bone className="h-4 w-4 rounded-full" />
          <Bone className="h-4 flex-1" />
        </div>
      ))}
    </SkeletonCard>
  );
}

// Mirrors /recruiter/interview/setup/[job_id]: header with back, 8/4 form + tips grid.
export default function InterviewSetupSkeleton() {
  return (
    <SkeletonPage label="Loading interview setup" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 2xl:col-span-9">
          <InterviewFormSkeleton />
        </div>
        <div className="lg:col-span-4 2xl:col-span-3">
          <InterviewAsideSkeleton />
        </div>
      </div>
    </SkeletonPage>
  );
}
