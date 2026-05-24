import { Bone, SkeletonCard, SkeletonBanner, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

// Mirrors app/recruiter/assessments: header, 4 stat tiles, search + filters, card grid.
export default function AssessmentListSkeleton() {
  return (
    <SkeletonPage label="Loading assessments" className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonBanner actions={1} />
      <SkeletonStats count={4} />
      <div className="space-y-4">
        <Bone className="h-8 w-40" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Bone className="h-11 flex-1 rounded-md" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => <Bone key={i} className="h-11 w-24 rounded-md" />)}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} className="space-y-4">
              <div className="flex items-start gap-4">
                <Bone className="h-12 w-12" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-5 w-3/4" />
                  <Bone className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3].map((j) => <Bone key={j} className="h-7 w-20" />)}
              </div>
              <div className="flex gap-2 border-t border-border pt-4">
                <Bone className="h-11 w-11 rounded-md" />
                <Bone className="h-11 flex-1 rounded-md" />
                <Bone className="h-11 w-24 rounded-md" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
