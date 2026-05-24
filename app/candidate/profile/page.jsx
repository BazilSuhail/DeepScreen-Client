'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';
import TagInput from '@/components/profile/TagInput';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import ErrorState from '@/components/dashboard/ErrorState';
import ProfileSkeleton from '@/components/skeletons/candidate/ProfileSkeleton';
import { FaGithub, FaLinkedinIn, FaGlobe } from 'react-icons/fa';
import {
  HiOutlinePencilSquare, HiOutlineCheck, HiOutlineXMark,
  HiOutlineEnvelope, HiOutlinePhone, HiOutlineSparkles,
  HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineMapPin,
  HiOutlineTrash, HiOutlinePlus, HiOutlineCalendarDays,
  HiOutlineUser, HiOutlineUserCircle, HiOutlineShieldCheck, HiOutlineExclamationCircle,
  HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowPath, HiOutlineArrowTopRightOnSquare,
  HiOutlineIdentification, HiOutlineCheckCircle, HiOutlineClock,
} from 'react-icons/hi2';
import { badge, card, focusRing, iconTile, primaryButton, secondaryButton, inputClass, labelClass as sharedLabelClass } from '@/components/ui/styles';
import { base, fadeUp, stagger } from '@/constants/motion';

const EMPTY_EXPERIENCE = { title: '', company: '', start: '', end: '', description: '' };
const EMPTY_EDUCATION = { school: '', degree: '', year: '' };

const EXPERIENCE_FIELDS = [
  { key: 'title', label: 'Title', placeholder: 'Frontend engineer' },
  { key: 'company', label: 'Company', placeholder: 'Acme Inc.' },
  { key: 'start', label: 'Start', placeholder: 'Jan 2022' },
  { key: 'end', label: 'End', placeholder: 'Present' },
  { key: 'description', label: 'Description', placeholder: 'What you built or led', wide: true },
];

const EDUCATION_FIELDS = [
  { key: 'school', label: 'School', placeholder: 'University name', wide: true },
  { key: 'degree', label: 'Degree', placeholder: 'BSc Computer Science' },
  { key: 'year', label: 'Year', placeholder: '2024' },
];

const labelClass = `${sharedLabelClass} mb-1.5`;
const emptyText = 'text-sm text-muted-foreground';

// Form state mirrors the profile payload; `profileToForm` and `formToPayload` convert between the two.
const profileToForm = (p) => ({
  first_name: p.first_name || '',
  last_name: p.last_name || '',
  headline: p.headline || '',
  location: p.location || '',
  years_experience: p.years_experience ?? '',
  bio: p.bio || '',
  phone: p.phone || '',
  github_url: p.github_url || '',
  linkedin_url: p.linkedin_url || '',
  portfolio_url: p.portfolio_url || '',
  skills: p.skills || [],
  interests: p.interests || [],
  desired_roles: p.desired_roles || [],
  experience: p.experience || [],
  education: p.education || [],
  open_to_work: !!p.open_to_work,
  is_public: !!p.is_public,
});

const formToPayload = (f) => {
  const trimmed = Object.fromEntries(
    Object.entries(f).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  );
  const hasText = (entry) => Object.values(entry).some((v) => String(v).trim());
  return {
    ...trimmed,
    years_experience: f.years_experience === '' ? null : Number(f.years_experience),
    experience: f.experience.filter(hasText),
    education: f.education.filter(hasText),
  };
};

const withHttps = (url) => (url.startsWith('http') ? url : `https://${url}`);
const fmtDate = (value) => (value ? new Date(value).toLocaleDateString() : null);

function Section({ title, helper, icon: Icon, children, index = 0, className = '' }) {
  return (
    <motion.section
      {...fadeUp}
      transition={{ ...base, delay: Math.min(index, 8) * stagger }}
      className={`min-w-0 p-5 lg:p-6 ${card} ${className}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-left transition-[color,background-color,border-color,translate,scale] active:scale-[0.99] motion-reduce:transform-none hover:border-emerald-400 dark:border-white/10 dark:bg-white/5 ${focusRing}`}
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-600' : 'bg-emerald-200 dark:bg-white/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[translate] ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}

// Add/remove editor for experience and education entries.
function EntryEditor({ items, onChange, fields, emptyEntry, addLabel }) {
  const update = (index, key, value) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  const remove = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-md border border-emerald-100 bg-emerald-50/50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map(({ key, label, placeholder, wide }) => (
              <input
                key={key}
                value={item[key] || ''}
                onChange={(e) => update(index, key, e.target.value)}
                placeholder={placeholder}
                aria-label={label}
                maxLength={500}
                className={`${inputClass} ${wide ? 'sm:col-span-2' : ''}`}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className={`flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-muted-foreground transition-[color,background-color,translate,scale] active:scale-[0.97] motion-reduce:transform-none hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 ${focusRing}`}
            >
              <HiOutlineTrash className="h-4 w-4" aria-hidden="true" /> Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, emptyEntry])}
        className={`flex min-h-11 items-center gap-2 rounded-md border border-dashed border-emerald-400 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-[color,background-color,translate,scale] active:scale-[0.97] motion-reduce:transform-none hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10 ${focusRing}`}
      >
        <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> {addLabel}
      </button>
    </div>
  );
}

function Timeline({ entries, render }) {
  return (
    <ol className="relative space-y-5 border-l border-emerald-200 pl-5 dark:border-white/10">
      {entries.map((entry, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" aria-hidden="true" />
          {render(entry)}
        </li>
      ))}
    </ol>
  );
}

export default function CandidateProfilePage() {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const data = await api.get('/accounts/profiles/me/');
        if (cancelled) return;
        setProfile(data);
        setForm(profileToForm(data));
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch profile', err);
        setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (user) fetchProfile();
    return () => { cancelled = true; };
  }, [user, attempt]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await api.put('/accounts/profiles/me/', formToPayload(form));
      setProfile(data);
      setForm(profileToForm(data));
      setIsEditing(false);
    } catch (err) {
      setError(err?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profileToForm(profile));
    setError('');
    setIsEditing(false);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setList = (key) => (value) => setForm({ ...form, [key]: value });

  if (!authLoading && !user) {
    return (
      <div className="w-full min-w-0 space-y-4 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <ErrorState title="You're signed out" message="Sign in again to view and edit your profile." />
        <Link href="/auth/login" className={primaryButton}>Sign in</Link>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <ErrorState
          title="Could not load your profile"
          message="Check your connection and try again."
          onRetry={() => { setLoadError(false); setLoading(true); setAttempt((n) => n + 1); }}
        />
      </div>
    );
  }
  if (loading || !form) return <ProfileSkeleton />;

  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  const initials = fullName ? fullName.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() : null;
  const links = [
    { key: 'github_url', label: 'GitHub', Icon: FaGithub, url: profile?.github_url, placeholder: 'https://github.com/you' },
    { key: 'linkedin_url', label: 'LinkedIn', Icon: FaLinkedinIn, url: profile?.linkedin_url, placeholder: 'https://linkedin.com/in/you' },
    { key: 'portfolio_url', label: 'Portfolio', Icon: FaGlobe, url: profile?.portfolio_url, placeholder: 'https://your-site.dev' },
  ];
  const updated = fmtDate(profile?.updated_at);
  const memberSince = fmtDate(user?.created_at);
  const dash = <span className="text-muted-foreground">—</span>;

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        icon={HiOutlineUserCircle}
        eyebrow="Candidate profile"
        title={fullName || 'Your profile'}
        description={profile?.headline || user?.email}
        meta={(
          <span className={`${badge} font-semibold ${profile?.setup_completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'}`}>
            {profile?.setup_completed ? <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> : <HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden="true" />}
            {profile?.setup_completed ? 'Setup complete' : 'Setup pending'}
          </span>
        )}
        actions={isEditing ? (
          <>
            <button type="button" onClick={handleCancel} disabled={saving} className={secondaryButton}>
              <HiOutlineXMark className="h-4 w-4" aria-hidden="true" /> Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className={primaryButton}>
              {saving
                ? <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                : <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)} className={primaryButton}>
            <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit profile
          </button>
        )}
      />

      {!isEditing && !profile?.setup_completed && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <HiOutlineSparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          Add a headline, skills, and experience to finish setting up your profile.
        </p>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 dark:border-red-500/25 dark:bg-red-500/10">
          <HiOutlineExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Aside: identity, contact, links, visibility, activity */}
        <aside className="min-w-0 space-y-6 lg:col-span-4 2xl:col-span-3">
          <motion.section {...fadeUp} transition={base} className={`relative overflow-hidden p-5 text-center lg:p-6 ${card}`}>
            <div className="absolute inset-x-0 top-0 h-16 bg-emerald-50 dark:bg-emerald-dark" aria-hidden="true" />
            <div className="relative flex flex-col items-center gap-3">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-emerald-600 text-2xl font-semibold text-white">
                {initials || <HiOutlineUser className="h-9 w-9" aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <p className="break-words text-lg font-semibold">{fullName || 'Your profile'}</p>
                {profile?.headline && <p className="break-words text-sm text-muted-foreground">{profile.headline}</p>}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {profile?.location && (
                  <span className={`${badge} bg-muted text-muted-foreground`}>
                    <HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden="true" /> {profile.location}
                  </span>
                )}
                {profile?.years_experience != null && (
                  <span className={`${badge} bg-muted text-muted-foreground`}>
                    <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    {profile.years_experience} {profile.years_experience === 1 ? 'year' : 'years'}
                  </span>
                )}
                {profile?.open_to_work && (
                  <span className={`${badge} bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
                    <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> Open to work
                  </span>
                )}
              </div>
            </div>
          </motion.section>

          <Section title="Contact" icon={HiOutlineIdentification} index={1}>
            <div className="space-y-4">
              <div>
                <span className={labelClass}>Phone</span>
                {isEditing ? (
                  <input value={form.phone} onChange={set('phone')} className={inputClass} placeholder="+1 234 567 890" maxLength={20} aria-label="Phone" />
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <HiOutlinePhone className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {profile?.phone || dash}
                  </p>
                )}
              </div>
              <div>
                <span className={labelClass}>Email</span>
                <p className="flex items-center gap-2 break-all text-sm font-medium">
                  <HiOutlineEnvelope className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  {user?.email || dash}
                </p>
              </div>
            </div>
          </Section>

          <Section title="Links" icon={FaGlobe} index={2}>
            {isEditing ? (
              <div className="space-y-4">
                {links.map(({ key, label, placeholder }) => (
                  <Field key={key} label={label}>
                    <input type="url" value={form[key]} onChange={set(key)} className={inputClass} placeholder={placeholder} />
                  </Field>
                ))}
              </div>
            ) : links.some((l) => l.url) ? (
              <div className="space-y-2">
                {links.filter((l) => l.url).map(({ key, label, Icon, url }) => (
                  <a
                    key={key}
                    href={withHttps(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex min-h-11 items-center gap-3 rounded-md border border-emerald-100 px-3 py-2 text-sm font-medium transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/10 dark:hover:bg-white/5 ${focusRing}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    <HiOutlineArrowTopRightOnSquare className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : (
              <p className={emptyText}>No links added yet.</p>
            )}
          </Section>

          <Section title="Visibility" icon={HiOutlineEye} index={3}>
            {isEditing ? (
              <div className="space-y-3">
                <Toggle
                  checked={form.open_to_work}
                  onChange={(v) => setForm({ ...form, open_to_work: v })}
                  label="Open to work"
                  description="Show that you are looking for roles"
                />
                <Toggle
                  checked={form.is_public}
                  onChange={(v) => setForm({ ...form, is_public: v })}
                  label="Visible to recruiters"
                  description="Recruiters can see your profile without an application"
                />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <HiOutlineBriefcase className={`h-4 w-4 ${profile?.open_to_work ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} aria-hidden="true" />
                  {profile?.open_to_work ? 'Open to work' : 'Not open to work'}
                </p>
                <p className="flex items-center gap-2">
                  {profile?.is_public ? (
                    <HiOutlineEye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  ) : (
                    <HiOutlineEyeSlash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  {profile?.is_public ? 'Visible to recruiters' : 'Hidden from recruiters'}
                </p>
              </div>
            )}
          </Section>

          <Section title="Activity" icon={HiOutlineCalendarDays} index={4}>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground"><HiOutlineClock className="h-4 w-4" aria-hidden="true" /> Last updated</dt>
                <dd className="font-semibold">{updated || dash}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground"><HiOutlineCalendarDays className="h-4 w-4" aria-hidden="true" /> Member since</dt>
                <dd className="font-semibold">{memberSince || dash}</dd>
              </div>
            </dl>
            <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              <HiOutlineShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Your profile information is used across the platform for applications, interviews, and communications.
            </p>
          </Section>
        </aside>

        {/* Main: about, skills, experience, education */}
        <div className="min-w-0 space-y-6 lg:col-span-8 2xl:col-span-9">
          <Section title="About" helper="Who you are and what you do" icon={HiOutlineUser} index={1}>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="First name">
                    <input value={form.first_name} onChange={set('first_name')} className={inputClass} placeholder="First name" maxLength={100} />
                  </Field>
                  <Field label="Last name">
                    <input value={form.last_name} onChange={set('last_name')} className={inputClass} placeholder="Last name" maxLength={100} />
                  </Field>
                </div>
                <Field label="Headline">
                  <input value={form.headline} onChange={set('headline')} className={inputClass} placeholder="e.g. Frontend engineer, React and TypeScript" maxLength={160} />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Location">
                    <input value={form.location} onChange={set('location')} className={inputClass} placeholder="City, Country" maxLength={120} />
                  </Field>
                  <Field label="Years of experience">
                    <input type="number" min={0} max={80} value={form.years_experience} onChange={set('years_experience')} className={inputClass} placeholder="e.g. 3" />
                  </Field>
                </div>
                <Field label="Bio">
                  <textarea
                    value={form.bio}
                    onChange={set('bio')}
                    className={`${inputClass} min-h-[120px] resize-y`}
                    placeholder="Tell us about yourself..."
                  />
                </Field>
              </div>
            ) : profile?.bio ? (
              <p className="max-w-prose whitespace-pre-wrap leading-relaxed text-foreground/90">{profile.bio}</p>
            ) : (
              <p className={emptyText}>No bio provided yet.</p>
            )}
          </Section>

          <Section title="Skills & interests" helper="What recruiters match you on" icon={HiOutlineSparkles} index={2}>
            {isEditing ? (
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="min-w-0">
                  <span className={labelClass}>Skills</span>
                  <TagInput value={form.skills} onChange={setList('skills')} placeholder="Type a skill and press Enter" />
                </div>
                <div className="min-w-0">
                  <span className={labelClass}>Interests</span>
                  <TagInput value={form.interests} onChange={setList('interests')} placeholder="Type an interest and press Enter" />
                </div>
                <div className="min-w-0">
                  <span className={labelClass}>Desired roles</span>
                  <TagInput value={form.desired_roles} onChange={setList('desired_roles')} placeholder="Type a role and press Enter" max={10} />
                </div>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-3">
                {[
                  { label: 'Skills', items: profile?.skills, tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' },
                  { label: 'Interests', items: profile?.interests, tone: 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300' },
                  { label: 'Desired roles', items: profile?.desired_roles, tone: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300' },
                ].map(({ label, items, tone }) => (
                  <div key={label} className="min-w-0">
                    <span className={labelClass}>{label}</span>
                    {Array.isArray(items) && items.length ? (
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <span key={item} className={`${badge} ${tone}`}>{item}</span>
                        ))}
                      </div>
                    ) : (
                      <p className={emptyText}>None added yet.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <div className={`grid gap-6 ${isEditing ? '' : 'xl:grid-cols-2'}`}>
            <Section title="Experience" icon={HiOutlineBriefcase} index={3}>
              {isEditing ? (
                <EntryEditor
                  items={form.experience}
                  onChange={setList('experience')}
                  fields={EXPERIENCE_FIELDS}
                  emptyEntry={EMPTY_EXPERIENCE}
                  addLabel="Add experience"
                />
              ) : Array.isArray(profile?.experience) && profile.experience.length ? (
                <Timeline
                  entries={profile.experience}
                  render={(entry) => (
                    <>
                      <p className="font-semibold">{entry.title}{entry.company ? ` · ${entry.company}` : ''}</p>
                      {(entry.start || entry.end) && <p className="text-xs text-muted-foreground">{[entry.start, entry.end].filter(Boolean).join(' – ')}</p>}
                      {entry.description && <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>}
                    </>
                  )}
                />
              ) : (
                <p className={emptyText}>No experience added yet.</p>
              )}
            </Section>

            <Section title="Education" icon={HiOutlineAcademicCap} index={4}>
              {isEditing ? (
                <EntryEditor
                  items={form.education}
                  onChange={setList('education')}
                  fields={EDUCATION_FIELDS}
                  emptyEntry={EMPTY_EDUCATION}
                  addLabel="Add education"
                />
              ) : Array.isArray(profile?.education) && profile.education.length ? (
                <Timeline
                  entries={profile.education}
                  render={(entry) => (
                    <>
                      <p className="font-semibold">{entry.school}</p>
                      {(entry.degree || entry.year) && <p className="text-sm text-muted-foreground">{[entry.degree, entry.year].filter(Boolean).join(' · ')}</p>}
                    </>
                  )}
                />
              ) : (
                <p className={emptyText}>No education added yet.</p>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
