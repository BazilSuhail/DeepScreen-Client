import { Bone, SkeletonCard, SkeletonPage, SkeletonStats } from '@/components/skeletons/primitives';

// Banner blocks use the banner's own tint so the hero does not flash from grey to emerald.
const bannerBone = 'animate-pulse rounded-sm bg-emerald-200/70 motion-reduce:animate-none dark:bg-white/10';

export default function OrganizationOverviewSkeleton() {
  return (
    <SkeletonPage label="Loading organization" className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:space-y-8 lg:px-8 2xl:px-10">
      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5 md:p-6 dark:border-white/5 dark:bg-emerald-dark">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0 space-y-4">
            <div className={`h-6 w-32 ${bannerBone}`} />
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 ${bannerBone}`} />
              <div className={`h-8 w-2/3 ${bannerBone}`} />
            </div>
            <div className={`h-3 w-1/3 ${bannerBone}`} />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }, (_, i) => <div key={i} className={`h-11 w-28 rounded-md ${bannerBone}`} />)}
            </div>
          </div>
          <div className="w-full space-y-3 rounded-lg border border-emerald-200 bg-white p-4 lg:w-72 dark:border-white/10 dark:bg-white/5">
            {Array.from({ length: 3 }, (_, i) => <div key={i} className={`h-4 w-full ${bannerBone}`} />)}
          </div>
        </div>
      </div>

      <SkeletonStats count={4} />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bone className="h-8 w-8" />
          <Bone className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} className="space-y-3">
              <Bone className="h-10 w-10" />
              <Bone className="h-4 w-2/3" />
              <Bone className="h-3 w-1/2" />
            </SkeletonCard>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <SkeletonCard className="space-y-4 lg:col-span-8 lg:p-6 2xl:col-span-9">
          <Bone className="h-5 w-40" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-3 border-t border-border pt-4">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Bone className="h-6 w-20" />
                <Bone className="h-6 w-20" />
              </div>
            </div>
          ))}
        </SkeletonCard>
        <div className="space-y-6 lg:col-span-4 2xl:col-span-3">
          <SkeletonCard className="space-y-4">
            <Bone className="h-5 w-24" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-4/5" />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Bone className="h-8 w-8" />
                <Bone className="h-4 w-1/2" />
              </div>
            ))}
          </SkeletonCard>
          <SkeletonCard className="flex items-center gap-3">
            <Bone className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3 w-2/3" />
            </div>
          </SkeletonCard>
        </div>
      </div>
    </SkeletonPage>
  );
}
