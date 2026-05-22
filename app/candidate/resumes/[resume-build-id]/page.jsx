"use client";

import { useState, useSyncExternalStore } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { Poppins } from "next/font/google";
import { useParams } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineDocumentText,
  HiOutlineCloudArrowUp,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineInformationCircle,
  HiOutlineAcademicCap,
  HiOutlineSwatch,
  HiOutlineDocument,
  HiOutlineBriefcase,
  HiOutlineSquares2X2,
  HiOutlineMinus,
  HiOutlinePlus,
} from "react-icons/hi2";
import { motion } from "motion/react";
import { BannerBlock } from "@/components/dashboard/DashboardBanner";
import ResumeForm from "@/components/resume/ResumeForm";
import ResumeTemplate from "@/components/resume/ResumeTemplate";
import ResumeReviewModal from "@/components/resume/ResumeReviewModal";
import { resumeApi } from "@/utils/resume_api";
import { useRouter } from "next/navigation";
import defaultResumeData from "@/constants/resume";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const TEMPLATES = [
  { id: 1, name: "LaTeX Professional", desc: "Academic & Technical", icon: HiOutlineAcademicCap },
  { id: 2, name: "Creative Visual", desc: "Design & Arts", icon: HiOutlineSwatch },
  { id: 3, name: "Modern Minimal", desc: "Clean & Simple", icon: HiOutlineDocument },
  { id: 4, name: "Executive Corporate", desc: "Business & Management", icon: HiOutlineBriefcase },
];

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const muted = "text-emerald-900/70 dark:text-slate-400";
const panel = "flex min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg dark:border-white/10 dark:bg-card lg:min-h-0";
const primaryButton = `flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-500 disabled:opacity-50 ${focusRing}`;
const secondaryButton = `flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white ${focusRing}`;
const savedButton = `flex min-h-11 items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-800 shadow-lg transition-all dark:bg-emerald-500/20 dark:text-emerald-200 ${focusRing}`;
const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;
const zoomButton = `flex min-h-11 min-w-11 items-center justify-center rounded-lg text-emerald-900 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white dark:hover:bg-white/10 ${focusRing}`;

// Client-only editor: the server render and first client render show the skeleton, then the editor mounts.
const noopSubscribe = () => () => {};
const useIsMounted = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

// Placeholder that mirrors the two-panel editor (form on the left, preview on the right).
function EditorSkeleton() {
  return (
    <output aria-busy="true" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <span className="sr-only">Loading resume builder...</span>
      {[0, 1].map((i) => (
        <div key={i} className={`${panel} min-h-[32rem] space-y-4 p-5 lg:p-6`}>
          <BannerBlock className="h-6 w-1/2" />
          <BannerBlock className="h-4 w-3/4" />
          <div className="space-y-3 pt-4">
            <BannerBlock className="h-11 w-full rounded-xl" />
            <BannerBlock className="h-11 w-full rounded-xl" />
            <BannerBlock className="h-24 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </output>
  );
}

// Simple card-shaped placeholder shown while the PDF preview compiles.
function PreviewSkeleton() {
  return (
    <output aria-busy="true" className="block h-full w-full space-y-4 rounded-2xl bg-white p-8 dark:bg-card">
      <span className="sr-only">Compiling preview...</span>
      <BannerBlock className="h-8 w-3/4" />
      <BannerBlock className="h-4 w-1/2" />
      <div className="space-y-2 pt-4">
        <BannerBlock className="h-3 w-full" />
        <BannerBlock className="h-3 w-5/6" />
      </div>
      <div className="space-y-2 pt-6">
        <BannerBlock className="h-4 w-1/3" />
        <BannerBlock className="h-3 w-full" />
        <BannerBlock className="h-3 w-4/5" />
        <BannerBlock className="h-3 w-3/4" />
      </div>
    </output>
  );
}

export default function ResumePage() {
  const { "resume-build-id": resumeBuildId } = useParams();
  const router = useRouter();
  const mounted = useIsMounted();
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [showPreview, setShowPreview] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [templateId, setTemplateId] = useState(Number(resumeBuildId) || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Re-sync the template when the route param changes (React's "adjust state during render" pattern).
  const [prevBuildId, setPrevBuildId] = useState(resumeBuildId);
  if (resumeBuildId !== prevBuildId) {
    setPrevBuildId(resumeBuildId);
    if (resumeBuildId) setTemplateId(Number(resumeBuildId));
  }

  const handleDownloadPdf = async () => {
    const blob = await pdf(
      <ResumeTemplate templateId={templateId} data={resumeData} />,
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData.basics.name.replace(/\s+/g, "_")}_Resume.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveResume = async () => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const blob = await pdf(
        <ResumeTemplate templateId={templateId} data={resumeData} />,
      ).toBlob();
      const formData = new FormData();
      formData.append(
        "pdf_file",
        blob,
        `${resumeData.basics.name.replace(/\s+/g, "_")}_Resume.pdf`,
      );
      formData.append("resume_data", JSON.stringify(resumeData));
      const result = await resumeApi.post("/resumes/build", formData);
      setReviewData(result);
      setShowReviewModal(true);
    } catch (err) {
      setSaveError(err?.message || "Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setShowPreview(true);
      setIsCompiling(false);
    }, 500);
  };

  // Keeps raw server payloads (JSON or bracketed text) out of the UI.
  const saveErrorText = /^[[{]/.test(saveError) ? "Could not save your resume. Please try again." : saveError;
  const activeTemplate = TEMPLATES.find((t) => t.id === templateId);
  const loading = !mounted;

  return (
    <div
      className={`mx-auto pt-8 w-full min-w-0 space-y-8 px-4 pb-16 md:px-8 ${poppins.variable} font-sans`}
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        aria-busy={loading || undefined}
        className="grid gap-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-950 md:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-6 dark:border-white/5 dark:bg-emerald-dark dark:text-white"
      >
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 dark:border-white/10 dark:bg-white/10 dark:text-white">
              <HiOutlineDocumentText className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="min-w-0 break-words text-2xl font-semibold leading-tight tracking-tight lg:text-3xl">Resume builder</h1>
          </div>
          <div className="break-words text-xs text-emerald-800/70 dark:text-slate-400">Fill in your details, compile a preview, then save.</div>
        </div>
        {loading ? (
          <div className="flex gap-2">
            <BannerBlock className="h-11 w-44 rounded-xl" />
          </div>
        ) : (
          <div className="flex min-w-0 flex-wrap items-center gap-3 lg:justify-end">
            {saveErrorText && (
              <span role="alert" className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
                {saveErrorText}
              </span>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              title="Back to your resumes"
              className={`${secondaryButton} px-3`}
            >
              <HiOutlineArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleSaveResume}
              disabled={isSaving}
              title="Generate the PDF and save it to your resumes"
              className={saveSuccess ? savedButton : primaryButton}
            >
              {isSaving ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <HiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                  Saved
                </>
              ) : (
                <>
                  <HiOutlineCloudArrowUp className="h-5 w-5" aria-hidden="true" />
                  Save resume
                </>
              )}
            </button>
            {showPreview && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                title="Download the compiled PDF"
                className={secondaryButton}
              >
                <HiOutlineArrowDownTray className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}
            <div className="group relative">
              <button
                type="button"
                title="Choose a resume template"
                aria-haspopup="menu"
                className={secondaryButton}
              >
                <HiOutlineSquares2X2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>{activeTemplate?.name ?? "Template"}</span>
                <HiOutlineChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" aria-hidden="true" />
              </button>
              <div
                role="menu"
                className="invisible absolute right-0 top-full z-50 mt-2 w-64 origin-top-right translate-y-2 rounded-xl border border-emerald-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-card"
              >
                {TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  const selected = templateId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="menuitem"
                      title={`Use the ${t.name} template`}
                      onClick={() => {
                        setTemplateId(t.id);
                        setShowPreview(false);
                      }}
                      className={`flex min-h-11 w-full items-center gap-3 border-r-4 px-4 py-3 text-left transition-all ${focusRing} ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                          : "border-transparent hover:bg-emerald-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-emerald-50 text-emerald-700 dark:bg-white/10 dark:text-slate-300"}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-sm font-semibold ${selected ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"}`}>
                          {t.name}
                        </span>
                        <span className={`block text-xs ${muted}`}>{t.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.section>

      {loading ? (
        <EditorSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:h-[44rem] lg:grid-cols-2">
          <div className={panel}>
            <div className="flex flex-col gap-1 border-b border-emerald-100 px-5 py-4 lg:px-6 dark:border-white/10">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <HiOutlinePencilSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Edit resume data
              </h2>
              <p className={`flex items-start gap-1.5 text-xs ${muted}`}>
                <HiOutlineInformationCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Start with your contact details, then add experience, education and skills.
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ResumeForm data={resumeData} onChange={setResumeData} />
            </div>
          </div>

          <div className={`${panel} bg-emerald-50/60 dark:bg-card`}>
            <div className="flex flex-col gap-3 border-b border-emerald-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6 dark:border-white/10 dark:bg-card">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <HiOutlineEye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  Live preview
                </h2>
                <p className={`mt-1 flex items-start gap-1.5 text-xs ${muted}`}>
                  <HiOutlineInformationCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {showPreview
                    ? "Your resume is ready. Download it or save it to your resumes."
                    : "Compile to see your resume before you save."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCompile}
                disabled={isCompiling}
                title="Render the PDF from the details you entered"
                className={`${primaryButton} shrink-0 px-4 py-2 text-sm disabled:cursor-not-allowed`}
              >
                {isCompiling ? (
                  <>
                    <HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
                    Compile preview
                  </>
                )}
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-1">
              {isCompiling ? (
                <PreviewSkeleton />
              ) : showPreview ? (
                <>
                  <div className="h-full w-full overflow-auto bg-white shadow-inner">
                    <div
                      className="h-full w-full"
                      style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
                    >
                      <PDFViewer
                        width="100%"
                        height="100%"
                        showToolbar={false}
                        className="border-0"
                      >
                        <ResumeTemplate
                          templateId={templateId}
                          data={resumeData}
                        />
                      </PDFViewer>
                    </div>
                  </div>
                  <div
                    className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/95 p-1 shadow-md dark:border-white/10 dark:bg-card dark:text-white"
                  >
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                      disabled={zoom <= ZOOM_MIN}
                      aria-label="Zoom out"
                      title="Zoom out"
                      className={zoomButton}
                    >
                      <HiOutlineMinus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span
                      aria-live="polite"
                      className="min-w-[3rem] text-center text-xs font-semibold tabular-nums text-emerald-900 dark:text-white"
                    >
                      {zoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                      disabled={zoom >= ZOOM_MAX}
                      aria-label="Zoom in"
                      title="Zoom in"
                      className={zoomButton}
                    >
                      <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-6 py-10 text-center">
                  <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-slate-300">
                    <HiOutlineDocumentText className="h-10 w-10" aria-hidden="true" />
                  </span>
                  <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
                    <HiOutlineCheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    No preview yet
                  </h3>
                  <p className={`mx-auto max-w-md text-sm ${muted}`}>
                    Fill in your resume details and click{" "}
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      Compile preview
                    </span>{" "}
                    to generate your resume.
                  </p>
                </div>
              )}
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
            if (saved) router.push("/candidate/resumes");
          }}
        />
      )}
    </div>
  );
}
