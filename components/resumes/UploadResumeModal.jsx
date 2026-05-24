"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiOutlineDocumentArrowUp, HiOutlineXMark, HiOutlineCloudArrowUp,
  HiOutlineDocumentMagnifyingGlass, HiOutlineUserCircle, HiOutlineSparkles,
  HiOutlineCheckCircle, HiOutlineDocument, HiOutlineShieldCheck,
  HiOutlineLightBulb, HiOutlineExclamationTriangle, HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import FormError from "@/components/auth/FormError";
import Modal from "@/components/ui/Modal";
import { primaryButton, secondaryButton } from "@/components/ui/styles";
import { base } from "@/constants/motion";

const MAX_BYTES = 10 * 1024 * 1024;

// Each stage runs on a timer while the upload request is in flight. The server answers with one response
// at the end, so these are a timed guide, not live progress.
const STAGES = [
  { label: "Uploading file", detail: "Sending your PDF securely", icon: HiOutlineCloudArrowUp, ms: 1400 },
  { label: "Reading document", detail: "Reading pages and layout", icon: HiOutlineDocumentMagnifyingGlass, ms: 1800 },
  { label: "Transcribing text", detail: "Converting the PDF into clean text", icon: HiOutlineDocument, ms: 2000 },
  { label: "Building your profile", detail: "Sorting experience, education and projects", icon: HiOutlineUserCircle, ms: 2200 },
  { label: "AI analyzing", detail: "Scoring skills and matching roles", icon: HiOutlineSparkles, ms: 2600 },
];

const TIPS = [
  { icon: HiOutlineDocument, text: "Use a text PDF, not a scanned image, so the text can be read." },
  { icon: HiOutlineShieldCheck, text: "Your file stays private and is only used for your profile." },
  { icon: HiOutlineLightBulb, text: "Put your skills and projects in clear sections with headings." },
];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UPLOAD_FALLBACK = "We couldn't upload your resume. Check that the file is a PDF under 10 MB, then try again.";

// Turns a server error into a short sentence. Raw output (JSON, stack traces, bracketed or multi-line text) is replaced with the fallback.
function friendlyUploadMessage(error) {
  if (!error) return "";
  const text = typeof error === "string" ? error : error.message;
  if (typeof text !== "string") return UPLOAD_FALLBACK;
  const t = text.trim();
  if (!t) return "";
  if (/^[[{]/.test(t) || /[[\]{}<>]/.test(t) || /traceback/i.test(t) || /\n/.test(t)) return UPLOAD_FALLBACK;
  if (t.length > 160) return UPLOAD_FALLBACK;
  return t;
}

// Animated stage timeline with a progress bar and a skeleton of the resume sections.
function ProcessingView() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= STAGES.length - 1) return;
    const timer = setTimeout(() => setStage((s) => s + 1), STAGES[stage].ms);
    return () => clearTimeout(timer);
  }, [stage]);

  const current = STAGES[stage];
  const progress = Math.min(92, Math.round(((stage + 1) / STAGES.length) * 100));
  const StageIcon = current.icon;

  return (
    <motion.output
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={base}
      aria-live="polite"
      className="block space-y-6 pt-1"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-sm bg-emerald-500/10">
          <AnimatePresence mode="wait">
            <motion.span
              key={current.label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={base}
              className="flex"
            >
              <StageIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </motion.span>
          </AnimatePresence>
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={base}
          >
            <p className="text-base font-semibold">{current.label}...</p>
            <p className="mt-1 text-sm text-muted-foreground">{current.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={base}
          />
        </div>
        <p className="text-right text-xs tabular-nums text-muted-foreground">{progress}%</p>
      </div>

      <ol className="space-y-2">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const done = i < stage;
          const active = i === stage;
          return (
            <li
              key={s.label}
              className={`flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                active ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-muted/40"
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm ${done ? "bg-emerald-600 text-white" : active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                {done ? <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
              </span>
              <span className={`text-sm ${active ? "font-semibold text-foreground" : done ? "text-foreground/70" : "text-muted-foreground"}`}>{s.label}</span>
              {active && <HiOutlineArrowPath className="ml-auto h-4 w-4 animate-spin motion-reduce:animate-none text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="space-y-2.5 rounded-lg border border-border bg-muted/40 p-4" aria-hidden="true">
        <div className="h-3 w-1/3 animate-pulse motion-reduce:animate-none rounded-sm bg-secondary" />
        <div className="h-2.5 w-full animate-pulse motion-reduce:animate-none rounded-sm bg-secondary/70" />
        <div className="h-2.5 w-11/12 animate-pulse motion-reduce:animate-none rounded-sm bg-secondary/70" />
        <div className="h-2.5 w-2/3 animate-pulse motion-reduce:animate-none rounded-sm bg-secondary/70" />
      </div>
    </motion.output>
  );
}

// Upload dialog: drag and drop, file card, guidance, and the processing view while the request runs.
export default function UploadResumeModal({ open, file, onFileChange, onClose, onSubmit, uploading, error, onDismissError }) {
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const errorMessage = friendlyUploadMessage(error);

  const acceptFile = (candidate) => {
    if (!candidate) return;
    if (candidate.type !== "application/pdf") {
      setFileError("That file is not a PDF. Choose a PDF resume.");
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setFileError("That PDF is larger than 10 MB. Export a smaller copy and try again.");
      return;
    }
    setFileError("");
    onFileChange(candidate);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!uploading}
      title={
        <span className="flex items-center gap-2">
          <HiOutlineDocumentArrowUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          Upload resume
        </span>
      }
    >
        <AnimatePresence mode="wait">
          {uploading ? (
            <ProcessingView key="processing" />
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={base}
              onSubmit={onSubmit}
              className="space-y-6 pt-1"
            >
              {errorMessage && <FormError title="Upload failed" message={errorMessage} onDismiss={onDismissError} />}

              {file ? (
                <div className="flex items-center gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-emerald-500/15">
                    <HiOutlineDocument className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(file.size)} · PDF ready to upload</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFileChange(null)}
                    aria-label="Remove file"
                    title="Remove file"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`group relative flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-5 sm:p-8 text-center transition-all focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 focus-within:ring-offset-card ${
                    dragging ? "border-emerald-500 bg-emerald-500/5" : "border-border bg-muted hover:border-emerald-500/40 hover:bg-secondary"
                  }`}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-sm bg-emerald-500/10">
                    <HiOutlineCloudArrowUp className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold">{dragging ? "Drop your PDF here" : "Drag a PDF here, or click to choose"}</p>
                  <p className="text-xs text-muted-foreground">PDF only, up to 10 MB</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    title="Choose a PDF resume"
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              )}

              {fileError && (
                <p role="alert" className="flex items-start gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                  <HiOutlineExclamationTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {fileError}
                </p>
              )}

              <ul className="space-y-2.5">
                {TIPS.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <li key={tip.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-muted">
                        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      </span>
                      <span className="leading-relaxed">{tip.text}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className={`${secondaryButton} flex-1`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file}
                  className={`${primaryButton} flex-[1.4]`}
                >
                  <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
                  Upload &amp; process
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
    </Modal>
  );
}
