'use client';

import { useState } from 'react';
import { FaCertificate, FaTrashAlt } from 'react-icons/fa';
import { HiUser, HiBriefcase, HiLightningBolt, HiAcademicCap, HiGlobe } from 'react-icons/hi';
import { HiRocketLaunch } from 'react-icons/hi2';

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
    { id: 'skills', label: 'Skills', icon: HiLightningBolt },
    { id: 'education', label: 'Education', icon: HiAcademicCap },
    { id: 'certifications', label: 'Certifications', icon: FaCertificate },
    { id: 'languages', label: 'Languages', icon: HiGlobe },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Section Tabs */}
      <div className="flex gap-2 p-3 border-b border-slate-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeSection === section.id
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {activeSection === 'basics' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Basic Information</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={data.basics?.name || ''}
                  onChange={(e) => updateField('basics', 'name', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Alex Rivera"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Professional Title</label>
                <input
                  type="text"
                  value={data.basics?.label || ''}
                  onChange={(e) => updateField('basics', 'label', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Senior Frontend Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={data.basics?.email || ''}
                  onChange={(e) => updateField('basics', 'email', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="alex@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={data.basics?.phone || ''}
                  onChange={(e) => updateField('basics', 'phone', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+1-202-555-0143"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Professional Summary</label>
              <textarea
                value={data.basics?.summary || ''}
                onChange={(e) => updateField('basics', 'summary', e.target.value)}
                rows={3}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Full-stack developer with 8+ years of experience..."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={data.basics?.location?.city || ''}
                  onChange={(e) => updateField('basics', 'location', { ...data.basics?.location, city: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">State/Region</label>
                <input
                  type="text"
                  value={data.basics?.location?.region || ''}
                  onChange={(e) => updateField('basics', 'location', { ...data.basics?.location, region: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country</label>
                <input
                  type="text"
                  value={data.basics?.location?.country || ''}
                  onChange={(e) => updateField('basics', 'location', { ...data.basics?.location, country: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="USA"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-800">Social & Professional Links</label>
                <button
                  type="button"
                  onClick={() => {
                    const currentLinks = data.basics?.links || [];
                    updateField('basics', 'links', [...currentLinks, { label: '', url: '', icon: 'globe' }]);
                  }}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
                >
                  + Add Link
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
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
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
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                        placeholder="URL (https://...)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedLinks = (data.basics?.links || []).filter((_, i) => i !== lIdx);
                        updateField('basics', 'links', updatedLinks);
                      }}
                      className="p-1 px-2 text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
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
              <h3 className="text-sm font-bold text-slate-900">Professional Experience</h3>
              <button
                onClick={() => addItem('experience', {
                  company: '',
                  location: '',
                  url: '',
                  roles: [{ title: '', startDate: '', endDate: '', isCurrent: false, highlights: [''] }]
                })}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition"
              >
                + Add Company
              </button>
            </div>

            {data.experience?.map((exp, idx) => (
              <div key={idx} className="p-3 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xs font-bold text-slate-800">Company {idx + 1}</h4>
                  <button
                    onClick={() => removeItem('experience', idx)}
                    className="text-red-500 hover:text-red-700 font-semibold text-xs"
                  >
                    <FaTrashAlt className='w-3.5 mt-1 h-3.5' />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Name</label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateNestedField('experience', idx, 'company', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="TechStream Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => updateNestedField('experience', idx, 'location', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Remote"
                    />
                  </div>
                </div>

                {/* Roles within company */}
                {exp.roles?.map((role, roleIdx) => (
                  <div key={roleIdx} className="p-3 border-l-4 border-emerald-300 bg-white rounded mb-3">
                    <div className="gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={role.title || ''}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].roles[roleIdx].title = e.target.value;
                            onChange({ ...data, experience: updated });
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="Staff Engineer"
                        />
                      </div>
                      <div className="flex gap-2 mt-2 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                          <input
                            type="month"
                            value={role.startDate || ''}
                            onChange={(e) => {
                              const updated = [...data.experience];
                              updated[idx].roles[roleIdx].startDate = e.target.value;
                              onChange({ ...data, experience: updated });
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                          <input
                            type="month"
                            value={role.endDate || ''}
                            disabled={role.isCurrent}
                            onChange={(e) => {
                              const updated = [...data.experience];
                              updated[idx].roles[roleIdx].endDate = e.target.value;
                              onChange({ ...data, experience: updated });
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={role.isCurrent || false}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].roles[roleIdx].isCurrent = e.target.checked;
                            onChange({ ...data, experience: updated });
                          }}
                          className="w-4 h-4 text-emerald-500 rounded focus:ring-2 focus:ring-emerald-500"
                        />
                        Currently working here
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Key Achievements</label>
                      {role.highlights?.map((highlight, hIdx) => (
                        <div key={hIdx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => {
                              const updated = [...data.experience];
                              updated[idx].roles[roleIdx].highlights[hIdx] = e.target.value;
                              onChange({ ...data, experience: updated });
                            }}
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Key achievement or responsibility"
                          />
                          <button
                            onClick={() => {
                              const updated = [...data.experience];
                              updated[idx].roles[roleIdx].highlights.splice(hIdx, 1);
                              onChange({ ...data, experience: updated });
                            }}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const updated = [...data.experience];
                          updated[idx].roles[roleIdx].highlights.push('');
                          onChange({ ...data, experience: updated });
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        + Add Achievement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900">Technical Skills</h3>
              <button
                onClick={() => addItem('skills', { category: '', keywords: [] })}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition"
              >
                + Add Category
              </button>
            </div>

            {data.skills?.map((skill, idx) => (
              <div key={idx} className="p-3 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="text"
                    value={skill.category || ''}
                    onChange={(e) => updateNestedField('skills', idx, 'category', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="Frontend, Backend, etc."
                  />
                  <button
                    onClick={() => removeItem('skills', idx)}
                    className="ml-3 text-red-500 hover:text-red-700 font-semibold text-xs"
                  >
                    <FaTrashAlt className='w-3.5 mt-1 h-3.5' />
                  </button>
                </div>
                <input
                  type="text"
                  value={skill.keywords?.join(', ') || ''}
                  onChange={(e) => updateNestedField('skills', idx, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="React, TypeScript, Next.js (comma-separated)"
                />
              </div>
            ))}
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900">Projects</h3>
              <button
                onClick={() => addItem('projects', {
                  name: '',
                  description: '',
                  startDate: '',
                  endDate: '',
                  keywords: [],
                  highlights: ['']
                })}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition"
              >
                + Add Project
              </button>
            </div>

            {data.projects?.map((project, idx) => (
              <div key={idx} className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-slate-800">Project {idx + 1}</h4>
                  <button
                    onClick={() => removeItem('projects', idx)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                  >

                    <FaTrashAlt className='w-3.5 mt-1 h-3.5' />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={project.name || ''}
                    onChange={(e) => updateNestedField('projects', idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="Project Name"
                  />

                  <textarea
                    value={project.description || ''}
                    onChange={(e) => updateNestedField('projects', idx, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Brief description of the project"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="month"
                        value={project.startDate || ''}
                        onChange={(e) => updateNestedField('projects', idx, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                      <input
                        type="month"
                        value={project.endDate || ''}
                        onChange={(e) => updateNestedField('projects', idx, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={project.keywords?.join(', ') || ''}
                    onChange={(e) => updateNestedField('projects', idx, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
              <h3 className="text-sm font-bold text-slate-900">Education</h3>
              <button
                onClick={() => addItem('education', {
                  institution: '',
                  area: '',
                  studyType: '',
                  startDate: '',
                  endDate: '',
                  score: ''
                })}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition"
              >
                + Add Education
              </button>
            </div>

            {data.education?.map((edu, idx) => (
              <div key={idx} className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-slate-800">Education {idx + 1}</h4>
                  <button
                    onClick={() => removeItem('education', idx)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                  >
                    <FaTrashAlt className='w-3.5 mt-1 h-3.5' />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => updateNestedField('education', idx, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="University Name"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={edu.studyType || ''}
                      onChange={(e) => updateNestedField('education', idx, 'studyType', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Bachelor of Science"
                    />
                    <input
                      type="text"
                      value={edu.area || ''}
                      onChange={(e) => updateNestedField('education', idx, 'area', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Computer Science"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={edu.startDate || ''}
                      onChange={(e) => updateNestedField('education', idx, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="2014"
                    />
                    <input
                      type="text"
                      value={edu.endDate || ''}
                      onChange={(e) => updateNestedField('education', idx, 'endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="2018"
                    />
                    <input
                      type="text"
                      value={edu.score || ''}
                      onChange={(e) => updateNestedField('education', idx, 'score', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
              <h3 className="text-sm font-bold text-slate-900">Certifications</h3>
              <button
                onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition"
              >
                + Add Certification
              </button>
            </div>

            {data.certifications?.map((cert, idx) => (
              <div key={idx} className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-slate-800">Certification {idx + 1}</h4>
                  <button
                    onClick={() => removeItem('certifications', idx)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                  >
                    <FaTrashAlt className='w-3.5 mt-1 h-3.5' />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={cert.name || ''}
                    onChange={(e) => updateNestedField('certifications', idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="AWS Certified Solutions Architect"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cert.issuer || ''}
                      onChange={(e) => updateNestedField('certifications', idx, 'issuer', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Amazon Web Services"
                    />
                    <input
                      type="month"
                      value={cert.date || ''}
                      onChange={(e) => updateNestedField('certifications', idx, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
              <h3 className="text-sm font-bold text-slate-900">Languages</h3>
              <button
                onClick={() => addItem('languages', { language: '', fluency: '' })}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition"
              >
                + Add Language
              </button>
            </div>

            {data.languages?.map((lang, idx) => (
              <div key={idx} className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div className="flex gap-3 items-start">
                  <input
                    type="text"
                    value={lang.language || ''}
                    onChange={(e) => updateNestedField('languages', idx, 'language', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="English"
                  />
                  <input
                    type="text"
                    value={lang.fluency || ''}
                    onChange={(e) => updateNestedField('languages', idx, 'fluency', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Native, Professional, etc."
                  />
                  <button
                    onClick={() => removeItem('languages', idx)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    <FaTrashAlt className='w-3.5 mt-1 h-3.5' />
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
