import { Bone, SkeletonCard, SkeletonPage, SkeletonStats } from '@/components/skeletons/primitives';
import OrgSubpageHeaderSkeleton, { ORG_SKELETON_PAGE } from './OrgSubpageHeaderSkeleton';

export default function OrgJobsSkeleton() {
  return (
    <SkeletonPage label="Loading jobs" className={ORG_SKELETON_PAGE}>
      <OrgSubpageHeaderSkeleton />
      <SkeletonStats count={3} className="grid grid-cols-1 gap-4 sm:grid-cols-3" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="space-y-4">
            <div className="flex items-start gap-3">
              <Bone className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-3/4" />
                <Bone className="h-5 w-14" />
              </div>
            </div>
            <div className="space-y-2">
              <Bone className="h-3 w-2/3" />
              <Bone className="h-3 w-1/2" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Bone className="h-6 w-20" />
              <Bone className="h-3 w-16" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
