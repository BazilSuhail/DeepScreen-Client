import React from 'react';
import Link from 'next/link';

export default function OrgCard({ org }) {
  return (
    <Link href={`/orgs/${org.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
  );
}
