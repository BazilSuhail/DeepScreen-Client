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
    <motion.div
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      aria-live="polite"
      className="space-y-6 p-5 lg:p-6"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border border-emerald-500/40"
            animate={{ scale: [1, 1.12, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={current.label}
              initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 12 }}
              transition={{ duration: 0.25 }}
              className="flex"
            >
              <StageIcon className="h-7 w-7 text-emerald-500" aria-hidden="true" />
            </motion.span>
          </AnimatePresence>
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
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
            transition={{ duration: 0.6, ease: "easeOut" }}
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
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                active ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-muted/40"
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${done ? "bg-emerald-500 text-white" : active ? "bg-emerald-500/15 text-emerald-500" : "bg-secondary text-muted-foreground"}`}>
                {done ? <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
              </span>
              <span className={`text-sm ${active ? "font-semibold text-foreground" : done ? "text-foreground/70" : "text-muted-foreground"}`}>{s.label}</span>
              {active && <HiOutlineArrowPath className="ml-auto h-4 w-4 animate-spin text-emerald-500" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="space-y-2.5 rounded-xl border border-border bg-muted/40 p-4" aria-hidden="true">
        <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
        <div className="h-2.5 w-full animate-pulse rounded bg-secondary/70" />
        <div className="h-2.5 w-11/12 animate-pulse rounded bg-secondary/70" />
        <div className="h-2.5 w-2/3 animate-pulse rounded bg-secondary/70" />
      </div>
    </motion.div>
  );
}

// Upload dialog: drag and drop, file card, guidance, and the processing view while the request runs.
export default function UploadResumeModal({ open, file, onFileChange, onClose, onSubmit, uploading, error, onDismissError }) {
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  if (!open) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-resume-title"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5 lg:p-6">
          <h2 id="upload-resume-title" className="flex items-center gap-2 text-xl font-semibold">
            <HiOutlineDocumentArrowUp className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            Upload resume
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            aria-label="Close"
            title="Close"
            className="rounded-lg p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {uploading ? (
            <ProcessingView key="processing" />
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={onSubmit}
              className="space-y-6 p-5 lg:p-6"
            >
              {error && <FormError title="Upload failed" message={error} onDismiss={onDismissError} />}

              {file ? (
                <div className="flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                    <HiOutlineDocument className="h-6 w-6 text-emerald-500" aria-hidden="true" />
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
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`group relative flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                    dragging ? "scale-[1.01] border-emerald-500 bg-emerald-500/5" : "border-border bg-muted hover:border-emerald-500/40 hover:bg-secondary"
                  }`}
                >
                  <motion.span
                    animate={dragging ? { y: [0, -4, 0] } : { y: 0 }}
                    transition={{ duration: 0.8, repeat: dragging ? Infinity : 0 }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10"
                  >
                    <HiOutlineCloudArrowUp className="h-7 w-7 text-emerald-500" aria-hidden="true" />
                  </motion.span>
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
                <p role="alert" className="flex items-start gap-2 text-xs font-medium text-red-500">
                  <HiOutlineExclamationTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {fileError}
                </p>
              )}

              <ul className="space-y-2.5">
                {TIPS.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <li key={tip.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                      </span>
                      <span className="leading-relaxed">{tip.text}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file}
                  className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                >
                  <HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden="true" />
                  Upload &amp; process
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
