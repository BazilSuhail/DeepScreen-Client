'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import {
  HiOutlineUser,
  HiOutlineUserCircle,
  HiOutlineBell,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineCheck,
  HiOutlineCog6Tooth,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineLanguage,
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

// Profile page for each role. Staff accounts have no personal profile, so no link is shown for them.
const PROFILE_HREF = {
  CANDIDATE: '/candidate/profile',
  RECRUITER: '/recruiter/profile',
};

const cardClass = 'rounded-xl border border-border bg-card p-5 lg:p-6 space-y-6';
const rowClass = 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-secondary/30 p-4';
const selectClass = 'px-4 py-2 rounded-xl bg-secondary border border-border outline-none text-sm font-medium focus:border-emerald-500';

function RowText({ icon: Icon, title, description }) {
  return (
    <div className="flex min-w-0 items-start gap-3 pr-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
        <Icon className="h-4 w-4 text-emerald-500" aria-hidden="true" />
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-muted'}`}
    >
      <span
        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

const TABS = [
  { id: 'account', name: 'Account', icon: HiOutlineUser },
  { id: 'notifications', name: 'Notifications', icon: HiOutlineBell },
  { id: 'security', name: 'Security & Privacy', icon: HiOutlineShieldCheck },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const profileHref = PROFILE_HREF[user?.role];
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Form states matching standard setting configurations
  const [accountSettings, setAccountSettings] = useState({
    language: 'en',
    theme: 'dark',
    marketingEmails: true,
    securityAlerts: true,
    twoFactor: false,
  });

  const handleToggle = (key) => {
    setAccountSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (key, value) => {
    setAccountSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Deletes the signed-in account (DELETE /accounts/profiles/me/), then signs out.
  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    try {
      await api.delete('/accounts/profiles/me/');
      localStorage.removeItem('access_token');
      window.location.href = '/auth/login';
    } catch (err) {
      alert(err?.message || 'Could not delete your account. Please try again.');
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Replace with your real settings update endpoint
      // await api.put("/accounts/settings/me/", accountSettings);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 px-4 pb-16 md:px-6 lg:px-8">
      <DashboardBanner
        icon={HiOutlineCog6Tooth}
        badge={{ label: 'Account', icon: HiOutlineUserCircle }}
        title="Settings"
        subtitle="Manage your account preferences, notifications, and security."
        footer="Changes to your profile are made on your profile page. Save configuration here after changing preferences."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
        {/* Tabs */}
        <div className="flex flex-row gap-1 overflow-x-auto border-b border-border pb-2 scrollbar-none lg:col-span-1 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-all lg:w-full ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500 lg:translate-x-1'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-500' : ''}`} aria-hidden="true" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="space-y-6 lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cardClass}
              >
                <div>
                  <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold">
                    <HiOutlineUserCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    Preferences
                  </h3>
                  <p className="text-xs text-muted-foreground">Tailor your app layout experience.</p>
                </div>

                <div className="space-y-6">
                  {profileHref && (
                    <div className={rowClass}>
                      <RowText icon={HiOutlineUserCircle} title="Your profile" description="Edit your details, links, skills, and visibility." />
                      <Link
                        href={profileHref}
                        className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-semibold transition-colors hover:border-emerald-500/50 hover:text-emerald-500"
                      >
                        Open profile <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  )}

                  <div className={rowClass}>
                    <RowText
                      icon={accountSettings.theme === 'light' ? HiOutlineSun : HiOutlineMoon}
                      title="Interface Theme"
                      description="Select how the interface appears to you."
                    />
                    <select
                      value={accountSettings.theme}
                      onChange={(e) => handleSelectChange('theme', e.target.value)}
                      className={selectClass}
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  <div className={rowClass}>
                    <RowText icon={HiOutlineLanguage} title="Display Language" description="Changes the default language of your core portal UI." />
                    <select
                      value={accountSettings.language}
                      onChange={(e) => handleSelectChange('language', e.target.value)}
                      className={selectClass}
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cardClass}
              >
                <div>
                  <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold">
                    <HiOutlineBell className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    Notification Configurations
                  </h3>
                  <p className="text-xs text-muted-foreground">Control when and how you want to be contacted.</p>
                </div>

                <div className="space-y-4">
                  <div className={`${rowClass} sm:items-center`}>
                    <RowText icon={HiOutlineEnvelope} title="Marketing & Features" description="Receive periodic digests, tips, and platform updates." />
                    <ToggleSwitch
                      label="Marketing and feature emails"
                      checked={accountSettings.marketingEmails}
                      onChange={() => handleToggle('marketingEmails')}
                    />
                  </div>

                  <div className={`${rowClass} sm:items-center`}>
                    <RowText icon={HiOutlineShieldExclamation} title="Security Alerts" description="Get alerted instantly about new logins or profile changes." />
                    <ToggleSwitch
                      label="Security alerts"
                      checked={accountSettings.securityAlerts}
                      onChange={() => handleToggle('securityAlerts')}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className={cardClass}>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <HiOutlineLockClosed className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    Security Safeguards
                  </h3>

                  <div className={`${rowClass} sm:items-center`}>
                    <RowText
                      icon={HiOutlineKey}
                      title="Two-Factor Authentication (2FA)"
                      description="Secure your account access with multi-layered code validation."
                    />
                    <ToggleSwitch
                      label="Two-factor authentication"
                      checked={accountSettings.twoFactor}
                      onChange={() => handleToggle('twoFactor')}
                    />
                  </div>
                </div>

                <div className="space-y-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 lg:p-6">
                  <div className="flex items-center gap-2 text-rose-500">
                    <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
                    <h3 className="text-lg font-semibold">Danger Zone</h3>
                  </div>
                  <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                    Permanently delete your profile data along with all application histories. This action is definitive and non-reversible.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 rounded-xl border border-rose-600/20 bg-rose-600/10 px-4 py-2.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-600 hover:text-white"
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" /> Delete Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              disabled={loading}
              onClick={handleSaveChanges}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-t-2 border-white" />
              ) : (
                <HiOutlineCheck className="h-4 w-4" aria-hidden="true" />
              )}
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
