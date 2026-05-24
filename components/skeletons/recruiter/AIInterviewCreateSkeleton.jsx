import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /recruiter/ai-interview/create: header with back, job picker grid, sticky progress + summary aside.
export default function AIInterviewCreateSkeleton() {
  return (
    <SkeletonPage label="Loading interview builder" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8 2xl:col-span-9">
          <div className="flex items-start gap-3">
            <Bone className="h-8 w-8" />
            <div className="space-y-2">
              <Bone className="h-5 w-40" />
              <Bone className="h-3 w-72 max-w-[60vw]" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} className="flex items-center gap-4 p-4">
                <Bone className="h-11 w-11" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-4 w-2/3" />
                  <Bone className="h-3 w-1/3" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
        <div className="hidden space-y-6 lg:col-span-4 lg:block 2xl:col-span-3">
          <SkeletonCard className="space-y-3">
            <Bone className="h-5 w-28" />
            {Array.from({ length: 4 }, (_, i) => <Bone key={i} className="h-10 w-full rounded-md" />)}
          </SkeletonCard>
          <SkeletonCard className="space-y-3">
            <Bone className="h-5 w-24" />
            {Array.from({ length: 8 }, (_, i) => <Bone key={i} className="h-5 w-full" />)}
            <Bone className="h-4 w-3/4" />
          </SkeletonCard>
        </div>
      </div>
    </SkeletonPage>
  );
}
