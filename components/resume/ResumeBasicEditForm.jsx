'use client';

import { useId, useState } from 'react';
import { HiOutlineCheck, HiOutlineExclamationTriangle, HiOutlineXMark } from 'react-icons/hi2';

const EDUCATION_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'phd', label: 'PhD' },
  { value: 'master', label: 'Master' },
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'matric', label: 'Matric' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LINKS = 10;
const FIELD_KEYS = ['title', 'candidate_name', 'candidate_email', 'years_experience', 'education_level', 'links'];

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const inputClass = `min-h-11 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-emerald-900/40 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-500 aria-[invalid=true]:border-red-500 ${focusRing}`;
const labelClass = 'mb-1.5 block text-xs font-semibold text-foreground/80';
const errorClass = 'mt-1.5 text-xs font-semibold text-red-700 dark:text-red-300';
const primaryButton = `flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;
const secondaryButton = `flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-all hover:bg-emerald-50 hover:text-emerald-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white ${focusRing}`;

// Server text is never shown; these plain messages stand in for it.
const SERVER_MESSAGES = {
  403: "You can't edit this resume.",
  400: 'Please check the highlighted fields.',
};
const SAVE_FAILED = "We couldn't save your changes. Try again.";
const SERVER_FIELD_ERROR = 'This value was not accepted.';

const linesToLinks = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

const toFormValues = (resume) => ({
  title: resume.title || '',
  candidate_name: resume.candidate_name || '',
  candidate_email: resume.candidate_email || '',
  years_experience: resume.years_experience == null ? '' : String(resume.years_experience),
  education_level: resume.education_level || '',
  links: (Array.isArray(resume.links) ? resume.links : []).join('\n'),
});

const validate = (values) => {
  const errors = {};
  const title = values.title.trim();
  if (!title) errors.title = 'Enter a title.';
  else if (title.length > 255) errors.title = 'Keep the title to 255 characters or fewer.';

  if (!EMAIL_PATTERN.test(values.candidate_email.trim())) errors.candidate_email = 'Enter a valid email address.';

  const years = values.years_experience.trim();
  if (years !== '' && (!/^\d+$/.test(years) || Number(years) > 60)) {
    errors.years_experience = 'Enter a whole number from 0 to 60.';
  }

  const links = linesToLinks(values.links);
  const badIndex = links.findIndex((link) => !/^https?:\/\//i.test(link));
  if (links.length > MAX_LINKS) errors.links = `Add up to ${MAX_LINKS} links.`;
  else if (badIndex !== -1) errors.links = `Link ${badIndex + 1} must start with http:// or https://.`;

  return errors;
};

// Returns only the fields that differ from the saved resume.
const buildChanges = (values, resume) => {
  const changes = {};
  const title = values.title.trim();
  if (title !== (resume.title || '')) changes.title = title;

  const name = values.candidate_name.trim();
  if (name !== (resume.candidate_name || '')) changes.candidate_name = name;

  const email = values.candidate_email.trim();
  if (email !== (resume.candidate_email || '')) changes.candidate_email = email;

  const yearsText = values.years_experience.trim();
  const years = yearsText === '' ? null : Number(yearsText);
  const savedYears = resume.years_experience == null ? null : Number(resume.years_experience);
  if (years !== savedYears) changes.years_experience = years;

  if (values.education_level !== (resume.education_level || '')) changes.education_level = values.education_level;

  const links = linesToLinks(values.links);
  const savedLinks = Array.isArray(resume.links) ? resume.links : [];
  if (JSON.stringify(links) !== JSON.stringify(savedLinks)) changes.links = links;

  return changes;
};

export default function ResumeBasicEditForm({ resume, onSave, onCancel }) {
  const uid = useId();
  const id = (name) => `${uid}-${name}`;
  const [values, setValues] = useState(() => toFormValues(resume));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const updateField = (field) => (e) => {
    const { value } = e.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setFormError('');

    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('Please check the highlighted fields.');
      return;
    }

    const changes = buildChanges(values, resume);
    if (Object.keys(changes).length === 0) {
      setSuccess('No changes to save.');
      return;
    }

    setSaving(true);
    try {
      await onSave(changes);
      setSuccess('Your changes were saved.');
    } catch (err) {
      const data = err?.errors && typeof err.errors === 'object' ? err.errors : {};
      const serverErrors = {};
      FIELD_KEYS.forEach((key) => {
        if (data[key]) serverErrors[key] = SERVER_FIELD_ERROR;
      });
      setFieldErrors(serverErrors);
      setFormError(SERVER_MESSAGES[err?.status] || SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const describe = (field) => (fieldErrors[field] ? id(`${field}-error`) : undefined);

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5 text-foreground">
      {formError && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-sm font-semibold text-red-700 dark:text-red-300">
          <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
          {formError}
        </div>
      )}

      <div>
        <label htmlFor={id('title')} className={labelClass}>Title</label>
        <input
          id={id('title')}
          type="text"
          value={values.title}
          onChange={updateField('title')}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={describe('title')}
          className={inputClass}
        />
        {fieldErrors.title && <p id={id('title-error')} className={errorClass}>{fieldErrors.title}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id('name')} className={labelClass}>Full name</label>
          <input
            id={id('name')}
            type="text"
            autoComplete="name"
            value={values.candidate_name}
            onChange={updateField('candidate_name')}
            aria-invalid={Boolean(fieldErrors.candidate_name)}
            aria-describedby={describe('candidate_name')}
            className={inputClass}
          />
          {fieldErrors.candidate_name && <p id={id('candidate_name-error')} className={errorClass}>{fieldErrors.candidate_name}</p>}
        </div>

        <div>
          <label htmlFor={id('email')} className={labelClass}>Email</label>
          <input
            id={id('email')}
            type="email"
            autoComplete="email"
            value={values.candidate_email}
            onChange={updateField('candidate_email')}
            aria-invalid={Boolean(fieldErrors.candidate_email)}
            aria-describedby={describe('candidate_email')}
            className={inputClass}
          />
          {fieldErrors.candidate_email && <p id={id('candidate_email-error')} className={errorClass}>{fieldErrors.candidate_email}</p>}
        </div>

        <div>
          <label htmlFor={id('years')} className={labelClass}>Years of experience</label>
          <input
            id={id('years')}
            type="number"
            inputMode="numeric"
            min={0}
            max={60}
            step={1}
            value={values.years_experience}
            onChange={updateField('years_experience')}
            aria-invalid={Boolean(fieldErrors.years_experience)}
            aria-describedby={describe('years_experience')}
            className={inputClass}
          />
          {fieldErrors.years_experience && <p id={id('years_experience-error')} className={errorClass}>{fieldErrors.years_experience}</p>}
        </div>

        <div>
          <label htmlFor={id('education')} className={labelClass}>Education level</label>
          <select
            id={id('education')}
            value={values.education_level}
            onChange={updateField('education_level')}
            aria-invalid={Boolean(fieldErrors.education_level)}
            aria-describedby={describe('education_level')}
            className={inputClass}
          >
            {EDUCATION_OPTIONS.map((option) => (
              <option key={option.value || 'none'} value={option.value}>{option.label}</option>
            ))}
          </select>
          {fieldErrors.education_level && <p id={id('education_level-error')} className={errorClass}>{fieldErrors.education_level}</p>}
        </div>
      </div>

      <div>
        <label htmlFor={id('links')} className={labelClass}>Links</label>
        <textarea
          id={id('links')}
          rows={4}
          value={values.links}
          onChange={updateField('links')}
          placeholder="https://example.com/portfolio"
          aria-invalid={Boolean(fieldErrors.links)}
          aria-describedby={describe('links') ? `${id('links-hint')} ${id('links-error')}` : id('links-hint')}
          className={`${inputClass} min-h-24 resize-y`}
        />
        <p id={id('links-hint')} className="mt-1.5 text-xs text-emerald-900/70 dark:text-slate-400">One URL per line, up to {MAX_LINKS}.</p>
        {fieldErrors.links && <p id={id('links-error')} className={errorClass}>{fieldErrors.links}</p>}
      </div>

      <output className="block min-h-5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{success}</output>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={saving} className={secondaryButton}>
          <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
          Cancel
        </button>
        <button type="submit" disabled={saving} className={primaryButton}>
          <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
