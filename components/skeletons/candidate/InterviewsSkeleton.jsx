import { Bone, SkeletonCard, SkeletonBanner, SkeletonPage } from "@/components/skeletons/primitives";
import { pagePad } from "@/components/skeletons/candidate/parts";

function SessionCards({ count }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} className="space-y-4 lg:p-6">
          <div className="flex items-start justify-between">
            <Bone className="h-10 w-10" />
            <Bone className="h-6 w-24" />
          </div>
          <Bone className="h-5 w-3/4" />
          <div className="space-y-2.5">
            <Bone className="h-4 w-2/3" />
            <Bone className="h-4 w-1/2" />
            <Bone className="h-4 w-1/3" />
          </div>
          <Bone className="h-4 w-24" />
        </SkeletonCard>
      ))}
    </div>
  );
}

function SectionHead() {
  return (
    <div className="flex items-center gap-3">
      <Bone className="h-8 w-8" />
      <div className="space-y-1.5"><Bone className="h-4 w-28" /><Bone className="h-3 w-20" /></div>
    </div>
  );
}

// Mirrors /candidate/interview: header, next-step callout, upcoming and past session grids.
export default function InterviewsSkeleton() {
  return (
    <SkeletonPage label="Loading interviews" className={`space-y-6 ${pagePad}`}>
      <SkeletonBanner actions={1} />
      <SkeletonCard className="flex items-center gap-3 p-4">
        <Bone className="h-8 w-8" />
        <Bone className="h-4 w-2/3" />
      </SkeletonCard>
      <div className="space-y-4"><SectionHead /><SessionCards count={2} /></div>
      <div className="space-y-4"><SectionHead /><SessionCards count={4} /></div>
    </SkeletonPage>
  );
}
