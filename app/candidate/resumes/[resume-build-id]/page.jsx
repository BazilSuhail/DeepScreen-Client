"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { Poppins } from "next/font/google";
import { useParams } from "next/navigation";
import {
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
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { motion } from "motion/react";
import { badge, card, focusRing, iconTile, primaryButton, secondaryButton } from "@/components/ui/styles";
import { base, fadeUp, stagger } from "@/constants/motion";
import PageHeader from "@/components/ui/PageHeader";
import { Bone } from "@/components/skeletons/primitives";
import ResumeBuilderSkeleton from "@/components/skeletons/candidate/ResumeBuilderSkeleton";
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

const panel = `flex min-h-[32rem] min-w-0 flex-col overflow-hidden lg:min-h-0 ${card}`;
const panelHead = "flex flex-col gap-3 border-b border-emerald-100 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6 dark:border-white/10";
const savedButton = `flex min-h-11 items-center gap-2 rounded-md border border-emerald-400 bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition-colors dark:bg-emerald-500/20 dark:text-emerald-200 ${focusRing}`;
const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;
const zoomButton = `flex min-h-11 min-w-11 items-center justify-center rounded-md text-emerald-900 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white dark:hover:bg-white/10 ${focusRing}`;

// Client-only editor: the server render and first client render show the skeleton, then the editor mounts.
const noopSubscribe = () => () => {};
const useIsMounted = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

function PanelTitle({ icon: Icon, title, hint }) {
  return (
    <div className="min-w-0">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
        <HiOutlineInformationCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {hint}
      </p>
    </div>
  );
}

// Simple card-shaped placeholder shown while the PDF preview compiles.
function PreviewSkeleton() {
  return (
    <output aria-busy="true" className="block h-full w-full space-y-4 rounded-md bg-card p-5 sm:p-8">
      <span className="sr-only">Compiling preview...</span>
      <Bone className="h-8 w-3/4" />
      <Bone className="h-4 w-1/2" />
      <div className="space-y-2 pt-4">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-5/6" />
      </div>
      <div className="space-y-2 pt-6">
        <Bone className="h-4 w-1/3" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
        <Bone className="h-3 w-3/4" />
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
  const [menuOpen, setMenuOpen] = useState(false);

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
    a.download = `${(resumeData.basics?.name?.trim() || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
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
        `${(resumeData.basics?.name?.trim() || "Resume").replace(/\s+/g, "_")}_Resume.pdf`,
      );
      formData.append("resume_data", JSON.stringify(resumeData));
      const result = await resumeApi.post("/resumes/build", formData);
      setReviewData(result);
      setShowReviewModal(true);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err?.message || "Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  // Show the Saved state briefly; the cleanup also clears the timer on unmount.
  useEffect(() => {
    if (!saveSuccess) return;
    const t = setTimeout(() => setSaveSuccess(false), 2500);
    return () => clearTimeout(t);
  }, [saveSuccess]);

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
  const ActiveIcon = activeTemplate?.icon;

  if (!mounted) return <ResumeBuilderSkeleton />;

  return (
    <div
      className={`w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10 ${poppins.variable} font-sans`}
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <PageHeader
        back={{ href: "/candidate/resumes", label: "Back to resumes" }}
        icon={HiOutlineDocumentText}
        eyebrow="Resume builder"
        title="Build your resume"
        description="Fill in your details, compile a preview, then save it to your resumes."
        meta={activeTemplate && (
          <span className={`${badge} bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
            <ActiveIcon className="h-3.5 w-3.5" aria-hidden="true" /> {activeTemplate.name}
          </span>
        )}
        actions={(
          <>
            {/* Opens on hover (desktop) and on tap/click or keyboard focus (touch). */}
            <div
              className="group relative"
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setMenuOpen(false); }}
            >
              <button
                type="button"
                title="Choose a resume template"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className={secondaryButton}
              >
                <HiOutlineSquares2X2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Template
                <HiOutlineChevronDown className={`h-4 w-4 transition-[rotate] duration-200 ${menuOpen ? "rotate-180" : "group-hover:rotate-180"}`} aria-hidden="true" />
              </button>
              <div
                role="menu"
                className={`absolute left-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] origin-top-left rounded-lg border border-emerald-100 bg-card py-2 shadow-md transition-[opacity,translate,visibility] duration-200 lg:left-auto lg:right-0 lg:origin-top-right dark:border-white/10 ${
                  menuOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-2 opacity-0 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                }`}
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
                        setMenuOpen(false);
                      }}
                      className={`flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors ${focusRing} ${
                        selected ? "bg-emerald-50 dark:bg-emerald-500/10" : "hover:bg-emerald-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className={`${iconTile} h-8 w-8 ${selected ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-semibold ${selected ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"}`}>
                          {t.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">{t.desc}</span>
                      </span>
                      {selected && <HiOutlineCheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
            {showPreview && (
              <button type="button" onClick={handleDownloadPdf} title="Download the compiled PDF" className={secondaryButton}>
                <HiOutlineArrowDownTray className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveResume}
              disabled={isSaving}
              title="Generate the PDF and save it to your resumes"
              className={saveSuccess ? savedButton : primaryButton}
            >
              {isSaving ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />
                  Saved
                </>
              ) : (
                <>
                  <HiOutlineCloudArrowUp className="h-4 w-4" aria-hidden="true" />
                  Save resume
                </>
              )}
            </button>
          </>
        )}
      />

      {saveErrorText && (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {saveErrorText}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:h-[max(36rem,calc(100dvh-16rem))] lg:grid-cols-2">
        <motion.section {...fadeUp} transition={base} className={panel}>
          <div className={panelHead}>
            <PanelTitle icon={HiOutlinePencilSquare} title="Edit resume data" hint="Start with your contact details, then add experience, education and skills." />
          </div>
          <div className="flex-1 overflow-hidden">
            <ResumeForm data={resumeData} onChange={setResumeData} />
          </div>
        </motion.section>

        <motion.section {...fadeUp} transition={{ ...base, delay: stagger }} className={panel}>
          <div className={panelHead}>
            <PanelTitle
              icon={HiOutlineEye}
              title="Live preview"
              hint={showPreview ? "Your resume is ready. Download it or save it to your resumes." : "Compile to see your resume before you save."}
            />
            <button
              type="button"
              onClick={handleCompile}
              disabled={isCompiling}
              title="Render the PDF from the details you entered"
              className={`${showPreview ? secondaryButton : primaryButton} shrink-0`}
            >
              <HiOutlineArrowPath className={`h-4 w-4 ${isCompiling ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
              {isCompiling ? "Compiling..." : showPreview ? "Recompile" : "Compile preview"}
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-emerald-50/60 p-1 dark:bg-background">
            {isCompiling ? (
              <PreviewSkeleton />
            ) : showPreview ? (
              <>
                <div className="h-full w-full overflow-auto bg-white">
                  <div
                    className="h-full w-full"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
                  >
                    <PDFViewer width="100%" height="100%" showToolbar={false} className="border-0">
                      <ResumeTemplate templateId={templateId} data={resumeData} />
                    </PDFViewer>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-md border border-emerald-200 bg-card p-1 shadow-md dark:border-white/10">
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
                  <span aria-live="polite" className="min-w-[3rem] text-center text-xs font-semibold tabular-nums">
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
                <span className={`${iconTile} mx-auto mb-5 h-16 w-16 bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-slate-300`}>
                  <HiOutlineDocumentText className="h-8 w-8" aria-hidden="true" />
                </span>
                <h3 className="mb-2 text-base font-semibold">No preview yet</h3>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Fill in your resume details and click{" "}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Compile preview</span>{" "}
                  to generate your resume.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* reviewData is kept after close so the content stays put during the exit animation. */}
      {reviewData && (
        <ResumeReviewModal
          open={showReviewModal}
          resumeData={reviewData.resume_data}
          cloudinaryUrl={reviewData.cloudinary_url}
          rawFullText={reviewData.raw_full_text}
          onClose={(saved) => {
            setShowReviewModal(false);
            if (saved) router.push("/candidate/resumes");
          }}
        />
      )}
    </div>
  );
}
