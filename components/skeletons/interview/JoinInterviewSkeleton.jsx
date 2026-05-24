import { Bone, SkeletonCard, SkeletonPage } from '@/components/skeletons/primitives';

// Mirrors the join lobby: preview + device controls on the left, details and join action on the right.
export default function JoinInterviewSkeleton() {
  return (
    <SkeletonPage label="Checking your interview link" className="min-h-dvh w-full bg-background px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="flex min-h-[calc(100dvh-3rem)] flex-col gap-6">
        <div className="flex items-center gap-3">
          <Bone className="h-10 w-10" />
          <div className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-5 w-48" />
          </div>
        </div>
        <div className="grid flex-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-7 2xl:col-span-8">
            <Bone className="aspect-video w-full rounded-lg" />
            <div className="flex justify-center gap-3">
              <Bone className="h-11 w-36 rounded-md" />
              <Bone className="h-11 w-36 rounded-md" />
            </div>
          </div>
          <SkeletonCard className="space-y-5 lg:col-span-5 lg:p-6 2xl:col-span-4">
            <Bone className="h-6 w-28" />
            <Bone className="h-8 w-2/3" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-4/5" />
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <Bone className="h-8 w-8" />
                  <Bone className="h-4 flex-1" />
                  <Bone className="h-5 w-16" />
                </div>
              ))}
            </div>
            <Bone className="h-12 w-full rounded-md" />
          </SkeletonCard>
        </div>
      </div>
    </SkeletonPage>
  );
}
