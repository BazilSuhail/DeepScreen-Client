'use client';

import React from 'react';
import { motion } from 'motion/react';
import { HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineChatBubbleLeftEllipsis } from 'react-icons/hi2';

export default function RecruiterDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your active jobs and track applications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'My Active Jobs', value: '0', icon: HiOutlineBriefcase, color: 'emerald' },
                    { label: 'New Applications', value: '0', icon: HiOutlineDocumentText, color: 'blue' },
                    { label: 'Unread Messages', value: '0', icon: HiOutlineChatBubbleLeftEllipsis, color: 'purple' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 rounded-3xl border border-emerald-500/5"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black">{stat.value}</div>
                        <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="glass rounded-[2rem] p-12 text-center border-dashed border-2 border-border">
                <HiOutlineBriefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="text-xl font-bold">No Jobs Assigned</h3>
                <p className="text-muted-foreground mt-2">Ask your organization owner to assign jobs to you or create a new listing.</p>
            </div>
        </div>
    );
}
