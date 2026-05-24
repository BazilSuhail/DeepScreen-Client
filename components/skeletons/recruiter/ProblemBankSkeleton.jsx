import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /recruiter/problems: header with back link, four stat tiles, problem list grid.
export default function ProblemBankSkeleton() {
  return (
    <SkeletonPage label="Loading problem bank" className="space-y-6">
      <SkeletonHeader back actions={1} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} className="flex items-center gap-3">
            <Bone className="h-10 w-10" />
            <div className="space-y-1.5">
              <Bone className="h-6 w-10" />
              <Bone className="h-3 w-16" />
            </div>
          </SkeletonCard>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <Bone className="h-4 w-28" />
      </div>
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="flex items-center gap-4">
            <Bone className="h-11 w-11" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3 w-1/3" />
            </div>
            <Bone className="h-6 w-16" />
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
