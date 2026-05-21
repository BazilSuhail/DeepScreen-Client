"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { api } from "@/utils/api";
import { resumeApi } from "@/utils/resume_api";
import { HiPlus, HiDocumentText, HiTrash, HiEye, HiOutlineDocumentArrowUp, HiAcademicCap, HiBriefcase, HiLink, HiPhone, HiUser, HiOutlineChartBar, HiOutlineClock, HiOutlineSparkles, HiOutlineDocument } from 'react-icons/hi2';
import { FiX, FiExternalLink } from 'react-icons/fi';
import { CgMail } from 'react-icons/cg';
import ResumeReviewModal from '@/components/resume/ResumeReviewModal';

const TEMPLATE_STYLES = {
  1: { gradient: 'from-emerald-700 to-emerald-900', textColor: 'text-emerald-700', accent: 'bg-emerald-100 text-emerald-800' },
  2: { gradient: 'from-emerald-500 to-emerald-700', textColor: 'text-emerald-600', accent: 'bg-emerald-50 text-emerald-700' },
  3: { gradient: 'from-emerald-400 to-emerald-500', textColor: 'text-emerald-500', accent: 'bg-emerald-50 text-emerald-600' },
  4: { gradient: 'from-teal-500 to-emerald-600', textColor: 'text-teal-600', accent: 'bg-teal-50 text-teal-700' },
};

export default function CandidateResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchResumes = async () => {
    try {
      const data = await api.get("/resumes/me/");
      setResumes(data);
    } catch (err) {
      setError("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

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
      setError(err.message || "Failed to upload resume");
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

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-secondary rounded-lg" />
            <div className="h-4 w-64 bg-secondary rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-36 bg-secondary rounded-xl" />
            <div className="h-12 w-36 bg-secondary rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-12 bg-secondary rounded" />
                <div className="h-3 w-20 bg-secondary rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden">
              <div className="h-40 bg-secondary" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-40 bg-secondary rounded" />
                <div className="h-4 w-32 bg-secondary rounded" />
                <div className="h-4 w-full bg-secondary rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="h-10 flex-1 bg-secondary rounded-lg" />
                  <div className="h-10 w-20 bg-secondary rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 ">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Resumes</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage your professional profiles and AI-ready resumes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-card text-primary border-2 border-border rounded-xl font-bold hover:bg-secondary transition-all active:scale-95"
          >
            <HiOutlineDocumentArrowUp className="w-5 h-5" />
            Upload Resume
          </button>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
          >
            <HiPlus className="w-5 h-5" />
            Build Resume
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {resumes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Resumes', value: resumes.length, icon: HiOutlineDocument, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500' },
            { label: 'Skills Extracted', value: resumes.reduce((sum, r) => {
              const md = getMetaData(r);
              try { return sum + (JSON.parse(md.skills_text || '[]')?.length || 0); } catch { return sum; }
            }, 0), icon: HiOutlineSparkles, color: 'from-blue-500/10 to-blue-600/5 text-blue-500' },
            { label: 'Last Uploaded', value: resumes.length > 0 ? new Date(Math.max(...resumes.map(r => new Date(r.upload_date).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—', icon: HiOutlineClock, color: 'from-amber-500/10 to-amber-600/5 text-amber-500' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const md = getMetaData(resume);
            const fileUrl = resume.file_path;
            const fileName = fileUrl ? decodeURIComponent(fileUrl.split("\\").pop().split("/").pop()) : null;
            return (
              <div key={resume.resume_id} className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-border hover:border-emerald-500/20">
                <div className="h-40 bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.07]">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id={`pattern-${resume.resume_id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <rect x="0" y="0" width="20" height="20" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill={`url(#pattern-${resume.resume_id})`} />
                    </svg>
                  </div>
                  <div className="relative text-center">
                    <div className="w-16 h-20 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 shadow-xl flex items-center justify-center">
                      <HiDocumentText className="w-8 h-8 text-white/70" />
                    </div>
                    <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                      {resume.status || "Active"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
                      {resume.title || "Untitled Resume"}
                    </h3>
                    <button
                      onClick={() => handleDeleteResume(resume.resume_id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                  {fileName && (
                    <p className="text-xs text-muted-foreground mb-3 truncate" title={fileUrl}>
                      {fileName}
                    </p>
                  )}

                  <div className="space-y-1.5 mb-6">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Experience:</span> {resume.years_experience || 0} years
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Education:</span> {(resume.education_level || "Not specified").toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Uploaded:</span> {new Date(resume.upload_date).toLocaleDateString('en-US')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedResume(resume); setShowDetailModal(true); }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                      <HiEye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                      disabled={!fileUrl}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-card text-primary border-2 border-border rounded-lg font-semibold text-sm hover:bg-secondary transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Open PDF"
                    >
                      <HiDocumentText className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
            <HiDocumentText className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No Resumes Yet</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Upload an existing resume or build one from a template to get started.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-card text-primary border-2 border-border rounded-xl font-bold hover:bg-secondary transition-all active:scale-95"
            >
              <HiOutlineDocumentArrowUp className="w-5 h-5" />
              Upload Resume
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
            >
              <HiPlus className="w-5 h-5" />
              Build Resume
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
              <h2 className="text-2xl font-bold text-foreground">Upload Resume</h2>
              <button
                onClick={() => { setShowUploadModal(false); setPdfFile(null); }}
                className="text-muted-foreground hover:text-foreground transition-all"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUploadResume} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary px-2">
                  Upload PDF Document
                </label>
                <div className="w-full relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl bg-muted hover:bg-secondary transition-all group">
                  <HiOutlineDocumentArrowUp className="w-12 h-12 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
                  <p className="text-sm font-bold text-foreground mb-1">
                    {pdfFile ? pdfFile.name : "Click to upload your resume"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF format only (Max 10MB)
                  </p>
                  <input
                    required
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-muted border border-border">
                <p className="text-sm text-muted-foreground font-medium">
                  <strong>Note:</strong> DeepScreen AI will automatically extract your skills, experience, and projects from this PDF to build your profile.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setPdfFile(null); }}
                  className="flex-1 px-6 py-3 text-foreground bg-secondary rounded-xl font-bold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Upload & Process"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
              <h2 className="text-2xl font-bold text-foreground">Build New Resume</h2>
              <button
                onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}
                className="text-muted-foreground hover:text-foreground transition-all"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-muted-foreground mb-6 font-medium">Choose a template to get started:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedTemplate?.id === template.id
                        ? 'border-emerald-500 bg-card shadow-md'
                        : 'border-border hover:border-emerald-300 bg-card hover:shadow-sm'
                    }`}
                  >
                    <div className={`h-24 bg-linear-to-br ${template.gradient} rounded-lg mb-3 flex items-center justify-center`}>
                      <div className="w-8 h-12 bg-white/20 rounded border border-white/30 backdrop-blur-sm flex items-center justify-center">
                        <HiDocumentText className="w-4 h-4 text-white/70" />
                      </div>
                    </div>
                    <h3 className={`font-bold ${template.textColor} mb-1`}>{template.name}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-border bg-card">
              <button
                onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}
                className="flex-1 px-6 py-3 text-foreground bg-secondary rounded-xl font-bold hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBuildFromTemplate}
                disabled={!selectedTemplate}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                  selectedTemplate
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Build Resume
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
            if (saved) fetchResumes();
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

        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide border border-border">
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card z-10">
                <h2 className="text-2xl font-bold text-foreground">{selectedResume.title || "Resume Details"}</h2>
                <button onClick={() => { setShowDetailModal(false); setSelectedResume(null); }} className="text-muted-foreground hover:text-foreground transition-all">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ── Left Column (2/5) – Profile Info ── */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <HiUser className="w-7 h-7" />
                      </div>
                      {md.cloudinary_url && (
                        <button
                          onClick={() => window.open(md.cloudinary_url, '_blank')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs font-semibold hover:bg-white/30 transition-all backdrop-blur-sm"
                        >
                          <HiDocumentText className="w-4 h-4" />
                          View PDF
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{selectedResume.candidate_name || "Candidate"}</h3>
                    <p className="text-white/80 text-sm">{selectedResume.title || "Untitled"}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <CgMail className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-semibold text-foreground">{selectedResume.candidate_email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <HiPhone className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-semibold text-foreground">{selectedResume.candidate_phone || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <HiBriefcase className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Experience</p>
                        <p className="text-sm font-semibold text-foreground">{selectedResume.years_experience ?? "—"} years</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <HiAcademicCap className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Education</p>
                        <p className="text-sm font-semibold text-foreground">{(selectedResume.education_level || "—").toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  {links.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <HiLink className="w-4 h-4 text-emerald-500" /> Links
                      </h4>
                      <div className="space-y-2">
                        {links.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2.5 bg-muted rounded-xl text-sm text-emerald-600 hover:bg-emerald-50 transition-all group">
                            <FiExternalLink className="w-4 h-4 shrink-0" />
                            <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Right Column (3/5) – Resume Sections ── */}
                <div className="lg:col-span-3 space-y-5">
                  {summary && (
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30">
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">Summary</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {skillList.length > 0 && (
                    <div className="p-5 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 rounded-2xl border border-sky-200/50 dark:border-sky-800/30">
                      <h4 className="text-sm font-bold text-sky-700 dark:text-sky-400 mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {skillList.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white dark:bg-card rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 shadow-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {expList.length > 0 && (
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30">
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3">Work Experience</h4>
                      <div className="space-y-3">
                        {expList.map((exp, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <p className="text-sm text-foreground/80 leading-relaxed">{exp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projectList.length > 0 && (
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/30">
                      <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-3">Projects</h4>
                      <div className="space-y-3">
                        {projectList.map((proj, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-400 shrink-0" />
                            <p className="text-sm text-foreground/80 leading-relaxed">{proj}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!summary && skillList.length === 0 && expList.length === 0 && projectList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <HiDocumentText className="w-12 h-12 mb-3 opacity-40" />
                      <p className="text-sm font-medium">No resume data available</p>
                      <p className="text-xs mt-1">Upload a PDF to extract your skills and experience.</p>
                    </div>
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
