"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';

export default function OrgDashboardPage({ params }) {
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const { slug } = React.use(params);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, memRes] = await Promise.all([
          api.get(`/api/organizations/organizations/${slug}/`),
          api.get(`/api/organizations/organizations/${slug}/members/`)
        ]);
        setOrg(orgRes);
        setMembers(Array.isArray(memRes) ? memRes : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [slug]);

  if (!org) return null; // handled by layout loader usually, or just empty state

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: 0 }}>Overview</h1>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Welcome to the {org.name} dashboard.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: '500' }}>Total Members</h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>{members.length}</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: '500' }}>Industry</h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.25rem', fontWeight: 'bold' }}>{org.industry || 'N/A'}</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: 0 }}>Organization Details</h2>
        <p style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>
          {org.description || 'No description provided.'}
        </p>
      </div>
    </div>
  );
}
