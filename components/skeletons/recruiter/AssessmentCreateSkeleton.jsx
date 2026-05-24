import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors app/recruiter/assessments/create: header with back, step tabs, form card (8/12) + summary aside (4/12).
export default function AssessmentCreateSkeleton() {
  return (
    <SkeletonPage label="Loading assessment builder" className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back />
      <Bone className="h-14 w-full rounded-lg sm:w-80" />
      <div className="grid gap-6 lg:grid-cols-12">
        <SkeletonCard className="space-y-6 lg:col-span-8 lg:p-6 2xl:col-span-9">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2">
              <Bone className="h-4 w-32" />
              <Bone className={`${i ? "h-32" : "h-11"} w-full rounded-md`} />
            </div>
          ))}
          <div className="grid gap-6 sm:grid-cols-2">
            <Bone className="h-11 rounded-md" />
            <Bone className="h-11 rounded-md" />
          </div>
          <Bone className="h-11 w-full rounded-md" />
          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Bone className="h-11 w-28 rounded-md" />
            <Bone className="h-11 w-48 rounded-md" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="space-y-4 lg:col-span-4 lg:self-start lg:p-6 2xl:col-span-3">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8" />
            <Bone className="h-5 w-24" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between py-1">
              <Bone className="h-4 w-24" />
              <Bone className="h-4 w-16" />
            </div>
          ))}
        </SkeletonCard>
      </div>
    </SkeletonPage>
  );
}
