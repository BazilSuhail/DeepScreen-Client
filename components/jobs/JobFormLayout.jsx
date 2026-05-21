'use client';

// Layout for the job form: sticky top bar, then a main column and a sticky aside (two columns from lg up).
// DOM order is topBar, main, aside, so the reading and tab order stays logical.
export function JobFormLayout({ topBar, main, aside }) {
    return (
        <div className="space-y-6">
            <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
                {topBar}
            </div>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0 space-y-6">{main}</div>
                <aside className="space-y-6 self-start lg:sticky lg:top-24">{aside}</aside>
            </div>
        </div>
    );
}

export default JobFormLayout;
