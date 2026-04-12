"use client";

import React, { useState, useEffect, use } from "react";
import { api } from "@/utils/api";
import resumeApi from "@/utils/resume_api";

import {
  HiOutlineUserCircle,
  HiOutlineSparkles,
  HiOutlineChevronLeft,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice,
  HiOutlineGlobeAlt,
  HiOutlineChartBarSquare,
  HiOutlineClock,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
} from "react-icons/hi2";

import CandidateCard from "@/components/applications/CandidateCard";
import ShortlistModal from "@/components/applications/modals/ShortlistModal";
import CandidateSearch from "@/components/applications/CandidateSearch";
import { useRouter } from "next/navigation";

export default function JobApplicationsPage({ params }) {
  const { id: jobId } = use(params);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [stageFilter, setStageFilter] = useState("all");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!jobId) return;
    fetchJobAndApps();
  }, [jobId]);

  const fetchJobAndApps = async () => {
    setLoading(true);
    try {
      const [jobData, appsData] = await Promise.all([
        api.get(`/jobs/${jobId}/`),
        api.get(`/applications/job/${jobId}/`),
      ]);
      setJob(jobData);
      setApplications(appsData);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleShortlistConfirm = async () => {
    setShortlisting(true);
    setError("");
    try {
      await resumeApi.post(`/applications/job/${jobId}/shortlist/`, {});
      await fetchJobAndApps();
      setIsShortlistModalOpen(false);
    } catch (err) {
      setError(err.message || "AI analysis failed");
    } finally {
      setShortlisting(false);
    }
  };

  const handleCandidateSearch = async (email) => {
    setSearching(true);
    setError("");
    try {
      const result = await api.get(
        `/applications/job/${jobId}/search/?email=${email}`,
      );
      setApplications((prev) => {
        const exists = prev.find(
          (a) => a.application_id === result.application_id,
        );
        if (exists) return prev;
        return [result, ...prev];
      });
      setStageFilter("all");
    } catch (err) {
      setError(`No candidate found with email: ${email}`);
    } finally {
      setSearching(false);
    }
  };

  const handleUpdateStatus = async (appId, updates) => {
    try {
      await api.patch(`/applications/${appId}//`, updates);
      const data = await api.get(`/applications/job/${jobId}/`);
      setApplications(data);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleStartChat = (app) => {
    if (app?.application_id) {
      router.push(`/chats/${app.application_id}`);
    }
  };

  const filteredApps =
    stageFilter === "all"
      ? applications
      : applications.filter((a) => a.current_stage === stageFilter);

  const stageCounts = applications.reduce((acc, a) => {
    acc[a.current_stage] = (acc[a.current_stage] || 0) + 1;
    return acc;
  }, {});

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

  return (
    <div className="w-full px-4 md:px-6 space-y-8">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.push("/recruiter/applications")}
          className="inline-flex items-center gap-1.5 text-emerald-500 font-bold text-sm hover:gap-2.5 transition-all w-fit"
        >
          <HiOutlineChevronLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {job?.job_title}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {job?.organization_details?.name} &middot; {applications.length} Applicant{applications.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-full md:w-72">
            <CandidateSearch
              onSearch={handleCandidateSearch}
              loading={searching}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-xs uppercase font-bold opacity-50 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: applications.length, icon: HiOutlineUserCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Shortlisted', count: stageCounts['shortlisted'] || 0, icon: HiOutlineCheckBadge, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pending', count: (stageCounts['applied'] || 0) + (stageCounts['coding_pending'] || 0), icon: HiOutlineClock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Rejected', count: stageCounts['rejected'] || 0, icon: HiOutlineXCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3 border border-border/50`}>
            <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action card */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <HiOutlineChartBarSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Candidate Evaluation</h3>
            <p className="text-xs text-muted-foreground">Trigger AI analysis or manage your pipeline</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsShortlistModalOpen(true)}
            disabled={shortlisting || applications.length === 0 || job?.is_shortlisted}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-600/20 text-sm disabled:opacity-50 disabled:grayscale"
          >
            <HiOutlineSparkles className="w-4 h-4" />
            {job?.is_shortlisted ? "Shortlisting Done" : "Run AI Shortlist"}
          </button>

          {job?.is_shortlisted && (
            <button
              onClick={() => router.push(`/chats/recruiter?job_id=${jobId}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-lg transition-all border border-border text-sm"
            >
              <HiOutlineChatBubbleBottomCenterText className="w-4 h-4 text-emerald-500" />
              Open Inbox
            </button>
          )}
        </div>
      </div>

      {/* Stage filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "applied", "shortlisted", "coding_pending", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
              stageFilter === s
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {s === "all"
              ? `All (${applications.length})`
              : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <div className="py-24 text-center glass rounded-2xl border-dashed border-2 border-border">
          <HiOutlineUserCircle className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold">No Candidates</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            {stageFilter === "all"
              ? "No one has applied to this position yet."
              : `No candidates in the "${stageFilter}" stage.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredApps.map((app, i) => (
            <CandidateCard
              key={app.application_id}
              app={app}
              rank={i + 1}
              onUpdateStatus={handleUpdateStatus}
              onStartChat={() => handleStartChat(app)}
              showMessageButton={job?.is_shortlisted}
            />
          ))}
        </div>
      )}

      <ShortlistModal
        isOpen={isShortlistModalOpen}
        onClose={() => setIsShortlistModalOpen(false)}
        onConfirm={handleShortlistConfirm}
        jobTitle={job?.job_title}
        totalApplicants={applications.length}
        loading={shortlisting}
      />
    </div>
  );
}
