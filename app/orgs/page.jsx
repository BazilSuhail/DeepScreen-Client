"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { FiPlus, FiBriefcase, FiCheck, FiX, FiClock } from 'react-icons/fi';

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
              <div key={inv.membership_id} className="glass" style={{
                padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--secondary)', padding: '1rem', borderRadius: '50%' }}>
                    <FiBriefcase color="var(--primary)" size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 'bold' }}>{inv.org_slug || 'Organization'}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Role: {inv.org_role}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button onClick={() => handleAccept(inv.org_slug || 'slug')} style={{
                    flex: 1, padding: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem'
                  }}>
                    <FiCheck /> Accept
                  </button>
                  <button onClick={() => handleReject(inv.org_slug || 'slug')} style={{
                    flex: 1, padding: '0.5rem', backgroundColor: 'var(--destructive)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem'
                  }}>
                    <FiX /> Reject
                  </button>
                </div>
              </div>
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
              <Link href={`/orgs/${org.slug}`} key={org.org_id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass" style={{
                  padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', height: '100%',
                  transition: 'transform 0.2s, boxShadow 0.2s', cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{org.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{org.industry || 'No industry'}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {org.description || 'No description provided.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
