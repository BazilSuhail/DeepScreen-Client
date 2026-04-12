'use client';

import { useState, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Poppins } from 'next/font/google';
import { useParams } from 'next/navigation';
import { HiRefresh, HiDownload, HiDocumentText } from 'react-icons/hi';
import ResumeForm from '@/components/resume/ResumeForm';
import ResumeTemplate from '@/components/resume/ResumeTemplate';
import { useRouter } from 'next/navigation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const defaultResumeData = {
  config: {
    theme: "professional-blue",
    showProfilePictures: true,
    displayOrder: ["summary", "experience", "projects", "skills", "education"]
  },
  basics: {
    name: "Bazil Suhail",
    label: "Senior Frontend Engineer",
    email: "bazilsuhail@email.com",
    phone: "+1-202-555-0143",
    summary: "Full-stack developer with 8+ years of experience specializing in high-performance web applications and design systems.",
    location: {
      city: "San Francisco",
      region: "CA",
      country: "USA"
    },
    links: [
      { label: "Portfolio", url: "https://bazilsuhail.netlify.app/", icon: "globe" },
      { label: "GitHub", url: "http://github.com/BazilSuhail", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/bazil-suhail", icon: "linkedin" }
    ]
  },
  experience: [
    {
      company: "TechStream Inc.",
      location: "Remote",
      url: "https://techstream.io",
      roles: [
        {
          title: "Staff Engineer",
          startDate: "2021-03",
          endDate: null,
          isCurrent: true,
          highlights: [
            "Migrated a monolith architecture to micro-frontends using Module Federation.",
            "Led a team of 12 developers to deliver a cross-platform mobile app.",
            "Optimized CI/CD pipelines, reducing deployment time by 50%."
          ]
        },
        {
          title: "Senior Developer",
          startDate: "2018-06",
          endDate: "2021-02",
          isCurrent: false,
          highlights: [
            "Developed an internal UI kit used by 40+ internal teams.",
            "Mentored 4 junior engineers into mid-level roles."
          ]
        }
      ]
    }
  ],
  projects: [
    {
      name: "Omni-Editor",
      description: "A collaborative markdown editor with real-time sync capabilities.",
      startDate: "2023-01",
      endDate: "2023-05",
      keywords: ["WebSockets", "React", "Yjs", "ProseMirror"],
      links: [
        { label: "Source", url: "https://github.com/arivera/omni" },
        { label: "Live Demo", url: "https://omni-editor.app" }
      ],
      highlights: [
        "Implemented CRDTs for conflict-free concurrent editing.",
        "Scaled backend to support 5,000+ concurrent users via Redis."
      ]
    },
    {
      "name": "Aura-Market",
      "description": "A hyper-personalized e-commerce platform featuring AI-driven product recommendations.",
      "startDate": "2024-02",
      "endDate": "2024-08",
      "keywords": ["Next.js", "MongoDB", "OpenAI API", "Stripe", "Tailwind CSS"],
      "links": [
        { "label": "Source", "url": "https://github.com/arivera/aura-market" },
        { "label": "Live Demo", "url": "https://aura-market.io" }
      ],
      "highlights": [
        "Integrated OpenAI to generate dynamic, user-specific product descriptions and shopping guides.",
        "Built a secure checkout flow using Stripe, supporting multi-currency and global tax compliance.",
        "Optimized frontend performance, achieving a 98/100 Lighthouse performance score via Next.js SSR."
      ]
    },
    {
      "name": "VitalPath",
      "description": "A cross-platform mobile app for real-time health monitoring and automated workout generation.",
      "startDate": "2024-09",
      "endDate": "2025-01",
      "keywords": ["Flutter", "Firebase", "TensorFlow Lite", "HealthKit", "Google Fit"],
      "links": [
        { "label": "App Store", "url": "https://apps.apple.com/vitalpath" },
        { "label": "Play Store", "url": "https://play.google.com/vitalpath" }
      ],
      "highlights": [
        "Utilized TensorFlow Lite for on-device pose estimation to track exercise form in real-time.",
        "Synchronized health data across iOS and Android using HealthKit and Google Fit APIs.",
        "Implemented background push notifications via Firebase Cloud Messaging to increase user retention by 25%."
      ]
    }
  ],
  skills: [
    {
      category: "Frontend",
      keywords: ["React", "TypeScript", "Next.js", "Redux", "SCSS", "Canvas API"]
    },
    {
      category: "Backend",
      keywords: ["Node.js", "PostgreSQL", "GraphQL", "Python", "Redis"]
    },
    {
      category: "DevOps & Tools",
      keywords: ["Docker", "AWS (EC2, S3)", "GitHub Actions", "Vercel"]
    }
  ],
  education: [
    {
      institution: "Georgia Institute of Technology",
      area: "Computer Science",
      studyType: "Master of Science",
      startDate: "2019",
      endDate: "2021",
      score: "4.0 GPA",
      courses: ["Advanced Algorithms", "Machine Learning"]
    },
    {
      institution: "State University",
      area: "Software Engineering",
      studyType: "Bachelor of Science",
      startDate: "2014",
      endDate: "2018",
      score: "3.8 GPA"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022-11",
      url: "https://aws.amazon.com/verification"
    }
  ],
  languages: [
    { language: "English", fluency: "Native" },
    { language: "Spanish", fluency: "Professional Working" }
  ]
};

export default function ResumePage() {
  const { resumeBuildId } = useParams();
  const router = useRouter();
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [showPreview, setShowPreview] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [templateId, setTemplateId] = useState(Number(resumeBuildId) || 1);

  useEffect(() => {
    if (resumeBuildId) {
      setTemplateId(Number(resumeBuildId));
    }
  }, [resumeBuildId]);

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setShowPreview(true);
      setIsCompiling(false);
    }, 500);
  };

  return (
    <div className={`h-screen flex flex-col w-full bg-linear-to-br from-slate-50 to-emerald-50 ${poppins.variable} font-sans overflow-x-hidden`} style={{ fontFamily: 'var(--font-poppins)' }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 sm:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className='flex items-center gap-3'>
              <button
                onClick={() => router.back()}
                className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm hover:shadow-md group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-slate-600 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  Resume Builder
                </h1>
                <p className="text-slate-600 text-[14px] font-medium">
                  Create your professional resume with ease
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {showPreview && (
                <PDFDownloadLink
                  document={<ResumeTemplate templateId={templateId} data={resumeData} />}
                  fileName={`${resumeData.basics.name.replace(/\s+/g, '_')}_Resume.pdf`}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                >
                  {({ loading }) => (
                    loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Preparing...
                      </span>
                    ) : (
                      <div className='flex font-semibold pt-0.5 text-[16px]'>
                        <HiDownload className="w-5 h-5 mr-2 mt-0.5" />
                        Download PDF
                      </div>
                    )
                  )}
                </PDFDownloadLink>
              )}
              <div className="relative group">
                <button className="flex items-center gap-3 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50">
                  <span className="text-sm">
                    {templateId === 1 && "LaTeX Professional"}
                    {templateId === 2 && "Creative Visual"}
                    {templateId === 3 && "Modern Minimal"}
                    {templateId === 4 && "Executive Corporate"}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full right-0 mt-2 w-58 bg-white border border-slate-300 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                  {[
                    { id: 1, name: 'LaTeX Professional', desc: 'Academic & Technical' },
                    { id: 2, name: 'Creative Visual', desc: 'Design & Arts' },
                    { id: 3, name: 'Modern Minimal', desc: 'Clean & Simple' },
                    { id: 4, name: 'Executive Corporate', desc: 'Business & Management' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTemplateId(t.id);
                        setShowPreview(false);
                      }}
                      className={`w-full flex flex-col px-5 py-3 transition-all ${
                        templateId === t.id 
                          ? 'bg-emerald-50 border-r-4 border-emerald-500' 
                          : 'hover:bg-slate-50 border-r-4 border-transparent'
                      }`}
                    >
                      <span className={`text-sm font-bold ${templateId === t.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {t.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-2 gap-6">
          {/* Left: Form Editor */}
          <div className="bg-white overflow-hidden rounded-xl shadow-lg border border-slate-200">
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-bold text-slate-900">
                  Edit Resume Data
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Fill in your information and compile to preview
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ResumeForm data={resumeData} onChange={setResumeData} />
              </div>
            </div>
          </div>

          {/* Right: PDF Preview */}
          <div className="bg-slate-50 overflow-hidden rounded-xl shadow-lg border border-slate-200">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Live Preview
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {showPreview ? 'Your resume is ready' : 'Compile to see your resume'}
                  </p>
                </div>
                <button
                  onClick={handleCompile}
                  disabled={isCompiling}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompiling ? (
                    <span className="flex text-[15px] items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Compiling...
                    </span>
                  ) : (
                    <div className='flex text-[15px]'>
                      <HiRefresh className="w-5 h-5 mr-2" />
                      Compile Preview
                    </div>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center p-1 bg-white scrollbar-hide">
                {isCompiling ? (
                  <div className="h-full w-full bg-white rounded-xl overflow-hidden">
                    <div className="h-full w-full animate-pulse space-y-4 p-8">
                      <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="space-y-2 pt-4">
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      </div>
                      <div className="space-y-2 pt-6">
                        <div className="h-4 bg-emerald-200 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                      </div>
                      <div className="space-y-2 pt-6">
                        <div className="h-4 bg-emerald-200 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ) : showPreview ? (
                  <div className="h-full w-full bg-white rounded-l g overflow-hidden shadow-inner">
                    <PDFViewer width="100%" height="100%" showToolbar={false} className="border-0">
                      <ResumeTemplate templateId={templateId} data={resumeData} />
                    </PDFViewer>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-slate-200 rounded-2xl flex items-center justify-center">
                      <HiDocumentText className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      No Preview Yet
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Fill in your resume details and click <span className="font-semibold text-emerald-600">Compile Preview</span> to generate your professional resume.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
