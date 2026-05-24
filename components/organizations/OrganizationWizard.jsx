'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineCheck,
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineGlobeAlt,
  HiOutlineMapPin,
  HiOutlinePhoto,
  HiOutlineSparkles,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import AuthLayout from '@/components/auth/AuthLayout';
import StepIndicator from '@/components/auth/StepIndicator';
import FormError from '@/components/auth/FormError';
import { ORG_SHOWCASE } from '@/components/auth/showcaseContent';
import { SelectField, TextAreaField, TextField } from '@/components/forms/FormFields';
import { cardPadded, ghostButton, primaryButton, secondaryButton } from '@/components/ui/styles';
import { base } from '@/constants/motion';
import PageHeader from '@/components/ui/PageHeader';
import { ORG_PAGE, industryBadge } from '@/components/organizations/orgUi';
import { api } from '@/utils/api';

const INDUSTRIES = ['Tech', 'Fintech', 'Healthcare', 'Education', 'Ecommerce', 'Manufacturing', 'Media', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const INDUSTRY_OPTIONS = INDUSTRIES.map((o) => ({ value: o, label: o }));
const SIZE_OPTIONS = COMPANY_SIZES.map((o) => ({ value: o, label: o }));
const CURRENT_YEAR = new Date().getFullYear();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELDS = {
  name: { label: 'Organization name', icon: HiOutlineBuildingOffice2, step: 0, hint: 'Shown on job posts so candidates know who is hiring.' },
  tagline: { label: 'Tagline', icon: HiOutlineSparkles, step: 0, hint: 'One line on what you do. Candidates see it in search results.' },
  industry: { label: 'Industry', icon: HiOutlineBriefcase, step: 0, hint: 'Helps candidates find your roles when they search by sector.' },
  founded_year: { label: 'Founded year', icon: HiOutlineCalendarDays, step: 0, hint: 'Shows how established your team is. Leave blank if unsure.' },
  location: { label: 'Location', icon: HiOutlineMapPin, step: 1, hint: 'Lets candidates judge whether a role fits where they live.' },
  company_size: { label: 'Company size', icon: HiOutlineUserGroup, step: 1, hint: 'Sets expectations about team size and how roles are structured.' },
  website_url: { label: 'Website', icon: HiOutlineGlobeAlt, step: 1, hint: 'Lets candidates read more about your work before they apply.' },
  contact_email: { label: 'Contact email', icon: HiOutlineEnvelope, step: 1, hint: 'Where candidates send questions about your roles.' },
  logo_url: { label: 'Logo URL', icon: HiOutlinePhoto, step: 1, hint: 'Shown beside your posts. Paste a public https image link.' },
  description: { label: 'Description', icon: HiOutlineDocumentText, step: 2, hint: 'Explain your mission and culture. Candidates read this before applying.' },
};

const STEPS = [
  { label: 'Identity', icon: HiOutlineBuildingOffice2, subtitle: 'Start with the name and a short tagline candidates will see.' },
  { label: 'Details', icon: HiOutlineMapPin, subtitle: 'Add where you are and how candidates can reach you.' },
  { label: 'About & review', icon: HiOutlineDocumentText, subtitle: 'Describe your work, then check everything before you create it.' },
];
const LAST = STEPS.length - 1;

const EMPTY = {
  name: '',
  tagline: '',
  industry: 'Tech',
  founded_year: '',
  location: '',
  company_size: '',
  website_url: '',
  contact_email: '',
  logo_url: '',
  description: '',
};

const SLIDE = {
  enter: (d) => ({ opacity: 0, x: d * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: d * -24 }),
};

const isHttps = (s) => s.trim().startsWith('https://');

// Returns { fieldKey: message } for every invalid value. Optional fields only count when filled.
function validate(v) {
  const errs = {};
  const name = v.name.trim();
  if (!name) errs.name = 'Enter your organization name.';
  else if (name.length < 2) errs.name = 'Use at least 2 characters.';
  if (v.founded_year !== '') {
    const year = Number(v.founded_year);
    if (!Number.isInteger(year) || year < 1800 || year > CURRENT_YEAR) {
      errs.founded_year = `Enter a year from 1800 to ${CURRENT_YEAR}.`;
    }
  }
  if (v.website_url.trim() && !isHttps(v.website_url)) errs.website_url = 'Use a link starting with https://.';
  if (v.logo_url.trim() && !isHttps(v.logo_url)) errs.logo_url = 'Use a link starting with https://.';
  if (v.contact_email.trim() && !EMAIL_RE.test(v.contact_email.trim())) {
    errs.contact_email = 'Enter an email like hello@company.com.';
  }
  return errs;
}

function buildPayload(v) {
  return {
    name: v.name.trim(),
    industry: v.industry,
    tagline: v.tagline.trim(),
    description: v.description.trim(),
    logo_url: v.logo_url.trim(),
    location: v.location.trim(),
    company_size: v.company_size,
    founded_year: v.founded_year === '' ? null : Number(v.founded_year),
    website_url: v.website_url.trim(),
    contact_email: v.contact_email.trim(),
  };
}

const messagesOf = (value) => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((m) => typeof m === 'string');
  return [];
};

// Splits DRF-style errors into per-field messages and messages that belong to no field.
function parseServerErrors(err) {
  const fields = {};
  const general = [];
  const data = err && typeof err.errors === 'object' && err.errors !== null ? err.errors : {};
  Object.entries(data).forEach(([key, value]) => {
    const msgs = messagesOf(value);
    if (!msgs.length) return;
    if (key in FIELDS) fields[key] = msgs[0];
    else general.push(...msgs);
  });
  if (!Object.keys(fields).length && !general.length) {
    const fallback = typeof err?.message === 'string' && !/[{}]|\[object/.test(err.message) ? err.message : '';
    general.push(fallback || 'Please check your details and try again.');
  }
  return { fields, general };
}

const counterText = (n, max) => <span className="text-[11px] tabular-nums text-foreground/35">{n}/{max}</span>;

export default function OrganizationWizard({ variant = 'app' }) {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const stepRef = useRef(null);
  const pendingFocus = useRef(false);

  // Props for a field keyed by its name; `error` comes from state.
  const f = (key) => ({ id: key, label: FIELDS[key].label, icon: FIELDS[key].icon, hint: FIELDS[key].hint, error: errors[key] });

  const set = (key) => (e) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const focusFirstInvalid = () => stepRef.current?.querySelector('[aria-invalid="true"]')?.focus();

  const goTo = (target) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  // Shows errors and moves to the earliest step that owns one, focusing its first invalid field.
  const reveal = (errs) => {
    setErrors(errs);
    const keys = Object.keys(errs).filter((k) => k in FIELDS);
    if (!keys.length) return;
    const target = Math.min(...keys.map((k) => FIELDS[k].step));
    if (target === step) {
      setTimeout(focusFirstInvalid, 0);
    } else {
      pendingFocus.current = true;
      goTo(target);
    }
  };

  const next = () => {
    const errs = validate(values);
    const own = Object.fromEntries(Object.entries(errs).filter(([k]) => FIELDS[k].step === step));
    if (Object.keys(own).length) return reveal(own);
    setErrors({});
    goTo(step + 1);
  };

  const submit = async () => {
    if (saving) return;
    const errs = validate(values);
    if (Object.keys(errs).length) return reveal(errs);
    setFormError('');
    setErrors({});
    setSaving(true);
    try {
      const data = await api.post('/organizations/', buildPayload(values));
      if (!data?.slug) throw new Error('Organization was created, but no link was returned.');
      router.push(variant === 'auth' ? '/organizations' : `/organizations/${data.slug}`);
    } catch (err) {
      const parsed = parseServerErrors(err);
      setSaving(false);
      setFormError(parsed.general.join(' '));
      reveal(parsed.fields);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step < LAST) next();
    else submit();
  };

  // Skip moves forward without checking the step's optional fields; the final submit still validates everything.
  const skip = () => {
    if (step === LAST) submit();
    else goTo(step + 1);
  };

  const review = Object.keys(FIELDS)
    .map((key) => ({ key, value: values[key].trim() }))
    .filter((item) => item.value);

  const StepIcon = STEPS[step].icon;

  const isApp = variant !== 'auth';

  const card = (
    <div>
      {!isApp && <div className="mb-6 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10">
          <StepIcon aria-hidden="true" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Create your organization</h1>
          <p className="mt-1 text-sm text-foreground/50">{STEPS[step].subtitle}</p>
        </div>
      </div>}

      <StepIndicator steps={STEPS} current={step + 1} onSelect={(n) => goTo(n - 1)} />
      <FormError title="Could not create organization" message={formError} onDismiss={() => setFormError('')} />

      <form noValidate onSubmit={handleFormSubmit}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            ref={stepRef}
            custom={direction}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={base}
            onAnimationComplete={() => {
              if (pendingFocus.current) {
                pendingFocus.current = false;
                focusFirstInvalid();
              }
            }}
            className="space-y-5"
          >
            {step === 0 && (
              <>
                <TextField {...f('name')} required autoComplete="organization" placeholder="Acme Corp" value={values.name} onChange={set('name')} />
                <TextField
                  {...f('tagline')}
                  placeholder="Building tools for better hiring"
                  maxLength={160}
                  counter={counterText(values.tagline.length, 160)}
                  value={values.tagline}
                  onChange={set('tagline')}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField {...f('industry')} options={INDUSTRY_OPTIONS} value={values.industry} onChange={set('industry')} />
                  <TextField
                    {...f('founded_year')}
                    type="number"
                    inputMode="numeric"
                    min={1800}
                    max={CURRENT_YEAR}
                    placeholder={String(CURRENT_YEAR - 5)}
                    value={values.founded_year}
                    onChange={set('founded_year')}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField {...f('location')} maxLength={120} placeholder="City, Country" value={values.location} onChange={set('location')} />
                  <SelectField
                    {...f('company_size')}
                    placeholder="Select a size"
                    options={SIZE_OPTIONS}
                    value={values.company_size}
                    onChange={set('company_size')}
                  />
                </div>
                <TextField {...f('website_url')} type="url" placeholder="https://www.example.com" value={values.website_url} onChange={set('website_url')} />
                <TextField {...f('contact_email')} type="email" autoComplete="email" placeholder="hello@example.com" value={values.contact_email} onChange={set('contact_email')} />
                <TextField {...f('logo_url')} type="url" placeholder="https://example.com/logo.png" value={values.logo_url} onChange={set('logo_url')} />
              </>
            )}

            {step === 2 && (
              <>
                <TextAreaField
                  {...f('description')}
                  rows={5}
                  maxLength={2000}
                  placeholder="What does your team build, and who do you hire for?"
                  value={values.description}
                  onChange={set('description')}
                />
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-foreground">Review before you create</h2>
                  {review.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border p-4 text-sm text-foreground/50">
                      Nothing added yet. You can create the organization now and fill in the rest later.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-muted/30">
                      {review.map(({ key, value }) => {
                        const meta = FIELDS[key];
                        const Icon = meta.icon;
                        return (
                          <li key={key} className="flex items-start gap-3 px-4 py-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10">
                              <Icon aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">{meta.label}</p>
                              <p className="break-words text-sm font-semibold text-foreground">{value}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (meta.step === step) document.getElementById(key)?.focus();
                                else goTo(meta.step);
                              }}
                              className="min-h-10 shrink-0 rounded-md px-3 py-1 text-xs font-semibold text-emerald-700 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-emerald-500/10 dark:text-emerald-400"
                            >
                              Edit
                              <span className="sr-only"> {meta.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className={`${secondaryButton} w-full sm:w-auto`}
              >
                <HiOutlineArrowLeft aria-hidden="true" className="h-4 w-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {step > 0 && (
              <button
                type="button"
                onClick={skip}
                disabled={saving}
                className={ghostButton}
              >
                Skip for now
              </button>
            )}
            {step < LAST ? (
              <button
                type="submit"
                className={`${primaryButton} w-full sm:w-auto`}
              >
                Continue
                <HiOutlineArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className={`${primaryButton} w-full sm:w-auto`}
              >
                {saving ? (
                  <>
                    <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
                    Creating...
                  </>
                ) : (
                  <>
                    <HiOutlineCheck aria-hidden="true" className="h-4 w-4" />
                    Create organization
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );

  if (variant === 'auth') {
    return <AuthLayout maxWidth="max-w-xl" showcase={ORG_SHOWCASE}>{card}</AuthLayout>;
  }
  return (
    <div className={ORG_PAGE}>
      <PageHeader
        back={{ href: '/organizations', label: 'Organizations' }}
        icon={HiOutlineBuildingOffice2}
        eyebrow={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step].label}`}
        title="Create your organization"
        description={STEPS[step].subtitle}
      />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className={`${cardPadded} min-w-0 lg:col-span-8 2xl:col-span-9`}>{card}</div>
        <OrgPreview values={values} />
      </div>
    </div>
  );
}

// Live preview of how the organization card will read, updated as the form is filled in.
function OrgPreview({ values }) {
  const rows = [
    { icon: HiOutlineMapPin, label: 'Location', value: values.location.trim() },
    { icon: HiOutlineUserGroup, label: 'Company size', value: values.company_size && `${values.company_size} people` },
    { icon: HiOutlineCalendarDays, label: 'Founded', value: values.founded_year },
    { icon: HiOutlineGlobeAlt, label: 'Website', value: values.website_url.trim() },
  ];
  return (
    <aside aria-label="Preview" className={`${cardPadded} space-y-4 self-start lg:sticky lg:top-6 lg:col-span-4 2xl:col-span-3`}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <HiOutlineEye className="h-4 w-4" aria-hidden="true" /> Candidate preview
      </p>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <HiOutlineBuildingOffice2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="break-words font-semibold">{values.name.trim() || <span className="text-muted-foreground">Your organization</span>}</p>
          {industryBadge(values.industry)}
        </div>
      </div>
      {values.tagline.trim() && <p className="break-words text-sm text-muted-foreground">{values.tagline.trim()}</p>}
      <ul className="space-y-2 border-t border-border pt-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex min-w-0 items-center gap-2 text-xs">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">{label}: </span>
            <span className={`truncate ${value ? 'text-foreground' : 'text-muted-foreground'}`}>{value || '—'}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
