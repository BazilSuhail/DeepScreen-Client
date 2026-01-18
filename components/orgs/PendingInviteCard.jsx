import React from 'react';
import { FiBriefcase, FiCheck, FiX } from 'react-icons/fi';

export default function PendingInviteCard({ inv, onAccept, onReject }) {
  return (
    <div className="glass" style={{
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
        <button onClick={() => onAccept(inv.org_slug || 'slug')} style={{
          flex: 1, padding: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem'
        }}>
          <FiCheck /> Accept
        </button>
        <button onClick={() => onReject(inv.org_slug || 'slug')} style={{
          flex: 1, padding: '0.5rem', backgroundColor: 'var(--destructive)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem'
        }}>
          <FiX /> Reject
        </button>
      </div>
    </div>
  );
}
