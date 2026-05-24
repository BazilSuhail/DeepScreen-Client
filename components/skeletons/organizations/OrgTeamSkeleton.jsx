import { Bone, SkeletonCard, SkeletonPage, SkeletonStats } from '@/components/skeletons/primitives';
import OrgSubpageHeaderSkeleton, { ORG_SKELETON_PAGE } from './OrgSubpageHeaderSkeleton';

function TableSkeleton({ rows }) {
  return (
    <SkeletonCard className="p-0">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Bone className="h-8 w-8" />
        <Bone className="h-4 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Bone className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/3" />
              <Bone className="h-3 w-1/2" />
            </div>
            <Bone className="hidden h-6 w-20 md:block" />
            <Bone className="hidden h-6 w-16 md:block" />
            <Bone className="h-4 w-20" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
}

export default function OrgTeamSkeleton() {
  return (
    <SkeletonPage label="Loading team" className={ORG_SKELETON_PAGE}>
      <OrgSubpageHeaderSkeleton />
      <SkeletonStats count={3} className="grid grid-cols-1 gap-4 sm:grid-cols-3" />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8 2xl:col-span-9">
          <TableSkeleton rows={4} />
          <TableSkeleton rows={2} />
        </div>
        <div className="space-y-6 lg:col-span-4 2xl:col-span-3">
          <SkeletonCard className="flex items-center gap-4">
            <Bone className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3 w-2/3" />
            </div>
          </SkeletonCard>
          <SkeletonCard className="space-y-4">
            <Bone className="h-5 w-40" />
            <Bone className="h-3 w-full" />
            <Bone className="h-11 w-full rounded-md" />
            <Bone className="h-11 w-full rounded-md" />
          </SkeletonCard>
        </div>
      </div>
    </SkeletonPage>
  );
}
