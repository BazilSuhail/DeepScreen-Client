"use client";

import { useState } from "react";
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
} from "react-icons/hi2";
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

const panel = "flex min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg lg:min-h-0";

// Simple card-shaped placeholder shown while the PDF preview compiles.
function PreviewSkeleton() {
  return (
    <div role="status" aria-busy="true" className="h-full w-full space-y-4 rounded-xl bg-card p-8">
      <span className="sr-only">Compiling preview...</span>
      <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
      <div className="space-y-2 pt-4">
        <div className="h-3 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-2 pt-6">
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-emerald-500/20" />
        <div className="h-3 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-3/4 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

export default function ResumePage() {
  const { "resume-build-id": resumeBuildId } = useParams();
  const router = useRouter();
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [showPreview, setShowPreview] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [templateId, setTemplateId] = useState(Number(resumeBuildId) || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
  const saveErrorText = /^[\[{]/.test(saveError) ? "Could not save your resume. Please try again." : saveError;
  const activeTemplate = TEMPLATES.find((t) => t.id === templateId);

  return (
    <div
      className={`flex min-h-screen w-full flex-col pt-10 ${poppins.variable} overflow-x-hidden font-sans`}
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <div className="border-b border-border shadow-sm">
        <div className="w-full px-4 pb-4 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                title="Back to your resumes"
                className="group shrink-0 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:bg-secondary hover:shadow-md"
              >
                <HiOutlineArrowLeft className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              </button>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <HiOutlineDocumentText className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Resume builder
                </h1>
                <p className="text-sm text-muted-foreground">
                  Fill in your details, compile a preview, then save.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {saveErrorText && (
                <span role="alert" className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
                  {saveErrorText}
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveResume}
                disabled={isSaving}
                title="Generate the PDF and save it to your resumes"
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-all ${
                  saveSuccess
                    ? "border-2 border-emerald-400 bg-emerald-100 text-emerald-700"
                    : "bg-primary text-primary-foreground hover:bg-emerald-700 hover:shadow-emerald-200/50 disabled:opacity-50"
                }`}
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
                  className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
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
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-secondary"
                >
                  <HiOutlineSquares2X2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  <span>{activeTemplate?.name ?? "Template"}</span>
                  <HiOutlineChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" aria-hidden="true" />
                </button>
                <div
                  role="menu"
                  className="invisible absolute right-0 top-full z-50 mt-2 w-64 origin-top-right translate-y-2 rounded-xl border border-border bg-card py-2 opacity-0 shadow-xl transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
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
                        className={`flex w-full items-center gap-3 border-r-4 px-4 py-3 text-left transition-all ${
                          selected
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-transparent hover:bg-muted"
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-emerald-500/15 text-emerald-500" : "bg-secondary/60 text-muted-foreground"}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold ${selected ? "text-emerald-500" : "text-foreground"}`}>
                            {t.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">{t.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 lg:overflow-hidden">
        <div className="grid grid-cols-1 gap-6 lg:h-full lg:grid-cols-2">
          <div className={panel}>
            <div className="flex flex-col gap-1 border-b border-border px-5 py-4 lg:px-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <HiOutlinePencilSquare className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                Edit resume data
              </h2>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <HiOutlineInformationCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Start with your contact details, then add experience, education and skills.
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ResumeForm data={resumeData} onChange={setResumeData} />
            </div>
          </div>

          <div className={`${panel} bg-muted`}>
            <div className="flex flex-col gap-3 border-b border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <HiOutlineEye className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  Live preview
                </h2>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
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
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="flex flex-1 items-center justify-center overflow-hidden bg-card p-1">
              {isCompiling ? (
                <PreviewSkeleton />
              ) : showPreview ? (
                <div className="h-full w-full overflow-hidden bg-white shadow-inner">
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
              ) : (
                <div className="px-6 py-10 text-center">
                  <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <HiOutlineDocumentText className="h-10 w-10" aria-hidden="true" />
                  </span>
                  <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
                    <HiOutlineCheckCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    No preview yet
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground">
                    Fill in your resume details and click{" "}
                    <span className="font-semibold text-emerald-500">
                      Compile preview
                    </span>{" "}
                    to generate your resume.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
