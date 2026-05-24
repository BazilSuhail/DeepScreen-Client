import { Bone, SkeletonCard, SkeletonBanner, SkeletonPage } from "@/components/skeletons/primitives";
import { CardGridSkeleton, pagePad } from "@/components/skeletons/candidate/parts";

// Mirrors /candidate/ai-interview: header with one action, next-step callout, interview card grid.
export default function AiInterviewsSkeleton() {
  return (
    <SkeletonPage label="Loading AI interviews" className={`space-y-6 ${pagePad}`}>
      <SkeletonBanner actions={1} />
      <SkeletonCard className="flex items-center gap-3 p-4">
        <Bone className="h-8 w-8" />
        <Bone className="h-4 w-2/3" />
      </SkeletonCard>
      <CardGridSkeleton count={6} />
    </SkeletonPage>
  );
}
