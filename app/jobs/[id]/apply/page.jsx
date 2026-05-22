"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  HiOutlineDocumentText,
  HiOutlineChevronLeft,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
  HiOutlineArrowPath,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2,
  HiOutlinePaperAirplane,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import JobApplyStepper from "@/components/jobs/JobApplyStepper";
import JobApplySection from "@/components/jobs/JobApplySection";

const STEPS = [
  { id: "step-resume", label: "Resume", icon: HiOutlineDocumentText },
  { id: "step-review", label: "Review", icon: HiOutlineClipboardDocumentCheck },
  { id: "step-submit", label: "Submit", icon: HiOutlinePaperAirplane },
];

export default function ApplicationPage({ params }) {
  const { id: jobId } = use(params);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [job, setJob] = useState(null);
  const submittingRef = useRef(false);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesData, jobData] = await Promise.all([
          api.get("/resumes/me/"),
          api.get(`/jobs/${jobId}/`),
        ]);
        setResumes(resumesData);
        console.log(resumesData)
        setJob(jobData);
      } catch {
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
    if (!selectedResume || submittingRef.current) return;
    submittingRef.current = true;
    setApplying(true);
    setError("");
    try {
      await api.post("/applications/", {
        job: jobId,
        resume: selectedResume.resume_id,
      });

      setApplied(true);
      redirectTimerRef.current = setTimeout(() => router.push("/jobs"), 3000);
    } catch (err) {
      setError(err.message || "Failed to submit application");
      submittingRef.current = false;
    } finally {
      setApplying(false);
    }
  };

  // Visual only: resume chosen -> review, submitting -> submit.
  const currentStep = !selectedResume ? 0 : applying ? 2 : 1;

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <HiOutlineArrowPath
            className="h-10 w-10 animate-spin text-emerald-500"
            aria-hidden="true"
          />
          <output className="block text-sm font-semibold text-muted-foreground">
            Loading your resumes...
          </output>
        </div>
      </div>
    );

  if (applied)
    return (
      <div className="flex min-h-screen mx-auto max-w-350  items-center justify-center bg-background p-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-card"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <HiOutlineCheckCircle className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground">
            Application Submitted!
          </h1>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            Your application has been received. Redirecting to job listings...
          </p>
          <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full w-full rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
          </div>
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-emerald-600 outline-none transition-colors hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-emerald-400 dark:focus-visible:ring-offset-background"
          >
            <HiOutlineChevronLeft className="h-4 w-4" aria-hidden="true" />
            View job
          </Link>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen mx-auto max-w-350 bg-background pt-24 font-sans lg:pt-28">
      <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
        <Link
          href={`/jobs/${jobId}`}
          className="group inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
        >
          <HiOutlineChevronLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          Back to Job Details
        </Link>

        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Apply for <span className="text-emerald-500">Position</span>
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">
            Select a resume to submit your application
          </p>
        </header>

        <JobApplyStepper steps={STEPS} current={currentStep} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Summary: above the form on phone, sticky side column on lg+ */}
          <aside
            aria-label="Job summary"
            className="order-1 min-w-0 space-y-6 lg:order-2 lg:sticky lg:top-24 lg:col-span-4 lg:self-start"
          >
            {job && (
              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20">
                    <HiOutlineBuildingOffice2 className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-foreground">
                      {job.job_title}
                    </h2>
                    <p className="truncate text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {job.organization_details?.name}
                    </p>
                  </div>
                </div>
                <ul className="mt-5 space-y-3 border-t border-emerald-100 pt-5 text-sm dark:border-white/10">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <HiOutlineMapPin className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span className="min-w-0 truncate">{job.location || "Remote"}</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <HiOutlineClock className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span className="min-w-0 truncate">{job.job_type || "N/A"}</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <HiOutlineCurrencyDollar className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span className="min-w-0 truncate">{job.salary_range || "Competitive"}</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card">
              <h2 className="mb-4 text-sm font-bold text-foreground">What happens next</h2>
              <ol className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <HiOutlineDocumentText className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span className="text-muted-foreground">Your selected resume is attached to this application.</span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlinePaperAirplane className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span className="text-muted-foreground">Submitting sends it for this job.</span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span className="text-muted-foreground">You are taken to job listings once it is sent.</span>
                </li>
              </ol>
            </div>
          </aside>

          <div className="order-2 min-w-0 space-y-6 lg:order-1 lg:col-span-8">
            {error && (
              <div
                role="alert"
                className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>We couldn&apos;t complete that request. Please try again.</span>
              </div>
            )}

            <JobApplySection
              id="step-resume"
              headingId="step-resume-heading"
              index={0}
              icon={HiOutlineDocumentText}
              title="Resume"
              description="Choose the resume to submit with this application."
            >
              {resumes.length === 0 ? (
                <div className="space-y-6 rounded-xl border-2 border-dashed border-emerald-100 p-10 text-center dark:border-white/10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-secondary dark:border-white/10">
                    <HiOutlineDocumentText className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">No Resumes Found</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a resume first to start applying.
                    </p>
                  </div>
                  <Link
                    href="/candidate/resumes"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 outline-none transition-colors hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
                  >
                    <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" />
                    Go to Resumes
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {resumes.map((resume) => {
                    const isSelected = selectedResume?.resume_id === resume.resume_id;
                    return (
                      <li key={resume.resume_id}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedResume(resume)}
                          className={`group flex min-h-11 w-full items-center justify-between gap-4 rounded-xl border p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-500/10 dark:bg-emerald-500/10"
                              : "border-emerald-100 hover:border-emerald-400 hover:shadow-sm dark:border-white/10 dark:hover:border-emerald-500/40"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-4">
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                isSelected
                                  ? "bg-emerald-500 text-white"
                                  : "bg-secondary text-emerald-500"
                              }`}
                            >
                              <HiOutlineDocumentText className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-base font-bold text-foreground">
                                {resume.title || "Untitled Resume"}
                              </span>
                              <span className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <HiOutlineCalendarDays className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                                  {new Date(resume.upload_date).toLocaleDateString("en-US")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <HiOutlineBriefcase className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                                  {resume.years_experience || 0}y exp
                                </span>
                              </span>
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                              isSelected
                                ? "bg-emerald-500 text-white"
                                : "bg-secondary text-muted-foreground/50 group-hover:bg-emerald-500 group-hover:text-white"
                            }`}
                          >
                            <HiOutlineCheckCircle className="h-5 w-5" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </JobApplySection>

            <JobApplySection
              id="step-review"
              headingId="step-review-heading"
              index={1}
              icon={HiOutlineClipboardDocumentCheck}
              title="Review"
              description="Check the resume that will be submitted."
            >
              {selectedResume ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <HiOutlineDocumentText className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-foreground">
                        {getMetaData(selectedResume).title || "Untitled Resume"}
                      </p>
                      <p className="text-sm text-muted-foreground">Ready for submission</p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 gap-4 rounded-xl border border-emerald-100 bg-secondary p-4 sm:grid-cols-2 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <HiOutlineAcademicCap className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                      <div>
                        <dt className="text-xs font-semibold text-muted-foreground">Experience</dt>
                        <dd className="text-sm font-bold text-foreground">
                          {selectedResume.years_experience || 0} years
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <HiOutlineMapPin className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className="text-xs font-semibold text-muted-foreground">Location</dt>
                        <dd className="truncate text-sm font-bold text-foreground">
                          {selectedResume.current_location || "N/A"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-emerald-100 p-10 text-center dark:border-white/10">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                    <HiOutlineDocumentText className="h-7 w-7 text-muted-foreground/60" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Select a resume to proceed
                  </p>
                </div>
              )}
            </JobApplySection>

            <JobApplySection
              id="step-submit"
              headingId="step-submit-heading"
              index={2}
              icon={HiOutlinePaperAirplane}
              title="Submit"
              description="Send your application for this job."
            >
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying || !selectedResume}
                  aria-busy={applying}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 outline-none transition-all hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none dark:focus-visible:ring-offset-background"
                >
                  {applying ? (
                    <>
                      <HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden="true" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </JobApplySection>
          </div>
        </div>
      </div>
    </div>
  );
}
