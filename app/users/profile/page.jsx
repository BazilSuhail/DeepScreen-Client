"use client";

import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="p-8 max-w-4xl flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getInitials = () => {
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getDisplayName = () => {
    if (user.profile?.first_name || user.profile?.last_name) {
      return `${user.profile.first_name || ""} ${user.profile.last_name || ""}`.trim();
    }
    return "User";
  };
  
  const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown";

  return (
    <div className="p-8 max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-emerald-600 mb-8"
      >
        My Profile
      </motion.h1>

      <div className="bg-card border border-emerald-500/10 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl font-bold text-emerald-600 border-4 border-emerald-500/20 overflow-hidden">
            {user.google_picture ? (
               <img src={user.google_picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               getInitials()
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{getDisplayName()}</h2>
            <p className="text-muted-foreground capitalize">{user.role?.toLowerCase() || 'Candidate'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="p-3 rounded-xl bg-secondary mt-1">{user.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio</label>
              <div className="p-3 rounded-xl bg-secondary mt-1">{user.profile?.bio || "No bio provided"}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <div className="p-3 rounded-xl bg-secondary mt-1">{user.profile?.phone || "Not specified"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Joined</label>
              <div className="p-3 rounded-xl bg-secondary mt-1">{joinedDate}</div>
            </div>
          </div>
        </div>

        <button className="mt-8 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
