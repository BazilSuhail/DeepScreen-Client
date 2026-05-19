"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineLockClosed,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);

  // Form states matching standard setting configurations
  const [accountSettings, setAccountSettings] = useState({
    language: "en",
    theme: "dark",
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

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Replace with your real settings update endpoint
      // await api.put("/accounts/settings/me/", accountSettings);
      alert("Settings updated successfully!");
    } catch (err) {
      console.error("Failed to update settings", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "account", name: "Account", icon: HiOutlineUser },
    { id: "notifications", name: "Notifications", icon: HiOutlineBell },
    { id: "security", name: "Security & Privacy", icon: HiOutlineShieldCheck },
  ];

  return (
    <div className="w-full px-4 md:px-6 space-y-10 pb-12">
      {/* Header Banner */}
      <div className="w-full relative overflow-hidden bg-slate-900 rounded-2xl p-8 lg:p-10 text-white min-h-[140px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 400" className="w-full h-full rotate-45">
            <path d="M0 0 L400 0 L400 400 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-slate-400 max-w-md">
            Manage your account preferences, system configurations, and security
            credentials.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 lg:border-r border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap lg:w-full ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500 lg:translate-x-1"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-emerald-500" : ""}`}
                />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Configurations Dynamic Panel */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-border bg-card p-6 lg:p-8 space-y-8"
              >
                <div>
                  <h3 className="font-bold text-lg mb-1">Preferences</h3>
                  <p className="text-xs text-muted-foreground">
                    Tailor your app layout experience.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Theme Select */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {accountSettings.theme === "dark" ? (
                          <HiOutlineMoon />
                        ) : (
                          <HiOutlineSun />
                        )}
                        Interface Theme
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Select how the interface appears to you.
                      </p>
                    </div>
                    <select
                      value={accountSettings.theme}
                      onChange={(e) =>
                        handleSelectChange("theme", e.target.value)
                      }
                      className="px-4 py-2 rounded-xl bg-secondary border border-border outline-none text-sm font-medium focus:border-emerald-500"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  {/* Language Select */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">Display Language</p>
                      <p className="text-xs text-muted-foreground">
                        Changes the default language of your core portal UI.
                      </p>
                    </div>
                    <select
                      value={accountSettings.language}
                      onChange={(e) =>
                        handleSelectChange("language", e.target.value)
                      }
                      className="px-4 py-2 rounded-xl bg-secondary border border-border outline-none text-sm font-medium focus:border-emerald-500"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-border bg-card p-6 lg:p-8 space-y-8"
              >
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    Notification Configurations
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Control when and how you want to be contacted.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Marketing Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-sm font-semibold">
                        Marketing & Features
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Receive periodic digests, tips, and platform updates.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("marketingEmails")}
                      className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                        accountSettings.marketingEmails
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          accountSettings.marketingEmails
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Security Alert Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-sm font-semibold">Security Alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Get alerted instantly about new logins or profile
                        changes.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("securityAlerts")}
                      className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                        accountSettings.securityAlerts
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          accountSettings.securityAlerts
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Credentials Panel */}
                <div className="rounded-xl border border-border bg-card p-6 lg:p-8 space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <HiOutlineLockClosed className="text-emerald-500" />{" "}
                    Security Safeguards
                  </h3>

                  {/* 2FA Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-sm font-semibold">
                        Two-Factor Authentication (2FA)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Secure your account access with multi-layered code
                        validation.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("twoFactor")}
                      className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                        accountSettings.twoFactor
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          accountSettings.twoFactor
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 lg:p-8 space-y-6">
                  <div className="flex items-center gap-2 text-rose-500">
                    <HiOutlineExclamationTriangle className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Danger Zone</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    Permanently delete your profile data along with all
                    application histories. This action is definitive and
                    non-reversible.
                  </p>
                  <button className="px-4 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs transition-all flex items-center gap-2 border border-rose-600/20">
                    <HiOutlineTrash className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Trigger Row */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              disabled={loading}
              onClick={handleSaveChanges}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white" />
              ) : (
                <HiOutlineCheck className="w-4 h-4" />
              )}
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
