import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors the job create/edit pages: header with back link, sticky form bar, form sections, preview + checklist aside.
export default function JobFormSkeleton({ label = "Loading job form" }) {
  return (
    <SkeletonPage label={label} className="space-y-6">
      <SkeletonHeader back actions={2} />
      <div className="flex items-center justify-between border-b border-border py-3">
        <div className="space-y-2">
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-20" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-11 w-24 rounded-md" />
          <Bone className="h-11 w-28 rounded-md" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8 2xl:col-span-9">
          <Bone className="h-11 w-full rounded-md" />
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard key={i} className="space-y-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Bone className="h-8 w-8" />
                <div className="space-y-1.5">
                  <Bone className="h-4 w-40" />
                  <Bone className="h-3 w-56 max-w-[50vw]" />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {Array.from({ length: 3 }, (_, j) => (
                  <div key={j} className="space-y-2">
                    <Bone className="h-3 w-20" />
                    <Bone className="h-11 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </SkeletonCard>
          ))}
        </div>
        <div className="space-y-6 lg:col-span-4 2xl:col-span-3">
          <SkeletonCard className="space-y-3">
            <Bone className="h-3 w-16" />
            <Bone className="h-5 w-3/4" />
            <Bone className="h-4 w-1/2" />
            <Bone className="h-4 w-2/3" />
            <Bone className="h-4 w-1/2" />
          </SkeletonCard>
          <SkeletonCard className="space-y-3">
            <Bone className="h-4 w-32" />
            <Bone className="h-1.5 w-full rounded-full" />
            {Array.from({ length: 4 }, (_, i) => (
              <Bone key={i} className="h-4 w-2/3" />
            ))}
          </SkeletonCard>
        </div>
      </div>
    </SkeletonPage>
  );
}
