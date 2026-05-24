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
    HiOutlineFunnel,
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AssessmentListSkeleton from '@/components/skeletons/recruiter/AssessmentListSkeleton';
import RecruiterAssessmentCard from '@/components/assessments/RecruiterAssessmentCard';
import AssessmentNotice from '@/components/assessments/AssessmentNotice';
import { AnimatePresence, motion } from 'motion/react';
import EmptyState from '@/components/dashboard/EmptyState';
import { base, fadeUp, spring, stagger } from '@/constants/motion';
import { cardPadded, dangerButton, focusRing, iconTile, inputClass, secondaryButton } from '@/components/ui/styles';

const isActive = (a) => a.is_active !== false;

function StatTile({ icon: Icon, value, label, hint, i }) {
    return (
        <motion.div {...fadeUp} transition={{ ...base, delay: i * stagger }} className={`${cardPadded} flex min-w-0 flex-col gap-3`}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
            </div>
            <div className="text-3xl font-semibold tabular-nums text-foreground">{value}</div>
            <div className="truncate text-xs text-muted-foreground">{hint}</div>
        </motion.div>
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
    const [pending, setPending] = useState(null);

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

    const handleArchive = (assessment) =>
        setPending({
            title: `Archive ${assessment.title || 'this assessment'}?`,
            description: 'Candidates who already started it can still finish.',
            confirmLabel: 'Archive',
            run: () => archive(assessment),
        });

    const archive = async (assessment) => {
        const id = assessment.assessment_id;
        const title = assessment.title || 'this assessment';
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

    if (loading) return <AssessmentListSkeleton />;

    return (
        <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
            <DashboardBanner
                compact
                icon={HiOutlineBeaker}
                badge={loadError ? null : { label: `${total} ${total === 1 ? 'assessment' : 'assessments'}`, icon: HiOutlineBeaker }}
                title="Assessments"
                subtitle="Coding, multiple-choice and written tests for your job openings."
                actions={[{ label: 'Create assessment', href: '/recruiter/assessments/create', icon: HiOutlinePlus }]}
                footer={!loadError && total === 0 && 'Next: create your first assessment, then add questions.'}
            />

            {!loading && loadError && (
                <AssessmentNotice title="Could not load assessments" message={loadError} onRetry={retry} />
            )}

            {!loading && !loadError && (
                <>
                    {notice && <AssessmentNotice tone="success" message={notice} />}
                    {actionError && <AssessmentNotice title="Action failed" message={actionError} />}

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatTile i={0} icon={HiOutlineBeaker} value={total} label="Total" hint="Assessments in your library" />
                        <StatTile i={1} icon={HiOutlineCheckCircle} value={activeCount} label="Active" hint="Candidates can start these" />
                        <StatTile i={2} icon={HiOutlineArchiveBox} value={archivedCount} label="Archived" hint="Closed to new candidates" />
                        <StatTile i={3} icon={HiOutlineUserGroup} value={totalSessions} label="Sessions" hint="Started across all assessments" />
                    </div>

                    <section aria-labelledby="assessment-list-heading" className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <h2 id="assessment-list-heading" className="flex items-center gap-3 text-base font-semibold text-foreground">
                                <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                                    <HiOutlineFunnel className="h-4 w-4" aria-hidden="true" />
                                </span>
                                Library <span className="text-sm font-medium tabular-nums text-muted-foreground">{visible.length} of {total}</span>
                            </h2>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1">
                                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                    <label htmlFor="assessment-search" className="sr-only">Search assessments</label>
                                    <input
                                        id="assessment-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by title, description or job"
                                        className={`${inputClass} pl-10`}
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
                                                className={`relative flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none ${focusRing} ${
                                                    selected
                                                        ? 'border-transparent text-emerald-700 dark:text-emerald-400'
                                                        : 'border-emerald-100 bg-card text-emerald-900/80 hover:border-emerald-200 dark:border-white/10 dark:bg-white/5 dark:text-muted-foreground'
                                                }`}
                                            >
                                                {selected && (
                                                    <motion.span layoutId="assessment-filter" transition={spring} className="absolute -inset-px rounded-md border border-emerald-500/40 bg-emerald-500/10" aria-hidden="true" />
                                                )}
                                                <f.icon className="relative h-4 w-4" aria-hidden="true" />
                                                <span className="relative">{f.label}</span>
                                                <span className="relative tabular-nums text-xs text-muted-foreground">{counts[f.id]}</span>
                                            </button>
                                        );
                                    })}
                                </fieldset>
                            </div>
                        </div>

                        {total === 0 ? (
                            <EmptyState
                                icon={HiOutlineBeaker}
                                title="No assessments yet"
                                text="Create your first assessment, then add coding, multiple-choice or written questions."
                                action={
                                    <button
                                        type="button"
                                        onClick={() => router.push('/recruiter/assessments/create')}
                                        className={secondaryButton}
                                    >
                                        <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Create an assessment
                                    </button>
                                }
                            />
                        ) : visible.length === 0 ? (
                            <EmptyState
                                icon={HiOutlineMagnifyingGlass}
                                title="No matching assessments"
                                text="Try a different search term or status filter."
                                action={isFiltered && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className={secondaryButton}
                                    >
                                        <HiOutlineXMark className="h-4 w-4" aria-hidden="true" /> Clear search and filter
                                    </button>
                                )}
                            />
                        ) : (
                            <ul className="grid gap-4 sm:grid-cols-2">
                                <AnimatePresence initial={false} mode="popLayout">
                                {visible.map((a, i) => (
                                    <motion.li
                                        layout
                                        key={a.assessment_id ?? `row-${i}`}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={base}
                                        className="min-w-0"
                                    >
                                        <RecruiterAssessmentCard
                                            assessment={a}
                                            editHref={`/recruiter/assessments/${a.assessment_id}`}
                                            onEdit={(item) => router.push(`/recruiter/assessments/${item.assessment_id}`)}
                                            onSessions={(item) => router.push(`/recruiter/assessments/${item.assessment_id}/sessions`)}
                                            onArchive={handleArchive}
                                        />
                                    </motion.li>
                                ))}
                                </AnimatePresence>
                            </ul>
                        )}
                    </section>
                </>
            )}
            <ConfirmDialog
                open={pending !== null}
                title={pending?.title}
                description={pending?.description}
                confirmLabel={pending?.confirmLabel}
                confirmClassName={dangerButton}
                onConfirm={() => {
                    const { run } = pending;
                    setPending(null);
                    run();
                }}
                onCancel={() => setPending(null)}
            />
        </div>
    );
}
