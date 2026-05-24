import { Bone, SkeletonCard, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";
import { pagePad } from "@/components/skeletons/candidate/parts";

// Mirrors /candidate/resumes: header with two actions, then resume cards (preview band, title, 3 meta rows, buttons).
export default function ResumesSkeleton() {
  return (
    <SkeletonPage label="Loading resumes" className={`space-y-6 ${pagePad}`}>
      <SkeletonHeader actions={2} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} className="overflow-hidden p-0">
            <Bone className="h-32 w-full rounded-none" />
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-2">
                <Bone className="h-5 w-2/3" />
                <Bone className="h-11 w-11 rounded-md" />
              </div>
              <div className="space-y-2">
                <Bone className="h-3 w-1/2" />
                <Bone className="h-3 w-2/3" />
                <Bone className="h-3 w-1/2" />
              </div>
              <div className="flex gap-2">
                <Bone className="h-11 flex-1 rounded-md" />
                <Bone className="h-11 w-20 rounded-md" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}
