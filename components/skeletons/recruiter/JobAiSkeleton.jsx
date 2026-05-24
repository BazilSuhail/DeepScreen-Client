import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /recruiter/jobs/create/ai: header, chat panel, job draft aside.
export default function JobAiSkeleton() {
  return (
    <SkeletonPage label="Loading AI job setup" className="space-y-6">
      <SkeletonHeader back actions={1} />
      <div className="grid gap-6 lg:grid-cols-12">
        <SkeletonCard className="flex h-[65dvh] min-h-[420px] flex-col gap-4 lg:col-span-7 lg:h-[calc(100dvh-16rem)] lg:min-h-[560px] xl:col-span-8 2xl:col-span-9">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8" />
            <Bone className="h-4 w-32" />
          </div>
          <div className="flex gap-2.5">
            <Bone className="h-8 w-8 rounded-full" />
            <Bone className="h-24 w-2/3 rounded-md" />
          </div>
          <div className="mt-auto flex gap-2">
            <Bone className="h-14 flex-1 rounded-md" />
            <Bone className="h-11 w-11 rounded-md" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="space-y-4 lg:col-span-5 xl:col-span-4 2xl:col-span-3">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8" />
            <Bone className="h-4 w-24" />
          </div>
          <Bone className="h-1.5 w-full rounded-full" />
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <Bone className="h-4 w-4" />
              <div className="flex-1 space-y-1.5">
                <Bone className="h-3 w-24" />
                <Bone className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </SkeletonCard>
      </div>
    </SkeletonPage>
  );
}
