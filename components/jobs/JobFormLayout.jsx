'use client';

// Layout for the job form: sticky top bar, then a main column and a sticky aside (12-col grid from lg up).
// DOM order is topBar, main, aside, so the reading and tab order stays logical.
export function JobFormLayout({ topBar, main, aside }) {
    return (
        <div className="space-y-6">
            <div className="sticky top-0 z-20 -mx-4 border-b border-emerald-100 bg-background px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 2xl:-mx-10 2xl:px-10 dark:border-white/10">
                {topBar}
            </div>
            <div className="grid gap-6 lg:grid-cols-12">
                <div className="min-w-0 space-y-6 lg:col-span-8 2xl:col-span-9">{main}</div>
                <aside className="min-w-0 space-y-6 self-start lg:sticky lg:top-24 lg:col-span-4 2xl:col-span-3">{aside}</aside>
            </div>
        </div>
    );
}

export default JobFormLayout;
