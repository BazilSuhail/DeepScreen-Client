import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from '@/components/skeletons/primitives';
import { ORG_SKELETON_PAGE } from './OrgSubpageHeaderSkeleton';

export default function CreateOrganizationSkeleton() {
  return (
    <SkeletonPage label="Loading" className={ORG_SKELETON_PAGE}>
      <SkeletonHeader back />
      <div className="grid gap-6 lg:grid-cols-12">
        <SkeletonCard className="space-y-5 lg:col-span-8 lg:p-6 2xl:col-span-9">
          <div className="flex gap-2">
            {Array.from({ length: 3 }, (_, i) => <Bone key={i} className="h-10 flex-1 rounded-md" />)}
          </div>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Bone className="h-3 w-28" />
              <Bone className="h-11 w-full rounded-md" />
            </div>
          ))}
          <div className="flex justify-end">
            <Bone className="h-11 w-32 rounded-md" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="space-y-4 lg:col-span-4 2xl:col-span-3">
          <Bone className="h-3 w-24" />
          <div className="flex items-center gap-3">
            <Bone className="h-11 w-11" />
            <Bone className="h-4 w-2/3" />
          </div>
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-1/2" />
        </SkeletonCard>
      </div>
    </SkeletonPage>
  );
}
