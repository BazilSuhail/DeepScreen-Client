'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { HiOutlinePlus, HiOutlineBuildingOffice2 } from 'react-icons/hi2';

function Skeleton() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-muted animate-pulse" />
      </div>
      <div className="space-y-3 text-center">
        <div className="h-8 w-64 bg-muted rounded-xl animate-pulse mx-auto" />
        <div className="h-4 w-48 bg-muted rounded-xl animate-pulse mx-auto" />
      </div>
      <div className="h-12 w-full bg-muted rounded-2xl animate-pulse" />
    </div>
  );
}

export default function OrganizationsListPage() {
  const router = useRouter();
  const [state, setState] = useState('loading'); // loading | create | redirecting

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await api.get('/organizations/');
        if (Array.isArray(data) && data.length > 0) {
          setState('redirecting');
          router.replace(`/organizations/${data[0].slug}`);
        } else {
          setState('create');
        }
      } catch {
        setState('create');
      }
    };
    fetchOrgs();
  }, [router]);

  if (state === 'loading' || state === 'redirecting') return <Skeleton />;

  return (
    <div className="max-w-md mx-auto px-4 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-8 text-center shadow-xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
          <HiOutlineBuildingOffice2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">No Organization Yet</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Create your organization to start recruiting top talent with AI-powered assessments and interviews.
        </p>
        <Link href="/organizations/create">
          <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-base">
            <HiOutlinePlus className="w-5 h-5" />
            Create Your Organization
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
