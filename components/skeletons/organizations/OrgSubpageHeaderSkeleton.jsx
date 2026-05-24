import { Bone, SkeletonHeader } from '@/components/skeletons/primitives';

export const ORG_SKELETON_PAGE = 'w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10';

// Mirrors OrgSubpageHeader: back link, PageHeader, then the section tab strip.
export default function OrgSubpageHeaderSkeleton({ actions = 0 }) {
  return (
    <div className="space-y-5">
      <SkeletonHeader back actions={actions} />
      <div className="flex gap-2 overflow-hidden border-b border-border pb-2">
        {Array.from({ length: 7 }, (_, i) => (
          <Bone key={i} className="h-8 w-24 shrink-0 rounded-md" />
        ))}
      </div>
    </div>
  );
}
