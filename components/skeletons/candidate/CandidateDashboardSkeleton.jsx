import { Bone, SkeletonPage, SkeletonStats } from "@/components/skeletons/primitives";
import { BannerSkeleton, PanelSkeleton, RowsSkeleton, pagePad } from "@/components/skeletons/candidate/parts";

// Mirrors /candidate: banner, 4 stat tiles, 8/4 grid (pipeline, recent applications, two charts, trend |
// upcoming interviews, next steps, activity), then AI review cards.
// `banner={false}` when the page already renders its real banner above.
export default function CandidateDashboardSkeleton({ banner = true }) {
  const body = (
    <>
      <SkeletonStats count={4} />
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <PanelSkeleton action>
            <div className="grid gap-6 md:grid-cols-2">
              <Bone className="h-56 rounded-md" />
              <Bone className="h-56 rounded-md" />
            </div>
          </PanelSkeleton>
          <PanelSkeleton action>
            <RowsSkeleton rows={5} trailing />
          </PanelSkeleton>
          <div className="grid gap-6 md:grid-cols-2">
            <PanelSkeleton><Bone className="h-56 rounded-md" /></PanelSkeleton>
            <PanelSkeleton><Bone className="h-56 rounded-md" /></PanelSkeleton>
          </div>
          <PanelSkeleton><Bone className="h-56 rounded-md" /></PanelSkeleton>
        </div>
        <div className="space-y-6 xl:col-span-4">
          <PanelSkeleton><RowsSkeleton rows={3} trailing /></PanelSkeleton>
          <PanelSkeleton><RowsSkeleton rows={4} /></PanelSkeleton>
          <PanelSkeleton><RowsSkeleton rows={5} /></PanelSkeleton>
        </div>
      </div>
      <PanelSkeleton>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <Bone key={i} className="h-40 rounded-md" />)}
        </div>
      </PanelSkeleton>
    </>
  );

  if (!banner) return <SkeletonPage label="Loading dashboard" className="space-y-6 lg:space-y-8">{body}</SkeletonPage>;
  return (
    <SkeletonPage label="Loading dashboard" className={`space-y-6 lg:space-y-8 ${pagePad}`}>
      <BannerSkeleton />
      {body}
    </SkeletonPage>
  );
}
