import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors app/recruiter/assessments/[id]: header with back + chips, question list (8/12) + settings aside (4/12).
export default function AssessmentDetailSkeleton() {
  return (
    <SkeletonPage label="Loading assessment" className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back actions={1} />
      <div className="grid gap-6 lg:grid-cols-12">
        <SkeletonCard className="space-y-5 lg:order-2 lg:col-span-4 lg:self-start lg:p-6 2xl:col-span-3">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8" />
            <Bone className="h-5 w-24" />
          </div>
          <Bone className="h-11 w-full rounded-md" />
          <Bone className="h-32 w-full rounded-md" />
          <div className="grid grid-cols-2 gap-3">
            <Bone className="h-11 rounded-md" />
            <Bone className="h-11 rounded-md" />
          </div>
          <Bone className="h-11 w-full rounded-md" />
        </SkeletonCard>
        <div className="space-y-4 lg:order-1 lg:col-span-8 2xl:col-span-9">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <Bone className="h-8 w-8" />
              <Bone className="h-5 w-28" />
            </div>
            <div className="flex gap-2">
              <Bone className="h-11 w-36 rounded-md" />
              <Bone className="h-11 w-36 rounded-md" />
            </div>
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} className="flex items-center gap-4 p-4">
              <Bone className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-1/2" />
                <Bone className="h-3 w-1/3" />
              </div>
              <Bone className="h-11 w-11 rounded-md" />
              <Bone className="h-11 w-11 rounded-md" />
            </SkeletonCard>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
