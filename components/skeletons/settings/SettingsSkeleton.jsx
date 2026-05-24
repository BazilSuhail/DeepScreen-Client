import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /settings: header, preferences card (profile + theme rows), danger zone card.
export default function SettingsSkeleton() {
  return (
    <SkeletonPage label="Loading settings" className="space-y-6 px-4 pb-16 sm:px-6 lg:px-8 2xl:px-10">
      <SkeletonHeader />
      <SkeletonCard className="space-y-6 lg:p-6">
        <div className="flex items-center gap-3">
          <Bone className="h-8 w-8" />
          <div className="space-y-1.5">
            <Bone className="h-5 w-32" />
            <Bone className="h-3 w-56 max-w-[60vw]" />
          </div>
        </div>
        <div className="space-y-5">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="flex flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Bone className="h-8 w-8" />
                <div className="space-y-1.5">
                  <Bone className="h-4 w-36" />
                  <Bone className="h-3 w-60 max-w-[60vw]" />
                </div>
              </div>
              <Bone className="h-11 w-40 rounded-md" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <div className="space-y-4 rounded-lg border border-red-200 bg-red-50/60 p-5 lg:p-6 dark:border-red-500/20 dark:bg-red-500/5">
        <div className="flex items-start gap-3">
          <Bone className="h-8 w-8" />
          <div className="space-y-1.5">
            <Bone className="h-5 w-28" />
            <Bone className="h-4 w-96 max-w-[70vw]" />
          </div>
        </div>
        <Bone className="h-11 w-40 rounded-md" />
      </div>
    </SkeletonPage>
  );
}
