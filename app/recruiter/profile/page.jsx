'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import ErrorState from '@/components/dashboard/ErrorState';
import RecruiterProfileSkeleton from '@/components/skeletons/recruiter/RecruiterProfileSkeleton';
import TagInput from '@/components/profile/TagInput';
import FormError from '@/components/auth/FormError';
import { TextField, TextAreaField, ToggleField } from '@/components/forms/FormFields';
import {
  HiOutlineUserCircle, HiOutlineBriefcase, HiOutlineUser, HiOutlineEnvelope,
  HiOutlineCalendarDays, HiOutlineBellAlert, HiOutlinePencilSquare, HiOutlineCheck,
  HiOutlineXMark, HiOutlinePhone, HiOutlineBuildingOffice2, HiOutlineClock,
  HiOutlineLink, HiOutlineArrowPath, HiOutlineCheckCircle, HiOutlineMinusCircle,
} from 'react-icons/hi2';
import { base, fadeUp } from '@/constants/motion';
import { badge, card, focusRing, iconTile, primaryButton as buttonPrimary, secondaryButton as buttonSecondary } from '@/components/ui/styles';

const EMPTY_RECRUITER = {
  job_title: '',
  department: '',
  hiring_focus: [],
  timezone: '',
  calendar_link: '',
  notify_new_applications: false,
  notify_interview_feedback: false,
};

const labelClass = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

// Form state mirrors the profile payload; `profileToForm` and `formToPayload` convert between the two.
const profileToForm = (p) => ({
  first_name: p.first_name || '',
  last_name: p.last_name || '',
  phone: p.phone || '',
  bio: p.bio || '',
  recruiter: { ...EMPTY_RECRUITER, ...(p.recruiter_profile || {}) },
});

const formToPayload = (f) => {
  const trim = (v) => (typeof v === 'string' ? v.trim() : v);
  return {
    first_name: trim(f.first_name),
    last_name: trim(f.last_name),
    phone: trim(f.phone),
    bio: trim(f.bio),
    recruiter_profile: {
      job_title: trim(f.recruiter.job_title),
      department: trim(f.recruiter.department),
      hiring_focus: f.recruiter.hiring_focus,
      timezone: trim(f.recruiter.timezone),
      calendar_link: trim(f.recruiter.calendar_link),
      notify_new_applications: !!f.recruiter.notify_new_applications,
      notify_interview_feedback: !!f.recruiter.notify_interview_feedback,
    },
  };
};

// Emerald card shell used by every section on this page.
function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.section
      {...fadeUp}
      transition={{ ...base, delay }}
      className={`${card} min-w-0 p-5 lg:p-6`}
    >
      <h2 className="mb-5 flex items-center gap-3 text-base font-semibold">
        <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function ReadRow({ label, value }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <p className="text-sm font-medium break-words">{value || <span className="text-muted-foreground/60">—</span>}</p>
    </div>
  );
}

export default function RecruiterProfilePage() {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const data = await api.get('/accounts/profiles/me/');
        if (!cancelled) {
          setProfile(data);
          setForm(profileToForm(data));
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        if (!cancelled) setError(err?.message || 'Could not load your profile. Check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (user) fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user, attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  const handleSave = async () => {
    const link = form.recruiter.calendar_link.trim();
    if (link && !link.startsWith('https://')) {
      setError('Calendar link must start with https://');
      return;
    }
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

  const setPersonal = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setRecruiter = (key, value) => setForm({ ...form, recruiter: { ...form.recruiter, [key]: value } });
  const recruiterInput = (key) => (e) => setRecruiter(key, e.target.value);

  const ready = !loading && !!form;
  const r = profile?.recruiter_profile || {};
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  const initials = fullName ? fullName.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : null;

  if (!authLoading && !user) {
    return (
      <div className="w-full min-w-0 space-y-4 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <ErrorState title="You're signed out" message="Sign in again to view and edit your profile." />
        <Link href="/auth/login" className={buttonPrimary}>
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <RecruiterProfileSkeleton />
      </div>
    );
  }

  const editActions = isEditing ? (
    <>
      <button type="button" onClick={handleCancel} disabled={saving} className={buttonSecondary}>
        <HiOutlineXMark className="h-4 w-4" aria-hidden="true" /> Cancel
      </button>
      <button type="button" onClick={handleSave} disabled={saving} className={buttonPrimary}>
        {saving ? (
          <HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />
        )}
        {saving ? 'Saving...' : 'Save'}
      </button>
    </>
  ) : (
    <button type="button" onClick={() => setIsEditing(true)} className={buttonSecondary}>
      <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" /> Edit
    </button>
  );

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        icon={HiOutlineUserCircle}
        eyebrow="Recruiter profile"
        title={fullName || 'Your profile'}
        description="Candidates see your job title and calendar link when they book interviews. Keep them current."
        actions={ready && editActions}
      />

      {!form && <ErrorState title="Could not load your profile" message={error} onRetry={retry} />}

      {ready && (
        <>
          <FormError title="Could not save" message={error} onDismiss={() => setError('')} />

          <div className="grid gap-6 lg:grid-cols-12">
            <motion.aside
              {...fadeUp}
              transition={base}
              className={`${card} min-w-0 self-start overflow-hidden lg:sticky lg:top-6 lg:col-span-4 2xl:col-span-3`}
            >
              <div className="flex flex-col items-center gap-3 border-b border-emerald-100 bg-emerald-50/60 px-5 py-6 text-center dark:border-white/10 dark:bg-white/5">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-card text-2xl font-semibold text-emerald-700 dark:border-white/10 dark:text-emerald-400">
                  {initials || <HiOutlineUser className="h-9 w-9" aria-hidden="true" />}
                </span>
                <div className="min-w-0 space-y-1">
                  {fullName && <p className="break-words text-lg font-semibold">{fullName}</p>}
                  {r.job_title && (
                    <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                      <HiOutlineBriefcase className="h-4 w-4 shrink-0" aria-hidden="true" /> {r.job_title}
                    </p>
                  )}
                  <span className={`${badge} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`}>
                    <HiOutlineBriefcase className="h-3.5 w-3.5" aria-hidden="true" /> Recruiter
                  </span>
                </div>
              </div>
              <dl className="divide-y divide-emerald-100 text-sm dark:divide-white/10">
                {[
                  { icon: HiOutlineEnvelope, label: 'Email', value: user?.email },
                  { icon: HiOutlinePhone, label: 'Phone', value: profile?.phone },
                  { icon: HiOutlineBuildingOffice2, label: 'Department', value: r.department },
                  { icon: HiOutlineClock, label: 'Timezone', value: r.timezone },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-5 py-3">
                    <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <dt className="sr-only">{label}</dt>
                    <dd className="min-w-0 break-all">{value || <span className="text-muted-foreground/60">—</span>}</dd>
                  </div>
                ))}
              </dl>
            </motion.aside>

            <div className="grid min-w-0 gap-6 lg:col-span-8 xl:grid-cols-2 2xl:col-span-9">
            <Section title="Personal details" icon={HiOutlineUser}>
              {isEditing ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField id="first_name" label="First name" value={form.first_name} onChange={setPersonal('first_name')} maxLength={80} />
                    <TextField id="last_name" label="Last name" value={form.last_name} onChange={setPersonal('last_name')} maxLength={80} />
                  </div>
                  <TextField id="phone" label="Phone" icon={HiOutlinePhone} value={form.phone} onChange={setPersonal('phone')} placeholder="+1 234 567 890" maxLength={20} />
                  <TextAreaField id="bio" label="Bio" value={form.bio} onChange={setPersonal('bio')} rows={4} maxLength={1000} />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReadRow label="First name" value={profile?.first_name} />
                    <ReadRow label="Last name" value={profile?.last_name} />
                  </div>
                  <ReadRow label="Phone" value={profile?.phone} />
                  <ReadRow label="Bio" value={profile?.bio} />
                </div>
              )}
              <div className="mt-5">
                <span className={labelClass}>Email</span>
                <p className="flex items-center gap-2 break-all text-sm font-medium">
                  <HiOutlineEnvelope className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  {user?.email}
                </p>
              </div>
            </Section>

            <Section title="Role and hiring" icon={HiOutlineBuildingOffice2} delay={0.05}>
              {isEditing ? (
                <div className="space-y-5">
                  <TextField id="job_title" label="Job title" value={form.recruiter.job_title} onChange={recruiterInput('job_title')} maxLength={120} placeholder="Senior Technical Recruiter" />
                  <TextField id="department" label="Department" value={form.recruiter.department} onChange={recruiterInput('department')} maxLength={120} placeholder="Talent Acquisition" />
                  <div>
                    <span className={labelClass}>Hiring focus</span>
                    <TagInput
                      value={form.recruiter.hiring_focus}
                      onChange={(v) => setRecruiter('hiring_focus', v)}
                      placeholder="Add a role or skill and press Enter"
                      max={10}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <ReadRow label="Job title" value={r.job_title} />
                  <ReadRow label="Department" value={r.department} />
                  <div>
                    <span className={labelClass}>Hiring focus</span>
                    {Array.isArray(r.hiring_focus) && r.hiring_focus.length ? (
                      <div className="flex flex-wrap gap-2">
                        {r.hiring_focus.map((tag) => (
                          <span key={tag} className="rounded-sm bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">{tag}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium"><span className="text-muted-foreground/60">—</span></p>
                    )}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Scheduling" icon={HiOutlineCalendarDays} delay={0.1}>
              {isEditing ? (
                <div className="space-y-5">
                  <TextField
                    id="timezone"
                    label="Timezone"
                    icon={HiOutlineClock}
                    hint="For example Asia/Karachi"
                    value={form.recruiter.timezone}
                    onChange={recruiterInput('timezone')}
                    maxLength={64}
                  />
                  <TextField
                    id="calendar_link"
                    label="Calendar link"
                    icon={HiOutlineLink}
                    hint="Candidates use this to book time with you"
                    type="url"
                    placeholder="https://cal.example.com/you"
                    value={form.recruiter.calendar_link}
                    onChange={recruiterInput('calendar_link')}
                    maxLength={300}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  <ReadRow label="Timezone" value={r.timezone} />
                  <div>
                    <span className={labelClass}>Calendar link</span>
                    {r.calendar_link ? (
                      <a
                        href={r.calendar_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex min-h-11 items-center break-all rounded-sm text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400 ${focusRing}`}
                      >
                        {r.calendar_link}
                      </a>
                    ) : (
                      <p className="text-sm font-medium"><span className="text-muted-foreground/60">—</span></p>
                    )}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Notifications" icon={HiOutlineBellAlert} delay={0.15}>
              {isEditing ? (
                <div className="space-y-3">
                  <ToggleField
                    id="notify_new_applications"
                    label="New applications"
                    hint="Email me when a candidate applies to one of my jobs"
                    checked={form.recruiter.notify_new_applications}
                    onChange={(v) => setRecruiter('notify_new_applications', v)}
                  />
                  <ToggleField
                    id="notify_interview_feedback"
                    label="Interview feedback"
                    hint="Email me when feedback is submitted after an interview"
                    checked={form.recruiter.notify_interview_feedback}
                    onChange={(v) => setRecruiter('notify_interview_feedback', v)}
                  />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-2">
                    {r.notify_new_applications
                      ? <HiOutlineCheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      : <HiOutlineMinusCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    {r.notify_new_applications ? 'Notified about new applications' : 'New application alerts off'}
                  </p>
                  <p className="flex items-center gap-2">
                    {r.notify_interview_feedback
                      ? <HiOutlineCheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      : <HiOutlineMinusCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    {r.notify_interview_feedback ? 'Notified about interview feedback' : 'Interview feedback alerts off'}
                  </p>
                </div>
              )}
            </Section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
