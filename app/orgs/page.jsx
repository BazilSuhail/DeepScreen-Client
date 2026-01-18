"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { FiPlus, FiBriefcase, FiClock } from 'react-icons/fi';
import OrgCard from '@/components/orgs/OrgCard';
import PendingInviteCard from '@/components/orgs/PendingInviteCard';

export default function OrgsPage() {
  const [orgs, setOrgs] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgsRes, invRes] = await Promise.all([
        api.get('/api/organizations/organizations/my_organizations/'),
        api.get('/api/organizations/memberships/pending/')
      ]);
      setOrgs(Array.isArray(orgsRes) ? orgsRes : []);
      setInvitations(Array.isArray(invRes) ? invRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (slug) => {
    try {
      await api.post(`/api/organizations/organizations/${slug}/accept_invitation/`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (slug) => {
    try {
      await api.post(`/api/organizations/organizations/${slug}/reject_invitation/`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <FiClock style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Organizations</h1>
        <Link href="/orgs/create" style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem', 
          backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', 
          padding: '0.5rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none',
          fontWeight: '500', transition: 'all 0.2s'
        }}>
          <FiPlus /> Create Organization
        </Link>
      </div>

      {invitations.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--muted-foreground)' }}>Pending Invitations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {invitations.map((inv) => (
              <PendingInviteCard 
                key={inv.membership_id} 
                inv={inv} 
                onAccept={handleAccept} 
                onReject={handleReject} 
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--muted-foreground)' }}>My Organizations</h2>
        {orgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <FiBriefcase size={48} color="var(--muted-foreground)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>You don't belong to any organizations yet.</p>
            <Link href="/orgs/create" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
              Create your first organization
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {orgs.map((org) => (
              <OrgCard key={org.org_id} org={org} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
