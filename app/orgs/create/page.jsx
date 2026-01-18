"use client";

import React, { useState } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';

export default function CreateOrgPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    industry: '',
    description: '',
    logo_url: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from name if slug is not manually edited or if name is being typed
      if (name === 'name' && !prev.slug_edited) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (name === 'slug') {
        updated.slug_edited = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/organizations/organizations/', {
        name: formData.name,
        slug: formData.slug,
        industry: formData.industry,
        description: formData.description,
        logo_url: formData.logo_url,
        branding: {},
        metadata: {}
      });
      router.push(`/orgs/${res.slug || formData.slug}`);
    } catch (err) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/orgs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
        <FiArrowLeft /> Back to Organizations
      </Link>
      
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>Create Organization</h1>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Set up a new workspace for your team.</p>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--destructive)', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--destructive)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Organization Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Acme Corp" />

          <label style={labelStyle}>Slug (URL identifier)</label>
          <input required type="text" name="slug" value={formData.slug} onChange={handleChange} style={inputStyle} placeholder="acme-corp" />

          <label style={labelStyle}>Industry</label>
          <input type="text" name="industry" value={formData.industry} onChange={handleChange} style={inputStyle} placeholder="e.g. Technology, Healthcare" />

          <label style={labelStyle}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} style={{...inputStyle, minHeight: '100px'}} placeholder="Brief description of your organization" />

          <label style={labelStyle}>Logo URL (Optional)</label>
          <input type="url" name="logo_url" value={formData.logo_url} onChange={handleChange} style={inputStyle} placeholder="https://example.com/logo.png" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Creating...' : <><FiSave /> Create Organization</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
