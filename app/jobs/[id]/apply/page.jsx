"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";
import { motion } from "motion/react";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
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
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import JobApplyStepper from "@/components/jobs/JobApplyStepper";
import JobApplySection from "@/components/jobs/JobApplySection";
import JobApplySkeleton from "@/components/skeletons/jobs/JobApplySkeleton";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/dashboard/ErrorState";
import EmptyState from "@/components/dashboard/EmptyState";
import { base } from "@/constants/motion";
import { cardPadded, focusRing, iconTile, primaryButton, secondaryButton } from "@/components/ui/styles";

const PAGE = "space-y-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28 2xl:px-10";

const STEPS = [
  { id: "step-resume", label: "Resume", icon: HiOutlineDocumentText },
  { id: "step-review", label: "Review", icon: HiOutlineClipboardDocumentCheck },
  { id: "step-submit", label: "Submit", icon: HiOutlinePaperAirplane },
];

const NEXT_STEPS = [
  { icon: HiOutlineDocumentText, text: "Your selected resume is attached to this application." },
  { icon: HiOutlinePaperAirplane, text: "Submitting sends it for this job." },
  { icon: HiOutlineCheckCircle, text: "You are taken to job listings once it is sent." },
];

const formatDate = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
};

const hasValue = (v) => v != null && v !== "";

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
  const back = { href: `/jobs/${jobId}`, label: "Job details" };

  if (loading) return <JobApplySkeleton />;

  if (applied)
    return (
      <div className={`${PAGE} flex min-h-[80vh] items-center justify-center`}>
        <motion.output
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={base}
          className={`${cardPadded} block w-full max-w-md text-center`}
        >
          <span className={`${iconTile} mx-auto mb-5 h-16 w-16 bg-emerald-600 text-white`}>
            <HiOutlineCheckCircle className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Application submitted</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {job?.job_title ? (
              <>Your application for <span className="font-semibold text-foreground">{job.job_title}</span> has been received.</>
            ) : (
              "Your application has been received."
            )}{" "}
            Taking you back to job listings...
          </p>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href={`/jobs/${jobId}`} className={secondaryButton}>
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
              View job
            </Link>
            <Link href="/jobs" className={primaryButton}>
              <HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" />
              Browse jobs
            </Link>
          </div>
        </motion.output>
      </div>
    );

  // Loading failed (signed out, network, missing job): nothing below would be accurate.
  if (!job)
    return (
      <div className={PAGE}>
        <PageHeader back={back} icon={HiOutlinePaperAirplane} eyebrow="Apply" title="Application unavailable" />
        <ErrorState
          title="We couldn't load this application"
          message="Make sure you are signed in as a candidate, then try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  const org = job.organization_details;
  const reviewTitle = selectedResume ? getMetaData(selectedResume).title || selectedResume.title : null;
  const summary = [
    { icon: HiOutlineMapPin, text: job.location, label: "Location" },
    { icon: HiOutlineClock, text: job.job_type, label: "Type" },
    { icon: HiOutlineCurrencyDollar, text: job.salary_range, label: "Salary" },
  ];

  return (
    <div className={PAGE}>
      <PageHeader
        back={back}
        icon={HiOutlinePaperAirplane}
        eyebrow="Apply"
        title={job.job_title || "Untitled role"}
        description={org?.name ? `Submit your application to ${org.name}.` : "Choose a resume and submit your application."}
      />

      <JobApplyStepper steps={STEPS} current={currentStep} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-8 2xl:col-span-9">
          {error && <ErrorState title="We couldn't complete that request" message={error} />}

          <JobApplySection
            id="step-resume"
            headingId="step-resume-heading"
            index={0}
            icon={HiOutlineDocumentText}
            title="Resume"
            description="Choose the resume to submit with this application."
          >
            {resumes.length === 0 ? (
              <EmptyState
                icon={HiOutlineDocumentText}
                title="No resumes yet"
                text="Create a resume first to start applying."
                action={
                  <Link href="/candidate/resumes" className={primaryButton}>
                    <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
                    Create a resume
                  </Link>
                }
              />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {resumes.map((resume) => {
                  const isSelected = selectedResume?.resume_id === resume.resume_id;
                  const uploaded = formatDate(resume.upload_date);
                  return (
                    <li key={resume.resume_id} className="min-w-0">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedResume(resume)}
                        className={`group flex h-full min-h-11 w-full items-center gap-4 rounded-md border p-4 text-left transition-[border-color,background-color,box-shadow,translate,scale] duration-150 active:scale-[0.99] motion-reduce:transform-none ${focusRing} ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/60 shadow-sm dark:bg-emerald-500/10"
                            : "border-emerald-100 hover:border-emerald-300 dark:border-white/10 dark:hover:border-emerald-500/40"
                        }`}
                      >
                        <span
                          className={`${iconTile} h-11 w-11 transition-colors ${
                            isSelected ? "bg-emerald-600 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          <HiOutlineDocumentText className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {resume.title || "Untitled resume"}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                              {uploaded || "—"}
                            </span>
                            {hasValue(resume.years_experience) && (
                              <span className="flex items-center gap-1">
                                <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" />
                                {resume.years_experience}y exp
                              </span>
                            )}
                          </span>
                        </span>
                        <HiOutlineCheckCircle
                          aria-hidden="true"
                          className={`h-6 w-6 shrink-0 transition-colors ${
                            isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/30 group-hover:text-emerald-400"
                          }`}
                        />
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
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`${iconTile} h-11 w-11 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                    <HiOutlineDocumentText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{reviewTitle || "Untitled resume"}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Ready for submission</p>
                  </div>
                </div>
                <dl className="grid gap-3 rounded-md border border-emerald-100 bg-emerald-50/40 p-4 sm:grid-cols-2 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <HiOutlineAcademicCap className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground">Experience</dt>
                      <dd className="text-sm font-semibold text-foreground">
                        {hasValue(selectedResume.years_experience) ? `${selectedResume.years_experience} years` : "—"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiOutlineMapPin className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-muted-foreground">Location</dt>
                      <dd className="truncate text-sm font-semibold text-foreground">{selectedResume.current_location || "—"}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="flex items-center gap-2 rounded-md border border-dashed border-emerald-200 p-4 text-sm text-muted-foreground dark:border-white/10">
                <HiOutlineInformationCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Select a resume above to review it here.
              </p>
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
            <button
              type="button"
              onClick={handleApply}
              disabled={applying || !selectedResume}
              aria-busy={applying}
              className={`${primaryButton} w-full sm:w-auto`}
            >
              {applying ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Submitting...
                </>
              ) : (
                <>
                  <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden="true" />
                  Submit application
                </>
              )}
            </button>
            {!selectedResume && <p className="text-xs text-muted-foreground">Choose a resume to enable submitting.</p>}
          </JobApplySection>
        </div>

        <aside aria-label="Job summary" className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start 2xl:col-span-3">
          <div className={cardPadded}>
            <div className="flex items-start gap-3">
              <span className={`${iconTile} h-12 w-12 bg-emerald-600 text-white`}>
                <HiOutlineBuildingOffice2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-foreground">{job.job_title || "Untitled role"}</h2>
                <p className="truncate text-sm font-medium text-emerald-700 dark:text-emerald-400">{org?.name || "—"}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              {summary.map(({ icon: Icon, text, label }) => (
                <li key={label} className="flex items-center gap-3 text-muted-foreground">
                  <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span className="sr-only">{label}:</span>
                  <span className="min-w-0 truncate">{text || "—"}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={cardPadded}>
            <h2 className="mb-4 text-sm font-semibold text-foreground">What happens next</h2>
            <ol className="space-y-4 text-sm">
              {NEXT_STEPS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
