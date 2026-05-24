import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";
import { pagePad } from "@/components/skeletons/candidate/parts";

// Mirrors the editor body: form panel (tabs + fields) and preview panel.
export function ResumeEditorSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SkeletonCard className="space-y-4 p-0">
        <div className="space-y-2 border-b border-border p-5"><Bone className="h-5 w-40" /><Bone className="h-3 w-2/3" /></div>
        <div className="flex gap-2 overflow-hidden px-5">{[0, 1, 2, 3].map((i) => <Bone key={i} className="h-10 w-24 shrink-0 rounded-md" />)}</div>
        <div className="space-y-3 p-5 pt-0">
          <Bone className="h-11 w-full rounded-md" />
          <Bone className="h-11 w-full rounded-md" />
          <div className="grid grid-cols-2 gap-3"><Bone className="h-11 rounded-md" /><Bone className="h-11 rounded-md" /></div>
          <Bone className="h-24 w-full rounded-md" />
        </div>
      </SkeletonCard>
      <SkeletonCard className="space-y-4 p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border p-5">
          <div className="space-y-2"><Bone className="h-5 w-32" /><Bone className="h-3 w-48 max-w-[40vw]" /></div>
          <Bone className="h-11 w-36 rounded-md" />
        </div>
        <div className="flex min-h-[24rem] items-center justify-center p-5">
          <Bone className="h-20 w-20 rounded-lg" />
        </div>
      </SkeletonCard>
    </div>
  );
}

// Mirrors /candidate/resumes/[resume-build-id]: header with back + actions, then the two-panel editor.
export default function ResumeBuilderSkeleton() {
  return (
    <SkeletonPage label="Loading resume builder" className={`space-y-6 ${pagePad}`}>
      <SkeletonHeader back actions={2} />
      <ResumeEditorSkeleton />
    </SkeletonPage>
  );
}
