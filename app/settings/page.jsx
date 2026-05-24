'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutGroup } from 'motion/react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ThemeToggle from '@/components/layout/ThemeToggle';
import SettingsSkeleton from '@/components/skeletons/settings/SettingsSkeleton';
import { badge, cardPadded, dangerButton, iconTile, secondaryButton } from '@/components/ui/styles';
import {
  HiOutlineUserCircle,
  HiOutlineEnvelope,
  HiOutlineCog6Tooth,
  HiOutlineSwatch,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

// Profile page for each role. Staff accounts have no personal profile, so no link is shown for them.
const PROFILE_HREF = {
  CANDIDATE: '/candidate/profile',
  RECRUITER: '/recruiter/profile',
};

const ROLE_LABEL = { CANDIDATE: 'Candidate', RECRUITER: 'Recruiter', STAFF: 'Staff' };

const rowClass = 'flex flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between';

function SectionTitle({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}

function RowText({ icon: Icon, title, description }) {
  return (
    <div className="flex min-w-0 items-start gap-3 sm:pr-4">
      <span className={`${iconTile} mt-0.5 h-8 w-8 bg-muted text-muted-foreground`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const profileHref = PROFILE_HREF[user?.role];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Deletes the signed-in account (DELETE /accounts/profiles/me/), then signs out.
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete('/accounts/profiles/me/');
      logout(); // clears token + user and routes to /auth/login
    } catch (err) {
      setDeleteError(err?.message || 'Could not delete your account. Please try again.');
      setDeleting(false);
    }
  };

  if (authLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6 px-4 pb-16 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        icon={HiOutlineCog6Tooth}
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, appearance, and account."
        meta={
          user && (
            <>
              {ROLE_LABEL[user.role] && (
                <span className={`${badge} bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300`}>
                  <HiOutlineUserCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {ROLE_LABEL[user.role]}
                </span>
              )}
              {user.email && (
                <span className={`${badge} bg-muted text-muted-foreground`}>
                  <HiOutlineEnvelope className="h-3.5 w-3.5" aria-hidden="true" />
                  {user.email}
                </span>
              )}
            </>
          )
        }
      />

      <section className={`${cardPadded} space-y-6`}>
        <SectionTitle icon={HiOutlineUserCircle} title="Preferences" text="Tailor how DeepScreen looks for you." />
        <div className="space-y-5">
          {profileHref && (
            <div className={rowClass}>
              <RowText icon={HiOutlineUserCircle} title="Your profile" description="Edit your details, links, skills, and visibility." />
              <Link href={profileHref} className={`${secondaryButton} shrink-0`}>
                Open profile <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          <div className={rowClass}>
            <RowText icon={HiOutlineSwatch} title="Interface theme" description="Applies right away and is remembered on this device." />
            {/* Own layout group so its sliding thumb doesn't animate across to the sidebar's toggle. */}
            <LayoutGroup id="settings-theme">
              <ThemeToggle />
            </LayoutGroup>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-red-200 bg-red-50/60 p-5 lg:p-6 dark:border-red-500/20 dark:bg-red-500/5">
        <div className="flex items-start gap-3">
          <span className={`${iconTile} h-8 w-8 bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400`}>
            <HiOutlineExclamationTriangle className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-red-800 dark:text-red-300">Danger zone</h2>
            <p className="max-w-prose text-sm text-red-700/80 dark:text-red-300/70">
              Permanently delete your profile along with your application history. This cannot be undone.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => { setDeleteError(''); setConfirmDelete(true); }} className={dangerButton}>
          <HiOutlineTrash className="h-4 w-4" aria-hidden="true" /> Delete account
        </button>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        description="Your profile and application history will be permanently removed. This cannot be undone."
        confirmLabel="Delete account"
        confirmClassName={dangerButton}
        busy={deleting}
        error={deleteError}
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
