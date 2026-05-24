'use client';

import { useState } from 'react';
import {
  HiOutlineBuildingOffice2, HiOutlinePhoto, HiOutlineTag, HiOutlineDocumentText,
  HiOutlineSparkles, HiOutlineMapPin, HiOutlineUserGroup, HiOutlineCalendarDays,
  HiOutlineGlobeAlt, HiOutlineEnvelope, HiOutlineCheck, HiOutlineXMark, HiOutlinePencilSquare,
} from 'react-icons/hi2';
import FormError from '@/components/auth/FormError';
import { SelectField, TextAreaField, TextField } from '@/components/forms/FormFields';
import { iconButton, primaryButton, secondaryButton } from '@/components/ui/styles';
import { api } from '@/utils/api';
import { Spinner } from '@/components/organizations/orgUi';

const INDUSTRIES = ['Tech', 'Fintech', 'Healthcare', 'Education', 'Ecommerce', 'Manufacturing', 'Media', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const INDUSTRY_OPTIONS = INDUSTRIES.map((o) => ({ value: o, label: o }));
const SIZE_OPTIONS = COMPANY_SIZES.map((o) => ({ value: o, label: `${o} people` }));

// Editable fields only. `slug` is never sent: the server rejects changes to it.
const FIELD_KEYS = ['name', 'logo_url', 'industry', 'description', 'tagline', 'location',
  'company_size', 'founded_year', 'website_url', 'contact_email'];

const toForm = (org) => ({
  name: org.name ?? '',
  logo_url: org.logo_url ?? '',
  industry: org.industry ?? 'Tech',
  description: org.description ?? '',
  tagline: org.tagline ?? '',
  location: org.location ?? '',
  company_size: org.company_size ?? '',
  founded_year: org.founded_year ?? '',
  website_url: org.website_url ?? '',
  contact_email: org.contact_email ?? '',
});

const firstMessage = (val) => {
  if (Array.isArray(val)) return String(val[0]);
  if (typeof val === 'string') return val;
  return 'Invalid value.';
};

// Inline edit panel for organization details. Calls onSaved with the saved organization fields.
export default function OrgEditForm({ org, slug, onSaved, onCancel }) {
  const [values, setValues] = useState(() => toForm(org));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentYear] = useState(() => new Date().getFullYear());

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError(null);

    const payload = {
      name: values.name.trim(),
      logo_url: values.logo_url.trim(),
      industry: values.industry,
      description: values.description.trim(),
      tagline: values.tagline.trim(),
      location: values.location.trim(),
      company_size: values.company_size,
      founded_year: values.founded_year === '' ? null : Number(values.founded_year),
      website_url: values.website_url.trim(),
      contact_email: values.contact_email.trim(),
    };

    try {
      const updated = await api.put(`/organizations/${slug}/`, payload);
      onSaved({ ...payload, ...(updated && typeof updated === 'object' ? updated : {}) });
    } catch (err) {
      const map = err?.errors && typeof err.errors === 'object' && !Array.isArray(err.errors) ? err.errors : {};
      if (err?.status === 400 && Object.keys(map).length) {
        const fieldErrors = {};
        const others = [];
        Object.entries(map).forEach(([key, val]) => {
          if (FIELD_KEYS.includes(key)) fieldErrors[key] = firstMessage(val);
          else others.push(firstMessage(val));
        });
        setErrors(fieldErrors);
        setFormError(others.length ? others.join(' ') : Object.keys(fieldErrors).length ? 'Please fix the highlighted fields.' : null);
      } else {
        setFormError(err?.message || 'Could not save your changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="org-edit-title" className="rounded-lg border border-emerald-200 bg-card p-5 lg:p-6 dark:border-emerald-500/20">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="org-edit-title" className="flex items-center gap-2 text-base font-semibold">
            <HiOutlinePencilSquare className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
            Edit details
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Update how your organization appears to candidates.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close edit panel"
          className={iconButton}
        >
          <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <FormError title="Could not save" message={formError} />

      <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="org-name" label="Organization name" icon={HiOutlineBuildingOffice2}
          hint="The name candidates see on every job post." value={values.name} onChange={set('name')}
          error={errors.name} maxLength={150} required
        />
        <TextField
          id="org-logo" label="Logo URL" icon={HiOutlinePhoto} type="url"
          hint="Link to a square image, at least 128px wide." value={values.logo_url} onChange={set('logo_url')}
          error={errors.logo_url} placeholder="https://"
        />
        <SelectField
          id="org-industry" label="Industry" icon={HiOutlineTag}
          hint="The sector that best describes your business." value={values.industry} onChange={set('industry')}
          error={errors.industry} options={INDUSTRY_OPTIONS}
        />
        <SelectField
          id="org-size" label="Company size" icon={HiOutlineUserGroup}
          hint="Roughly how many people work for you." value={values.company_size} onChange={set('company_size')}
          error={errors.company_size} options={SIZE_OPTIONS} placeholder="Not specified"
        />
        <TextField
          id="org-location" label="Location" icon={HiOutlineMapPin}
          hint="Headquarters city and country." value={values.location} onChange={set('location')}
          error={errors.location} placeholder="City, Country"
        />
        <TextField
          id="org-founded" label="Founded year" icon={HiOutlineCalendarDays} type="number"
          inputMode="numeric" min="1800" max={currentYear}
          hint="The year the company was founded." value={values.founded_year} onChange={set('founded_year')}
          error={errors.founded_year} placeholder="2015"
        />
        <div className="sm:col-span-2">
          <TextField
            id="org-tagline" label="Tagline" icon={HiOutlineSparkles}
            hint="One line that sums up what you do." value={values.tagline} onChange={set('tagline')}
            error={errors.tagline} placeholder="Building the future of payments"
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            id="org-description" label="About" icon={HiOutlineDocumentText} rows={5}
            hint="A short story of the company, its mission and its team." value={values.description}
            onChange={set('description')} error={errors.description}
          />
        </div>
        <TextField
          id="org-website" label="Website" icon={HiOutlineGlobeAlt} type="url"
          hint="Full address, starting with https://." value={values.website_url} onChange={set('website_url')}
          error={errors.website_url} placeholder="https://example.com"
        />
        <TextField
          id="org-email" label="Contact email" icon={HiOutlineEnvelope} type="email"
          hint="Where candidates can reach your team." value={values.contact_email} onChange={set('contact_email')}
          error={errors.contact_email} placeholder="hiring@example.com"
        />

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className={secondaryButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={primaryButton}
          >
            {saving ? <Spinner /> : <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
