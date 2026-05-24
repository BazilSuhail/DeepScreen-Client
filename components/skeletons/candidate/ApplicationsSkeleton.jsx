import { Bone, SkeletonCard, SkeletonBanner, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";
import { ChipsSkeleton, pagePad } from "@/components/skeletons/candidate/parts";

// Mirrors /candidate/applications: header, 4 stat tiles, filter chips, application cards (2 columns on 2xl).
export default function ApplicationsSkeleton() {
  return (
    <SkeletonPage label="Loading applications" className={`space-y-6 ${pagePad}`}>
      <SkeletonBanner actions={1} />
      <SkeletonStats count={4} />
      <ChipsSkeleton count={5} />
      <div className="grid gap-4 2xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} className="flex flex-col gap-4 md:flex-row md:items-center lg:p-6">
            <div className="flex flex-1 items-center gap-4">
              <Bone className="h-11 w-11" />
              <div className="flex-1 space-y-2">
                <Bone className="h-5 w-1/2" />
                <Bone className="h-3 w-2/3" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bone className="h-10 w-16" />
              <Bone className="h-6 w-28" />
              <Bone className="h-11 w-11 rounded-md" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
