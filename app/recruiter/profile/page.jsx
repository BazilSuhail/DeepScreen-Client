'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import TagInput from '@/components/profile/TagInput';
import FormError from '@/components/auth/FormError';
import { TextField, TextAreaField, ToggleField } from '@/components/forms/FormFields';
import {
  HiOutlineUserCircle, HiOutlineBriefcase, HiOutlineUser, HiOutlineEnvelope,
  HiOutlineCalendarDays, HiOutlineBellAlert, HiOutlinePencilSquare, HiOutlineCheck,
  HiOutlineXMark, HiOutlinePhone, HiOutlineBuildingOffice2, HiOutlineClock,
  HiOutlineLink, HiOutlineSparkles,
} from 'react-icons/hi2';

const EMPTY_RECRUITER = {
  job_title: '',
  department: '',
  hiring_focus: [],
  timezone: '',
  calendar_link: '',
  notify_new_applications: false,
  notify_interview_feedback: false,
};

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none text-sm';
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

function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-border bg-card p-6 lg:p-8"
    >
      <h3 className="mb-5 flex items-center gap-2 text-base font-semibold">
        <Icon className="h-4 w-4 text-emerald-500" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function ReadRow({ label, value }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <p className="text-sm font-medium break-words">{value || 'Not provided'}</p>
    </div>
  );
}

export default function RecruiterProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/accounts/profiles/me/');
        setProfile(data);
        setForm(profileToForm(data));
      } catch (err) {
        console.error('Failed to fetch profile', err);
        setError(err?.message || 'Could not load your profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

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

  if (loading || !form) return <PageSkeleton stats={0} cards={3} />;

  const r = profile?.recruiter_profile || {};
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-6 lg:px-8">
      <DashboardBanner
        icon={HiOutlineUserCircle}
        badge={{ label: 'Recruiter', icon: HiOutlineBriefcase }}
        title={fullName || 'Your profile'}
        subtitle={
          <span className="flex min-w-0 items-center gap-2">
            <HiOutlineBriefcase className="h-4 w-4 shrink-0" aria-hidden="true" /> {r.job_title || 'Add your job title'}
          </span>
        }
        footer="Candidates see your job title and calendar link when they book interviews. Keep them current."
      />

      <div className="flex justify-end">
        {isEditing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary/50 disabled:opacity-50"
            >
              <HiOutlineXMark className="h-4 w-4" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-400 disabled:opacity-50"
            >
              <HiOutlineCheck className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary/50"
          >
            <HiOutlinePencilSquare className="h-4 w-4" /> Edit
          </button>
        )}
      </div>

      <FormError title="Could not save" message={error} onDismiss={() => setError('')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            <p className="flex items-center gap-2 text-sm font-medium">
              <HiOutlineEnvelope className="h-4 w-4 text-emerald-500" aria-hidden="true" />
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
                {r.hiring_focus?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {r.hiring_focus.map((tag) => (
                      <span key={tag} className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">{tag}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium">Not provided</p>
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
                  <a href={r.calendar_link} target="_blank" rel="noopener noreferrer" className="break-all text-sm font-medium text-emerald-500 hover:underline">
                    {r.calendar_link}
                  </a>
                ) : (
                  <p className="text-sm font-medium">Not provided</p>
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
                <HiOutlineSparkles className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                {r.notify_new_applications ? 'Notified about new applications' : 'New application alerts off'}
              </p>
              <p className="flex items-center gap-2">
                <HiOutlineSparkles className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                {r.notify_interview_feedback ? 'Notified about interview feedback' : 'Interview feedback alerts off'}
              </p>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
