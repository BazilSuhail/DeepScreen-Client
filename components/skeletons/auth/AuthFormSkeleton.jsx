import { Bone, SkeletonPage } from "@/components/skeletons/primitives";

// Mirrors AuthLayout: brand, heading, optional step row, form fields and submit on the left; showcase panel on lg+.
export default function AuthFormSkeleton({ fields = 2, steps = false, label = "Loading" }) {
  return (
    <SkeletonPage label={label} className="flex min-h-screen w-full bg-background">
      <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2.5">
            <Bone className="h-9 w-9" />
            <Bone className="h-5 w-28" />
          </div>
          <div className="space-y-2">
            <Bone className="h-8 w-56" />
            <Bone className="h-4 w-72 max-w-full" />
          </div>
          {steps && (
            <div className="flex items-center gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex flex-1 items-center gap-2 last:flex-none">
                  <Bone className="h-9 w-9 rounded-full" />
                  {i < 2 && <Bone className="h-0.5 flex-1" />}
                </div>
              ))}
            </div>
          )}
          {Array.from({ length: fields }, (_, i) => (
            <div key={i} className="space-y-2">
              <Bone className="h-3 w-24" />
              <Bone className="h-11 w-full rounded-md" />
            </div>
          ))}
          <Bone className="h-11 w-full rounded-md" />
        </div>
      </div>
      <div className="hidden w-1/2 items-center justify-center border-l border-emerald-100 bg-emerald-50/40 lg:flex dark:border-white/10 dark:bg-white/[0.02]">
        <div className="w-full max-w-md space-y-3 px-8">
          <Bone className="mx-auto mb-6 h-20 w-20" />
          <Bone className="mx-auto h-6 w-56" />
          <Bone className="mx-auto mb-6 h-4 w-72" />
          {Array.from({ length: 4 }, (_, i) => <Bone key={i} className="h-[74px] w-full rounded-lg" />)}
        </div>
      </div>
    </SkeletonPage>
  );
}
