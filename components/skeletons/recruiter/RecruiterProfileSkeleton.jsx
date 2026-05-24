import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors /recruiter/profile: header, identity card aside, four section cards.
export default function RecruiterProfileSkeleton() {
  return (
    <SkeletonPage label="Loading profile" className="space-y-6">
      <SkeletonHeader actions={1} />
      <div className="grid gap-6 lg:grid-cols-12">
        <SkeletonCard className="space-y-4 p-0 lg:col-span-4 2xl:col-span-3">
          <div className="flex flex-col items-center gap-3 border-b border-border px-5 py-6">
            <Bone className="h-20 w-20 rounded-full" />
            <Bone className="h-5 w-40" />
            <Bone className="h-4 w-28" />
          </div>
          <div className="space-y-4 px-5 pb-5">
            {Array.from({ length: 4 }, (_, i) => (
              <Bone key={i} className="h-4 w-3/4" />
            ))}
          </div>
        </SkeletonCard>
        <div className="grid gap-6 lg:col-span-8 xl:grid-cols-2 2xl:col-span-9">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} className="space-y-5 lg:p-6">
              <div className="flex items-center gap-3">
                <Bone className="h-8 w-8" />
                <Bone className="h-4 w-32" />
              </div>
              {Array.from({ length: 3 }, (_, j) => (
                <div key={j} className="space-y-2">
                  <Bone className="h-3 w-20" />
                  <Bone className="h-4 w-2/3" />
                </div>
              ))}
            </SkeletonCard>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
