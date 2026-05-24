import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage, SkeletonStats } from '@/components/skeletons/primitives';
import { ORG_SKELETON_PAGE } from './OrgSubpageHeaderSkeleton';

export default function OrganizationsListSkeleton() {
  return (
    <SkeletonPage label="Loading your organizations" className={ORG_SKELETON_PAGE}>
      <SkeletonHeader actions={1} />
      <SkeletonStats count={3} className="grid grid-cols-1 gap-4 sm:grid-cols-3" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} className="space-y-4">
            <div className="flex items-start gap-3">
              <Bone className="h-11 w-11" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-2/3" />
                <Bone className="h-5 w-20" />
              </div>
            </div>
            <Bone className="h-3 w-1/2" />
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Bone className="h-8 w-full" />
              <Bone className="h-8 w-full" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
