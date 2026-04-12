"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from "@/utils/api";
import { resumeApi } from "@/utils/resume_api";
import { HiPlus, HiDocumentText, HiTrash, HiEye, HiOutlineDocumentArrowUp } from 'react-icons/hi2';
import { FiX } from 'react-icons/fi';

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
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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
      formData.append("title", pdfFile.name.replace('.pdf', ''));
      await resumeApi.post("/resumes/upload/", formData);
      setShowUploadModal(false);
      setPdfFile(null);
      fetchResumes();
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
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-emerald-100">
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-emerald-900">My Resumes</h1>
              <p className="text-emerald-600 font-medium mt-1">Manage your professional profiles and AI-ready resumes</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-emerald-600 border-2 border-emerald-200 rounded-xl font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-95"
              >
                <HiOutlineDocumentArrowUp className="w-5 h-5" />
                Upload Resume
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200 active:scale-95"
              >
                <HiPlus className="w-5 h-5" />
                Build Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => {
              const md = getMetaData(resume);
              const fileUrl = md.cloudinary_url || md.file_path;
              const fileName = fileUrl ? decodeURIComponent(fileUrl.split("\\").pop().split("/").pop()) : null;
              return (
                <div key={resume.resume_id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-emerald-200/50 hover:shadow-xl transition-all duration-300 border border-emerald-100 hover:border-emerald-200">
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
                      <span className={`inline-block mt-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white`}>
                        {resume.status || "Active"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-bold text-emerald-900 truncate group-hover:text-emerald-700 transition-colors">
                        {md.title || "Untitled Resume"}
                      </h3>
                      <button
                        onClick={() => handleDeleteResume(resume.resume_id)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                    {fileName && (
                      <p className="text-xs text-emerald-500 mb-3 truncate" title={fileUrl}>
                        {fileName}
                      </p>
                    )}

                    <div className="space-y-1.5 mb-6">
                      <p className="text-xs text-emerald-600">
                        <span className="font-semibold">Experience:</span> {resume.years_experience || 0} years
                      </p>
                      <p className="text-xs text-emerald-600">
                        <span className="font-semibold">Location:</span> {resume.current_location || "Not specified"}
                      </p>
                      <p className="text-xs text-emerald-600">
                        <span className="font-semibold">Uploaded:</span> {new Date(resume.upload_date).toLocaleDateString('en-US')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold text-sm hover:bg-emerald-600 transition-all shadow-md hover:shadow-emerald-200 active:scale-95">
                        <HiEye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <HiDocumentText className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">No Resumes Yet</h3>
            <p className="text-emerald-600 mb-8 text-center max-w-md">
              Upload an existing resume or build one from a template to get started.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-200 rounded-xl font-bold hover:bg-emerald-50 transition-all active:scale-95"
              >
                <HiOutlineDocumentArrowUp className="w-5 h-5" />
                Upload Resume
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200 active:scale-95"
              >
                <HiPlus className="w-5 h-5" />
                Build Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-emerald-100 bg-white">
              <h2 className="text-2xl font-bold text-emerald-900">Upload Resume</h2>
              <button
                onClick={() => { setShowUploadModal(false); setPdfFile(null); }}
                className="text-emerald-400 hover:text-emerald-600 transition-all"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUploadResume} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-emerald-500 px-2">
                  Upload PDF Document
                </label>
                <div className="w-full relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 transition-all group">
                  <HiOutlineDocumentArrowUp className="w-12 h-12 text-emerald-400 group-hover:text-emerald-500 mb-4 transition-colors" />
                  <p className="text-sm font-bold text-emerald-700 mb-1">
                    {pdfFile ? pdfFile.name : "Click to upload your resume"}
                  </p>
                  <p className="text-xs text-emerald-500">
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
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium">
                  <strong>Note:</strong> DeepScreen AI will automatically extract your skills, experience, and projects from this PDF to build your profile.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setPdfFile(null); }}
                  className="flex-1 px-6 py-3 text-emerald-700 bg-emerald-50 rounded-xl font-bold hover:bg-emerald-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
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

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-emerald-100 bg-white">
              <h2 className="text-2xl font-bold text-emerald-900">Build New Resume</h2>
              <button
                onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}
                className="text-emerald-400 hover:text-emerald-600 transition-all"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-emerald-600 mb-6 font-medium">Choose a template to get started:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedTemplate?.id === template.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                        : 'border-emerald-100 hover:border-emerald-300 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className={`h-24 bg-linear-to-br ${template.gradient} rounded-lg mb-3 flex items-center justify-center`}>
                      <div className="w-8 h-12 bg-white/20 rounded border border-white/30 backdrop-blur-sm flex items-center justify-center">
                        <HiDocumentText className="w-4 h-4 text-white/70" />
                      </div>
                    </div>
                    <h3 className={`font-bold ${template.textColor} mb-1`}>{template.name}</h3>
                    <p className="text-xs text-emerald-600">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-emerald-100 bg-white">
              <button
                onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}
                className="flex-1 px-6 py-3 text-emerald-700 bg-emerald-50 rounded-xl font-bold hover:bg-emerald-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBuildFromTemplate}
                disabled={!selectedTemplate}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                  selectedTemplate
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200'
                    : 'bg-emerald-50 text-emerald-300 cursor-not-allowed'
                }`}
              >
                Build Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
