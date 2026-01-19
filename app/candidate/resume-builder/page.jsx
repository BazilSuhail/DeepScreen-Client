"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiPlus, HiEye, HiTrash, HiX } from 'react-icons/hi';

const ResumesPage = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resumes, setResumes] = useState([
    {
      id: 1,
      name: 'Alex Rivera - Software Engineer',
      template: 1,
      lastModified: '2025-01-10',
      createdDate: '2025-01-05'
    },
    {
      id: 2,
      name: 'Alex Rivera - Web Developer',
      template: 2,
      lastModified: '2025-01-08',
      createdDate: '2025-01-02'
    }
  ]);

  const templates = [
    {
      id: 1,
      name: 'Professional',
      description: 'Clean and traditional design, perfect for corporate roles',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Modern',
      description: 'Contemporary layout with accent colors and modern typography',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 3,
      name: 'Minimalist',
      description: 'Simple and elegant design focusing on content clarity',
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 4,
      name: 'Creative',
      description: 'Bold design for creative professionals and designers',
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  const handleCreateResume = () => {
    setShowModal(true);
    setSelectedTemplate(null);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleConfirmCreate = () => {
    if (selectedTemplate) {
      router.push(`/candidate/resumes/${selectedTemplate.id}`);
    }
  };

  const handleDeleteResume = (id) => {
    setResumes(resumes.filter(resume => resume.id !== id));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-slate-900">My Resumes</h1>
              <p className="text-slate-600 font-medium mt-1">Create and manage your professional resumes</p>
            </div>
            <button
              onClick={handleCreateResume}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              <HiPlus className="w-5 h-5" />
              Create Resume
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {resumes.length > 0 ? (
          <div className="space-y-8">
            {/* My Resumes Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Your Resumes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => {
                  const template = templates.find(t => t.id === resume.template);
                  return (
                    <div key={resume.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-slate-200">
                      {/* Placeholder Image */}
                      <div className={`h-40 bg-linear-to-br ${template?.color || 'from-slate-500 to-slate-600'} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-10">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <pattern id={`pattern-${resume.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="20" height="20" fill="none" stroke="white" strokeWidth="0.5" />
                              </pattern>
                            </defs>
                            <rect width="100" height="100" fill={`url(#pattern-${resume.id})`} />
                          </svg>
                        </div>
                        <div className="relative text-center">
                          <div className="w-16 h-20 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30"></div>
                          <p className="text-white text-xs font-semibold mt-3">{template?.name}</p>
                        </div>
                      </div>

                      {/* Resume Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 truncate mb-2">{resume.name}</h3>
                        <div className="space-y-1.5 mb-6">
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold">Template:</span> {template?.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold">Created:</span> {new Date(resume.createdDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold">Modified:</span> {new Date(resume.lastModified).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link
                            href={`/candidate/resume-builder/${resume.template}`}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-semibold text-sm hover:bg-emerald-100 transition-all"
                          >
                            <HiEye className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteResume(resume.id)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-100 transition-all"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Templates Section */}
            <div className="border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Available Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-slate-200"
                  >
                    {/* Template Preview */}
                    <div className={`h-32 bg-linear-to-br ${template.color} flex items-center justify-center`}>
                      <div className="w-12 h-16 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30"></div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 mb-1">{template.name}</h3>
                      <p className="text-xs text-slate-600 mb-4">{template.description}</p>
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-all"
                      >
                        Choose Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <HiPlus className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Resumes Yet</h3>
            <p className="text-slate-600 mb-8 text-center max-w-md">
              Create your first resume by choosing from our professional templates
            </p>
            <button
              onClick={handleCreateResume}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              <HiPlus className="w-5 h-5" />
              Create Your First Resume
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">Create New Resume</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-all"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-slate-600 mb-6 font-medium">Choose a template to get started:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedTemplate?.id === template.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div className={`h-24 bg-linear-to-br ${template.color} rounded-lg mb-3 flex items-center justify-center`}>
                      <div className="w-8 h-12 bg-white/20 rounded border border-white/30"></div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{template.name}</h3>
                    <p className="text-xs text-slate-600">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-200 bg-white">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={!selectedTemplate}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${selectedTemplate
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-xl'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                Create Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumesPage;
