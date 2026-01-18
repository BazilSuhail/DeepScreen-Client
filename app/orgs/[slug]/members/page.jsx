"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { FiUserPlus, FiTrash2, FiMail } from 'react-icons/fi';

export default function OrgMembersPage({ params }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { slug } = React.use(params);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/organizations/organizations/${slug}/members/`);
      setMembers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [slug]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setError(null);
    try {
      await api.post(`/api/organizations/organizations/${slug}/invite_member/`, {
        user_email: inviteEmail,
        org_role: inviteRole
      });
      setInviteEmail('');
      fetchMembers(); // Refresh list to show pending
    } catch (err) {
      setError(err.message || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.post(`/api/organizations/organizations/${slug}/remove_member/`, {
        user_id: userId
      });
      fetchMembers();
    } catch (err) {
      console.error('Failed to remove member', err);
      alert('Failed to remove member');
    }
  };

  const inputStyle = {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    outline: 'none'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Members</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage team members and roles.</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: 0 }}>Invite Member</h2>
        {error && <p style={{ color: 'var(--destructive)', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 0.5rem', flex: 1, minWidth: '200px' }}>
            <FiMail color="var(--muted-foreground)" />
            <input 
              type="email" 
              placeholder="Email address" 
              required 
              value={inviteEmail} 
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{ ...inputStyle, border: 'none', flex: 1 }}
            />
          </div>
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={inputStyle}>
            <option value="MEMBER">Member</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" disabled={inviteLoading} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold',
            cursor: inviteLoading ? 'not-allowed' : 'pointer', opacity: inviteLoading ? 0.7 : 1
          }}>
            {inviteLoading ? 'Sending...' : <><FiUserPlus /> Invite</>}
          </button>
        </form>
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Role</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading members...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No members found.</td></tr>
            ) : (
              members.map((member) => (
                <tr key={member.membership_id || member.user_email} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{member.user_email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--secondary)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {member.org_role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: member.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: member.status === 'ACTIVE' ? 'var(--primary)' : '#f59e0b',
                      borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' 
                    }}>
                      {member.status || 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleRemove(member.user_id || member.membership_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
