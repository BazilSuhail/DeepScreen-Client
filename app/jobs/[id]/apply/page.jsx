"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  HiOutlineDocumentText,
  HiOutlineChevronLeft,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendarDays,
  HiOutlineArrowUpTray,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2,
} from "react-icons/hi2";

export default function ApplicationPage({ params }) {
  const { id: jobId } = use(params);
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesData, jobData] = await Promise.all([
          api.get("/resumes/me/"),
          api.get(`/jobs/${jobId}/`),
        ]);
        setResumes(resumesData);
        setJob(jobData);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchData();
  }, [jobId]);

  const getMetaData = (resume) => {
    if (!resume.metadata) return {};
    if (typeof resume.metadata === "string") {
      try {
        return JSON.parse(resume.metadata);
      } catch {
        return {};
      }
    }
    return resume.metadata;
  };

  const handleApply = async () => {
    if (!selectedResume) return;
    setApplying(true);
    setError("");
    try {
      await api.post("/applications/", {
        job: jobId,
        resume: selectedResume.resume_id,
      });
 
      
      setApplied(true);
      setTimeout(() => router.push("/jobs"), 3000);
    } catch (err) {
      setError(err.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading your resumes...
          </p>
        </div>
      </div>
    );

  if (applied)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-[40px] p-12 text-center shadow-2xl"
        >
          <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40">
            <HiOutlineCheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground font-medium leading-relaxed mb-8">
            Your application has been received. Redirecting to job listings...
          </p>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full animate-pulse"
              style={{ width: "100%" }}
            />
          </div>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="px-6 lg:px-12 xl:px-24 pt-24 lg:pt-28 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              href={`/jobs/${jobId}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-emerald-500 transition-colors group"
            >
              <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Job Details
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Apply for <span className="text-emerald-500">Position</span>
            </h1>
            <p className="text-muted-foreground text-sm font-semibold mt-1">
              Select a resume to submit your application
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Resume Selection */}
            <div className="lg:col-span-7 space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-3">
                  <HiOutlineXCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              {resumes.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-6 shadow-sm">
                  <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto border border-border">
                    <HiOutlineDocumentText className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                      No Resumes Found
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium">
                      Create a resume first to start applying.
                    </p>
                  </div>
                  <Link
                    href="/candidate/resumes"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                  >
                    <HiOutlineDocumentText className="w-4 h-4" />
                    Go to Resumes
                  </Link>
                </div>
              ) : (
                resumes.map((resume) => {
                  const md = getMetaData(resume);
                  return (
                    <motion.div
                      key={resume.resume_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedResume(resume)}
                      className={`group cursor-pointer bg-card border rounded-2xl p-5 transition-all flex items-center justify-between ${
                        selectedResume?.resume_id === resume.resume_id
                          ? "border-emerald-500 shadow-lg shadow-emerald-500/10"
                          : "border-border hover:border-emerald-500/30 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all ${
                            selectedResume?.resume_id === resume.resume_id
                              ? "bg-emerald-500 text-white shadow-emerald-500/20"
                              : "bg-secondary text-emerald-500"
                          }`}
                        >
                          <HiOutlineDocumentText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
                            {md.title || "Untitled Resume"}
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <HiOutlineCalendarDays className="w-3 h-3 text-emerald-500" />
                              {new Date(resume.upload_date).toLocaleDateString(
                                "en-US",
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiOutlineBriefcase className="w-3 h-3 text-emerald-500" />
                              {resume.years_experience || 0}y exp
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          selectedResume?.resume_id === resume.resume_id
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-secondary text-muted-foreground/40 group-hover:bg-emerald-500 group-hover:text-white"
                        }`}
                      >
                        {selectedResume?.resume_id === resume.resume_id ? (
                          <HiOutlineCheckCircle className="w-4 h-4" />
                        ) : (
                          <HiOutlineChevronLeft className="w-3 h-3 rotate-180" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              {job && (
                <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {job.organization_details?.logo_url ? (
                        <Image
                          src={job.organization_details.logo_url}
                          alt=""
                          width={48}
                          height={48}
                          className="object-contain p-1.5"
                          unoptimized
                        />
                      ) : (
                        <HiOutlineBuildingOffice2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {job.job_title}
                      </p>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                        {job.organization_details?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-semibold text-muted-foreground">
                      <HiOutlineMapPin className="w-3 h-3 text-emerald-500" />
                      {job.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-semibold text-muted-foreground">
                      <HiOutlineCurrencyDollar className="w-3 h-3 text-emerald-500" />
                      {job.salary_range || "Competitive"}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-semibold text-muted-foreground">
                      <HiOutlineClock className="w-3 h-3 text-emerald-500" />
                      {job.job_type || "N/A"}
                    </span>
                  </div>
                </div>
              )}

              <div className="lg:sticky lg:top-28">
                {selectedResume ? (
                  <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Selected Resume
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <HiOutlineDocumentText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {getMetaData(selectedResume).title ||
                              "Untitled Resume"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Ready for submission
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center gap-2">
                          <HiOutlineAcademicCap className="w-4 h-4 text-emerald-500" />
                          <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              Experience
                            </p>
                            <p className="text-xs font-bold text-foreground">
                              {selectedResume.years_experience || 0} years
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiOutlineMapPin className="w-4 h-4 text-emerald-500" />
                          <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              Location
                            </p>
                            <p className="text-xs font-bold text-foreground truncate">
                              {selectedResume.current_location || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="w-full py-4 bg-primary text-primary-foreground disabled:bg-muted disabled:cursor-not-allowed rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        {applying ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <HiOutlineArrowUpTray className="w-4 h-4" />
                            Submit Application
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center">
                    <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-5">
                      <HiOutlineDocumentText className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                      Select a resume to proceed
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
