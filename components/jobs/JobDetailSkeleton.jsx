const block = 'animate-pulse rounded-lg bg-emerald-100/70 dark:bg-white/10';
const card = 'rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card';

export default function JobDetailSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-8">
      <div className={`${card} p-6 md:p-8`}>
        <div className="flex items-start gap-4 md:gap-5">
          <div className={`${block} h-14 w-14 shrink-0 rounded-xl md:h-16 md:w-16`} />
          <div className="min-w-0 flex-1 space-y-3">
            <div className={`${block} h-8 w-3/4`} />
            <div className={`${block} h-4 w-1/3`} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${block} h-9 w-28`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-8 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${card} space-y-4 p-6 md:p-8`}>
              <div className="flex items-center gap-3">
                <div className={`${block} h-9 w-9 rounded-lg`} />
                <div className={`${block} h-6 w-1/4`} />
              </div>
              <div className={`${block} h-4 w-full`} />
              <div className={`${block} h-4 w-11/12`} />
              <div className={`${block} h-4 w-2/3`} />
            </div>
          ))}
        </div>

        <aside className="order-first min-w-0 space-y-6 lg:order-none lg:self-start">
          <div className={`${card} p-6`}>
            <div className={`${block} h-11 w-full`} />
          </div>
          <div className={`${card} grid grid-cols-1 gap-3 p-6 md:grid-cols-2`}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`${block} h-16`} />
            ))}
          </div>
          <div className={`${card} space-y-4 p-6`}>
            <div className="flex items-center gap-4">
              <div className={`${block} h-12 w-12 shrink-0 rounded-xl`} />
              <div className={`${block} h-5 w-2/3`} />
            </div>
            <div className={`${block} h-3 w-1/2`} />
          </div>
        </aside>
      </div>
    </div>
  );
}
