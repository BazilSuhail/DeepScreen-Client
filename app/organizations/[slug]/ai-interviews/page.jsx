'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  HiOutlineSpeakerWave, HiOutlineClock, HiOutlineChartBar,
  HiOutlineHashtag, HiOutlineUser, HiOutlinePlus,
} from 'react-icons/hi2';

export default function OrgAIInterviewsPage() {
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

  if (error) return <div className="text-center py-20 text-destructive">Failed to load AI interviews</div>;

  const items = configs?.ai_interviews || [];

  return (
    <div className="space-y-6 px-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href={`/organizations/${slug}`} className="hover:text-emerald-500 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">AI Interviews</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI-Powered Interviews</h1>
          <p className="text-muted-foreground mt-1">{items.length} configured</p>
        </div>
        <Link href="/recruiter/ai-interview/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> New
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
          <HiOutlineSpeakerWave className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h2 className="text-xl font-bold text-foreground mb-2">No AI Interviews Yet</h2>
          <p className="text-muted-foreground">Configure AI interviews to automatically assess candidates.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((ai, i) => (
            <motion.div key={ai.interview_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl p-5 hover:border-amber-500/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 flex items-center justify-center text-amber-500 shrink-0">
                    <HiOutlineSpeakerWave className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{ai.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ai.job_title && <span>Job: {ai.job_title}</span>}
                      {ai.created_by?.name && <span className="ml-3 flex items-center gap-1"><HiOutlineUser className="w-3 h-3" />{ai.created_by.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground"><HiOutlineClock className="w-3.5 h-3.5" />{ai.duration_minutes}min</span>
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground"><HiOutlineHashtag className="w-3.5 h-3.5" />{ai.number_of_questions} Q</span>
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground"><HiOutlineChartBar className="w-3.5 h-3.5" />Pass: {ai.passing_score}%</span>
                </div>
              </div>
              {ai.evaluation_criteria && Object.keys(ai.evaluation_criteria).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  {Object.entries(ai.evaluation_criteria).map(([c, w]) => (
                    <span key={c} className="px-2.5 py-1 rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
                      {c}: {Math.round(w * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
