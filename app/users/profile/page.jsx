'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';
import {
  HiOutlinePencilSquare, HiOutlineCheck, HiOutlineXMark,
  HiOutlineGlobeAlt, HiOutlineEnvelope, HiOutlinePhone,
  HiOutlineUser, HiOutlineSparkles, HiOutlineCalendarDays,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';

export default function ProfilePage() {
  const { user } = useAuth();
  const role = user?.role || 'CANDIDATE';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', bio: '', phone: '', extra_data: {}
  });
  const [newLink, setNewLink] = useState({ key: '', value: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/accounts/profiles/me/');
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          extra_data: data.extra_data || {}
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      const data = await api.put('/accounts/profiles/me/', formData);
      setProfile(data);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save profile');
    }
  };

  const addLink = () => {
    if (newLink.key && newLink.value) {
      setFormData({
        ...formData,
        extra_data: { ...formData.extra_data, [newLink.key]: newLink.value }
      });
      setNewLink({ key: '', value: '' });
    }
  };

  const removeLink = (key) => {
    const updated = { ...formData.extra_data };
    delete updated[key];
    setFormData({ ...formData, extra_data: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-10 pb-12">
      {/* Hero Banner */}
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-[70%] relative overflow-hidden bg-slate-900 rounded-2xl p-8 lg:p-10 text-white min-h-[200px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <svg viewBox="0 0 400 400" className="w-full h-full rotate-12">
                <path d="M0 0 L400 0 L400 400 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl bg-white/10 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                {user?.google_picture ? (
                  <img src={user.google_picture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl lg:text-4xl font-bold text-emerald-400">
                    {user?.email?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div className="space-y-2 min-w-0">
                <h1 className="text-2xl lg:text-4xl font-bold tracking-tight leading-[1.1]">
                  {profile?.first_name || profile?.last_name
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`
                    : 'Your Profile'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineEnvelope className="w-4 h-4" />
                    {user?.email}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    {role}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex justify-end">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 backdrop-blur-sm"
                  >
                    <HiOutlineXMark className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <HiOutlineCheck className="w-4 h-4" /> Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 backdrop-blur-sm"
                >
                  <HiOutlinePencilSquare className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
          </div>

          <div className="lg:w-[30%] bg-emerald-500 rounded-2xl p-8 text-white flex flex-col justify-between shadow-xl shadow-emerald-500/20 dark:shadow-emerald-500/10">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <HiOutlineSparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                {profile?.updated_at ? 'Active' : 'New'}
              </span>
            </div>
            <div>
              <p className="text-5xl font-bold mb-1">
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString().slice(0, 2) : '--'}
              </p>
              <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest">
                {profile?.updated_at ? `Updated ${new Date(profile.updated_at).toLocaleDateString()}` : 'Complete Your Profile'}
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Me */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-8"
          >
            <h3 className="font-bold text-lg mb-6">About Me</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none text-sm"
                    placeholder="First Name"
                  />
                  <input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none text-sm"
                    placeholder="Last Name"
                  />
                </div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none min-h-[120px] resize-none text-sm"
                  placeholder="Tell us about yourself..."
                />
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile?.bio || 'No bio provided yet.'}
              </p>
            )}
          </motion.div>

          {/* Links & Portfolio */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-border bg-card p-8"
          >
            <h3 className="font-bold text-lg mb-6">Links & Portfolio</h3>
            {Object.entries(isEditing ? formData.extra_data : (profile?.extra_data || {})).length === 0 && !isEditing ? (
              <p className="text-muted-foreground text-sm">No links added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(isEditing ? formData.extra_data : (profile?.extra_data || {})).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 text-sm font-medium group">
                    <HiOutlineGlobeAlt className="w-4 h-4" />
                    <span className="capitalize">{key}:</span>
                    <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">{value}</a>
                    {isEditing && (
                      <button onClick={() => removeLink(key)} className="ml-1 hover:text-red-500 transition-colors">
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isEditing && (
              <div className="flex gap-2 items-center mt-6 pt-6 border-t border-border">
                <input
                  placeholder="Label (e.g. LinkedIn)"
                  value={newLink.key}
                  onChange={(e) => setNewLink({...newLink, key: e.target.value})}
                  className="w-1/3 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none text-sm"
                />
                <input
                  placeholder="URL"
                  value={newLink.value}
                  onChange={(e) => setNewLink({...newLink, value: e.target.value})}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none text-sm"
                />
                <button
                  onClick={addLink}
                  className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                >
                  <HiOutlineCheck className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-8"
          >
            <h3 className="font-bold text-base mb-6 flex items-center gap-2">
              <HiOutlineUser className="w-4 h-4 text-emerald-500" />
              Contact Info
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Phone</label>
                {isEditing ? (
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none text-sm"
                    placeholder="+1 234 567 890"
                  />
                ) : (
                  <p className="font-medium text-sm flex items-center gap-2">
                    <HiOutlinePhone className="w-4 h-4 text-emerald-500" />
                    {profile?.phone || 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Email</label>
                <p className="font-medium text-sm flex items-center gap-2">
                  <HiOutlineEnvelope className="w-4 h-4 text-emerald-500" />
                  {user?.email}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-8"
          >
            <h3 className="font-bold text-base mb-6 flex items-center gap-2">
              <HiOutlineCalendarDays className="w-4 h-4 text-emerald-500" />
              Activity
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-bold">{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-bold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base">Account</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your profile information is used across the platform for applications, interviews, and communications.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
