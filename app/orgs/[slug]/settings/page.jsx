"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { FiSave, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

export default function OrgSettingsPage({ params }) {
  const router = useRouter();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  const { slug } = React.use(params);

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
    fetchOrg();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrg(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.put(`/api/organizations/organizations/${slug}/`, {
        description: org.description,
        logo_url: org.logo_url
      });
      alert('Settings updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/organizations/organizations/${slug}/`);
      router.push('/orgs');
    } catch (err) {
      setError(err.message || 'Failed to delete organization');
      setDeleting(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;
  if (!org) return <div>Organization not found.</div>;

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    marginBottom: '1rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: 'var(--foreground)'
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: 0 }}>Settings</h1>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Update your organization details and preferences.</p>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--destructive)', borderRadius: 'var(--radius)', marginBottom: '2rem', border: '1px solid var(--destructive)' }}>
          {error}
        </div>
      )}

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: 0 }}>General Information</h2>
        <form onSubmit={handleUpdate}>
          <label style={labelStyle}>Description</label>
          <textarea 
            name="description" 
            value={org.description || ''} 
            onChange={handleChange} 
            style={{ ...inputStyle, minHeight: '120px' }} 
            placeholder="Brief description of your organization"
          />

          <label style={labelStyle}>Logo URL</label>
          <input 
            type="url" 
            name="logo_url" 
            value={org.logo_url || ''} 
            onChange={handleChange} 
            style={inputStyle} 
            placeholder="https://example.com/logo.png"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
            }}>
              {saving ? 'Saving...' : <><FiSave /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--destructive)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: 0, color: 'var(--destructive)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiAlertTriangle /> Danger Zone
        </h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          Once you delete an organization, there is no going back. Please be certain.
        </p>
        <button onClick={handleDelete} disabled={deleting} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.5rem', backgroundColor: 'var(--destructive)', color: 'white',
          border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold',
          cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1
        }}>
          {deleting ? 'Deleting...' : <><FiTrash2 /> Delete Organization</>}
        </button>
      </div>
    </div>
  );
}
