'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { base, sheet } from '@/constants/motion';
import { api } from '@/utils/api';
import {
  HiOutlineCodeBracket,
  HiOutlineTag,
  HiOutlineInformationCircle,
  HiOutlineBeaker,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { btnPrimary, btnSecondary, focusRing } from '@/components/assessments/problemBankStyles';

const labelClass = 'flex items-center gap-2 text-sm font-semibold text-emerald-950 dark:text-foreground';
const inputClass = `mt-2 min-h-11 w-full rounded-md border border-emerald-200 bg-card px-3.5 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-800/60 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-white/15 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground`;
const hintClass = 'mt-1.5 text-xs text-emerald-800/80 dark:text-muted-foreground';

export default function CreateProblemModal({ organization, onClose, onSaved }) {
  // Payload shape is fixed by the backend; keep these keys exactly as they are.
  const [formData, setFormData] = useState({
    title: '',
    problem_statement: '',
    difficulty: 'easy',
    points: 100,
    organization,
    public_test_cases: [{}],
    hidden_test_cases: [{}],
    order_number: 1,
    allowed_languages: ['python', 'javascript'],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    titleRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const requestClose = () => {
    if (!saving) onClose();
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      await api.post('/assessments/problems/', formData);
    } catch (err) {
      setSaveError(err?.message || 'We could not save this problem. Check the fields and try again.');
      setSaving(false);
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={base}
        onClick={requestClose}
        className="absolute inset-0 bg-emerald-950/50 backdrop-blur-sm"
      />
      <motion.dialog
        open
        aria-modal="true"
        aria-labelledby="create-problem-title"
        aria-describedby="create-problem-desc"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={sheet}
        className="relative m-0 flex max-h-[90dvh] w-full max-w-none flex-col overflow-hidden rounded-t-lg border border-emerald-100 bg-card p-0 pb-[env(safe-area-inset-bottom)] text-foreground shadow-md sm:max-w-2xl sm:rounded-lg sm:pb-0 dark:border-white/10"
      >
        <div className="flex items-start justify-between gap-4 border-b border-emerald-100 p-5 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HiOutlineCodeBracket className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="create-problem-title" className="text-lg font-semibold text-emerald-950 dark:text-foreground">
                Create problem
              </h2>
              <p id="create-problem-desc" className="text-sm text-emerald-800/80 dark:text-muted-foreground">
                Saved to your problem bank for reuse in assessments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            aria-label="Close without saving"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-emerald-800/80 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-emerald-50 hover:text-emerald-950 disabled:opacity-50 dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:text-foreground ${focusRing}`}
          >
            <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form id="create-problem-form" onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-5">
          <div>
            <label htmlFor="problem-title" className={labelClass}>
              <HiOutlineTag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Problem title
            </label>
            <input
              id="problem-title"
              ref={titleRef}
              required
              value={formData.title}
              onChange={setField('title')}
              placeholder="e.g. Reverse a string"
              aria-describedby="problem-title-hint"
              className={inputClass}
            />
            <p id="problem-title-hint" className={hintClass}>
              A short name candidates see in the assessment.
            </p>
          </div>

          <div>
            <label htmlFor="problem-statement" className={labelClass}>
              <HiOutlineInformationCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Problem statement
            </label>
            <textarea
              id="problem-statement"
              required
              rows={5}
              value={formData.problem_statement}
              onChange={setField('problem_statement')}
              placeholder="Write a function that..."
              aria-describedby="problem-statement-hint"
              className={`${inputClass} min-h-0 resize-y`}
            />
            <p id="problem-statement-hint" className={hintClass}>
              Describe the input, the expected output, and any constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="problem-difficulty" className={labelClass}>
                <HiOutlineBeaker className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Difficulty
              </label>
              <select
                id="problem-difficulty"
                value={formData.difficulty}
                onChange={setField('difficulty')}
                aria-describedby="problem-difficulty-hint"
                className={inputClass}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <p id="problem-difficulty-hint" className={hintClass}>
                Easy is a warm-up. Hard tests deep problem solving.
              </p>
            </div>

            <div>
              <label htmlFor="problem-points" className={labelClass}>
                <HiOutlineTag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Points
              </label>
              <input
                id="problem-points"
                type="number"
                min="0"
                value={formData.points}
                onChange={setField('points')}
                aria-describedby="problem-points-hint"
                className={inputClass}
              />
              <p id="problem-points-hint" className={hintClass}>
                Points awarded for a correct solution.
              </p>
            </div>
          </div>
        </form>

        {saveError && (
          <div
            role="alert"
            className="mx-5 mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          >
            <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">{saveError}</span>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-emerald-100 p-5 sm:flex-row sm:justify-end dark:border-white/10">
          <button type="button" onClick={requestClose} disabled={saving} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" form="create-problem-form" disabled={saving} className={btnPrimary}>
            {saving ? (
              <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />
            )}
            {saving ? 'Saving...' : 'Save problem'}
          </button>
        </div>
      </motion.dialog>
    </div>
  );
}
