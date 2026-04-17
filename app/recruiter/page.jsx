'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineUserGroup,
    HiOutlineCommandLine,
    HiOutlineChatBubbleLeftEllipsis,
    HiOutlineVideoCamera,
    HiOutlineArrowTrendingUp,
    HiOutlineClock,
    HiOutlineCheckBadge,
    HiOutlineCalendarDays,
    HiOutlineUser,
    HiOutlineAcademicCap,
    HiOutlineStar,
    HiOutlineExclamationTriangle,
    HiOutlinePaperAirplane,
    HiOutlineCog6Tooth,
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineArrowRight,
    HiOutlinePlus,
} from 'react-icons/hi2';
import BarChart from '@/components/display/BarChart';

/* ═══════════════════════════════════════════════════════════════════
   Dummy data
   ═══════════════════════════════════════════════════════════════════ */

const weeklyApps = [
    { label: 'Mon', applicants: 12, assessments: 8, interviews: 3 },
    { label: 'Tue', applicants: 19, assessments: 14, interviews: 6 },
    { label: 'Wed', applicants: 25, assessments: 18, interviews: 9 },
    { label: 'Thu', applicants: 16, assessments: 12, interviews: 5 },
    { label: 'Fri', applicants: 21, assessments: 15, interviews: 7 },
    { label: 'Sat', applicants: 8,  assessments: 5,  interviews: 2 },
    { label: 'Sun', applicants: 5,  assessments: 3,  interviews: 1 },
];

const stats = [
    { label: 'Active Jobs', value: 8, change: '+2', icon: HiOutlineBriefcase, color: 'emerald' },
    { label: 'Total Applications', value: 106, change: '+18', icon: HiOutlineDocumentText, color: 'blue' },
    { label: 'Coding Assessments', value: 38, change: '+12', icon: HiOutlineCommandLine, color: 'cyan' },
    { label: 'AI Interviews Done', value: 21, change: '+7', icon: HiOutlineChatBubbleLeftEllipsis, color: 'violet' },
    { label: 'Real Interviews', value: 9, change: '+3', icon: HiOutlineVideoCamera, color: 'rose' },
    { label: 'Hired', value: 14, change: '+3', icon: HiOutlineCheckBadge, color: 'purple' },
];

const pipeline = [
    { stage: 'Jobs Posted', count: 8, sub: 'Active listings across engineering, product & design', icon: HiOutlineBriefcase },
    { stage: 'Applications', count: 106, sub: '46 new this week · 12 in review', icon: HiOutlineDocumentText },
    { stage: 'Coding Assessment', count: 38, sub: '22 pending · 16 evaluated (68% pass rate)', icon: HiOutlineCommandLine },
    { stage: 'AI Interview', count: 21, sub: '12 scheduled · 9 completed (4.2 avg rating)', icon: HiOutlineChatBubbleLeftEllipsis },
    { stage: 'Real Interview', count: 9, sub: '5 upcoming · 4 done · 3 offers extended', icon: HiOutlineVideoCamera },
];

const recentApps = [
    { name: 'Sarah Chen', role: 'Senior Frontend', job: 'FE Lead', score: 92, status: 'Evaluated', avatar: 'SC' },
    { name: 'James Wilson', role: 'Backend Eng', job: 'BE Senior', score: 78, status: 'AI Round', avatar: 'JW' },
    { name: 'Priya Patel', role: 'ML Engineer', job: 'ML Lead', score: 88, status: 'Technical', avatar: 'PP' },
    { name: 'Alex Kim', role: 'iOS Dev', job: 'Mobile Lead', score: 85, status: 'Screening', avatar: 'AK' },
    { name: 'Maria Garcia', role: 'Product Designer', job: 'Design Lead', score: 0, status: 'Review', avatar: 'MG' },
];

const upcomingInterviews = [
    { name: 'Emily Zhang', role: 'Senior Backend', time: 'Today 2:00 PM', type: 'Technical', avatar: 'EZ' },
    { name: 'David Park', role: 'Full Stack', time: 'Today 4:30 PM', type: 'AI Screen', avatar: 'DP' },
    { name: 'Lisa Johnson', role: 'DevOps Eng', time: 'Tomorrow 10:00 AM', type: 'Cultural', avatar: 'LJ' },
    { name: 'Rajan Mehta', role: 'Data Eng', time: 'Tomorrow 1:00 PM', type: 'Technical', avatar: 'RM' },
    { name: 'Anna Kowalski', role: 'Frontend Eng', time: 'Wed 11:00 AM', type: 'AI Screen', avatar: 'AK' },
];

const jobPerformance = [
    { title: 'Senior Frontend Lead', apps: 28, assessments: 12, interviews: 4, hires: 1, score: 87 },
    { title: 'Backend Engineer', apps: 34, assessments: 14, interviews: 3, hires: 2, score: 92 },
    { title: 'ML Engineer Lead', apps: 18, assessments: 7, interviews: 2, hires: 0, score: 76 },
    { title: 'Product Designer', apps: 15, assessments: 5, interviews: 1, hires: 1, score: 94 },
    { title: 'Mobile Developer', apps: 11, assessments: 4, interviews: 0, hires: 0, score: 0 },
];

const quickActions = [
    { label: 'Post Job', icon: HiOutlinePlus, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { label: 'Review Apps', icon: HiOutlineDocumentText, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { label: 'Schedule', icon: HiOutlineCalendarDays, color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
    { label: 'Send Offer', icon: HiOutlinePaperAirplane, color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
];

const activityFeed = [
    { text: 'Sarah Chen submitted coding assessment', time: '12 min ago', type: 'assessment' },
    { text: 'New application from James Wilson', time: '34 min ago', type: 'application' },
    { text: 'AI interview completed for Priya Patel', time: '1h ago', type: 'ai' },
    { text: 'Offer sent to Michael Torres', time: '2h ago', type: 'offer' },
    { text: 'Real interview scheduled with Emily Zhang', time: '3h ago', type: 'schedule' },
    { text: 'Coding assessment evaluated: Alex Kim (85%)', time: '5h ago', type: 'assessment' },
];

/* ═══════════════════════════════════════════════════════════════════
   Components
   ═══════════════════════════════════════════════════════════════════ */

function StatCard({ stat, index }) {
    const colorMap = {
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        blue:    'bg-blue-500/10 text-blue-500 border-blue-500/20',
        cyan:    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        violet:  'bg-violet-500/10 text-violet-500 border-violet-500/20',
        rose:    'bg-rose-500/10 text-rose-500 border-rose-500/20',
        purple:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 transition-all hover:shadow-md hover:shadow-emerald-500/5 group"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${colorMap[stat.color]}`}>
                    <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.change}</span>
            </div>
            <div className="text-xl font-bold">{stat.value.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
        </motion.div>
    );
}

function PipelineCard({ item, index }) {
    const colors = ['from-emerald-500/30','from-blue-500/30','from-cyan-500/30','from-violet-500/30','from-rose-500/30'];
    return (
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
            className="relative flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 pl-4 transition-all hover:shadow-md group"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${colors[index]} to-transparent rounded-full`} />
            <div className="w-9 h-9 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground shrink-0 group-hover:scale-110 transition-transform">
                <item.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{item.stage}</span>
                    <span className="text-base font-black text-emerald-500">{item.count}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate max-w-[40ch]">{item.sub}</p>
            </div>
        </motion.div>
    );
}

function FunnelBar({ label, value, max, color, index }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.06 }} className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-muted-foreground w-24 text-right shrink-0">{label}</span>
            <div className="flex-1 h-5 bg-secondary/40 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color}`} />
            </div>
            <span className="text-xs font-bold w-8 text-right shrink-0">{value}</span>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        Evaluated:  'bg-emerald-500/10 text-emerald-500',
        'AI Round': 'bg-violet-500/10 text-violet-500',
        Technical:  'bg-cyan-500/10 text-cyan-500',
        Screening:  'bg-blue-500/10 text-blue-500',
        Review:     'bg-amber-500/10 text-amber-500',
    };
    return (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${styles[status] || 'bg-secondary text-muted-foreground'}`}>{status}</span>
    );
}

function Avatar({ initials }) {
    return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-500 shrink-0">
            {initials}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Dashboard
   ═══════════════════════════════════════════════════════════════════ */

export default function RecruiterDashboard() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const maxFunnel = Math.max(...pipeline.map(p => p.count));

    return (
        <div className="space-y-6 px-6 lg:px-8 pb-10">
            {/* ═══ Header ═══ */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-500/0 rounded-full" />
                </div>
                <div className="h-7 w-px bg-border/60" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    <span>Week of Jun 2, 2026</span>
                </div>
            </div>

            {/* ═══ Row 1: Stats Grid ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
            </div>

            {/* ═══ Row 2: Pipeline + Bar Chart ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Pipeline */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center gap-2">
                        <HiOutlineArrowTrendingUp className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-sm font-bold">Pipeline</h2>
                    </div>
                    {pipeline.map((item, i) => <PipelineCard key={item.stage} item={item} index={i} />)}
                </div>

                {/* Bar Chart */}
                <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold">Weekly Activity</h3>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Applicants, assessments & interviews</p>
                        </div>
                        <div className="flex items-center gap-2.5 text-[9px] font-semibold">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" /> Apps</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-300" /> Assess</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/30" /> Intvs</span>
                        </div>
                    </div>
                    <div className="h-52"><BarChart data={weeklyApps} /></div>
                </div>
            </div>

            {/* ═══ Row 3: Funnel + Recent Applications ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Funnel */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
                    <h3 className="text-sm font-bold mb-4">Conversion Funnel</h3>
                    <div className="space-y-3">
                        <FunnelBar label="Applications" value={106} max={maxFunnel} color="bg-emerald-500" index={0} />
                        <FunnelBar label="Assessments" value={38} max={maxFunnel} color="bg-emerald-400" index={1} />
                        <FunnelBar label="AI Interviews" value={21} max={maxFunnel} color="bg-emerald-300" index={2} />
                        <FunnelBar label="Real Interviews" value={9} max={maxFunnel} color="bg-emerald-200" index={3} />
                        <FunnelBar label="Offers" value={3} max={maxFunnel} color="bg-emerald-100" index={4} />
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex justify-between text-[10px] text-muted-foreground/60">
                        <span>Conversion: <strong className="text-emerald-500">2.8%</strong></span>
                        <span>Time to hire: <strong>12d</strong></span>
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold">Recent Applications</h3>
                        <button className="text-[10px] font-semibold text-emerald-500 hover:underline flex items-center gap-1">View All <HiOutlineArrowRight className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-2">
                        {recentApps.map((app, i) => (
                            <motion.div key={app.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors"
                            >
                                <Avatar initials={app.avatar} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold truncate">{app.name}</span>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{app.role} · {app.job}</p>
                                </div>
                                {app.score > 0 && (
                                    <div className={`text-xs font-bold ${app.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{app.score}%</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Row 4: Upcoming Interviews + Job Performance + Quick Actions ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Upcoming Interviews */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <HiOutlineCalendarDays className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-sm font-bold">Upcoming Interviews</h3>
                        </div>
                        <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">5 scheduled</span>
                    </div>
                    <div className="space-y-2">
                        {upcomingInterviews.map((iv, i) => (
                            <motion.div key={iv.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors"
                            >
                                <Avatar initials={iv.avatar} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold truncate">{iv.name}</span>
                                        <span className="text-[9px] font-semibold text-muted-foreground/60 bg-secondary/40 px-1.5 py-0.5 rounded">{iv.type}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{iv.role} · {iv.time}</p>
                                </div>
                                <HiOutlineVideoCamera className="w-3.5 h-3.5 text-muted-foreground/40" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Job Performance */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <HiOutlineStar className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-sm font-bold">Job Performance</h3>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="grid grid-cols-5 gap-2 text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider pb-1.5 border-b border-border mb-1">
                            <span className="col-span-2">Job</span><span className="text-right">Apps</span><span className="text-right">Assess</span><span className="text-right">Hires</span>
                        </div>
                        {jobPerformance.map((job, i) => (
                            <motion.div key={job.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                className="grid grid-cols-5 gap-2 py-1.5 items-center rounded hover:bg-secondary/20 transition-colors"
                            >
                                <span className="col-span-2 text-[11px] font-bold truncate">{job.title}</span>
                                <span className="text-[11px] font-semibold text-right text-muted-foreground">{job.apps}</span>
                                <span className="text-[11px] font-semibold text-right text-muted-foreground">{job.assessments}</span>
                                <span className={`text-[11px] font-bold text-right ${job.hires > 0 ? 'text-emerald-500' : 'text-muted-foreground/40'}`}>{job.hires}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions + Activity */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Quick Actions */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="text-sm font-bold mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action, i) => (
                                <motion.button key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:shadow-sm ${action.color}`}
                                >
                                    <action.icon className="w-4 h-4" />
                                    <span className="text-[9px] font-bold">{action.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <HiOutlineClock className="w-3.5 h-3.5 text-muted-foreground/60" />
                            <h3 className="text-sm font-bold">Activity</h3>
                        </div>
                        <div className="space-y-2.5">
                            {activityFeed.slice(0, 4).map((a, i) => (
                                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                    className="flex items-start gap-2.5"
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                        a.type === 'assessment' ? 'bg-cyan-500' : a.type === 'application' ? 'bg-blue-500' : a.type === 'ai' ? 'bg-violet-500' : a.type === 'offer' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`} />
                                    <div className="min-w-0">
                                        <p className="text-[10px] leading-relaxed text-foreground/80">{a.text}</p>
                                        <span className="text-[9px] text-muted-foreground/50">{a.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Row 5: Footer Summary Bar ═══ */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground/70">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><HiOutlineUserGroup className="w-4 h-4 text-emerald-500" /> <strong className="text-foreground">156</strong> total candidates</span>
                    <span className="flex items-center gap-1.5"><HiOutlineAcademicCap className="w-4 h-4 text-emerald-500" /> <strong className="text-foreground">38</strong> in assessment</span>
                    <span className="flex items-center gap-1.5"><HiOutlineStar className="w-4 h-4 text-emerald-500" /> <strong className="text-foreground">4.2</strong> avg rating</span>
                </div>
                <span className="text-[10px] text-muted-foreground/40">Last synced: just now</span>
            </div>
        </div>
    );
}
