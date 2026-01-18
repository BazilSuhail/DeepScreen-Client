"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiUsers, FiSettings, FiArrowLeft } from 'react-icons/fi';

export default function OrgDashboardLayout({ children, params }) {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  // We need to properly unwrap params if it's an async context, but standard next.js 14 client layout gets params
  const { slug } = React.use(params); // React.use is standard for App Router async params, but in older 13/14 it might just be params.slug

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await api.get(`/api/organizations/organizations/${slug}/`);
        setOrg(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchOrg();
  }, [slug]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading organization...</div>;
  }

  if (!org) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Organization not found.</div>;
  }

  const navItems = [
    { name: 'Overview', href: `/orgs/${slug}`, icon: FiGrid },
    { name: 'Members', href: `/orgs/${slug}/members`, icon: FiUsers },
    { name: 'Settings', href: `/orgs/${slug}/settings`, icon: FiSettings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--secondary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <Link href="/orgs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.875rem' }}>
          <FiArrowLeft /> All Organizations
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', fontWeight: 'bold' }}>
              {org.name.charAt(0)}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{org.name}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{org.industry || 'Organization'}</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
                textDecoration: 'none', fontWeight: '500', transition: 'all 0.2s',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--foreground)'
              }}>
                <item.icon /> {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
