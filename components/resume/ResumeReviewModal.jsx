'use client';

import { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import { resumeApi } from '@/utils/resume_api';
import { parseResumeList } from '@/utils/resumeList';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card';

const STEPS = [
  { id: 'summary', label: 'Summary' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Work Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'other', label: 'Other Info' },
];

export default function ResumeReviewModal({ resumeData: initial, cloudinaryUrl, rawFullText, onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <dialog open aria-modal="true" aria-labelledby="review-resume-title" className="relative bg-card text-foreground rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h2 id="review-resume-title" className="text-xl font-bold text-foreground">Review & Edit Resume</h2>
          <button onClick={() => onClose(false)} aria-label="Close" title="Close" className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-all ${FOCUS_RING}`}>
            <FiX className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1 px-6 pt-4 shrink-0">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex-1 min-h-11 py-2 text-xs font-bold rounded-lg transition-all ${FOCUS_RING} ${
                i === step
                  ? 'bg-primary text-primary-foreground'
                  : i < step
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Professional Summary</h3>
              <textarea
                value={data.summary || ''}
                onChange={(e) => update('summary', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Write a professional summary..."
              />
              <p className="text-xs text-muted-foreground">A 3-4 sentence overview of your profile, experience level, and key strengths.</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-foreground">Skills</h3>
              </div>
              <textarea
                value={parseResumeList(data.skills).join('\n')}
                onChange={(e) => update('skills', e.target.value.split('\n').filter(Boolean))}
                rows={8}
                className="w-full px-4 py-3 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono"
                placeholder="One skill per line:&#10;React&#10;TypeScript&#10;Node.js&#10;PostgreSQL"
              />
              <p className="text-xs text-muted-foreground">One skill per line.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Work Experience</h3>
              <textarea
                value={parseResumeList(data.work_experience).join('\n---\n')}
                onChange={(e) => update('work_experience', e.target.value.split('\n---\n').filter(Boolean))}
                rows={10}
                className="w-full px-4 py-3 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono"
                placeholder="Senior Engineer at Company — led team, built features.&#10;---&#10;Junior Dev at Startup — implemented APIs."
              />
              <p className="text-xs text-muted-foreground">Separate each role with <code className="bg-muted px-1 rounded">---</code> on its own line.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Projects</h3>
              <textarea
                value={parseResumeList(data.projects).join('\n---\n')}
                onChange={(e) => update('projects', e.target.value.split('\n---\n').filter(Boolean))}
                rows={10}
                className="w-full px-4 py-3 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono"
                placeholder="Project Alpha — built authentication system.&#10;---&#10;Project Beta — designed dashboard."
              />
              <p className="text-xs text-muted-foreground">Separate each project with <code className="bg-muted px-1 rounded">---</code> on its own line.</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Additional Information</h3>

              <div>
                <label htmlFor="review-title" className="block text-xs font-semibold text-muted-foreground mb-1.5">Job Title</label>
                <input
                  id="review-title"
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Senior Frontend Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="review-years" className="block text-xs font-semibold text-muted-foreground mb-1.5">Years of Experience</label>
                  <input
                    id="review-years"
                    type="number"
                    value={data.years_experience ?? ''}
                    onChange={(e) => update('years_experience', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-2.5 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label htmlFor="review-education" className="block text-xs font-semibold text-muted-foreground mb-1.5">Education Level</label>
                  <select
                    id="review-education"
                    value={data.education_level || ''}
                    onChange={(e) => update('education_level', e.target.value || null)}
                    className="w-full px-4 py-2.5 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                <label htmlFor="review-phone" className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone</label>
                <input
                  id="review-phone"
                  type="tel"
                  value={data.candidate_phone || ''}
                  onChange={(e) => update('candidate_phone', e.target.value || null)}
                  className="w-full px-4 py-2.5 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+1-202-555-0143"
                />
              </div>

              <div>
                <label htmlFor="review-links" className="block text-xs font-semibold text-muted-foreground mb-1.5">Links (one per line)</label>
                <textarea
                  id="review-links"
                  value={parseResumeList(data.links).join('\n')}
                  onChange={(e) => update('links', e.target.value.split('\n').filter(Boolean))}
                  rows={4}
                  className="w-full px-4 py-3 text-sm bg-card text-foreground border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono"
                  placeholder="https://linkedin.com/in/...&#10;https://github.com/..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border shrink-0">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`flex min-h-11 items-center gap-2 px-5 py-2.5 text-foreground bg-secondary rounded-xl font-bold hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed ${FOCUS_RING}`}
          >
            <FiChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              className={`flex min-h-11 items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg ${FOCUS_RING}`}
            >
              Next <FiChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={saving}
              className={`flex min-h-11 items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50 ${FOCUS_RING}`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" /> Finalize & Save
                </>
              )}
            </button>
          )}
        </div>
      </dialog>
    </div>
  );
}
