import { SkeletonHeader, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";
import { InterviewAsideSkeleton, InterviewFormSkeleton } from "@/components/skeletons/recruiter/InterviewSetupSkeleton";

// Mirrors /recruiter/interview/create: header with back, 2 stat tiles, 8/4 form + checklist grid.
export default function InterviewCreateSkeleton() {
  return (
    <SkeletonPage label="Loading interview scheduler" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader back />
      <SkeletonStats count={2} className="grid grid-cols-2 gap-4 lg:grid-cols-4" />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 2xl:col-span-9">
          <InterviewFormSkeleton fields={3} />
        </div>
        <div className="lg:col-span-4 2xl:col-span-3">
          <InterviewAsideSkeleton />
        </div>
      </div>
    </SkeletonPage>
  );
}
