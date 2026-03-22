"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HiOutlineChartBar, HiOutlineUserGroup, HiOutlineClock } from "react-icons/hi2";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    screened: 0,
    scheduled: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder: fetch from a future analytics endpoint
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard…</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Recruiter Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Candidates */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-card rounded-xl border border-emerald-500/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineUserGroup className="w-6 h-6 text-emerald-600" />
            <span className="font-medium">Candidates Processed</span>
          </div>
          <p className="text-4xl font-bold text-emerald-700">{stats.totalCandidates}</p>
        </motion.div>
        {/* Screened Candidates */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-card rounded-xl border border-emerald-500/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineChartBar className="w-6 h-6 text-emerald-600" />
            <span className="font-medium">Screened</span>
          </div>
          <p className="text-4xl font-bold text-emerald-700">{stats.screened}</p>
        </motion.div>
        {/* Scheduled Interviews */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-card rounded-xl border border-emerald-500/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineClock className="w-6 h-6 text-emerald-600" />
            <span className="font-medium">Interviews Scheduled</span>
          </div>
          <p className="text-4xl font-bold text-emerald-700">{stats.scheduled}</p>
        </motion.div>
        {/* Average Score */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-card rounded-xl border border-emerald-500/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineChartBar className="w-6 h-6 text-emerald-600" />
            <span className="font-medium">Avg. AI Score</span>
          </div>
          <p className="text-4xl font-bold text-emerald-700">{stats.averageScore}%</p>
        </motion.div>
      </div>
    </div>
  );
}
