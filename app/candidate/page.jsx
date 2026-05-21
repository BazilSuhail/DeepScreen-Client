'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import {
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineStar,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineChevronRight,
    HiOutlineDocumentDuplicate,
    HiOutlineChartBar,
    HiOutlineVideoCamera,
    HiOutlineAcademicCap,
    HiOutlineExclamationTriangle,
    HiOutlineArrowRight,
    HiOutlineMagnifyingGlass,
    HiOutlinePlus,
    HiOutlineChatBubbleLeftEllipsis,
    HiOutlineCodeBracket,
    HiOutlineMap,
    HiOutlineFire,
    HiOutlineShieldCheck,
    HiOutlinePaperAirplane,
    HiOutlineFlag,
} from 'react-icons/hi2';
import Link from 'next/link';
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';

const ICON_MAP = {
    HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineStar,
    HiOutlineBriefcase, HiOutlineVideoCamera, HiOutlineAcademicCap,
    HiOutlineClock,
};

const STAGE_ICONS = [
    HiOutlineBriefcase, HiOutlineShieldCheck, HiOutlineCodeBracket,
    HiOutlineChatBubbleLeftEllipsis, HiOutlineVideoCamera, HiOutlinePaperAirplane,
];

const ACTIVITY_ICONS = {
    success: HiOutlineCheckCircle,
    offer: HiOutlinePaperAirplane,
    interview: HiOutlineVideoCamera,
    ai: HiOutlineChatBubbleLeftEllipsis,
    assessment: HiOutlineAcademicCap,
    rejection: HiOutlineExclamationTriangle,
    pending: HiOutlineClock,
    application: HiOutlineDocumentText,
};

/* ── Stat Card ── */
function StatCard({ stat, index }) {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-500',
        emerald: 'bg-emerald-500/10 text-emerald-500',
        purple: 'bg-purple-500/10 text-purple-400',
    };
    const Icon = ICON_MAP[stat.icon] || HiOutlineDocumentText;
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass p-8 rounded-2xl border border-emerald-500/5 relative overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
        >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${colors[stat.color]} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                </div>
                <HiOutlineChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-emerald-500/50 transition-all" />
            </div>
            <div className="text-4xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</div>
        </motion.div>
    );
}

/* ── Stage Badge ── */
function StageBadge({ stage }) {
    const styles = {
        Applied: 'bg-blue-500/10 text-blue-500',
        Shortlisted: 'bg-emerald-500/10 text-emerald-500',
        'Coding Pending': 'bg-amber-500/10 text-amber-500',
        'Coding Passed': 'bg-emerald-500/10 text-emerald-500',
        'Ai Interview Pending': 'bg-violet-500/10 text-violet-500',
        'Ai Interview Passed': 'bg-violet-500/10 text-violet-500',
        'Real Interview Scheduled': 'bg-cyan-500/10 text-cyan-500',
        Offered: 'bg-purple-500/10 text-purple-400',
        Hired: 'bg-emerald-500/10 text-emerald-500',
        Rejected: 'bg-rose-500/10 text-rose-500',
    };
    return (
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${styles[stage] || 'bg-secondary text-muted-foreground'}`}>
            {stage}
        </span>
    );
}

/* ── Journey Bar ── */
function JourneyBar({ label, value, max, index }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    const colors = ['from-blue-500 to-blue-400', 'from-emerald-500 to-emerald-400', 'from-amber-500 to-amber-400', 'from-violet-500 to-violet-400', 'from-cyan-500 to-cyan-400', 'from-purple-500 to-purple-400'];
    const Icon = STAGE_ICONS[index] || HiOutlineFlag;
    const iconColors = ['text-blue-500', 'text-emerald-500', 'text-amber-500', 'text-violet-500', 'text-cyan-500', 'text-purple-400'];
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="flex items-center gap-2 group cursor-pointer hover:bg-secondary/20 p-1.5 transition-colors"
        >
            <div className={`w-7 h-7 bg-secondary/50 flex items-center justify-center shrink-0 ${iconColors[index]}`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] font-bold text-muted-foreground truncate">{label}</span>
                            <span className="text-xs font-bold ml-2">{value}</span>
                </div>
                <div className="h-1.5 bg-secondary/40 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: 'easeOut' }}
                        className={`h-full bg-gradient-to-r ${colors[index]}`}
                    />
                </div>
            </div>
        </motion.div>
    );
}

/* ── Activity Item ── */
function ActivityItem({ a, i }) {
    const Icon = ACTIVITY_ICONS[a.type] || HiOutlineClock;
    const iconColors = {
        success: 'bg-emerald-500/10 text-emerald-500',
        offer: 'bg-purple-500/10 text-purple-400',
        interview: 'bg-cyan-500/10 text-cyan-500',
        ai: 'bg-violet-500/10 text-violet-500',
        assessment: 'bg-emerald-500/10 text-emerald-500',
        rejection: 'bg-rose-500/10 text-rose-500',
        pending: 'bg-amber-500/10 text-amber-500',
        application: 'bg-blue-500/10 text-blue-500',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/20 transition-colors group cursor-pointer"
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconColors[a.type] || 'bg-secondary text-muted-foreground'} group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-foreground/80">{a.text}</p>
                <span className="text-[11px] text-muted-foreground/50 flex items-center gap-1 mt-0.5">
                    <HiOutlineClock className="w-3 h-3" /> {a.time}
                </span>
            </div>
        </motion.div>
    );
}

/* ── Profile Donut (visx Pie) ── */
function ProfileDonut({ value = 0 }) {
    const pieData = useMemo(() => [
        { label: 'filled', value: Math.max(0, Math.min(100, value)) },
        { label: 'empty', value: Math.max(0, 100 - Math.max(0, Math.min(100, value))) },
    ], [value]);

    return (
        <svg width={120} height={120} className="shrink-0">
            <Group top={60} left={60}>
                <Pie data={pieData} pieValue={d => d.value}
                    outerRadius={60} innerRadius={50} cornerRadius={4} padAngle={0.02}
                >
                    {pie => pie.arcs.map((arc, i) => (
                        <path key={i} d={pie.path(arc) || ''}
                            fill={arc.data.label === 'filled' ? '#10b981' : 'rgba(255,255,255,0.05)'} />
                    ))}
                </Pie>
                <text textAnchor="middle" dominantBaseline="central"
                    fill="#10b981" fontSize={20} fontWeight={600}
                    style={{ fontFamily: 'inherit' }}>
                    {value}%
                </text>
            </Group>
        </svg>
    );
}

export default function CandidateDashboard() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        setMounted(true);
        (async () => {
            try {
                const res = await api.get('/accounts/candidate/dashboard/');
                setData(res);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (!mounted || loading) {
        return (
            <div className="space-y-10 p-4 md:px-8 pb-4 max-w-7xl mx-auto animate-pulse">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-secondary shrink-0" />
                        <div className="space-y-2">
                            <div className="h-8 w-72 bg-secondary rounded-lg" />
                            <div className="h-5 w-48 bg-secondary rounded" />
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-8 w-24 bg-secondary rounded-xl" />
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-border p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-20 bg-secondary rounded" />
                                <div className="h-5 w-12 bg-secondary rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 rounded-2xl border border-border p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-secondary" />
                            <div className="space-y-1">
                                <div className="h-5 w-28 bg-secondary rounded" />
                                <div className="h-3 w-20 bg-secondary rounded" />
                            </div>
                        </div>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-6 w-full bg-secondary rounded" />
                        ))}
                    </div>
                    <div className="lg:col-span-2 rounded-2xl border border-border p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-secondary" />
                            <div className="space-y-1">
                                <div className="h-5 w-20 bg-secondary rounded" />
                                <div className="h-3 w-16 bg-secondary rounded" />
                            </div>
                        </div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 w-full bg-secondary rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-border p-6 space-y-3">
                            <div className="h-5 w-36 bg-secondary rounded" />
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="h-16 w-full bg-secondary rounded-xl" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                    <HiOutlineExclamationTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <p className="text-sm font-medium">Failed to load dashboard.</p>
                <button onClick={() => window.location.reload()} className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">
                    Try Again
                </button>
            </div>
        );
    }

    const { user, stats, stageBreakdown, recentApplications, upcomingInterviews, assessments, aiInterviews, activity, summary } = data;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const maxStage = Math.max(...(stageBreakdown || []).map((s) => s.value), 1);

    const quickActions = [
        { label: 'Browse Jobs', icon: HiOutlineMagnifyingGlass, href: '/jobs', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' },
        { label: 'Upload Resume', icon: HiOutlinePlus, href: '/candidate/resumes', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20' },
        { label: 'Applications', icon: HiOutlineDocumentText, href: '/candidate/applications', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500/20' },
        { label: 'Interviews', icon: HiOutlineVideoCamera, href: '/candidate/interview', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20' },
    ];

    return (
        <div className="space-y-10 p-4 md:px-8 pb-4 max-w-7xl mx-auto">

        {/* ═══ Header ═══ */}
        <div className="flex items-start justify-between gap-4" >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <HiOutlineFire className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
                    <p className="text-muted-foreground mt-1 text-lg flex items-center gap-2">
                        <HiOutlineClock className="w-4 h-4" /> {today}
                    </p>
                </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 shrink-0">
                {quickActions.map((a) => (
                    <Link key={a.label} href={a.href} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${a.color}`}>
                        <a.icon className="w-3.5 h-3.5" />
                        {a.label}
                    </Link>
                ))}
            </div>
        </div>

            {/* ═══ Quick Actions (mobile) ═══ */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {quickActions.map((a) => (
                    <Link key={a.label} href={a.href} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${a.color}`}>
                        <a.icon className="w-3.5 h-3.5" />
                        {a.label}
                    </Link>
                ))}
            </div>

            {/* ═══ Stats Grid ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(stats || []).map((stat, i) => (
                    <StatCard key={stat.label} stat={stat} index={i} />
                ))}
            </div>

            {/* ═══ Your Journey + Overview ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 glass p-6 border border-emerald-500/5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 bg-violet-500/10 flex items-center justify-center">
                            <HiOutlineMap className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Your Journey</h3>
                            <p className="text-xs text-muted-foreground/60">Progress across stages</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {(stageBreakdown || []).map((s, i) => (
                            <JourneyBar key={s.label} label={s.label} value={s.value} max={maxStage} index={i} />
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 glass p-6 border border-emerald-500/5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 bg-emerald-500/10 flex items-center justify-center">
                            <HiOutlineChartBar className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Overview</h3>
                            <p className="text-xs text-muted-foreground/60">At a glance</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-secondary/20">
                            <span className="text-sm font-bold text-muted-foreground">Applications</span>
                            <span className="text-lg font-bold">{(stats || []).find(s => s.label === 'Applications')?.value || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-secondary/20">
                            <span className="text-sm font-bold text-muted-foreground">Interviews</span>
                            <span className="text-lg font-bold">{(upcomingInterviews || []).length}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-secondary/20">
                            <span className="text-sm font-bold text-muted-foreground">Assessments</span>
                            <span className="text-lg font-bold">{assessments?.completed || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Recent Apps + Upcoming Interviews ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <HiOutlineBriefcase className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold">Recent Applications</h2>
                        </div>
                        <Link href="/candidate/applications" className="text-emerald-500 text-sm font-bold hover:underline flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition-all">
                            View All <HiOutlineChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {(recentApplications || []).slice(0, 4).map((app, i) => {
                            const stageKey = app.stage.toLowerCase().replace(/\s+/g, '_');
                            const StageIcon = stageKey.includes('shortlist') ? HiOutlineShieldCheck :
                                stageKey.includes('coding') ? HiOutlineCodeBracket :
                                stageKey.includes('ai') ? HiOutlineChatBubbleLeftEllipsis :
                                stageKey.includes('interview') ? HiOutlineVideoCamera :
                                stageKey.includes('offer') ? HiOutlinePaperAirplane :
                                stageKey.includes('hire') ? HiOutlineCheckCircle :
                                stageKey.includes('reject') ? HiOutlineExclamationTriangle :
                                HiOutlineBriefcase;
                            return (
                                <motion.div
                                    key={app.application_id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="glass p-5 rounded-xl border border-emerald-500/5 flex items-center justify-between group hover:border-emerald-500/20 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            <HiOutlineBriefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2">
                                                {app.job_title}
                                                <StageIcon className="w-3.5 h-3.5 text-muted-foreground/40" />
                                            </h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                <HiOutlineBriefcase className="w-3 h-3" /> {app.organization}
                                                <span className="text-muted-foreground/30">&middot;</span>
                                                <HiOutlineClock className="w-3 h-3" /> {new Date(app.applied_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <StageBadge stage={app.stage} />
                                </motion.div>
                            );
                        })}
                        {(!recentApplications || recentApplications.length === 0) && (
                            <div className="glass rounded-xl p-12 text-center border-dashed border-2 border-border">
                                <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                                    <HiOutlineDocumentText className="w-8 h-8 text-muted-foreground opacity-30" />
                                </div>
                                <p className="text-muted-foreground font-medium">No applications yet.</p>
                                <Link href="/jobs" className="text-emerald-500 font-bold hover:underline mt-3 inline-flex items-center gap-1 bg-emerald-500/10 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">
                                    <HiOutlineMagnifyingGlass className="w-4 h-4" /> Explore Jobs
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                <HiOutlineVideoCamera className="w-5 h-5 text-cyan-500" />
                            </div>
                            <h2 className="text-2xl font-bold">Upcoming Interviews</h2>
                        </div>
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider bg-secondary px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <HiOutlineVideoCamera className="w-3.5 h-3.5" />
                            {(upcomingInterviews || []).length} scheduled
                        </span>
                    </div>
                    <div className="space-y-4">
                        {(upcomingInterviews || []).slice(0, 4).map((iv, i) => (
                            <motion.div
                                key={iv.room_id}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="glass p-5 rounded-xl border border-emerald-500/5 group hover:border-emerald-500/20 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">
                                        <HiOutlineVideoCamera className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold truncate">{iv.title}</h4>
                                            <HiOutlineChatBubbleLeftEllipsis className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                            <HiOutlineBriefcase className="w-3 h-3" /> {iv.job}
                                        </p>
                                        <p className="text-xs text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                                            <HiOutlineClock className="w-3.5 h-3.5" /> {iv.time}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/candidate/interview/${iv.room_id}`}
                                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-1.5"
                                    >
                                        <HiOutlineVideoCamera className="w-3.5 h-3.5" /> Join
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                        {(!upcomingInterviews || upcomingInterviews.length === 0) && (
                            <div className="glass rounded-xl p-12 text-center border-dashed border-2 border-border">
                                <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                                    <HiOutlineVideoCamera className="w-8 h-8 text-muted-foreground opacity-30" />
                                </div>
                                <p className="text-muted-foreground font-medium">No upcoming interviews.</p>
                                <Link href="/jobs" className="text-emerald-500 font-bold hover:underline mt-3 inline-flex items-center gap-1 bg-emerald-500/10 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">
                                    <HiOutlineBriefcase className="w-4 h-4" /> Browse Jobs
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Assessments + Activity ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="glass rounded-2xl p-8 border border-emerald-500/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <HiOutlineAcademicCap className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Assessments</h2>
                            <p className="text-xs text-muted-foreground/60">Coding &amp; AI interview results</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-500/5 rounded-2xl p-5 text-center border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="text-2xl font-bold">{assessments?.completed || 0}</div>
                            <div className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest mt-1">Completed</div>
                        </div>
                        <div className="bg-amber-500/5 rounded-2xl p-5 text-center border border-amber-500/10 hover:bg-amber-500/10 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                                <HiOutlineClock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="text-2xl font-bold">{assessments?.pending || 0}</div>
                            <div className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest mt-1">Pending</div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {assessments?.avgScore > 0 && (
                            <div className="flex items-center gap-2 text-sm bg-secondary/30 rounded-xl px-4 py-3">
                                <HiOutlineStar className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="text-muted-foreground">Average score</span>
                                <span className="text-emerald-500 font-bold ml-auto">{assessments.avgScore}%</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm bg-secondary/30 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <HiOutlineChatBubbleLeftEllipsis className="w-4 h-4 text-violet-500" />
                                <span className="text-muted-foreground">AI Interviews</span>
                            </div>
                            <span className="font-bold">{aiInterviews?.completed || 0} / {aiInterviews?.total || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-8 border border-emerald-500/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <HiOutlineFire className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Recent Activity</h2>
                            <p className="text-xs text-muted-foreground/60">Everything happening with your apps</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {(activity || []).slice(0, 6).map((a, i) => (
                            <ActivityItem key={i} a={a} i={i} />
                        ))}
                        {(!activity || activity.length === 0) && (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-xl bg-secondary mx-auto mb-3 flex items-center justify-center">
                                    <HiOutlineClock className="w-6 h-6 text-muted-foreground opacity-30" />
                                </div>
                                <p className="text-sm text-muted-foreground/50">No activity yet. Start by applying to jobs!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Profile Strength + Next Steps ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass rounded-2xl p-8 border border-emerald-500/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <HiOutlineChartBar className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Profile Strength</h2>
                            <p className="text-xs text-muted-foreground/60">How complete your profile is</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 mb-6">
                        <ProfileDonut value={summary?.profileStrength || 0} />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <HiOutlineDocumentDuplicate className="w-4 h-4 text-emerald-500" />
                                <span className="text-muted-foreground">{summary?.resumeCount || 0} resume{(summary?.resumeCount || 0) !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <HiOutlineCheckCircle className={`w-4 h-4 ${summary?.hasResume ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
                                <span className="text-muted-foreground">{summary?.hasResume ? 'Resume uploaded' : 'No resume yet'}</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                                    style={{ width: `${summary?.profileStrength || 0}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="glass rounded-2xl p-8 border border-emerald-500/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <HiOutlineFlag className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Next Steps</h2>
                            <p className="text-xs text-muted-foreground/60">Things to take care of</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(summary?.pendingTasks || []).map((t, i) => {
                            const taskIcons = {
                                'Complete coding assessment': HiOutlineCodeBracket,
                                'Complete AI interview': HiOutlineChatBubbleLeftEllipsis,
                                'Upload a resume': HiOutlineDocumentDuplicate,
                            };
                            const TaskIcon = taskIcons[t.task] || HiOutlineExclamationTriangle;
                            return (
                                <motion.div
                                    key={t.task}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                                        <TaskIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold">{t.task}</p>
                                        {t.count > 1 && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{t.count} pending</p>}
                                    </div>
                                    <Link
                                        href={t.task.includes('resume') ? '/candidate/resumes' : '/candidate/applications'}
                                        className="text-emerald-500 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                    >
                                        Go <HiOutlineArrowRight className="w-3 h-3" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                        {(!summary?.pendingTasks || summary.pendingTasks.length === 0) && (
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">All caught up!</p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">No pending tasks. Great job!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
