'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { HiUser, HiBriefcase, HiAcademicCap, HiGlobeAlt, HiRocketLaunch, HiBolt, HiCheckBadge, HiOutlinePlus, HiOutlineTrash, HiOutlineXMark } from 'react-icons/hi2';
import { focusRing, inputClass, labelClass as sharedLabel } from '@/components/ui/styles';
import { spring } from '@/constants/motion';

const fieldLabel = `${sharedLabel} mb-1.5`;
const entryCard = 'rounded-md border border-emerald-100 bg-emerald-50/40 p-4 dark:border-white/10 dark:bg-white/5';
const addButton = `inline-flex min-h-11 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-emerald-500 ${focusRing}`;
const removeButton = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 ${focusRing}`;
const textButton = `inline-flex min-h-11 items-center gap-1.5 rounded-md font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 ${focusRing}`;

const ResumeForm = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState('basics');

  const updateField = (section, field, value) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value,
      },
    });
  };

  const updateNestedField = (section, index, field, value) => {
    const updated = [...data[section]];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({
      ...data,
      [section]: updated,
    });
  };

  // Copies the company and role before writing, so the parent's state is never mutated in place.
  const updateRole = (idx, roleIdx, patch) => {
    const updated = data.experience.map((exp, i) => (i !== idx ? exp : {
      ...exp,
      roles: exp.roles.map((role, r) => (r !== roleIdx ? role : { ...role, ...patch(role) })),
    }));
    onChange({ ...data, experience: updated });
  };

  const emptyRole = () => ({ title: '', startDate: '', endDate: '', isCurrent: false, highlights: [''] });
  // Copy-on-write add/remove of roles under one company.
  const setRoles = (idx, fn) => {
    onChange({ ...data, experience: data.experience.map((exp, i) => (i !== idx ? exp : { ...exp, roles: fn(exp.roles || []) })) });
  };

  const addItem = (section, template) => {
    onChange({
      ...data,
      [section]: [...(data[section] || []), template],
    });
  };

  const removeItem = (section, index) => {
    const updated = [...data[section]];
    updated.splice(index, 1);
    onChange({
      ...data,
      [section]: updated,
    });
  };

  const sections = [
    { id: 'basics', label: 'Basic Info', icon: HiUser },
    { id: 'experience', label: 'Experience', icon: HiBriefcase },
    { id: 'projects', label: 'Projects', icon: HiRocketLaunch },
    { id: 'skills', label: 'Skills', icon: HiBolt },
    { id: 'education', label: 'Education', icon: HiAcademicCap },
    { id: 'certifications', label: 'Certifications', icon: HiCheckBadge },
    { id: 'languages', label: 'Languages', icon: HiGlobeAlt },
  ];

  return (
    <div className="flex h-full min-h-[32rem] flex-col bg-card">
      <div className="flex gap-2 p-3 border-b border-border overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`relative min-h-10 px-3 rounded-md font-semibold text-xs whitespace-nowrap transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none flex items-center gap-1.5 ${focusRing} ${activeSection === section.id
                ? 'text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-secondary'
                }`}
            >
              {activeSection === section.id && (
                <motion.span layoutId="resume-form-tab" transition={spring} className="absolute inset-0 rounded-md bg-primary" />
              )}
              <IconComponent className="relative w-3.5 h-3.5" aria-hidden="true" />
              <span className="relative">{section.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {activeSection === 'basics' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">Basic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="basics-name" className={fieldLabel}>Full Name</label>
                <input
                  id="basics-name"
                  type="text"
                  value={data.basics?.name || ''}
                  onChange={(e) => updateField('basics', 'name', e.target.value)}
                  className={`${inputClass}`}
                  placeholder="Alex Rivera"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="basics-label" className={fieldLabel}>Professional Title</label>
                <input
                  id="basics-label"
                  type="text"
                  value={data.basics?.label || ''}
                  onChange={(e) => updateField('basics', 'label', e.target.value)}
                  className={`${inputClass}`}
                  placeholder="Senior Frontend Engineer"
                />
              </div>

              <div>
                <label htmlFor="basics-email" className={fieldLabel}>Email</label>
                <input
                  id="basics-email"
                  type="email"
                  value={data.basics?.email || ''}
                  onChange={(e) => updateField('basics', 'email', e.target.value)}
                  className={`${inputClass}`}
                  placeholder="alex@email.com"
                />
              </div>

              <div>
                <label htmlFor="basics-phone" className={fieldLabel}>Phone</label>
                <input
                  id="basics-phone"
                  type="tel"
                  value={data.basics?.phone || ''}
                  onChange={(e) => updateField('basics', 'phone', e.target.value)}
                  className={`${inputClass}`}
                  placeholder="+1-202-555-0143"
                />
              </div>
            </div>

            <div>
              <label htmlFor="basics-summary" className={fieldLabel}>Professional Summary</label>
              <textarea
                id="basics-summary"
                value={data.basics?.summary || ''}
                onChange={(e) => updateField('basics', 'summary', e.target.value)}
                rows={3}
                className={`${inputClass} resize-y`}
                placeholder="Full-stack developer with 8+ years of experience..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="basics-city" className={fieldLabel}>City</label>
                <input
                  id="basics-city"
                  type="text"
                  value={data.basics?.location?.city || ''}
                  onChange={(e) => updateField('basics', 'location', { ...data.basics?.location, city: e.target.value })}
                  className={`${inputClass}`}
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label htmlFor="basics-region" className={fieldLabel}>State/Region</label>
                <input
                  id="basics-region"
                  type="text"
                  value={data.basics?.location?.region || ''}
                  onChange={(e) => updateField('basics', 'location', { ...data.basics?.location, region: e.target.value })}
                  className={`${inputClass}`}
                  placeholder="CA"
                />
              </div>
              <div>
                <label htmlFor="basics-country" className={fieldLabel}>Country</label>
                <input
                  id="basics-country"
                  type="text"
                  value={data.basics?.location?.country || ''}
                  onChange={(e) => updateField('basics', 'location', { ...data.basics?.location, country: e.target.value })}
                  className={`${inputClass}`}
                  placeholder="USA"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className={sharedLabel}>Social & Professional Links</span>
                <button
                  type="button"
                  onClick={() => {
                    const currentLinks = data.basics?.links || [];
                    updateField('basics', 'links', [...currentLinks, { label: '', url: '', icon: 'globe' }]);
                  }}
                  className={`${textButton} text-xs`}
                >
<HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Link
</button>
              </div>
              <div className="space-y-2">
                {data.basics?.links?.map((link, lIdx) => (
                  <div key={lIdx} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => {
                          const updatedLinks = [...(data.basics?.links || [])];
                          updatedLinks[lIdx] = { ...updatedLinks[lIdx], label: e.target.value };
                          updateField('basics', 'links', updatedLinks);
                        }}
                        className={`${inputClass}`}
                        aria-label="Label"
                    placeholder="Label (e.g. GitHub)"
                      />
                    </div>
                    <div className="flex-[2]">
                      <input
                        type="url"
                        value={link.url || ''}
                        onChange={(e) => {
                          const updatedLinks = [...(data.basics?.links || [])];
                          updatedLinks[lIdx] = { ...updatedLinks[lIdx], url: e.target.value };
                          updateField('basics', 'links', updatedLinks);
                        }}
                        className={`${inputClass}`}
                        aria-label="URL"
                    placeholder="URL (https://...)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedLinks = (data.basics?.links || []).filter((_, i) => i !== lIdx);
                        updateField('basics', 'links', updatedLinks);
                      }}
                      aria-label="Remove link"
                      className={removeButton}
                    >
                      <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-foreground">Professional Experience</h3>
              <button
                type="button"
                onClick={() => addItem('experience', {
                  company: '',
                  location: '',
                  url: '',
                  roles: [emptyRole()]
                })}
                className={addButton}
              >
<HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Company
</button>
            </div>

            {data.experience?.map((exp, idx) => (
              <div key={idx} className={entryCard}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem('experience', idx)}
                    aria-label="Remove experience entry"
                    className={removeButton}
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor={`exp-company-${idx}`} className={fieldLabel}>Company Name</label>
                    <input
                      id={`exp-company-${idx}`}
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateNestedField('experience', idx, 'company', e.target.value)}
                      className={`${inputClass}`}
                      placeholder="TechStream Inc."
                    />
                  </div>
                  <div>
                    <label htmlFor={`exp-location-${idx}`} className={fieldLabel}>Location</label>
                    <input
                      id={`exp-location-${idx}`}
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => updateNestedField('experience', idx, 'location', e.target.value)}
                      className={`${inputClass}`}
                      placeholder="Remote"
                    />
                  </div>
                </div>

                {exp.roles?.map((role, roleIdx) => (
                  <div key={roleIdx} className="mb-3 rounded-md border border-l-4 border-emerald-100 border-l-emerald-500 bg-card p-3 dark:border-white/10 dark:border-l-emerald-500">
                    {exp.roles.length > 1 && (
                      <div className="-mt-1 mb-1 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role {roleIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setRoles(idx, (roles) => roles.filter((_, r) => r !== roleIdx))}
                          aria-label={`Remove role ${roleIdx + 1}`}
                          className={removeButton}
                        >
                          <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                    <div className="gap-3 mb-3">
                      <div>
                        <label htmlFor={`exp-role-title-${idx}-${roleIdx}`} className={fieldLabel}>Job Title</label>
                        <input
                          id={`exp-role-title-${idx}-${roleIdx}`}
                          type="text"
                          value={role.title || ''}
                          onChange={(e) => {
                            updateRole(idx, roleIdx, () => ({ title: e.target.value }));
                          }}
                          className={`${inputClass}`}
                          placeholder="Staff Engineer"
                        />
                      </div>
                      <div className="flex gap-2 mt-2 items-end">
                        <div className="flex-1">
                          <label htmlFor={`exp-role-start-${idx}-${roleIdx}`} className={fieldLabel}>Start Date</label>
                          <input
                            id={`exp-role-start-${idx}-${roleIdx}`}
                            type="month"
                            value={role.startDate || ''}
                            onChange={(e) => {
                              updateRole(idx, roleIdx, () => ({ startDate: e.target.value }));
                            }}
                            className={`${inputClass}`}
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`exp-role-end-${idx}-${roleIdx}`} className={fieldLabel}>End Date</label>
                          <input
                            id={`exp-role-end-${idx}-${roleIdx}`}
                            type="month"
                            value={role.endDate || ''}
                            disabled={role.isCurrent}
                            onChange={(e) => {
                              updateRole(idx, roleIdx, () => ({ endDate: e.target.value }));
                            }}
                            className={`${inputClass} disabled:opacity-60`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="flex min-h-11 items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={role.isCurrent || false}
                          onChange={(e) => {
                            updateRole(idx, roleIdx, () => ({ isCurrent: e.target.checked }));
                          }}
                          className="h-4 w-4 rounded-sm accent-emerald-600"
                        />
                        Currently working here
                      </label>
                    </div>

                    <div>
                      <span className={fieldLabel}>Key Achievements</span>
                      {role.highlights?.map((highlight, hIdx) => (
                        <div key={hIdx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => {
                              updateRole(idx, roleIdx, (r) => ({ highlights: r.highlights.map((h, k) => (k === hIdx ? e.target.value : h)) }));
                            }}
                            className={`${inputClass} flex-1`}
                            aria-label="Key achievement or responsibility"
                    placeholder="Key achievement or responsibility"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              updateRole(idx, roleIdx, (r) => ({ highlights: r.highlights.filter((_, k) => k !== hIdx) }));
                            }}
                            aria-label="Remove achievement"
                            className={removeButton}
                          >
                            <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          updateRole(idx, roleIdx, (r) => ({ highlights: [...(r.highlights || []), ''] }));
                        }}
                        className={`${textButton} text-sm`}
                      >
<HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Achievement
</button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRoles(idx, (roles) => [...roles, emptyRole()])}
                  className={`${textButton} text-sm`}
                >
                  <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add role
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-foreground">Technical Skills</h3>
              <button
                type="button"
                onClick={() => addItem('skills', { category: '', keywords: [] })}
                className={addButton}
              >
<HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Category
</button>
            </div>

            {data.skills?.map((skill, idx) => (
              <div key={idx} className={entryCard}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <input
                    type="text"
                    value={skill.category || ''}
                    onChange={(e) => updateNestedField('skills', idx, 'category', e.target.value)}
                    className={`${inputClass} flex-1 font-semibold`}
                    aria-label="Skill category"
                    placeholder="Frontend, Backend, etc."
                  />
                  <button
                    type="button"
                    onClick={() => removeItem('skills', idx)}
                    aria-label="Remove skills entry"
                    className={removeButton}
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <input
                  type="text"
                  value={skill.keywords?.join(', ') || ''}
                  onChange={(e) => updateNestedField('skills', idx, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                  className={`${inputClass}`}
                  aria-label="Keywords"
                    placeholder="React, TypeScript, Next.js (comma-separated)"
                />
              </div>
            ))}
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-foreground">Projects</h3>
              <button
                type="button"
                onClick={() => addItem('projects', {
                  name: '',
                  description: '',
                  startDate: '',
                  endDate: '',
                  keywords: [],
                  highlights: ['']
                })}
                className={addButton}
              >
<HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Project
</button>
            </div>

            {data.projects?.map((project, idx) => (
              <div key={idx} className={entryCard}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem('projects', idx)}
                    aria-label="Remove projects entry"
                    className={removeButton}
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={project.name || ''}
                    onChange={(e) => updateNestedField('projects', idx, 'name', e.target.value)}
                    className={`${inputClass} font-semibold`}
                    aria-label="Project Name"
                    placeholder="Project Name"
                  />

                  <textarea
                    value={project.description || ''}
                    onChange={(e) => updateNestedField('projects', idx, 'description', e.target.value)}
                    rows={2}
                    className={`${inputClass}`}
                    aria-label="Brief description of the project"
                    placeholder="Brief description of the project"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`proj-start-${idx}`} className={fieldLabel}>Start Date</label>
                      <input
                        id={`proj-start-${idx}`}
                        type="month"
                        value={project.startDate || ''}
                        onChange={(e) => updateNestedField('projects', idx, 'startDate', e.target.value)}
                        className={`${inputClass}`}
                      />
                    </div>
                    <div>
                      <label htmlFor={`proj-end-${idx}`} className={fieldLabel}>End Date</label>
                      <input
                        id={`proj-end-${idx}`}
                        type="month"
                        value={project.endDate || ''}
                        onChange={(e) => updateNestedField('projects', idx, 'endDate', e.target.value)}
                        className={`${inputClass}`}
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={project.keywords?.join(', ') || ''}
                    onChange={(e) => updateNestedField('projects', idx, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                    className={`${inputClass}`}
                    aria-label="Technologies used"
                    placeholder="Technologies used (comma-separated)"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-foreground">Education</h3>
              <button
                type="button"
                onClick={() => addItem('education', {
                  institution: '',
                  area: '',
                  studyType: '',
                  startDate: '',
                  endDate: '',
                  score: ''
                })}
                className={addButton}
              >
<HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Education
</button>
            </div>

            {data.education?.map((edu, idx) => (
              <div key={idx} className={entryCard}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Education {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem('education', idx)}
                    aria-label="Remove education entry"
                    className={removeButton}
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => updateNestedField('education', idx, 'institution', e.target.value)}
                    className={`${inputClass} font-semibold`}
                    aria-label="University Name"
                    placeholder="University Name"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={edu.studyType || ''}
                      onChange={(e) => updateNestedField('education', idx, 'studyType', e.target.value)}
                      className={`${inputClass}`}
                      aria-label="Degree"
                    placeholder="Bachelor of Science"
                    />
                    <input
                      type="text"
                      value={edu.area || ''}
                      onChange={(e) => updateNestedField('education', idx, 'area', e.target.value)}
                      className={`${inputClass}`}
                      aria-label="Field of study"
                    placeholder="Computer Science"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={edu.startDate || ''}
                      onChange={(e) => updateNestedField('education', idx, 'startDate', e.target.value)}
                      className={`${inputClass}`}
                      aria-label="Start year"
                    placeholder="2014"
                    />
                    <input
                      type="text"
                      value={edu.endDate || ''}
                      onChange={(e) => updateNestedField('education', idx, 'endDate', e.target.value)}
                      className={`${inputClass}`}
                      aria-label="End year"
                    placeholder="2018"
                    />
                    <input
                      type="text"
                      value={edu.score || ''}
                      onChange={(e) => updateNestedField('education', idx, 'score', e.target.value)}
                      className={`${inputClass}`}
                      aria-label="Score"
                    placeholder="3.8 GPA"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'certifications' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-foreground">Certifications</h3>
              <button
                type="button"
                onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })}
                className={addButton}
              >
<HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Certification
</button>
            </div>

            {data.certifications?.map((cert, idx) => (
              <div key={idx} className={entryCard}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certification {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem('certifications', idx)}
                    aria-label="Remove certifications entry"
                    className={removeButton}
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={cert.name || ''}
                    onChange={(e) => updateNestedField('certifications', idx, 'name', e.target.value)}
                    className={`${inputClass} font-semibold`}
                    aria-label="Certification name"
                    placeholder="AWS Certified Solutions Architect"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cert.issuer || ''}
                      onChange={(e) => updateNestedField('certifications', idx, 'issuer', e.target.value)}
                      className={`${inputClass}`}
                      aria-label="Issuer"
                    placeholder="Amazon Web Services"
                    />
                    <input
                      type="month"
                      value={cert.date || ''}
                      onChange={(e) => updateNestedField('certifications', idx, 'date', e.target.value)}
                      className={`${inputClass}`}
                    aria-label="Date issued"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'languages' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-foreground">Languages</h3>
              <button
                type="button"
                onClick={() => addItem('languages', { language: '', fluency: '' })}
                className={addButton}
              >
<HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Language
</button>
            </div>

            {data.languages?.map((lang, idx) => (
              <div key={idx} className={entryCard}>
                <div className="flex gap-3 items-start">
                  <input
                    type="text"
                    value={lang.language || ''}
                    onChange={(e) => updateNestedField('languages', idx, 'language', e.target.value)}
                    className={`${inputClass} flex-1 font-semibold`}
                    aria-label="Language"
                    placeholder="English"
                  />
                  <input
                    type="text"
                    value={lang.fluency || ''}
                    onChange={(e) => updateNestedField('languages', idx, 'fluency', e.target.value)}
                    className={`${inputClass} flex-1`}
                    aria-label="Fluency"
                    placeholder="Native, Professional, etc."
                  />
                  <button
                    type="button"
                    onClick={() => removeItem('languages', idx)}
                    aria-label="Remove languages entry"
                    className={removeButton}
                  >
                    <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;
