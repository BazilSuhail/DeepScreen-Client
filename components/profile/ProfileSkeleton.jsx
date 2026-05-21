// Placeholder layout shown while the profile loads. Mirrors the real page so nothing jumps when data arrives.
function Bar({ className }) {
  return <div className={`animate-pulse rounded-md ${className}`} />;
}

function CardSkeleton({ lines }) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 lg:p-8">
      <Bar className="h-5 w-32 bg-secondary/60" />
      {Array.from({ length: lines }, (_, i) => (
        <Bar key={i} className={`h-3 bg-secondary/60 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export default function ProfileSkeleton() {
  return (
    <div className="w-full px-4 md:px-6 space-y-8 pb-12" role="status" aria-busy="true">
      <span className="sr-only">Loading your profile...</span>

      {/* Hero */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-[70%] min-h-[200px] space-y-6 rounded-2xl bg-slate-900 p-6 lg:p-10">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-white/10 lg:h-24 lg:w-24" />
            <div className="min-w-0 flex-1 space-y-3">
              <Bar className="h-7 w-2/3 bg-white/10" />
              <Bar className="h-3 w-1/2 bg-white/10" />
              <Bar className="h-3 w-1/3 bg-white/10" />
            </div>
          </div>
        </div>
        <div className="min-h-[200px] space-y-4 rounded-2xl bg-emerald-500/40 p-6 lg:w-[30%] lg:p-8">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/20" />
          <Bar className="h-5 w-2/3 bg-white/20" />
          <Bar className="h-3 w-1/2 bg-white/20" />
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={2} />
          <CardSkeleton lines={3} />
        </div>
        <div className="space-y-6">
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
        </div>
      </div>
    </div>
  );
}
