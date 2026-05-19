'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineVideoCamera, HiOutlineClock, HiOutlineCamera,
  HiOutlineMicrophone, HiOutlineComputerDesktop, HiOutlinePlus,
} from 'react-icons/hi2';

export default function OrgInterviewsPage() {
  const { slug } = useParams();
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/organizations/${slug}/configs/`)
      .then(setConfigs)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="space-y-4 px-12">
      {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
    </div>
  );

  if (error) return <div className="text-center py-20 text-destructive">Failed to load interviews</div>;

  const items = configs?.interview_configs || [];

  return (
    <div className="space-y-6 px-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href={`/organizations/${slug}`} className="hover:text-emerald-500 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Live Interviews</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Live Interview Settings</h1>
          <p className="text-muted-foreground mt-1">{items.length} configured</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
          <HiOutlineVideoCamera className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Interview Configs</h2>
          <p className="text-muted-foreground">Configure live video interview settings for your jobs.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((cfg, i) => (
            <motion.div key={cfg.config_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl p-5 hover:border-rose-500/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 flex items-center justify-center text-rose-500 shrink-0">
                    <HiOutlineVideoCamera className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{cfg.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1">{cfg.job_title && <span>Job: {cfg.job_title}</span>}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground"><HiOutlineClock className="w-3.5 h-3.5" />{cfg.default_duration_minutes}min</span>
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground"><HiOutlineCamera className="w-3.5 h-3.5" />{cfg.camera_required ? 'Req' : 'Opt'}</span>
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground"><HiOutlineMicrophone className="w-3.5 h-3.5" />{cfg.mic_required ? 'Req' : 'Opt'}</span>
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground"><HiOutlineComputerDesktop className="w-3.5 h-3.5" />{cfg.screen_share_enabled ? 'Share' : 'No Share'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
