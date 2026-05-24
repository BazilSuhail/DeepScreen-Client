import { Bone, SkeletonCard, SkeletonPage, SkeletonStats } from '@/components/skeletons/primitives';
import OrgSubpageHeaderSkeleton, { ORG_SKELETON_PAGE } from './OrgSubpageHeaderSkeleton';

export default function OrgAnalyticsSkeleton() {
  return (
    <SkeletonPage label="Loading analytics" className={ORG_SKELETON_PAGE}>
      <OrgSubpageHeaderSkeleton />
      <SkeletonStats count={5} className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5" />
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonCard key={i} className="space-y-5 lg:p-6">
            <div className="flex items-center gap-3">
              <Bone className="h-8 w-8" />
              <div className="space-y-2">
                <Bone className="h-4 w-36" />
                <Bone className="h-3 w-48" />
              </div>
            </div>
            {i === 0 ? <Bone className="mx-auto h-56 w-56 rounded-full" /> : <Bone className="h-60 w-full" />}
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
