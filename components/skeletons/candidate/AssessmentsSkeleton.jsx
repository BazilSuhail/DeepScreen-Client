import { Bone, SkeletonCard, SkeletonBanner, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";
import { pagePad } from "@/components/skeletons/candidate/parts";

function SectionHead() {
  return (
    <div className="flex items-center gap-3">
      <Bone className="h-8 w-8" />
      <Bone className="h-4 w-32" />
      <Bone className="h-5 w-8" />
    </div>
  );
}

function RowCards({ count }) {
  return (
    <div className="grid gap-4 2xl:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} className="flex flex-col gap-4 md:flex-row md:items-center lg:p-6">
          <div className="flex flex-1 items-center gap-4">
            <Bone className="h-12 w-12" />
            <div className="flex-1 space-y-2">
              <Bone className="h-5 w-1/2" />
              <Bone className="h-3 w-1/3" />
              <div className="flex gap-2"><Bone className="h-5 w-16" /><Bone className="h-5 w-20" /></div>
            </div>
          </div>
          <Bone className="h-7 w-28" />
        </SkeletonCard>
      ))}
    </div>
  );
}

// Mirrors /candidate/assessments: header, 4 stat tiles, "Action required" and "Completed" sections.
export default function AssessmentsSkeleton() {
  return (
    <SkeletonPage label="Loading assessments" className={`space-y-6 ${pagePad}`}>
      <SkeletonBanner actions={1} />
      <SkeletonStats count={4} />
      <div className="space-y-4"><SectionHead /><RowCards count={2} /></div>
      <div className="space-y-4"><SectionHead /><RowCards count={4} /></div>
    </SkeletonPage>
  );
}
