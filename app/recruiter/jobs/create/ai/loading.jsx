import JobAiSkeleton from "@/components/skeletons/recruiter/JobAiSkeleton";

export default function Loading() {
  return (
    <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <JobAiSkeleton />
    </div>
  );
}
