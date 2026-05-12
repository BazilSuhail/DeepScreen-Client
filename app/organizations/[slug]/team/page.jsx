'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiOutlineUsers, HiOutlineEnvelope, HiOutlineCalendar,
  HiOutlineShieldCheck, HiOutlinePlus, HiOutlineXMark,
} from 'react-icons/hi2';

function InviteModal({ slug, orgName, open, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await api.post('/accounts/auth/recruiter/invite/', { email, org_slug: slug });
      setSuccess(true);
      setEmail('');
      setTimeout(() => { onClose(); setSuccess(false); }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Invite Recruiter</h2>
                <p className="text-sm text-muted-foreground mt-1">to {orgName}</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}
              {success && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold">&#10003;</span> Invitation sent!
              </div>}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/60 ml-1 uppercase tracking-wider">Recruiter's Email</label>
                <div className="relative">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all text-base"
                    placeholder="recruiter@example.com" required />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-border bg-muted hover:bg-secondary text-foreground font-semibold transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20">
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function OrgTeamPage() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/organizations/${slug}/`),
      api.get(`/organizations/${slug}/members/`),
    ]).then(([orgData, membersData]) => {
      setOrg(orgData);
      setMembers(membersData);
    }).catch(() => setError(true))
    .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="space-y-4 px-12 py-8">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)}
    </div>
  );

  if (error) return <div className="text-center py-20 text-destructive">Failed to load team</div>;

  return (
    <div className="space-y-6 px-12 py-8">
      <InviteModal slug={slug} orgName={org?.name} open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <Link href={`/organizations/${slug}`} className="hover:text-emerald-500 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Team</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-1">{members.length} {members.length === 1 ? 'member' : 'members'}</p>
        </div>
        <button onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> Invite
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/10 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
          {org?.owner?.email?.[0]?.toUpperCase() || 'O'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground">{org?.owner?.email?.split('@')[0] || 'Owner'}</div>
          <div className="text-sm text-muted-foreground">{org?.owner?.email}</div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
          <HiOutlineShieldCheck className="w-4 h-4" /> Owner
        </div>
      </motion.div>

      {members.length === 0 ? (
        <div className="bg-card border border-border rounded-[2rem] p-16 text-center">
          <HiOutlineUsers className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Team Members</h2>
          <p className="text-muted-foreground">Invite recruiters to help manage your hiring pipeline.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {members.map((m, i) => (
            <motion.div key={m.membership_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center text-foreground font-bold text-sm shrink-0 border border-border">
                {m.user_email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{m.user_email?.split('@')[0] || 'Member'}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-3">
                  <span className="flex items-center gap-1"><HiOutlineEnvelope className="w-3 h-3" />{m.user_email}</span>
                  <span className="flex items-center gap-1"><HiOutlineCalendar className="w-3 h-3" />{new Date(m.invited_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {m.status === 'PENDING' && <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase">Pending</span>}
                <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] font-bold uppercase">{m.org_role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
