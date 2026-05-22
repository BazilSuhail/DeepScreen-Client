"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from "@/utils/api";
import { resumeApi } from "@/utils/resume_api";
import {
  HiPlus, HiOutlineDocumentText, HiOutlineTrash, HiOutlineEye, HiOutlineDocumentArrowUp,
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineLink, HiOutlinePhone, HiOutlineUser,
  HiOutlineSparkles, HiOutlineDocument, HiOutlineXMark,
  HiOutlineEnvelope, HiOutlineArrowTopRightOnSquare, HiOutlineCalendarDays, HiOutlineArrowPath,
  HiOutlineCheckCircle, HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
  HiOutlineSwatch, HiOutlineLightBulb, HiOutlineCodeBracket, HiOutlineCpuChip,
  HiOutlinePencilSquare, HiOutlineFolderOpen,
} from 'react-icons/hi2';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import ResumeReviewModal from '@/components/resume/ResumeReviewModal';
import ResumeBasicEditForm from '@/components/resume/ResumeBasicEditForm';
import UploadResumeModal from '@/components/resumes/UploadResumeModal';
import { parseResumeList } from '@/utils/resumeList';

const TEMPLATE_STYLES = {
  1: { preview: 'bg-emerald-50 dark:bg-emerald-dark', textColor: 'text-emerald-700 dark:text-emerald-300', icon: HiOutlineBriefcase },
  2: { preview: 'bg-emerald-600', textColor: 'text-emerald-700 dark:text-emerald-300', icon: HiOutlineSwatch },
  3: { preview: 'bg-emerald-500/20', textColor: 'text-emerald-700 dark:text-emerald-300', icon: HiOutlineDocument },
  4: { preview: 'bg-teal-600', textColor: 'text-teal-700 dark:text-teal-300', icon: HiOutlineLightBulb },
};

const pageSpacing = 'mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8';
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const muted = 'text-emerald-900/70 dark:text-slate-400';
const card = 'rounded-2xl border border-emerald-100 bg-white p-5 lg:p-6 dark:border-white/10 dark:bg-card';
const primaryButton = `flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 dark:hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;
const secondaryButton = `flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-all hover:bg-emerald-50 hover:text-emerald-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white ${focusRing}`;

const UPLOAD_ERRORS = {
  tooLarge: "That PDF is larger than 10 MB. Export a smaller copy and try again.",
  notPdf: "That file is not a PDF. Choose a PDF resume.",
  session: "Your session has expired. Sign in again and retry.",
  network: "We couldn't reach the server. Check your connection and try again.",
  server: "Something went wrong on our side. Please try again in a moment.",
  generic: "We couldn't upload your resume. Check that the file is a PDF under 10 MB, then try again.",
};

// Maps an upload failure (from resumeApi: { status, message }) to a plain message.
// Raw server text (JSON, stack traces, bracketed output) never reaches the UI.
const uploadErrorMessage = (err) => {
  const status = err?.status;
  const raw = typeof err?.message === 'string' ? err.message.trim() : '';
  const text = raw.toLowerCase();
  if (status === 413) return UPLOAD_ERRORS.tooLarge;
  if (status === 415) return UPLOAD_ERRORS.notPdf;
  if (status === 401 || status === 403) return UPLOAD_ERRORS.session;
  if (status >= 500) return UPLOAD_ERRORS.server;
  if (status === undefined || status === null) return UPLOAD_ERRORS.network;
  if (/too large|larger than/.test(text)) return UPLOAD_ERRORS.tooLarge;
  if (/not a pdf|invalid (file )?type|unsupported/.test(text)) return UPLOAD_ERRORS.notPdf;
  const isPlain = raw && raw.length < 160 && !/[{}[\]<>\\\n]/.test(raw);
  return isPlain ? raw : UPLOAD_ERRORS.generic;
};

// Keeps the card rendering when a stored file name is not valid percent-encoding.
const safeDecode = (value) => {
  try { return decodeURIComponent(value); } catch { return value; }
};

function SectionHeader({ icon: Icon, tone, title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className={`text-xs ${muted}`}>{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

const SEPARATOR = /\s[—-]\s/;
const TECH_LABEL = /Tech stack:/i;

// Splits an entry into a bold title, a body and the "Tech stack:" items.
const parseEntry = (text) => {
  const tech = TECH_LABEL.exec(text);
  const techItems = tech
    ? text.slice(tech.index + tech[0].length).split(',').map((s) => s.trim().replace(/\.$/, '')).filter(Boolean)
    : [];
  const main = (tech ? text.slice(0, tech.index) : text).trim().replace(/[.;,\s]+$/, '');
  const sep = SEPARATOR.exec(main);
  return {
    title: sep ? main.slice(0, sep.index).trim() : main,
    body: sep ? main.slice(sep.index + sep[0].length).trim() : '',
    techItems,
  };
};

function EmptyLine({ icon: Icon, text }) {
  return (
    <p className={`flex items-center gap-2 text-xs ${muted}`}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
}

function EntryCard({ text, icon: Icon, tone }) {
  const { title, body, techItems } = parseEntry(text);
  return (
    <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-white/10 dark:bg-white/5">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        {title && <p className="break-words text-sm font-semibold text-foreground">{title}</p>}
        {body && <p className="break-words text-sm leading-relaxed text-foreground/80">{body}</p>}
        {techItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className={`text-xs font-semibold ${muted}`}>Tech stack:</span>
            {techItems.map((item, i) => (
              <span key={i} className="rounded-md border border-emerald-100 bg-white px-2 py-0.5 text-xs font-medium text-emerald-900 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">{item}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [editingDetails, setEditingDetails] = useState(false);

  const templates = [
    { id: 1, name: 'Professional', description: 'Clean and traditional design, perfect for corporate roles', ...TEMPLATE_STYLES[1] },
    { id: 2, name: 'Modern', description: 'Contemporary layout with accent colors and modern typography', ...TEMPLATE_STYLES[2] },
    { id: 3, name: 'Minimalist', description: 'Simple and elegant design focusing on content clarity', ...TEMPLATE_STYLES[3] },
    { id: 4, name: 'Creative', description: 'Bold design for creative professionals and designers', ...TEMPLATE_STYLES[4] },
  ];

  const getMetaData = (resume) => {
    if (!resume.metadata) return {};
    if (typeof resume.metadata === "string") {
      try { return JSON.parse(resume.metadata); } catch { return {}; }
    }
    return resume.metadata;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get("/resumes/me/");
        if (cancelled) return;
        setResumes(Array.isArray(data) ? data : []);
        setLoadError("");
      } catch {
        if (cancelled) return;
        setLoadError("We could not load your resumes. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [attempt]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError("");
    setAttempt((n) => n + 1);
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError("Please select a PDF file"); return; }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("pdf_file", pdfFile);
      const result = await resumeApi.post("/resumes/upload", formData);
      setReviewData(result);
      setShowUploadModal(false);
      setShowReviewModal(true);
      setPdfFile(null);
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (id) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/resumes/${id}/`);
      setResumes(resumes.filter((r) => r.resume_id !== id));
    } catch {
      alert("Failed to delete resume");
    }
  };

  // Patches the open resume with the changed fields and keeps the card and modal in sync.
  const handleSaveDetails = async (changes) => {
    const id = selectedResume.resume_id;
    const updated = await api.patch(`/resumes/${id}/`, changes);
    setResumes((list) => list.map((r) => (r.resume_id === id ? { ...r, ...updated } : r)));
    setSelectedResume((current) => (current ? { ...current, ...updated } : current));
  };

  const handleBuildFromTemplate = () => {
    if (selectedTemplate) {
      router.push(`/candidate/resumes/${selectedTemplate.id}`);
    }
  };

  // Count badge and footer depend on loaded resumes, so they are hidden until data arrives.
  const banner = (
    <DashboardBanner
      loading={loading}
      icon={HiOutlineDocumentText}
      badge={loading ? undefined : { label: `${resumes.length} ${resumes.length === 1 ? 'resume' : 'resumes'}`, icon: HiOutlineDocumentText }}
      title="My Resumes"
      subtitle="Manage your professional profiles and AI-ready resumes."
      aside={loading ? (
        <div className="flex gap-2">
          <BannerBlock className="h-11 w-36 rounded-xl" />
        </div>
      ) : (
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            title="Start a new resume from a template"
            className={`${primaryButton} w-full sm:w-auto`}
          >
            <HiPlus className="h-5 w-5" aria-hidden="true" />
            Build resume
          </button>
        </div>
      )}
      footer={loading ? null : resumes.length > 0
        ? 'Next step: keep your resume current so recruiters can match you to the latest jobs.'
        : 'Upload a resume so recruiters can match you to jobs.'}
    />
  );

  return (
    <div className={pageSpacing}>
      {banner}

      {loading ? (
        <PageSkeleton stats={0} cards={2} banner={false} />
      ) : (
        <>
          {loadError && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5">
              <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Something went wrong</p>
                <p className="mt-0.5 text-xs text-red-700/80 dark:text-red-300/70">{loadError}</p>
              </div>
              <button
                type="button"
                onClick={retryLoad}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/25 dark:text-red-300 dark:hover:bg-red-400/20 ${focusRing}`}
              >
                <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-sm font-semibold text-red-700 dark:text-red-300">
              <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              {error}
            </div>
          )}

          <section className="space-y-6">
            <SectionHeader
              icon={HiOutlineDocumentText}
              tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              title="Your resumes"
              subtitle="Open a resume to review its details, or download the PDF."
            >
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                title="Upload an existing PDF resume"
                className={secondaryButton}
              >
                <HiOutlineDocumentArrowUp className="h-5 w-5" aria-hidden="true" />
                Upload resume
              </button>
            </SectionHeader>

            {resumes.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resumes.map((resume) => {
                  const fileUrl = typeof resume.file_path === 'string' && resume.file_path ? resume.file_path : null;
                  const fileName = fileUrl ? safeDecode(fileUrl.split("\\").pop().split("/").pop()) : null;
                  return (
                    <div key={resume.resume_id} className="group flex min-w-0 flex-col rounded-2xl border border-emerald-100 bg-white transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-white/10 dark:bg-card">
                      <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-t-2xl bg-emerald-50 dark:bg-emerald-dark">
                        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                          <defs>
                            <pattern id={`pattern-${resume.resume_id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                              <rect x="0" y="0" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-700 dark:text-white" />
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill={`url(#pattern-${resume.resume_id})`} />
                        </svg>
                        <div className="relative text-center">
                          <div className="mx-auto flex h-16 w-14 items-center justify-center rounded-lg border border-emerald-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-white/30 dark:bg-white/20">
                            <HiOutlineDocumentText className="h-8 w-8 text-emerald-700 dark:text-white/70" aria-hidden="true" />
                          </div>
                          <span title="Resume status" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-white/20 dark:text-white">
                            <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {resume.status || "Active"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5 lg:p-6">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <h3 className="min-w-0 truncate text-lg font-semibold transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {resume.title || "Untitled Resume"}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleDeleteResume(resume.resume_id)}
                            aria-label="Delete resume"
                            title="Delete this resume"
                            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${muted} transition-all hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-400/10 dark:hover:text-red-400 ${focusRing}`}
                          >
                            <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        {fileName && (
                          <p className={`mb-3 flex min-w-0 items-center gap-1.5 text-xs ${muted}`} title={fileUrl}>
                            <HiOutlineDocument className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{fileName}</span>
                          </p>
                        )}

                        <div className="mb-6 space-y-2">
                          <p title="Years of work experience" className={`flex items-center gap-2 text-xs ${muted}`}>
                            <HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="font-semibold text-emerald-950 dark:text-white/80">Experience:</span> {resume.years_experience || 0} years
                          </p>
                          <p title="Highest education level" className={`flex items-center gap-2 text-xs ${muted}`}>
                            <HiOutlineAcademicCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="font-semibold text-emerald-950 dark:text-white/80">Education:</span> {(resume.education_level || "Not specified").toUpperCase()}
                          </p>
                          <p title="Date you uploaded this resume" className={`flex items-center gap-2 text-xs ${muted}`}>
                            <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="font-semibold text-emerald-950 dark:text-white/80">Uploaded:</span> {new Date(resume.upload_date).toLocaleDateString('en-US')}
                          </p>
                        </div>

                        <div className="mt-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setSelectedResume(resume); setShowDetailModal(true); }}
                            title="See the parsed details of this resume"
                            className={`${primaryButton} flex-1`}
                          >
                            <HiOutlineEye className="h-4 w-4" aria-hidden="true" />
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                            disabled={!fileUrl}
                            className={secondaryButton}
                            title="Open PDF"
                          >
                            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
                            PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              !loadError && (
                <EmptyState
                  icon={HiOutlineDocumentText}
                  title="No resumes yet"
                  text="Upload an existing resume or build one from a template to get started."
                />
              )
            )}
          </section>

          <UploadResumeModal
            open={showUploadModal}
            file={pdfFile}
            onFileChange={setPdfFile}
            onClose={() => { setShowUploadModal(false); setPdfFile(null); setError(""); }}
            onSubmit={handleUploadResume}
            uploading={uploading}
            error={error}
            onDismissError={() => setError("")}
          />

          {showTemplateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <dialog open aria-modal="true" aria-labelledby="build-resume-title" className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-100 bg-white text-foreground shadow-2xl dark:border-white/10 dark:bg-card">
                <div className="sticky top-0 flex items-center justify-between border-b border-emerald-100 bg-white p-5 lg:p-6 dark:border-white/10 dark:bg-card">
                  <h2 id="build-resume-title" className="flex items-center gap-2 text-xl font-semibold">
                    <HiPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    Build new resume
                  </h2>
                  <button
                    type="button"
                    onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}
                    aria-label="Close"
                    title="Close"
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${muted} transition-all hover:text-emerald-900 dark:hover:text-white ${focusRing}`}
                  >
                    <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-5 lg:p-6">
                  <p className={`mb-5 text-sm ${muted}`}>Choose a template to get started. You can edit every section in the builder.</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {templates.map((template) => {
                      const TemplateIcon = template.icon;
                      const isSelected = selectedTemplate?.id === template.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplate(template)}
                          aria-pressed={isSelected}
                          title={`Use the ${template.name} template`}
                          className={`rounded-xl border-2 p-4 text-left transition-all ${focusRing} ${
                            isSelected
                              ? 'border-emerald-500 bg-white shadow-md dark:bg-white/5'
                              : 'border-emerald-100 bg-white hover:border-emerald-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5'
                          }`}
                        >
                          <div className={`mb-3 flex h-24 items-center justify-center rounded-lg ${template.preview}`}>
                            <span className="flex h-12 w-9 items-center justify-center rounded border border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-white/30 dark:bg-white/20">
                              <TemplateIcon className="h-4 w-4 text-emerald-700 dark:text-white/80" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`font-semibold ${template.textColor}`}>{template.name}</h3>
                            {isSelected && <HiOutlineCheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
                          </div>
                          <p className={`mt-1 text-xs ${muted}`}>{template.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sticky bottom-0 flex gap-3 border-t border-emerald-100 bg-white p-5 lg:p-6 dark:border-white/10 dark:bg-card">
                  <button
                    type="button"
                    onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}
                    className={`${secondaryButton} flex-1 px-6 py-3`}
                  >
                    <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBuildFromTemplate}
                    disabled={!selectedTemplate}
                    title={selectedTemplate ? `Open the builder with ${selectedTemplate.name}` : 'Pick a template first'}
                    className={`${primaryButton} flex-1 px-6 py-3 disabled:bg-emerald-200 disabled:text-emerald-900 disabled:hover:bg-emerald-200 dark:disabled:bg-white/10 dark:disabled:text-slate-300 dark:disabled:hover:bg-white/10`}
                  >
                    <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
                    Build resume
                  </button>
                </div>
              </dialog>
            </div>
          )}

          {showReviewModal && reviewData && (
            <ResumeReviewModal
              resumeData={reviewData.resume_data}
              cloudinaryUrl={reviewData.cloudinary_url}
              rawFullText={reviewData.raw_full_text}
              onClose={(saved) => {
                setShowReviewModal(false);
                setReviewData(null);
                if (saved) setAttempt((n) => n + 1);
              }}
            />
          )}

          {showDetailModal && selectedResume && (() => {
            const md = getMetaData(selectedResume);
            const links = parseResumeList(selectedResume.links);
            const skillList = parseResumeList(md.skills_text);
            const projectList = parseResumeList(md.projects_text);
            const expList = parseResumeList(md.experience_text);
            const summary = md.summary_text || "";

            const contactRows = [
              { label: 'Email', value: selectedResume.candidate_email || "—", icon: HiOutlineEnvelope, hint: 'Email on this resume' },
              { label: 'Phone', value: selectedResume.candidate_phone || "—", icon: HiOutlinePhone, hint: 'Phone on this resume' },
              { label: 'Experience', value: `${selectedResume.years_experience ?? "—"} years`, icon: HiOutlineBriefcase, hint: 'Years of work experience' },
              { label: 'Education', value: (selectedResume.education_level || "—").toUpperCase(), icon: HiOutlineAcademicCap, hint: 'Highest education level' },
            ];

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <dialog open aria-modal="true" aria-labelledby="resume-details-title" className="relative scrollbar-none max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-emerald-100 bg-white text-foreground shadow-2xl dark:border-white/10 dark:bg-card">
                  <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-emerald-100 bg-white p-5 lg:p-6 dark:border-white/10 dark:bg-card">
                    <h2 id="resume-details-title" className="min-w-0 truncate text-xl font-semibold">{selectedResume.title || "Resume details"}</h2>
                    <div className="flex shrink-0 items-center gap-2">
                      {!editingDetails && (
                        <button
                          type="button"
                          onClick={() => setEditingDetails(true)}
                          title="Edit the basic details of this resume"
                          className={secondaryButton}
                        >
                          <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
                          Edit details
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setShowDetailModal(false); setSelectedResume(null); setEditingDetails(false); }}
                        aria-label="Close"
                        title="Close"
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${muted} transition-all hover:text-emerald-900 dark:hover:text-white ${focusRing}`}
                      >
                        <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {editingDetails ? (
                    <div className="p-5 lg:p-6">
                      <ResumeBasicEditForm
                        resume={selectedResume}
                        onSave={handleSaveDetails}
                        onCancel={() => setEditingDetails(false)}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-5 lg:p-6">
                      {/* Left column: profile */}
                      <div className="space-y-5 lg:col-span-2">
                        <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-950 dark:bg-emerald-dark dark:text-white lg:p-6">
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white backdrop-blur-sm dark:bg-white/20">
                              <HiOutlineUser className="h-6 w-6 text-emerald-700 dark:text-white" aria-hidden="true" />
                            </span>
                            {md.cloudinary_url && (
                              <button
                                type="button"
                                onClick={() => window.open(md.cloudinary_url, '_blank')}
                                title="Open the uploaded PDF"
                                className={`flex min-h-11 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-sm transition-all hover:bg-emerald-100 dark:bg-white/20 dark:text-white dark:shadow-none dark:hover:bg-emerald-400/10 ${focusRing}`}
                              >
                                <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" />
                                View PDF
                              </button>
                            )}
                          </div>
                          <h3 className="mb-1 text-xl font-semibold">{selectedResume.candidate_name || "Candidate"}</h3>
                          <p className="text-sm text-emerald-900/70 dark:text-white/80">{selectedResume.title || "Untitled"}</p>
                        </div>
  
                        <div className="space-y-3">
                          {contactRows.map((row) => (
                            <div key={row.label} title={row.hint} className="flex min-w-0 items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-white/10 dark:bg-white/5">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <row.icon className="h-5 w-5" aria-hidden="true" />
                              </span>
                              <div className="min-w-0">
                                <p className={`text-xs ${muted}`}>{row.label}</p>
                                <p className="truncate text-sm font-semibold text-foreground">{row.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
  
                        {links.length > 0 && (
                          <div className={card}>
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                              <HiOutlineLink className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Links
                            </h4>
                            <div className="space-y-2">
                              {links.map((link, i) => (
                                <a
                                  key={i}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={link}
                                  className={`group flex min-h-11 items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-sm text-emerald-700 transition-all hover:bg-emerald-100 dark:bg-white/5 dark:text-emerald-300 dark:hover:bg-emerald-400/10 ${focusRing}`}
                                >
                                  <HiOutlineArrowTopRightOnSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
                                  <span className="truncate">{String(link).replace(/^https?:\/\//, '')}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
  
                      {/* Right column: resume sections */}
                      <div className="space-y-5 lg:col-span-3">
                        {summary && (
                          <div className={card}>
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"><HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" /></span>
                              Summary
                            </h4>
                            <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
                          </div>
                        )}
  
                        <div className={card}>
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400"><HiOutlineCpuChip className="h-4 w-4" aria-hidden="true" /></span>
                            Skills
                          </h4>
                          {skillList.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {skillList.map((skill, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                                  <HiOutlineSparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <EmptyLine icon={HiOutlineSparkles} text="No skills listed on this resume." />
                          )}
                        </div>
  
                        <div className={card}>
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /></span>
                            Work experience
                          </h4>
                          {expList.length > 0 ? (
                            <div className="space-y-3">
                              {expList.map((exp, i) => (
                                <EntryCard key={i} text={exp} icon={HiOutlineBriefcase} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
                              ))}
                            </div>
                          ) : (
                            <EmptyLine icon={HiOutlineBriefcase} text="No work experience listed on this resume." />
                          )}
                        </div>
  
                        <div className={card}>
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400"><HiOutlineCodeBracket className="h-4 w-4" aria-hidden="true" /></span>
                            Projects
                          </h4>
                          {projectList.length > 0 ? (
                            <div className="space-y-3">
                              {projectList.map((proj, i) => (
                                <EntryCard key={i} text={proj} icon={HiOutlineFolderOpen} tone="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
                              ))}
                            </div>
                          ) : (
                            <EmptyLine icon={HiOutlineFolderOpen} text="No projects listed on this resume." />
                          )}
                        </div>
  
                        {!summary && skillList.length === 0 && expList.length === 0 && projectList.length === 0 && (
                          <EmptyState
                            icon={HiOutlineDocumentText}
                            title="No resume data available"
                            text="Upload a PDF to extract your skills and experience."
                          />
                        )}
                      </div>
                    </div>
                  )}
                </dialog>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
