import { Bone, SkeletonCard, SkeletonBanner, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";

function ChartBones({ className = "" }) {
  return (
    <SkeletonCard className={`space-y-5 lg:p-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <div className="space-y-1.5">
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-44" />
        </div>
      </div>
      <Bone className="h-[240px] w-full" />
    </SkeletonCard>
  );
}

// Mirrors /recruiter/analytics: header, KPI row, tip, chart grid, job breakdown table.
export default function AnalyticsSkeleton() {
  return (
    <SkeletonPage label="Loading analytics" className="space-y-6 lg:space-y-8">
      <SkeletonBanner actions={2} />
      <SkeletonStats count={4} />
      <Bone className="h-11 w-full rounded-md" />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-6">
        <ChartBones className="lg:col-span-2 xl:col-span-4" />
        <ChartBones className="xl:col-span-2" />
        <ChartBones className="xl:col-span-2" />
        <ChartBones className="xl:col-span-2" />
        <ChartBones className="lg:col-span-2 xl:col-span-2" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bone className="h-8 w-8" />
          <Bone className="h-4 w-32" />
        </div>
        <SkeletonCard className="divide-y divide-border p-0">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Bone className="h-8 w-8" />
              <Bone className="h-4 flex-1" />
              <Bone className="hidden h-4 w-1/2 sm:block" />
            </div>
          ))}
        </SkeletonCard>
      </div>
    </SkeletonPage>
  );
}
