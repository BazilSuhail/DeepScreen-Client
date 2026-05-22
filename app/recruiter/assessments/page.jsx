'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import {
    HiOutlinePlus,
    HiOutlineBeaker,
    HiOutlineMagnifyingGlass,
    HiOutlineUserGroup,
    HiOutlineCheckCircle,
    HiOutlineArchiveBox,
    HiOutlineSquares2X2,
    HiOutlineXMark,
    HiOutlineClipboardDocumentCheck,
    HiOutlineQuestionMarkCircle,
    HiOutlineFunnel,
} from 'react-icons/hi2';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import RecruiterAssessmentCard from '@/components/assessments/RecruiterAssessmentCard';
import AssessmentNotice from '@/components/assessments/AssessmentNotice';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';
const isActive = (a) => a.is_active !== false;

function StatTile({ icon: Icon, value, label, hint }) {
    return (
        <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-5 dark:border-white/10 dark:bg-card">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <div className="text-2xl font-semibold tabular-nums text-emerald-950 dark:text-foreground">{value}</div>
                <div className="text-sm font-medium text-emerald-900/80 dark:text-slate-300">{label}</div>
                <div className="text-xs text-emerald-800/70 dark:text-slate-400">{hint}</div>
            </div>
        </div>
    );
}

function EmptyBlock({ icon: Icon, title, text, action }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.02]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700/70 shadow-sm dark:bg-white/5 dark:text-slate-400">
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-emerald-950 dark:text-foreground">{title}</p>
            <p className="max-w-sm text-sm text-emerald-800/70 dark:text-slate-400">{text}</p>
            {action && <div className="mt-1">{action}</div>}
        </div>
    );
}

const FILTERS = [
    { id: 'all', label: 'All', icon: HiOutlineSquares2X2 },
    { id: 'active', label: 'Active', icon: HiOutlineCheckCircle },
    { id: 'archived', label: 'Archived', icon: HiOutlineArchiveBox },
];

export default function RecruiterAssessmentsPage() {
    const router = useRouter();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [actionError, setActionError] = useState('');
    const [notice, setNotice] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    // Ignore responses from a superseded request (retry or unmount).
    useEffect(() => {
        let ignore = false;
        api.get('/assessments/')
            .then((data) => {
                if (ignore) return;
                setAssessments(Array.isArray(data) ? data : []);
                setLoadError('');
            })
            .catch((err) => {
                if (ignore) return;
                console.error('Fetch error:', err);
                setLoadError('We could not load your assessments. Check your connection and try again.');
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => { ignore = true; };
    }, [attempt]);

    // Success notices clear themselves; cleanup stops an older timer from hiding a newer message.
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(''), 3000);
        return () => clearTimeout(timer);
    }, [notice]);

    const retry = () => {
        setLoading(true);
        setLoadError('');
        setAttempt((n) => n + 1);
    };

    const handleArchive = async (assessment) => {
        const id = assessment.assessment_id;
        const title = assessment.title || 'this assessment';
        if (!window.confirm(`Archive ${title}? Candidates who already started it can still finish.`)) return;
        setActionError('');
        try {
            await api.patch(`/assessments/${id}/`, { is_active: false });
            setAssessments((prev) => prev.map((a) => (a.assessment_id === id ? { ...a, is_active: false } : a)));
            setNotice(`${title} moved to archived.`);
        } catch {
            setActionError('The assessment could not be archived. Try again.');
        }
    };

    const total = assessments.length;
    const activeCount = assessments.filter(isActive).length;
    const archivedCount = total - activeCount;
    const totalSessions = assessments.reduce((sum, a) => sum + (a.session_count || 0), 0);
    const counts = { all: total, active: activeCount, archived: archivedCount };

    const query = search.trim().toLowerCase();
    const visible = assessments.filter((a) => {
        if (filter === 'active' && !isActive(a)) return false;
        if (filter === 'archived' && isActive(a)) return false;
        if (!query) return true;
        return [a.title, a.description, a.job_title].some((v) => typeof v === 'string' && v.toLowerCase().includes(query));
    });
    const isFiltered = query !== '' || filter !== 'all';
    const clearFilters = () => { setSearch(''); setFilter('all'); };

    const createButton = (
        <button
            type="button"
            onClick={() => router.push('/recruiter/assessments/create')}
            className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 sm:w-auto ${focusRing}`}
        >
            <HiOutlinePlus className="h-5 w-5" aria-hidden="true" /> Create assessment
        </button>
    );

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            <DashboardBanner
                loading={loading}
                icon={HiOutlineBeaker}
                badge={loading ? undefined : { label: 'Assessment library', icon: HiOutlineClipboardDocumentCheck }}
                title="Assessments"
                subtitle="Coding, multiple-choice and written tests for your job openings."
                footer={!loading && !loadError && total === 0 ? (
                    <span className="flex items-center gap-2">
                        <HiOutlineQuestionMarkCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Next: create your first assessment, then add coding, multiple-choice or written questions.
                    </span>
                ) : null}
                aside={loading ? (
                    <div className="flex gap-2"><BannerBlock className="h-11 w-36 rounded-xl" /></div>
                ) : (
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">{createButton}</div>
                )}
            />

            {loading && <PageSkeleton stats={3} cards={2} banner={false} />}

            {!loading && loadError && (
                <AssessmentNotice title="Could not load assessments" message={loadError} onRetry={retry} />
            )}

            {!loading && !loadError && (
                <>
                    {notice && <AssessmentNotice tone="success" message={notice} />}
                    {actionError && <AssessmentNotice title="Action failed" message={actionError} />}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatTile icon={HiOutlineBeaker} value={total} label="Total assessments" hint={`${archivedCount} archived`} />
                        <StatTile icon={HiOutlineCheckCircle} value={activeCount} label="Open to candidates" hint="Candidates can start these" />
                        <StatTile icon={HiOutlineUserGroup} value={totalSessions} label="Candidate sessions" hint="Started across all assessments" />
                    </div>

                    <section aria-labelledby="assessment-list-heading" className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <h2 id="assessment-list-heading" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-emerald-950 dark:text-foreground">
                                <HiOutlineFunnel className="h-5 w-5 text-emerald-700/70 dark:text-slate-400" aria-hidden="true" />
                                All assessments <span className="ml-1 text-sm font-medium text-emerald-700/70 dark:text-slate-400">({visible.length} of {total})</span>
                            </h2>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1">
                                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700/70" aria-hidden="true" />
                                    <label htmlFor="assessment-search" className="sr-only">Search assessments</label>
                                    <input
                                        id="assessment-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by title, description or job"
                                        className="min-h-11 w-full rounded-2xl border border-emerald-100 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 outline-none transition-colors placeholder:text-emerald-700/70 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-white/10 dark:bg-white/5 dark:text-foreground"
                                    />
                                </div>
                                <fieldset aria-label="Filter by status" className="m-0 flex min-w-0 gap-2 overflow-x-auto border-0 p-0">
                                    {FILTERS.map((f) => {
                                        const selected = filter === f.id;
                                        return (
                                            <button
                                                key={f.id}
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() => setFilter(f.id)}
                                                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${focusRing} ${
                                                    selected
                                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                        : 'border-emerald-100 bg-white text-emerald-900/80 hover:border-emerald-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                                                }`}
                                            >
                                                <f.icon className="h-4 w-4" aria-hidden="true" />
                                                {f.label}
                                                <span className="tabular-nums text-xs text-emerald-700/70 dark:text-slate-400">{counts[f.id]}</span>
                                            </button>
                                        );
                                    })}
                                </fieldset>
                            </div>
                        </div>

                        {total === 0 ? (
                            <EmptyBlock
                                icon={HiOutlineBeaker}
                                title="No assessments yet"
                                text="Create your first assessment, then add coding, multiple-choice or written questions."
                                action={
                                    <button
                                        type="button"
                                        onClick={() => router.push('/recruiter/assessments/create')}
                                        className={`flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 ${focusRing}`}
                                    >
                                        <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create an assessment
                                    </button>
                                }
                            />
                        ) : visible.length === 0 ? (
                            <EmptyBlock
                                icon={HiOutlineMagnifyingGlass}
                                title="No matching assessments"
                                text="Try a different search term or status filter."
                                action={isFiltered && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className={`flex min-h-11 items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 text-sm font-semibold text-emerald-900 transition-colors hover:border-emerald-200 dark:border-white/10 dark:bg-white/5 dark:text-foreground ${focusRing}`}
                                    >
                                        <HiOutlineXMark className="h-4 w-4" aria-hidden="true" /> Clear search and filter
                                    </button>
                                )}
                            />
                        ) : (
                            <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {visible.map((a, i) => (
                                    <li key={a.assessment_id ?? `row-${i}`} className="min-w-0">
                                        <RecruiterAssessmentCard
                                            assessment={a}
                                            editHref={`/recruiter/assessments/${a.assessment_id}`}
                                            onEdit={(item) => router.push(`/recruiter/assessments/${item.assessment_id}`)}
                                            onSessions={(item) => router.push(`/recruiter/assessments/${item.assessment_id}/sessions`)}
                                            onArchive={handleArchive}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
