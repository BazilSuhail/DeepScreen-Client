"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { api } from "@/utils/api";
import { resumeApi } from "@/utils/resume_api";
import {
  HiPlus, HiOutlineDocumentText, HiOutlineTrash, HiOutlineEye, HiOutlineDocumentArrowUp,
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineLink, HiOutlinePhone, HiOutlineUser,
  HiOutlineSparkles, HiOutlineDocument, HiOutlineXMark,
  HiOutlineEnvelope, HiOutlineArrowTopRightOnSquare, HiOutlineCalendarDays, HiOutlineArrowPath,
  HiOutlineCheckCircle, HiOutlineExclamationTriangle,
  HiOutlineArrowRight, HiOutlineSwatch, HiOutlineCodeBracket, HiOutlineCpuChip,
  HiOutlinePencilSquare, HiOutlineFolderOpen, HiOutlineLightBulb,
} from 'react-icons/hi2';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import ResumesSkeleton from '@/components/skeletons/candidate/ResumesSkeleton';
import ResumeReviewModal from '@/components/resume/ResumeReviewModal';
import ResumeBasicEditForm from '@/components/resume/ResumeBasicEditForm';
import UploadResumeModal from '@/components/resumes/UploadResumeModal';
import { parseResumeList } from '@/utils/resumeList';
import Modal from '@/components/ui/Modal';
import { badge, card, dangerButton, focusRing, iconButton, iconTile, primaryButton, secondaryButton } from '@/components/ui/styles';
import { base, fadeUp, stagger } from '@/constants/motion';

// Names and icons match the builder's template menu so the choice reads the same on both screens.
const TEMPLATES = [
  { id: 1, name: 'LaTeX Professional', description: 'Clean and traditional, suited to academic and technical roles', preview: 'bg-emerald-50 dark:bg-emerald-dark', icon: HiOutlineAcademicCap },
  { id: 2, name: 'Creative Visual', description: 'Bold layout with accent colours for design and creative roles', preview: 'bg-emerald-600', icon: HiOutlineSwatch },
  { id: 3, name: 'Modern Minimal', description: 'Simple and elegant, focused on content clarity', preview: 'bg-emerald-500/20', icon: HiOutlineDocument },
  { id: 4, name: 'Executive Corporate', description: 'Structured and formal for business and management roles', preview: 'bg-teal-600', icon: HiOutlineBriefcase },
];

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

const getMetaData = (resume) => {
  if (!resume.metadata) return {};
  if (typeof resume.metadata === "string") {
    try { return JSON.parse(resume.metadata); } catch { return {}; }
  }
  return resume.metadata;
};

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

const dash = <span className="text-muted-foreground">—</span>;

function EmptyLine({ icon: Icon, text }) {
  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
}

function DetailCard({ icon: Icon, tone, title, children }) {
  return (
    <div className="rounded-md border border-emerald-100 p-4 dark:border-white/10">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className={`${iconTile} h-8 w-8 ${tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function EntryCard({ text, icon: Icon, tone }) {
  const { title, body, techItems } = parseEntry(text);
  return (
    <div className="flex gap-3 rounded-md border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-white/10 dark:bg-white/5">
      <span className={`${iconTile} h-8 w-8 ${tone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        {title && <p className="break-words text-sm font-semibold">{title}</p>}
        {body && <p className="break-words text-sm leading-relaxed text-foreground/80">{body}</p>}
        {techItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-muted-foreground">Tech stack:</span>
            {techItems.map((item, i) => (
              <span key={i} className={`${badge} border border-emerald-100 bg-card text-emerald-900 dark:border-white/10 dark:bg-white/10 dark:text-slate-200`}>{item}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const EMERALD_TONE = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
const TEAL_TONE = 'bg-teal-500/10 text-teal-700 dark:text-teal-300';
const AMBER_TONE = 'bg-amber-500/10 text-amber-700 dark:text-amber-300';

function ResumeDetails({ resume }) {
  const md = getMetaData(resume);
  const links = parseResumeList(resume.links);
  const skillList = parseResumeList(md.skills_text);
  const projectList = parseResumeList(md.projects_text);
  const expList = parseResumeList(md.experience_text);
  const summary = md.summary_text || "";

  const contactRows = [
    { label: 'Email', value: resume.candidate_email, icon: HiOutlineEnvelope },
    { label: 'Phone', value: resume.candidate_phone, icon: HiOutlinePhone },
    { label: 'Experience', value: resume.years_experience != null ? `${resume.years_experience} years` : null, icon: HiOutlineBriefcase },
    { label: 'Education', value: resume.education_level ? resume.education_level.toUpperCase() : null, icon: HiOutlineAcademicCap },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-md bg-emerald-50 p-5 text-emerald-950 dark:bg-emerald-dark dark:text-white">
          <span className={`${iconTile} mb-4 h-12 w-12 bg-white dark:bg-white/20`}>
            <HiOutlineUser className="h-6 w-6 text-emerald-700 dark:text-white" aria-hidden="true" />
          </span>
          <p className="break-words text-lg font-semibold">{resume.candidate_name || dash}</p>
          <p className="break-words text-sm text-emerald-900/70 dark:text-white/80">{resume.title || "Untitled"}</p>
        </div>

        <dl className="divide-y divide-border rounded-md border border-emerald-100 dark:border-white/10">
          {contactRows.map((row) => (
            <div key={row.label} className="flex min-w-0 items-center gap-3 p-3">
              <span className={`${iconTile} h-9 w-9 ${EMERALD_TONE}`}>
                <row.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="truncate text-sm font-semibold">{row.value || dash}</dd>
              </div>
            </div>
          ))}
        </dl>

        {links.length > 0 && (
          <DetailCard icon={HiOutlineLink} tone={EMERALD_TONE} title="Links">
            <div className="space-y-2">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link}
                  className={`flex min-h-11 items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-white/5 dark:text-emerald-300 dark:hover:bg-white/10 ${focusRing}`}
                >
                  <HiOutlineArrowTopRightOnSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{String(link).replace(/^https?:\/\//, '')}</span>
                </a>
              ))}
            </div>
          </DetailCard>
        )}
      </div>

      <div className="space-y-4 lg:col-span-3">
        {summary && (
          <DetailCard icon={HiOutlineDocumentText} tone={AMBER_TONE} title="Summary">
            <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
          </DetailCard>
        )}

        <DetailCard icon={HiOutlineCpuChip} tone={TEAL_TONE} title="Skills">
          {skillList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skillList.map((skill, i) => (
                <span key={i} className={`${badge} border border-emerald-100 bg-emerald-50 font-semibold text-emerald-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200`}>
                  <HiOutlineSparkles className="h-3 w-3 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <EmptyLine icon={HiOutlineSparkles} text="No skills listed on this resume." />
          )}
        </DetailCard>

        <DetailCard icon={HiOutlineBriefcase} tone={EMERALD_TONE} title="Work experience">
          {expList.length > 0 ? (
            <div className="space-y-3">
              {expList.map((exp, i) => <EntryCard key={i} text={exp} icon={HiOutlineBriefcase} tone={EMERALD_TONE} />)}
            </div>
          ) : (
            <EmptyLine icon={HiOutlineBriefcase} text="No work experience listed on this resume." />
          )}
        </DetailCard>

        <DetailCard icon={HiOutlineCodeBracket} tone={TEAL_TONE} title="Projects">
          {projectList.length > 0 ? (
            <div className="space-y-3">
              {projectList.map((proj, i) => <EntryCard key={i} text={proj} icon={HiOutlineFolderOpen} tone={TEAL_TONE} />)}
            </div>
          ) : (
            <EmptyLine icon={HiOutlineFolderOpen} text="No projects listed on this resume." />
          )}
        </DetailCard>

        {!summary && skillList.length === 0 && expList.length === 0 && projectList.length === 0 && (
          <EmptyState icon={HiOutlineDocumentText} title="No resume data available" text="Upload a PDF to extract your skills and experience." />
        )}
      </div>
    </div>
  );
}

function ResumeCard({ resume, index, onView, onDelete }) {
  const fileUrl = typeof resume.file_path === 'string' && resume.file_path ? resume.file_path : null;
  const fileName = fileUrl ? safeDecode(fileUrl.split("\\").pop().split("/").pop()) : null;
  const meta = [
    { icon: HiOutlineBriefcase, label: 'Experience', value: resume.years_experience != null ? `${resume.years_experience} years` : null },
    { icon: HiOutlineAcademicCap, label: 'Education', value: resume.education_level ? resume.education_level.toUpperCase() : null },
    { icon: HiOutlineCalendarDays, label: 'Uploaded', value: resume.upload_date ? new Date(resume.upload_date).toLocaleDateString('en-US') : null },
  ];

  return (
    <motion.article
      {...fadeUp}
      transition={{ ...base, delay: Math.min(index, 8) * stagger }}
      className={`group flex min-w-0 flex-col overflow-hidden transition-[border-color,box-shadow] hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-500/40 ${card}`}
    >
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-emerald-50 dark:bg-emerald-dark">
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id={`pattern-${resume.resume_id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-700 dark:text-white" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#pattern-${resume.resume_id})`} />
        </svg>
        <span className="relative flex h-16 w-14 items-center justify-center rounded-sm border border-emerald-200 bg-white shadow-sm transition-[translate] duration-200 group-hover:-translate-y-0.5 dark:border-white/20 dark:bg-white/10">
          <HiOutlineDocumentText className="h-8 w-8 text-emerald-700 dark:text-white/80" aria-hidden="true" />
        </span>
        {resume.status && (
          <span className={`${badge} absolute left-3 top-3 bg-white font-semibold capitalize text-emerald-800 dark:bg-white/15 dark:text-white`}>
            <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> {resume.status}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate pt-2 text-base font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            {resume.title || "Untitled Resume"}
          </h3>
          <button
            type="button"
            onClick={() => onDelete(resume)}
            aria-label="Delete resume"
            title="Delete this resume"
            className={`${iconButton} -mr-2 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400`}
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

        <dl className="mb-5 space-y-2 text-xs">
          {meta.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <m.icon className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <dt className="text-muted-foreground">{m.label}</dt>
              <dd className="ml-auto truncate font-semibold">{m.value || dash}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex gap-2">
          <button type="button" onClick={() => onView(resume)} title="See the parsed details of this resume" className={`${primaryButton} flex-1`}>
            <HiOutlineEye className="h-4 w-4" aria-hidden="true" />
            View details
          </button>
          <button type="button" onClick={() => fileUrl && window.open(fileUrl, '_blank')} disabled={!fileUrl} className={secondaryButton} title="Open PDF">
            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
            PDF
          </button>
        </div>
      </div>
    </motion.article>
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  const askDelete = (resume) => {
    setDeleteTarget(resume);
    setDeleteError("");
    setConfirmOpen(true);
  };

  const handleDeleteResume = async () => {
    const id = deleteTarget.resume_id;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/resumes/${id}/`);
      setResumes((list) => list.filter((r) => r.resume_id !== id));
      setConfirmOpen(false);
    } catch {
      setDeleteError("Failed to delete resume. Please try again.");
    } finally {
      setDeleting(false);
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

  const closeTemplates = () => { setShowTemplateModal(false); setSelectedTemplate(null); };
  const closeDetails = () => { setShowDetailModal(false); setEditingDetails(false); };
  const detailPdf = selectedResume ? getMetaData(selectedResume).cloudinary_url : null;

  if (loading) return <ResumesSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        icon={HiOutlineDocumentText}
        eyebrow="Candidate"
        title="My resumes"
        description="Manage your professional profiles and AI-ready resumes."
        meta={!loadError && (
          <>
            <span className={`${badge} bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
              <HiOutlineDocumentText className="h-3.5 w-3.5" aria-hidden="true" />
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
            </span>
            <span className={`${badge} bg-muted text-muted-foreground`}>
              <HiOutlineLightBulb className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              {resumes.length > 0
                ? 'Keep your resume current so recruiters can match you to the latest jobs.'
                : 'Upload a resume so recruiters can match you to jobs.'}
            </span>
          </>
        )}
        actions={(
          <>
            <button type="button" onClick={() => setShowUploadModal(true)} title="Upload an existing PDF resume" className={secondaryButton}>
              <HiOutlineDocumentArrowUp className="h-4 w-4" aria-hidden="true" />
              Upload resume
            </button>
            <button type="button" onClick={() => setShowTemplateModal(true)} title="Start a new resume from a template" className={primaryButton}>
              <HiPlus className="h-4 w-4" aria-hidden="true" />
              Build resume
            </button>
          </>
        )}
      />

      {loadError ? (
        <ErrorState message={loadError} onRetry={retryLoad} />
      ) : resumes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {resumes.map((resume, i) => (
            <ResumeCard
              key={resume.resume_id}
              resume={resume}
              index={i}
              onView={(r) => { setSelectedResume(r); setEditingDetails(false); setShowDetailModal(true); }}
              onDelete={askDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HiOutlineDocumentText}
          title="No resumes yet"
          text="Upload an existing resume or build one from a template to get started."
          action={(
            <button type="button" onClick={() => setShowUploadModal(true)} className={secondaryButton}>
              <HiOutlineDocumentArrowUp className="h-4 w-4" aria-hidden="true" /> Upload resume
            </button>
          )}
        />
      )}

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

      <Modal
        open={showTemplateModal}
        onClose={closeTemplates}
        title="Build new resume"
        description="Choose a template to get started. You can edit every section in the builder."
        size="lg"
        footer={(
          <>
            <button type="button" onClick={closeTemplates} className={secondaryButton}>
              <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBuildFromTemplate}
              disabled={!selectedTemplate}
              title={selectedTemplate ? `Open the builder with ${selectedTemplate.name}` : 'Pick a template first'}
              className={primaryButton}
            >
              <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
              Build resume
            </button>
          </>
        )}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TEMPLATES.map((template) => {
            const TemplateIcon = template.icon;
            const isSelected = selectedTemplate?.id === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template)}
                aria-pressed={isSelected}
                className={`rounded-lg border-2 bg-card p-3 text-left transition-[border-color,translate,scale] active:scale-[0.98] motion-reduce:transform-none ${focusRing} ${
                  isSelected ? 'border-emerald-500' : 'border-emerald-100 hover:border-emerald-300 dark:border-white/10 dark:hover:border-emerald-500/40'
                }`}
              >
                <div className={`mb-3 flex h-20 items-center justify-center rounded-md ${template.preview}`}>
                  <span className="flex h-12 w-9 items-center justify-center rounded-sm border border-emerald-200 bg-white/90 dark:border-white/30 dark:bg-white/20">
                    <TemplateIcon className="h-4 w-4 text-emerald-700 dark:text-white/80" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{template.name}</h3>
                  {isSelected && <HiOutlineCheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={showDetailModal && !!selectedResume}
        onClose={closeDetails}
        title={editingDetails ? 'Edit resume details' : (selectedResume?.title || "Resume details")}
        size="xl"
        footer={!editingDetails && selectedResume && (
          <>
            {detailPdf && (
              <button type="button" onClick={() => window.open(detailPdf, '_blank')} title="Open the uploaded PDF" className={secondaryButton}>
                <HiOutlineDocumentText className="h-4 w-4" aria-hidden="true" />
                View PDF
              </button>
            )}
            <button type="button" onClick={() => setEditingDetails(true)} title="Edit the basic details of this resume" className={primaryButton}>
              <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
              Edit details
            </button>
          </>
        )}
      >
        {selectedResume && (editingDetails ? (
          <ResumeBasicEditForm resume={selectedResume} onSave={handleSaveDetails} onCancel={() => setEditingDetails(false)} />
        ) : (
          <ResumeDetails resume={selectedResume} />
        ))}
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        dismissible={!deleting}
        size="sm"
        title="Delete resume?"
        description="Are you sure you want to delete this resume? This cannot be undone."
        footer={(
          <>
            <button type="button" onClick={() => setConfirmOpen(false)} disabled={deleting} className={secondaryButton}>
              Cancel
            </button>
            <button type="button" onClick={handleDeleteResume} disabled={deleting} className={dangerButton}>
              {deleting
                ? <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                : <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />}
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}
      >
        <div className="space-y-3">
          {deleteTarget && (
            <p className="flex min-w-0 items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium">
              <HiOutlineDocumentText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{deleteTarget.title || "Untitled Resume"}</span>
            </p>
          )}
          {deleteError && (
            <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-600 dark:text-red-400">
              <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {deleteError}
            </p>
          )}
        </div>
      </Modal>

      {/* reviewData is kept after close so the content stays put during the exit animation. */}
      {reviewData && (
        <ResumeReviewModal
          open={showReviewModal}
          resumeData={reviewData.resume_data}
          cloudinaryUrl={reviewData.cloudinary_url}
          rawFullText={reviewData.raw_full_text}
          onClose={(saved) => {
            setShowReviewModal(false);
            if (saved) setAttempt((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
