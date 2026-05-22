'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';
import TagInput from '@/components/profile/TagInput';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import { FaGithub, FaLinkedinIn, FaGlobe } from 'react-icons/fa';
import {
  HiOutlinePencilSquare, HiOutlineCheck, HiOutlineXMark,
  HiOutlineEnvelope, HiOutlinePhone, HiOutlineSparkles,
  HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineMapPin,
  HiOutlineTrash, HiOutlinePlus, HiOutlineCalendarDays,
  HiOutlineUser, HiOutlineUserCircle, HiOutlineShieldCheck, HiOutlineExclamationCircle,
  HiOutlineEye, HiOutlineEyeSlash,
} from 'react-icons/hi2';

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

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const muted = 'text-emerald-900/70 dark:text-slate-400';
const card = 'rounded-2xl border border-emerald-100 bg-white p-5 lg:p-6 dark:border-white/10 dark:bg-card';
const secondaryButton = `flex min-h-11 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white ${focusRing}`;
const primaryButton = `flex min-h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50 ${focusRing}`;
const inputClass = `w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-white/10 dark:bg-white/5 ${focusRing}`;
const labelClass = `mb-1.5 block text-[10px] font-semibold uppercase tracking-widest ${muted}`;

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

function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={card}
    >
      <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-emerald-950 dark:text-white">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {children}
    </div>
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
      className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-left transition-colors hover:border-emerald-500/60 dark:border-white/10 dark:bg-white/5 ${focusRing}`}
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className={`block text-xs ${muted}`}>{description}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-600' : 'bg-emerald-200 dark:bg-white/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
        <div key={index} className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-white/10 dark:bg-white/5">
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
              className={`flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${muted} transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 ${focusRing}`}
            >
              <HiOutlineTrash className="h-3.5 w-3.5" aria-hidden="true" /> Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, emptyEntry])}
        className={`flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-emerald-500/60 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10 ${focusRing}`}
      >
        <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> {addLabel}
      </button>
    </div>
  );
}

export default function CandidateProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (user) fetchProfile();
    return () => { cancelled = true; };
  }, [user]);

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

  const pending = loading || !form;
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  const links = [
    { key: 'github_url', label: 'GitHub', Icon: FaGithub, url: profile?.github_url },
    { key: 'linkedin_url', label: 'LinkedIn', Icon: FaLinkedinIn, url: profile?.linkedin_url },
    { key: 'portfolio_url', label: 'Portfolio', Icon: FaGlobe, url: profile?.portfolio_url },
  ];

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      <DashboardBanner
        loading={pending}
        icon={HiOutlineUserCircle}
        badge={pending ? undefined : {
          label: profile?.setup_completed ? 'Setup complete' : 'Setup pending',
          icon: HiOutlineSparkles,
        }}
        title={fullName || 'Your profile'}
        subtitle={pending ? null : (profile?.headline || user?.email)}
        footer={pending ? null : (
          profile?.setup_completed
            ? 'Keep your skills and experience current so recruiters can find you.'
            : 'Add a headline, skills, and experience to finish setting up your profile.'
        )}
        aside={pending ? (
          <div className="flex gap-2">
            <BannerBlock className="h-11 w-36 rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {isEditing ? (
              <>
                <button type="button" onClick={handleCancel} disabled={saving} className={secondaryButton}>
                  <HiOutlineXMark className="h-4 w-4" aria-hidden="true" /> Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className={primaryButton}>
                  <HiOutlineCheck className="h-4 w-4" aria-hidden="true" /> {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className={primaryButton}>
                <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit profile
              </button>
            )}
          </div>
        )}
      />

      {pending ? (
        <PageSkeleton stats={0} cards={3} banner={false} />
      ) : (
        <>
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5">
              <HiOutlineExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Section title="About" icon={HiOutlineUser}>
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
                        className={`${inputClass} min-h-[120px] resize-none`}
                        placeholder="Tell us about yourself..."
                      />
                    </Field>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile?.location && (
                      <p className={`flex items-center gap-2 text-sm ${muted}`}>
                        <HiOutlineMapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        {profile.location}
                      </p>
                    )}
                    <p className={`whitespace-pre-wrap leading-relaxed ${muted}`}>
                      {profile?.bio || 'No bio provided yet.'}
                    </p>
                    {profile?.years_experience != null && (
                      <p className={`flex items-center gap-2 text-sm ${muted}`}>
                        <HiOutlineBriefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        {profile.years_experience} {profile.years_experience === 1 ? 'year' : 'years'} of experience
                      </p>
                    )}
                  </div>
                )}
              </Section>

              <Section title="Links" icon={FaGlobe} delay={0.05}>
                {isEditing ? (
                  <div className="space-y-4">
                    <Field label="GitHub">
                      <input type="url" value={form.github_url} onChange={set('github_url')} className={inputClass} placeholder="https://github.com/you" />
                    </Field>
                    <Field label="LinkedIn">
                      <input type="url" value={form.linkedin_url} onChange={set('linkedin_url')} className={inputClass} placeholder="https://linkedin.com/in/you" />
                    </Field>
                    <Field label="Portfolio">
                      <input type="url" value={form.portfolio_url} onChange={set('portfolio_url')} className={inputClass} placeholder="https://your-site.dev" />
                    </Field>
                  </div>
                ) : links.some((l) => l.url) ? (
                  <div className="flex flex-wrap gap-3">
                    {links.filter((l) => l.url).map(({ key, label, Icon, url }) => (
                      <a
                        key={key}
                        href={withHttps(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:border-emerald-500 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300 ${focusRing}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${muted}`}>No links added yet.</p>
                )}
              </Section>

              <Section title="Skills & interests" icon={HiOutlineSparkles} delay={0.1}>
                {isEditing ? (
                  <div className="space-y-4">
                    <Field label="Skills">
                      <TagInput value={form.skills} onChange={setList('skills')} placeholder="Type a skill and press Enter" />
                    </Field>
                    <Field label="Interests">
                      <TagInput value={form.interests} onChange={setList('interests')} placeholder="Type an interest and press Enter" />
                    </Field>
                    <Field label="Desired roles">
                      <TagInput value={form.desired_roles} onChange={setList('desired_roles')} placeholder="Type a role and press Enter" max={10} />
                    </Field>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: 'Skills', items: profile?.skills },
                      { label: 'Interests', items: profile?.interests },
                      { label: 'Desired roles', items: profile?.desired_roles },
                    ].map(({ label, items }) => (
                      <div key={label}>
                        <span className={labelClass}>{label}</span>
                        {Array.isArray(items) && items.length ? (
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <span key={item} className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">{item}</span>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-sm ${muted}`}>None added yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Experience" icon={HiOutlineBriefcase} delay={0.15}>
                {isEditing ? (
                  <EntryEditor
                    items={form.experience}
                    onChange={setList('experience')}
                    fields={EXPERIENCE_FIELDS}
                    emptyEntry={EMPTY_EXPERIENCE}
                    addLabel="Add experience"
                  />
                ) : Array.isArray(profile?.experience) && profile.experience.length ? (
                  <ul className="space-y-4">
                    {profile.experience.map((entry, i) => (
                      <li key={i} className="border-l-2 border-emerald-500/40 pl-4">
                        <p className="font-semibold">{entry.title}{entry.company ? ` · ${entry.company}` : ''}</p>
                        <p className={`text-xs ${muted}`}>{[entry.start, entry.end].filter(Boolean).join(' – ')}</p>
                        {entry.description && <p className={`mt-1 text-sm ${muted}`}>{entry.description}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm ${muted}`}>No experience added yet.</p>
                )}
              </Section>

              <Section title="Education" icon={HiOutlineAcademicCap} delay={0.2}>
                {isEditing ? (
                  <EntryEditor
                    items={form.education}
                    onChange={setList('education')}
                    fields={EDUCATION_FIELDS}
                    emptyEntry={EMPTY_EDUCATION}
                    addLabel="Add education"
                  />
                ) : Array.isArray(profile?.education) && profile.education.length ? (
                  <ul className="space-y-4">
                    {profile.education.map((entry, i) => (
                      <li key={i} className="border-l-2 border-emerald-500/40 pl-4">
                        <p className="font-semibold">{entry.school}</p>
                        <p className={`text-sm ${muted}`}>{[entry.degree, entry.year].filter(Boolean).join(' · ')}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm ${muted}`}>No education added yet.</p>
                )}
              </Section>
            </div>

            <div className="space-y-6">
              <Section title="Contact" icon={HiOutlineUser}>
                <div className="space-y-5">
                  <Field label="Phone">
                    {isEditing ? (
                      <input value={form.phone} onChange={set('phone')} className={inputClass} placeholder="+1 234 567 890" maxLength={20} />
                    ) : (
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <HiOutlinePhone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        {profile?.phone || 'Not provided'}
                      </p>
                    )}
                  </Field>
                  <Field label="Email">
                    <p className="flex items-center gap-2 text-sm font-medium break-all">
                      <HiOutlineEnvelope className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      {user?.email}
                    </p>
                  </Field>
                </div>
              </Section>

              <Section title="Visibility" icon={HiOutlineEye} delay={0.05}>
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
                      <HiOutlineBriefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      {profile?.open_to_work ? 'Open to work' : 'Not open to work'}
                    </p>
                    <p className="flex items-center gap-2">
                      {profile?.is_public ? (
                        <HiOutlineEye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <HiOutlineEyeSlash className={`h-4 w-4 ${muted}`} aria-hidden="true" />
                      )}
                      {profile?.is_public ? 'Visible to recruiters' : 'Hidden from recruiters'}
                    </p>
                  </div>
                )}
              </Section>

              <Section title="Activity" icon={HiOutlineCalendarDays} delay={0.1}>
                <div className="space-y-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className={muted}>Last updated</span>
                    <span className="font-semibold">{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className={muted}>Member since</span>
                    <span className="font-semibold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </Section>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 lg:p-6 dark:border-emerald-500/20 dark:bg-emerald-500/5"
              >
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <HiOutlineShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  Account
                </h3>
                <p className={`text-sm leading-relaxed ${muted}`}>
                  Your profile information is used across the platform for applications, interviews, and communications.
                </p>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
