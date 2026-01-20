'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { motion } from 'motion/react';
import { HiOutlinePlus, HiOutlineBuildingOffice2, HiOutlineUsers, HiOutlineBriefcase } from 'react-icons/hi2';

export default function OrganizationsListPage() {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const data = await api.get('/organizations/');
                setOrgs(data);
            } catch (err) {
                setError('Failed to load organizations');
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Organizations</h1>
                    <p className="text-muted-foreground mt-1">Manage your workspaces and recruitment teams</p>
                </div>
                <Link href="/organizations/create">
                    <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20">
                        <HiOutlinePlus className="w-5 h-5" />
                        Create New
                    </button>
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgs.map((org) => (
                    <motion.div
                        key={org.org_id}
                        whileHover={{ y: -5 }}
                        className="glass p-6 rounded-3xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                {org.logo_url ? (
                                    <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain rounded-2xl" />
                                ) : (
                                    <HiOutlineBuildingOffice2 className="w-8 h-8" />
                                )}
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase">
                                {org.industry}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">
                            {org.name}
                        </h3>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                            <div className="flex items-center gap-1.5">
                                <HiOutlineUsers className="w-4 h-4" />
                                {org.members_count} Members
                            </div>
                            <div className="flex items-center gap-1.5">
                                <HiOutlineBriefcase className="w-4 h-4" />
                                {org.active_jobs_count} Active Jobs
                            </div>
                        </div>

                        <Link href={`/organizations/${org.slug}`}>
                            <button className="w-full py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-semibold transition-all border border-border">
                                Open Workspace
                            </button>
                        </Link>
                    </motion.div>
                ))}

                {orgs.length === 0 && !error && (
                    <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-border">
                        <HiOutlineBuildingOffice2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">No Organizations Yet</h3>
                        <p className="text-muted-foreground mt-2 mb-8">Create your first organization to start recruiting talent.</p>
                        <Link href="/organizations/create">
                            <button className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20">
                                Get Started
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
