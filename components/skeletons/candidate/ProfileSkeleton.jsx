import { Bone, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";
import { PanelSkeleton, pagePad } from "@/components/skeletons/candidate/parts";

const lines = (n) => (
  <div className="space-y-2.5">
    {Array.from({ length: n }, (_, i) => <Bone key={i} className={`h-3 ${i % 2 ? "w-4/5" : "w-full"}`} />)}
  </div>
);

const chips = (n) => (
  <div className="flex flex-wrap gap-2">
    {Array.from({ length: n }, (_, i) => <Bone key={i} className="h-6 w-20" />)}
  </div>
);

// Mirrors /candidate/profile: header with action, 4/8 grid (identity, contact, links, visibility, activity |
// about, skills, experience + education).
export default function ProfileSkeleton() {
  return (
    <SkeletonPage label="Loading profile" className={`space-y-6 ${pagePad}`}>
      <SkeletonHeader actions={1} />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4 2xl:col-span-3">
          <PanelSkeleton>
            <div className="flex flex-col items-center gap-3">
              <Bone className="h-20 w-20 rounded-full" />
              <Bone className="h-5 w-40" />
              <Bone className="h-3 w-48 max-w-full" />
              <div className="flex gap-2"><Bone className="h-6 w-24" /><Bone className="h-6 w-24" /></div>
            </div>
          </PanelSkeleton>
          <PanelSkeleton>{lines(2)}</PanelSkeleton>
          <PanelSkeleton>{lines(3)}</PanelSkeleton>
          <PanelSkeleton>{lines(2)}</PanelSkeleton>
          <PanelSkeleton>{lines(2)}</PanelSkeleton>
        </div>
        <div className="space-y-6 lg:col-span-8 2xl:col-span-9">
          <PanelSkeleton>{lines(4)}</PanelSkeleton>
          <PanelSkeleton>
            <div className="space-y-4">{chips(6)}{chips(4)}{chips(3)}</div>
          </PanelSkeleton>
          <div className="grid gap-6 xl:grid-cols-2">
            <PanelSkeleton>{lines(5)}</PanelSkeleton>
            <PanelSkeleton>{lines(4)}</PanelSkeleton>
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
