'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HiOutlineUsers, HiOutlineEnvelope, HiOutlineCalendar,
  HiOutlineShieldCheck, HiOutlinePaperAirplane, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineUserPlus, HiOutlineBuildingOffice2,
  HiOutlineExclamationCircle, HiOutlineClipboardDocument, HiOutlineCheck,
} from 'react-icons/hi2';
import { TextField } from '@/components/forms/FormFields';
import FormError from '@/components/auth/FormError';
import EmptyState from '@/components/dashboard/EmptyState';
import OrgSubpageBanner, { ORG_PAGE_CLASS } from '@/components/organizations/OrgSubpageBanner';
import OrgSubpageSkeleton from '@/components/organizations/OrgSubpageSkeleton';

const FALLBACK_INVITE_ERROR = 'Please check the email and try again.';

// Raw objects or JSON bodies are not useful to the user, so show a plain prompt instead.
function inviteErrorMessage(err) {
  const msg = err?.message;
  if (typeof msg !== 'string' || !msg.trim() || /^\s*[[{]/.test(msg)) return FALLBACK_INVITE_ERROR;
  return msg;
}

const RELATIVE_UNITS = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function relativeTime(iso) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const unit = RELATIVE_UNITS.find(([, size]) => Math.abs(seconds) >= size);
  return unit ? rtf.format(Math.round(seconds / unit[1]), unit[0]) : rtf.format(Math.round(seconds), 'second');
}

const INVITE_STATUS = {
  pending: { label: 'Pending', icon: HiOutlineClock, className: 'bg-amber-500/10 text-amber-500' },
  expired: { label: 'Expired', icon: HiOutlineExclamationCircle, className: 'bg-muted text-muted-foreground' },
  accepted: { label: 'Accepted', icon: HiOutlineCheckCircle, className: 'bg-emerald-500/10 text-emerald-500' },
};

function InviteCard({ slug, onSent }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorTitle, setErrorTitle] = useState('Could not send the invitation');
  const [error, setError] = useState('');

  // The success line clears itself after a few seconds.
  useEffect(() => {
    if (!sent) return undefined;
    const t = setTimeout(() => setSent(false), 4000);
    return () => clearTimeout(t);
  }, [sent]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSent(false);
    try {
      await api.post('/accounts/auth/recruiter/invite/', { email, org_slug: slug });
      setSent(true);
      setEmail('');
      onSent?.();
    } catch (err) {
      setErrorTitle(err?.status === 409 ? 'Invitation already pending' : 'Could not send the invitation');
      setError(inviteErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="invite-heading" className="rounded-xl border border-border bg-card p-5 lg:self-start lg:p-6">
      <div className="mb-5 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <HiOutlineUserPlus className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="invite-heading" className="text-lg font-semibold text-foreground">Invite a recruiter</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            They get an email with a link to join. Their access starts once they accept.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <FormError
            title={errorTitle}
            message={error}
            onDismiss={() => setError('')}
          />
        )}
        <TextField
          id="invite-email"
          name="email"
          type="email"
          label="Recruiter's email"
          icon={HiOutlineEnvelope}
          hint="Use the address they sign in with."
          placeholder="recruiter@example.com"
          autoComplete="email"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden="true" />
          {loading ? 'Sending...' : 'Send invitation'}
        </button>
        {sent && (
          <output className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <HiOutlineCheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Invitation sent.
          </output>
        )}
      </form>
    </section>
  );
}

export default function OrgTeamPage() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [invitesError, setInvitesError] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  // Shown when the clipboard is unavailable, so the owner can select and copy the link by hand.
  const [manualLink, setManualLink] = useState(null);

  const fetchInvites = useCallback(
    () => api.get(`/organizations/${slug}/recruiter_invites/`).then((data) => data.invites || []),
    [slug],
  );

  const loadTeam = useCallback(() => {
    Promise.all([
      api.get(`/organizations/${slug}/`),
      api.get(`/organizations/${slug}/members/`),
      fetchInvites(),
    ]).then(([orgData, membersData, invitesData]) => {
      setOrg(orgData);
      setMembers(membersData);
      setInvites(invitesData);
      setInvitesError(false);
    }).catch(() => setError(true))
    .finally(() => setLoading(false));
  }, [fetchInvites, slug]);

  const refreshInvites = useCallback(() => {
    fetchInvites()
      .then((data) => {
        setInvites(data);
        setInvitesError(false);
      })
      .catch(() => setInvitesError(true));
  }, [fetchInvites]);

  const retryTeam = () => {
    setError(false);
    setLoading(true);
    loadTeam();
  };

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  // The "Copied" confirmation reverts on its own after 2 seconds.
  useEffect(() => {
    if (!copiedKey) return undefined;
    const t = setTimeout(() => setCopiedKey(null), 2000);
    return () => clearTimeout(t);
  }, [copiedKey]);

  const copyInviteLink = async (key, link) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(link);
      setManualLink(null);
      setCopiedKey(key);
    } catch {
      setCopiedKey(null);
      setManualLink({ key, link });
    }
  };

  if (loading) return <OrgSubpageSkeleton variant="team" />;

  if (error) {
    return (
      <div className={ORG_PAGE_CLASS}>
        <OrgSubpageBanner slug={slug} current="team" icon={HiOutlineUsers} title="Team Members" subtitle="The team could not be loaded" />
        <FormError title="Team unavailable" message="We could not load your team. Try again." />
        <button
          type="button"
          onClick={retryTeam}
          className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  const pendingCount = members.filter((m) => m.status === 'PENDING').length;
  const industry = org?.industry;
  const industryBadge = industry ? { label: industry, icon: HiOutlineBuildingOffice2 } : undefined;

  // Accepted invites are deleted by the server, so accepted people come from the members list.
  const activeMembers = members.filter((m) => m.status === 'ACTIVE');
  const activeEmails = new Set(activeMembers.map((m) => m.user_email));
  const inviteEmails = new Set(invites.map((i) => i.email));
  const inviteRows = invites.map((i) => ({
    key: `invite-${i.email}`,
    email: i.email,
    status: activeEmails.has(i.email) ? 'accepted' : i.status,
    invitedAt: i.invited_at,
    expiresAt: i.expires_at,
    link: i.link || '',
  }));
  const acceptedRows = activeMembers
    .filter((m) => !inviteEmails.has(m.user_email))
    .map((m) => ({
      key: `member-${m.membership_id}`,
      email: m.user_email,
      status: 'accepted',
      invitedAt: m.invited_at,
      expiresAt: null,
    }));
  const inviteListRows = [...inviteRows, ...acceptedRows];

  return (
    <div className={ORG_PAGE_CLASS}>
      <OrgSubpageBanner
        slug={slug}
        current="team"
        icon={HiOutlineUsers}
        badge={industryBadge}
        title="Team Members"
        subtitle={`${members.length} ${members.length === 1 ? 'member' : 'members'} · ${pendingCount} pending ${pendingCount === 1 ? 'invite' : 'invites'}`}
        footer="Invite a recruiter, then give them jobs to manage once they accept."
        emptyText="No team members yet. Invite a recruiter to help run your hiring."
        stats={members.length ? [
          { label: 'Members', value: members.length, icon: HiOutlineUsers, hint: 'Everyone on the team, including pending invites' },
          { label: 'Pending invites', value: pendingCount, icon: HiOutlineClock, hint: 'Invitations not yet accepted' },
          { label: 'Accepted', value: members.length - pendingCount, icon: HiOutlineUserPlus, hint: 'Members who accepted their invitation' },
        ] : null}
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-card p-5 lg:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-600/20">
          {org?.owner?.email?.[0]?.toUpperCase() || 'O'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-foreground">{org?.owner?.email?.split('@')[0] || 'Owner'}</div>
          <div className="truncate text-sm text-muted-foreground">{org?.owner?.email}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
          <HiOutlineShieldCheck className="h-4 w-4" aria-hidden="true" /> Owner
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InviteCard slug={slug} onSent={refreshInvites} />

        <div className="min-w-0 space-y-6 lg:col-span-2">
          {members.length === 0 ? (
            <EmptyState
              icon={HiOutlineUsers}
              title="No Team Members"
              text="Send your first invitation using the form beside this list."
            />
          ) : (
            <ul className="grid gap-2">
              {members.map((m, i) => {
                const isPending = m.status === 'PENDING';
                return (
                  <motion.li key={m.membership_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-emerald-500/30 lg:p-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                      {m.user_email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-foreground">{m.user_email?.split('@')[0] || 'Member'}</div>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex min-w-0 items-center gap-1"><HiOutlineEnvelope className="h-3 w-3 shrink-0" aria-hidden="true" /><span className="truncate">{m.user_email}</span></span>
                        <span className="flex shrink-0 items-center gap-1"><HiOutlineCalendar className="h-3 w-3" aria-hidden="true" />{new Date(m.invited_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${isPending ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {isPending ? 'Pending' : 'Active'}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{m.org_role}</span>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}

          <section aria-labelledby="invitations-heading" className="space-y-3">
            <h2 id="invitations-heading" className="text-lg font-semibold text-foreground">Invitations</h2>
            {invitesError && (
              <div>
                <FormError title="Invitations unavailable" message="We could not load the invitation list." />
                <button
                  type="button"
                  onClick={refreshInvites}
                  className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald-500/30"
                >
                  Retry
                </button>
              </div>
            )}
            {inviteListRows.length === 0 ? (
              !invitesError && (
                <EmptyState
                  icon={HiOutlineEnvelope}
                  title="No Invitations"
                  text="Invitations you send appear here until they are accepted or expire."
                />
              )
            ) : (
              <ul className="grid gap-2">
                {inviteListRows.map((row) => {
                  const style = INVITE_STATUS[row.status] || INVITE_STATUS.pending;
                  const StatusIcon = style.icon;
                  return (
                    <li key={row.key} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 lg:p-6">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-foreground">{row.email}</div>
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><HiOutlineCalendar className="h-3 w-3" aria-hidden="true" />Invited {relativeTime(row.invitedAt)}</span>
                          {row.expiresAt && (
                            <span className="flex items-center gap-1"><HiOutlineClock className="h-3 w-3" aria-hidden="true" />{row.status === 'expired' ? 'Expired' : 'Expires'} {relativeTime(row.expiresAt)}</span>
                          )}
                        </div>
                        {manualLink?.key === row.key && (
                          <input
                            readOnly
                            value={manualLink.link}
                            aria-label="Invite link"
                            onFocus={(e) => e.target.select()}
                            className="mt-3 w-full rounded-xl border border-border bg-muted px-3 py-2 text-xs text-foreground"
                          />
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {row.status === 'pending' && row.link && (
                          <button
                            type="button"
                            onClick={() => copyInviteLink(row.key, row.link)}
                            title="Copy the invite link to share it yourself"
                            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-emerald-500/30"
                          >
                            {copiedKey === row.key ? (
                              <><HiOutlineCheck className="h-3.5 w-3.5" aria-hidden="true" />Copied</>
                            ) : (
                              <><HiOutlineClipboardDocument className="h-3.5 w-3.5" aria-hidden="true" />Copy link</>
                            )}
                          </button>
                        )}
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${style.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          {style.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
