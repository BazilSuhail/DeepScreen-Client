"use client";

import { HiOutlineArrowPath } from "react-icons/hi2";
import Modal from "@/components/ui/Modal";
import { primaryButton, secondaryButton } from "@/components/ui/styles";

// App-wide replacement for window.confirm(). Keep it mounted and drive it with `open`;
// pass `confirmClassName={dangerButton}` for destructive actions and `busy` while the request runs.
export default function ConfirmDialog({ open, title, description, confirmLabel, confirmClassName = primaryButton, busy = false, error, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      dismissible={!busy}
      footer={
        <>
          <button type="button" onClick={onCancel} disabled={busy} className={secondaryButton}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={confirmClassName}>
            {busy && <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {busy ? "Working..." : confirmLabel}
          </button>
        </>
      }
    >
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </Modal>
  );
}
