'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/api';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { base, fadeUp } from '@/constants/motion';
import {
  HiOutlineUsers, HiOutlineEnvelope, HiOutlineCalendar,
  HiOutlineShieldCheck, HiOutlinePaperAirplane, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineUserPlus,
  HiOutlineExclamationCircle, HiOutlineClipboardDocument, HiOutlineCheck,
} from 'react-icons/hi2';
import { TextField } from '@/components/forms/FormFields';
import FormError from '@/components/auth/FormError';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import { card, cardPadded, primaryButton, secondaryButton } from '@/components/ui/styles';
import { ORG_PAGE, Chip, OrgSubpageHeader, SectionHeading, Spinner, StatTile, industryBadge } from '@/components/organizations/orgUi';
import OrgTeamSkeleton from '@/components/skeletons/organizations/OrgTeamSkeleton';

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
  if (!iso) return '—';
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const unit = RELATIVE_UNITS.find(([, size]) => Math.abs(seconds) >= size);
  return unit ? rtf.format(Math.round(seconds / unit[1]), unit[0]) : rtf.format(Math.round(seconds), 'second');
}

const INVITE_STATUS = {
  pending: { label: 'Pending', icon: HiOutlineClock, tone: 'amber' },
  expired: { label: 'Expired', icon: HiOutlineExclamationCircle, tone: 'muted' },
  accepted: { label: 'Accepted', icon: HiOutlineCheckCircle, tone: 'emerald' },
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

// Header row for the member and invitation tables; columns collapse into the row on small screens.
const TABLE_COLS = 'md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-4';

function TableHead({ cols }) {
  return (
    <div className={`hidden border-b border-border bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${TABLE_COLS}`}>
      {cols.map((c, i) => <span key={c} className={i === cols.length - 1 ? 'text-right' : undefined}>{c}</span>)}
    </div>
  );
}

function Avatar({ email }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
      {email?.[0]?.toUpperCase() || <HiOutlineEnvelope className="h-4 w-4" aria-hidden="true" />}
    </span>
  );
}

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
    <section aria-labelledby="invite-heading" className={`${cardPadded} space-y-5`}>
      <SectionHeading
        id="invite-heading"
        icon={HiOutlineUserPlus}
        title="Invite a recruiter"
        helper="They get an email with a link to join. Their access starts once they accept."
      />
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
          className={`${primaryButton} w-full`}
        >
          {loading ? <Spinner /> : <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden="true" />}
          {loading ? 'Sending...' : 'Send invitation'}
        </button>
        {sent && (
          <output className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
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

  if (loading) return <OrgTeamSkeleton />;

  if (error) {
    return (
      <div className={ORG_PAGE}>
        <OrgSubpageHeader slug={slug} current="team" title="Team" />
        <ErrorState title="Team unavailable" message="We could not load your team. Try again." onRetry={retryTeam} />
      </div>
    );
  }

  const pendingCount = members.filter((m) => m.status === 'PENDING').length;

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
    <div className={ORG_PAGE}>
      <OrgSubpageHeader
        slug={slug}
        current="team"
        title="Team"
        description={`${members.length} ${members.length === 1 ? 'member' : 'members'} · ${pendingCount} pending ${pendingCount === 1 ? 'invite' : 'invites'}. Invite a recruiter, then give them jobs to manage once they accept.`}
        meta={industryBadge(org?.industry)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile i={0} label="Members" value={members.length} icon={HiOutlineUsers} hint="Everyone on the team, including pending invites" />
        <StatTile i={1} label="Pending invites" value={pendingCount} icon={HiOutlineClock} tone="amber" hint="Invitations not yet accepted" />
        <StatTile i={2} label="Accepted" value={members.length - pendingCount} icon={HiOutlineCheckCircle} tone="teal" hint="Members who accepted their invitation" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-8 2xl:col-span-9">
          <section aria-labelledby="members-heading" className={`${card} overflow-hidden`}>
            <div className="p-4 lg:p-5">
              <SectionHeading id="members-heading" icon={HiOutlineUsers} title="Members" helper="People with access to this organization" />
            </div>
            {members.length === 0 ? (
              <div className="px-4 pb-4 lg:px-5 lg:pb-5">
                <EmptyState icon={HiOutlineUsers} title="No team members" text="Send your first invitation with the invite form." />
              </div>
            ) : (
              <>
                <TableHead cols={['Member', 'Role', 'Status', 'Joined']} />
                <ul className="divide-y divide-border border-t border-border md:border-t-0">
                  {members.map((m) => {
                    const isPending = m.status === 'PENDING';
                    return (
                      <li key={m.membership_id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-muted/40 ${TABLE_COLS}`}>
                        <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
                          <Avatar email={m.user_email} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{m.user_email?.split('@')[0] || '—'}</p>
                            <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                              <HiOutlineEnvelope className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="truncate">{m.user_email || '—'}</span>
                            </p>
                          </div>
                        </div>
                        <div><Chip tone="teal" icon={HiOutlineShieldCheck}><span className="capitalize">{m.org_role?.toLowerCase() || '—'}</span></Chip></div>
                        <div><Chip tone={isPending ? 'amber' : 'emerald'} icon={isPending ? HiOutlineClock : HiOutlineCheckCircle}>{isPending ? 'Pending' : 'Active'}</Chip></div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground md:justify-end" title="Invited on">
                          <HiOutlineCalendar className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(m.invited_at)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>

          <section aria-labelledby="invitations-heading" className={`${card} overflow-hidden`}>
            <div className="p-4 lg:p-5">
              <SectionHeading id="invitations-heading" icon={HiOutlineEnvelope} title="Invitations" helper="Sent invites until they are accepted or expire" />
            </div>
            {invitesError && (
              <div className="px-4 pb-4 lg:px-5">
                <ErrorState title="Invitations unavailable" message="We could not load the invitation list." onRetry={refreshInvites} />
              </div>
            )}
            {inviteListRows.length === 0 ? (
              !invitesError && (
                <div className="px-4 pb-4 lg:px-5 lg:pb-5">
                  <EmptyState icon={HiOutlineEnvelope} title="No invitations" text="Invitations you send appear here until they are accepted or expire." />
                </div>
              )
            ) : (
              <>
                <TableHead cols={['Email', 'Invited', 'Expires', 'Status']} />
                <ul className="divide-y divide-border border-t border-border md:border-t-0">
                  {inviteListRows.map((row) => {
                    const style = INVITE_STATUS[row.status] || INVITE_STATUS.pending;
                    return (
                      <li key={row.key} className="px-4 py-3">
                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${TABLE_COLS}`}>
                          <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
                            <Avatar email={row.email} />
                            <p className="min-w-0 truncate text-sm font-semibold">{row.email}</p>
                          </div>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <HiOutlineCalendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />Invited {relativeTime(row.invitedAt)}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <HiOutlineClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {row.expiresAt ? `${row.status === 'expired' ? 'Expired' : 'Expires'} ${relativeTime(row.expiresAt)}` : '—'}
                          </p>
                          <div className="flex items-center gap-2 md:justify-end">
                            {row.status === 'pending' && row.link && (
                              <button
                                type="button"
                                onClick={() => copyInviteLink(row.key, row.link)}
                                title="Copy the invite link to share it yourself"
                                className={`${secondaryButton} min-h-10 px-3 py-1.5 text-xs`}
                              >
                                {copiedKey === row.key ? (
                                  <><HiOutlineCheck className="h-3.5 w-3.5" aria-hidden="true" />Copied</>
                                ) : (
                                  <><HiOutlineClipboardDocument className="h-3.5 w-3.5" aria-hidden="true" />Copy link</>
                                )}
                              </button>
                            )}
                            <Chip tone={style.tone} icon={style.icon}>{style.label}</Chip>
                          </div>
                        </div>
                        {manualLink?.key === row.key && (
                          <input
                            readOnly
                            value={manualLink.link}
                            aria-label="Invite link"
                            onFocus={(e) => e.target.select()}
                            className="mt-3 min-h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-xs text-foreground"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        </div>

        <div className="space-y-6 self-start lg:sticky lg:top-6 lg:col-span-4 2xl:col-span-3">
          <motion.section {...fadeUp} transition={base} aria-label="Owner" className={`${cardPadded} flex items-center gap-4`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">
              {org?.owner?.email?.[0]?.toUpperCase() || <HiOutlineShieldCheck className="h-5 w-5" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{org?.owner?.email?.split('@')[0] || '—'}</p>
              {org?.owner?.email && <p className="truncate text-sm text-muted-foreground">{org.owner.email}</p>}
            </div>
            <Chip tone="emerald" icon={HiOutlineShieldCheck}>Owner</Chip>
          </motion.section>
          <InviteCard slug={slug} onSent={refreshInvites} />
        </div>
      </div>
    </div>
  );
}