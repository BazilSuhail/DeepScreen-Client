'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { HiOutlineArrowPath, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineCheck } from 'react-icons/hi2';
import Modal from '@/components/ui/Modal';
import { focusRing, inputClass, labelClass, primaryButton, secondaryButton } from '@/components/ui/styles';
import { spring } from '@/constants/motion';
import { resumeApi } from '@/utils/resume_api';
import { parseResumeList } from '@/utils/resumeList';

const STEPS = [
  { id: 'summary', label: 'Summary' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Work Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'other', label: 'Other Info' },
];

export default function ResumeReviewModal({ open = true, resumeData: initial, cloudinaryUrl, rawFullText, onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Callers keep this mounted (for the exit animation), so start fresh when a new parse result arrives.
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setData({ ...initial });
    setStep(0);
    setError('');
  }

  const update = (field, value) => setData({ ...data, [field]: value });

  const handleFinalize = async () => {
    setSaving(true);
    setError('');
    try {
      await resumeApi.post('/resumes/save', {
        resume_data: data,
        cloudinary_url: cloudinaryUrl,
        raw_full_text: rawFullText,
      });
      onClose(true);
    } catch (err) {
      setError(err?.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const field = `${inputClass} font-mono resize-y`;

  return (
    // Keep mounted and drive with `open` so the shared Modal can play its exit animation.
    <Modal
      open={open}
      onClose={() => onClose(false)}
      dismissible={!saving}
      size="lg"
      title="Review & edit resume"
      description="Check what we extracted before saving it to your resumes."
      footer={(
        <div className="flex w-full items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={secondaryButton}
          >
            <HiOutlineChevronLeft className="w-4 h-4" aria-hidden="true" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              className={primaryButton}
            >
              Next <HiOutlineChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalize}
              disabled={saving}
              className={primaryButton}
            >
              {saving ? (
                <>
                  <HiOutlineArrowPath className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                <>
                  <HiOutlineCheck className="w-4 h-4" aria-hidden="true" /> Finalize & save
                </>
              )}
            </button>
          )}
        </div>
      )}
    >
        {/* Step indicators */}
        <div role="tablist" aria-label="Resume sections" className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === step}
              onClick={() => setStep(i)}
              className={`relative shrink-0 sm:flex-1 min-h-11 px-3 py-2 whitespace-nowrap text-xs font-semibold rounded-md transition-[color,background-color,border-color,translate,scale] active:scale-[0.97] motion-reduce:transform-none ${focusRing} ${
                i === step
                  ? 'text-primary-foreground'
                  : i < step
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {i === step && (
                <motion.span layoutId="resume-review-step" transition={spring} className="absolute inset-0 rounded-md bg-primary" />
              )}
              <span className="relative flex items-center gap-1.5">
                {i < step && <HiOutlineCheck className="h-3.5 w-3.5" aria-hidden="true" />}
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {error && (
            <div role="alert" className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/25 dark:text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Professional Summary</h3>
              <textarea
                aria-label="Professional summary"
                value={data.summary || ''}
                onChange={(e) => update('summary', e.target.value)}
                rows={6}
                className={`${inputClass} resize-y`}
                placeholder="Write a professional summary..."
              />
              <p className="text-xs text-muted-foreground">A 3-4 sentence overview of your profile, experience level, and key strengths.</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-foreground">Skills</h3>
              </div>
              <textarea
                aria-label="Skills"
                value={parseResumeList(data.skills).join('\n')}
                onChange={(e) => update('skills', e.target.value.split('\n').filter(Boolean))}
                rows={8}
                className={field}
                placeholder="One skill per line:&#10;React&#10;TypeScript&#10;Node.js&#10;PostgreSQL"
              />
              <p className="text-xs text-muted-foreground">One skill per line.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Work Experience</h3>
              <textarea
                aria-label="Work experience"
                value={parseResumeList(data.work_experience).join('\n---\n')}
                onChange={(e) => update('work_experience', e.target.value.split('\n---\n').filter(Boolean))}
                rows={10}
                className={field}
                placeholder="Senior Engineer at Company — led team, built features.&#10;---&#10;Junior Dev at Startup — implemented APIs."
              />
              <p className="text-xs text-muted-foreground">Separate each role with <code className="rounded-sm bg-muted px-1">---</code> on its own line.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Projects</h3>
              <textarea
                aria-label="Projects"
                value={parseResumeList(data.projects).join('\n---\n')}
                onChange={(e) => update('projects', e.target.value.split('\n---\n').filter(Boolean))}
                rows={10}
                className={field}
                placeholder="Project Alpha — built authentication system.&#10;---&#10;Project Beta — designed dashboard."
              />
              <p className="text-xs text-muted-foreground">Separate each project with <code className="rounded-sm bg-muted px-1">---</code> on its own line.</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Additional Information</h3>

              <div>
                <label htmlFor="review-title" className={`${labelClass} mb-1.5`}>Job Title</label>
                <input
                  id="review-title"
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => update('title', e.target.value)}
                  className={inputClass}
                  placeholder="Senior Frontend Engineer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="review-years" className={`${labelClass} mb-1.5`}>Years of Experience</label>
                  <input
                    id="review-years"
                    type="number"
                    value={data.years_experience ?? ''}
                    onChange={(e) => update('years_experience', e.target.value ? parseInt(e.target.value) : null)}
                    className={inputClass}
                    placeholder="8"
                  />
                </div>
                <div>
                  <label htmlFor="review-education" className={`${labelClass} mb-1.5`}>Education Level</label>
                  <select
                    id="review-education"
                    value={data.education_level || ''}
                    onChange={(e) => update('education_level', e.target.value || null)}
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    <option value="phd">PhD</option>
                    <option value="master">Master</option>
                    <option value="bachelor">Bachelor</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="matric">Matric</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="review-phone" className={`${labelClass} mb-1.5`}>Phone</label>
                <input
                  id="review-phone"
                  type="tel"
                  value={data.candidate_phone || ''}
                  onChange={(e) => update('candidate_phone', e.target.value || null)}
                  className={inputClass}
                  placeholder="+1-202-555-0143"
                />
              </div>

              <div>
                <label htmlFor="review-links" className={`${labelClass} mb-1.5`}>Links (one per line)</label>
                <textarea
                  id="review-links"
                  value={parseResumeList(data.links).join('\n')}
                  onChange={(e) => update('links', e.target.value.split('\n').filter(Boolean))}
                  rows={4}
                  className={field}
                  placeholder="https://linkedin.com/in/...&#10;https://github.com/..."
                />
              </div>
            </div>
          )}
        </div>

    </Modal>
  );
}
