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
} from 'react-icons/hi2';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import ResumeReviewModal from '@/components/resume/ResumeReviewModal';
import UploadResumeModal from '@/components/resumes/UploadResumeModal';

const TEMPLATE_STYLES = {
  1: { preview: 'bg-emerald-dark', textColor: 'text-emerald-600', icon: HiOutlineBriefcase },
  2: { preview: 'bg-emerald-600', textColor: 'text-emerald-600', icon: HiOutlineSwatch },
  3: { preview: 'bg-emerald-500/20', textColor: 'text-emerald-600', icon: HiOutlineDocument },
  4: { preview: 'bg-teal-600', textColor: 'text-teal-600', icon: HiOutlineLightBulb },
};

const pageSpacing = 'mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8';

// Hides raw server payloads (JSON or bracketed text) behind a plain message.
const friendlyError = (err, fallback) => {
  const msg = typeof err?.message === 'string' ? err.message.trim() : '';
  return msg && !/^[\[{]/.test(msg) ? msg : fallback;
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
          {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

const sectionCard = 'rounded-xl border border-border bg-card p-5 lg:p-6';

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
    (async () => {
      try {
        const data = await api.get("/resumes/me/");
        setResumes(data);
        setLoadError("");
      } catch (err) {
        setLoadError("We could not load your resumes. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    })();
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
      setError(friendlyError(err, "Upload failed. Please try again with a PDF under 10MB."));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (id) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/resumes/${id}/`);
      setResumes(resumes.filter((r) => r.resume_id !== id));
    } catch (err) {
      alert("Failed to delete resume");
    }
  };

  const handleBuildFromTemplate = () => {
    if (selectedTemplate) {
      router.push(`/candidate/resumes/${selectedTemplate.id}`);
    }
  };

  if (loading) return <PageSkeleton stats={0} cards={2} />;

  return (
    <div className={pageSpacing}>
      <DashboardBanner
        icon={HiOutlineDocumentText}
        badge={{ label: `${resumes.length} ${resumes.length === 1 ? 'resume' : 'resumes'}`, icon: HiOutlineDocumentText }}
        title="My Resumes"
        subtitle="Manage your professional profiles and AI-ready resumes."
        footer={resumes.length > 0
          ? 'Next step: keep your resume current so recruiters can match you to the latest jobs.'
          : 'Upload a resume so recruiters can match you to jobs.'}
      />

      {loadError && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5">
          <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-300">Something went wrong</p>
            <p className="mt-0.5 text-xs text-red-300/70">{loadError}</p>
          </div>
          <button
            type="button"
            onClick={retryLoad}
            className="shrink-0 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25"
          >
            Retry
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-sm font-semibold text-red-300">
          <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
          {error}
        </div>
      )}

      <section className="space-y-6">
        <SectionHeader
          icon={HiOutlineDocumentText}
          tone="bg-emerald-500/10 text-emerald-500"
          title="Your resumes"
          subtitle="Open a resume to review its details, or download the PDF."
        >
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            title="Upload an existing PDF resume"
            className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-secondary active:scale-95"
          >
            <HiOutlineDocumentArrowUp className="h-5 w-5" aria-hidden="true" />
            Upload resume
          </button>
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            title="Start a new resume from a template"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-emerald-700 active:scale-95"
          >
            <HiPlus className="h-5 w-5" aria-hidden="true" />
            Build resume
          </button>
        </SectionHeader>

        {resumes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => {
              const fileUrl = resume.file_path;
              const fileName = fileUrl ? decodeURIComponent(fileUrl.split("\\").pop().split("/").pop()) : null;
              return (
                <div key={resume.resume_id} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/5">
                  <div className="relative flex h-36 items-center justify-center overflow-hidden bg-emerald-dark">
                    <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <pattern id={`pattern-${resume.resume_id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <rect x="0" y="0" width="20" height="20" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill={`url(#pattern-${resume.resume_id})`} />
                    </svg>
                    <div className="relative text-center">
                      <div className="mx-auto flex h-16 w-14 items-center justify-center rounded-lg border border-white/30 bg-white/20 shadow-xl backdrop-blur-sm">
                        <HiOutlineDocumentText className="h-8 w-8 text-white/70" aria-hidden="true" />
                      </div>
                      <span title="Resume status" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                        <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        {resume.status || "Active"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 lg:p-6">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="min-w-0 truncate text-lg font-semibold transition-colors group-hover:text-emerald-500">
                        {resume.title || "Untitled Resume"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleDeleteResume(resume.resume_id)}
                        aria-label="Delete resume"
                        title="Delete this resume"
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                      >
                        <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    {fileName && (
                      <p className="mb-3 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground" title={fileUrl}>
                        <HiOutlineDocument className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{fileName}</span>
                      </p>
                    )}

                    <div className="mb-6 space-y-2">
                      <p title="Years of work experience" className="flex items-center gap-2 text-xs text-muted-foreground">
                        <HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-foreground/80">Experience:</span> {resume.years_experience || 0} years
                      </p>
                      <p title="Highest education level" className="flex items-center gap-2 text-xs text-muted-foreground">
                        <HiOutlineAcademicCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-foreground/80">Education:</span> {(resume.education_level || "Not specified").toUpperCase()}
                      </p>
                      <p title="Date you uploaded this resume" className="flex items-center gap-2 text-xs text-muted-foreground">
                        <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-foreground/80">Uploaded:</span> {new Date(resume.upload_date).toLocaleDateString('en-US')}
                      </p>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSelectedResume(resume); setShowDetailModal(true); }}
                        title="See the parsed details of this resume"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
                      >
                        <HiOutlineEye className="h-4 w-4" aria-hidden="true" />
                        View details
                      </button>
                      <button
                        type="button"
                        onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                        disabled={!fileUrl}
                        className="flex items-center justify-center gap-2 rounded-lg border-2 border-border bg-card px-3 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-secondary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-secondary active:scale-95"
                  >
                    <HiOutlineDocumentArrowUp className="h-5 w-5" aria-hidden="true" />
                    Upload resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-emerald-700 active:scale-95"
                  >
                    <HiPlus className="h-5 w-5" aria-hidden="true" />
                    Build resume
                  </button>
                </div>
              }
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-5 lg:p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <HiPlus className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                Build new resume
              </h2>
              <button
                type="button"
                onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}
                aria-label="Close"
                title="Close"
                className="text-muted-foreground transition-all hover:text-foreground"
              >
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 lg:p-6">
              <p className="mb-5 text-sm text-muted-foreground">Choose a template to get started. You can edit every section in the builder.</p>
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
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-card shadow-md'
                          : 'border-border bg-card hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`mb-3 flex h-24 items-center justify-center rounded-lg ${template.preview}`}>
                        <span className="flex h-12 w-9 items-center justify-center rounded border border-white/30 bg-white/20 backdrop-blur-sm">
                          <TemplateIcon className="h-4 w-4 text-white/80" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-semibold ${template.textColor}`}>{template.name}</h3>
                        {isSelected && <HiOutlineCheckCircle className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-border bg-card p-5 lg:p-6">
              <button
                type="button"
                onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}
                className="flex-1 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBuildFromTemplate}
                disabled={!selectedTemplate}
                title={selectedTemplate ? `Open the builder with ${selectedTemplate.name}` : 'Pick a template first'}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-95 ${
                  selectedTemplate
                    ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90'
                    : 'cursor-not-allowed bg-muted text-muted-foreground'
                }`}
              >
                <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
                Build resume
              </button>
            </div>
          </div>
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
        const links = selectedResume.links || [];
        const skillList = (() => {
          try {
            const raw = md.skills_text;
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch { return []; }
        })();
        const projectList = (() => {
          try {
            const raw = md.projects_text;
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch { return []; }
        })();
        const expList = (() => {
          try {
            const raw = md.experience_text;
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch { return []; }
        })();
        const summary = md.summary_text || "";

        const contactRows = [
          { label: 'Email', value: selectedResume.candidate_email || "—", icon: HiOutlineEnvelope, tone: 'bg-emerald-500/10 text-emerald-500', hint: 'Email on this resume' },
          { label: 'Phone', value: selectedResume.candidate_phone || "—", icon: HiOutlinePhone, tone: 'bg-emerald-500/10 text-emerald-500', hint: 'Phone on this resume' },
          { label: 'Experience', value: `${selectedResume.years_experience ?? "—"} years`, icon: HiOutlineBriefcase, tone: 'bg-emerald-500/10 text-emerald-500', hint: 'Years of work experience' },
          { label: 'Education', value: (selectedResume.education_level || "—").toUpperCase(), icon: HiOutlineAcademicCap, tone: 'bg-emerald-500/10 text-emerald-500', hint: 'Highest education level' },
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="scrollbar-hide max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card p-5 lg:p-6">
                <h2 className="min-w-0 truncate text-xl font-semibold">{selectedResume.title || "Resume details"}</h2>
                <button
                  type="button"
                  onClick={() => { setShowDetailModal(false); setSelectedResume(null); }}
                  aria-label="Close"
                  title="Close"
                  className="shrink-0 text-muted-foreground transition-all hover:text-foreground"
                >
                  <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-5 lg:p-6">
                {/* Left column: profile */}
                <div className="space-y-5 lg:col-span-2">
                  <div className="rounded-xl bg-emerald-dark p-5 text-white lg:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <HiOutlineUser className="h-6 w-6" aria-hidden="true" />
                      </span>
                      {md.cloudinary_url && (
                        <button
                          type="button"
                          onClick={() => window.open(md.cloudinary_url, '_blank')}
                          title="Open the uploaded PDF"
                          className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
                        >
                          <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" />
                          View PDF
                        </button>
                      )}
                    </div>
                    <h3 className="mb-1 text-xl font-semibold">{selectedResume.candidate_name || "Candidate"}</h3>
                    <p className="text-sm text-white/80">{selectedResume.title || "Untitled"}</p>
                  </div>

                  <div className="space-y-3">
                    {contactRows.map((row) => (
                      <div key={row.label} title={row.hint} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-muted p-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${row.tone}`}>
                          <row.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{row.label}</p>
                          <p className="truncate text-sm font-semibold text-foreground">{row.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {links.length > 0 && (
                    <div className={sectionCard}>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <HiOutlineLink className="h-4 w-4 text-emerald-500" aria-hidden="true" /> Links
                      </h4>
                      <div className="space-y-2">
                        {links.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link}
                            className="group flex items-center gap-2 rounded-xl bg-muted p-2.5 text-sm text-emerald-600 transition-all hover:bg-emerald-50"
                          >
                            <HiOutlineArrowTopRightOnSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column: resume sections */}
                <div className="space-y-5 lg:col-span-3">
                  {summary && (
                    <div className={sectionCard}>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500"><HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" /></span>
                        Summary
                      </h4>
                      <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
                    </div>
                  )}

                  {skillList.length > 0 && (
                    <div className={sectionCard}>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500"><HiOutlineCpuChip className="h-4 w-4" aria-hidden="true" /></span>
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skillList.map((skill, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground/80">
                            <HiOutlineSparkles className="h-3 w-3 text-blue-500" aria-hidden="true" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {expList.length > 0 && (
                    <div className={sectionCard}>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500"><HiOutlineBriefcase className="h-4 w-4" aria-hidden="true" /></span>
                        Work experience
                      </h4>
                      <div className="space-y-3">
                        {expList.map((exp, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                            <p className="text-sm leading-relaxed text-foreground/80">{exp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projectList.length > 0 && (
                    <div className={sectionCard}>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500"><HiOutlineCodeBracket className="h-4 w-4" aria-hidden="true" /></span>
                        Projects
                      </h4>
                      <div className="space-y-3">
                        {projectList.map((proj, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple-500" aria-hidden="true" />
                            <p className="text-sm leading-relaxed text-foreground/80">{proj}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!summary && skillList.length === 0 && expList.length === 0 && projectList.length === 0 && (
                    <EmptyState
                      icon={HiOutlineDocumentText}
                      title="No resume data available"
                      text="Upload a PDF to extract your skills and experience."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
