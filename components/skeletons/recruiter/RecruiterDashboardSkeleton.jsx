import { Bone, SkeletonCard, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";
import { BannerBlock } from "@/components/dashboard/DashboardBanner";

function PanelBones({ rows = 3, chart = false, className = "" }) {
  return (
    <SkeletonCard className={`space-y-5 lg:p-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8" />
        <div className="space-y-1.5">
          <Bone className="h-4 w-36" />
          <Bone className="h-3 w-24" />
        </div>
      </div>
      {chart ? (
        <Bone className="h-[220px] w-full" />
      ) : (
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, i) => (
            <Bone key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}
    </SkeletonCard>
  );
}

// Body of /recruiter below the banner. `banner` adds a placeholder for the hero (route loading.jsx).
export default function RecruiterDashboardSkeleton({ banner = true }) {
  const body = (
    <>
      <SkeletonStats count={4} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonCard key={i} className="space-y-4">
            <Bone className="h-8 w-8" />
            <Bone className="h-7 w-14" />
          </SkeletonCard>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <PanelBones rows={3} className="lg:col-span-8" />
        <PanelBones rows={3} className="lg:col-span-4" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-6">
        <PanelBones chart className="lg:col-span-2 xl:col-span-4" />
        <PanelBones chart className="xl:col-span-2" />
        <PanelBones chart className="xl:col-span-2" />
        <PanelBones chart className="xl:col-span-2" />
        <PanelBones chart className="xl:col-span-2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <PanelBones rows={4} />
        <PanelBones rows={4} />
        <PanelBones rows={4} className="lg:col-span-2 2xl:col-span-1" />
      </div>
    </>
  );
  if (!banner) return <SkeletonPage label="Loading dashboard" className="space-y-6 lg:space-y-8">{body}</SkeletonPage>;
  return (
    <SkeletonPage label="Loading dashboard" className="space-y-6 px-4 py-6 sm:px-6 lg:space-y-8 lg:px-8 2xl:px-10">
      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5 md:p-6 dark:border-white/5 dark:bg-emerald-dark">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-4">
            <BannerBlock className="h-6 w-40" />
            <BannerBlock className="h-8 w-72 max-w-[70vw]" />
            <BannerBlock className="h-3 w-1/2" />
            <BannerBlock className="h-4 w-2/3" />
          </div>
          <BannerBlock className="h-11 w-36 rounded-md" />
        </div>
      </div>
      {body}
    </SkeletonPage>
  );
}
