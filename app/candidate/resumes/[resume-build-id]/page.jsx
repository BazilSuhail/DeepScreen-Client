'use client';

import { useState, useEffect } from 'react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { Poppins } from 'next/font/google';
import { useParams } from 'next/navigation';
import { HiOutlineArrowPath, HiOutlineArrowDownTray, HiOutlineDocumentText, HiOutlineCloudArrowUp, HiOutlineCheck } from 'react-icons/hi2';
import ResumeForm from '@/components/resume/ResumeForm';
import ResumeTemplate from '@/components/resume/ResumeTemplate';
import { resumeApi } from '@/utils/resume_api';
import { useRouter } from 'next/navigation';
import defaultResumeData from '@/constants/resume';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export default function ResumePage() {
  const { resumeBuildId } = useParams();
  const router = useRouter();
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [showPreview, setShowPreview] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [templateId, setTemplateId] = useState(Number(resumeBuildId) || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (resumeBuildId) {
      setTemplateId(Number(resumeBuildId));
    }
  }, [resumeBuildId]);

  const handleDownloadPdf = async () => {
    const blob = await pdf(<ResumeTemplate templateId={templateId} data={resumeData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.basics.name.replace(/\s+/g, '_')}_Resume.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveResume = async () => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const blob = await pdf(<ResumeTemplate templateId={templateId} data={resumeData} />).toBlob();
      const formData = new FormData();
      formData.append("pdf_file", blob, `${resumeData.basics.name.replace(/\s+/g, '_')}_Resume.pdf`);
      formData.append("resume_data", JSON.stringify(resumeData));
      await resumeApi.post("/resumes/build", formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err?.message || "Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setShowPreview(true);
      setIsCompiling(false);
    }, 500);
  };

  return (
    <div className={`min-h-screen pt-10 flex flex-col w-full  ${poppins.variable} font-sans overflow-x-hidden`} style={{ fontFamily: 'var(--font-poppins)' }}>
      <div className="border-b border-border shadow-sm">
        <div className="w-full px-4 md:px-6 pb-4">
          <div className="flex justify-between items-center">
            <div className='flex items-center gap-3'>
              <button
                onClick={() => router.back()}
                className="p-4 bg-card border border-border rounded-2xl hover:bg-secondary transition-all shadow-sm hover:shadow-md group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-muted-foreground group-hover:-translate-x-1 transition-transform"
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
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  Resume Builder
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Create your professional resume with ease
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {saveError && (
                <span className="text-xs text-destructive font-semibold bg-destructive/10 px-3 py-1.5 rounded-lg">
                  {saveError}
                </span>
              )}
              <button
                onClick={handleSaveResume}
                disabled={isSaving}
                className={`px-5 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${
                  saveSuccess
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400'
                    : 'bg-primary text-primary-foreground hover:bg-emerald-700 hover:shadow-emerald-200/50 disabled:opacity-50'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <HiOutlineCheck className="w-5 h-5" />
                    Saved
                  </>
                ) : (
                  <>
                    <HiOutlineCloudArrowUp className="w-5 h-5" />
                    Save Resume
                  </>
                )}
              </button>
              {showPreview && (
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <HiOutlineArrowDownTray className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">PDF</span>
                </button>
              )}
              <div className="relative group">
                <button className="flex items-center gap-3 px-5 py-3 bg-card text-foreground border border-border rounded-xl font-bold hover:bg-secondary transition-all shadow-sm">
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
                <div className="absolute top-full right-0 mt-2 w-58 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 transform origin-top-right group-hover:translate-y-0 translate-y-2">
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
                          ? 'bg-emerald-500/10 border-r-4 border-emerald-500' 
                          : 'hover:bg-muted border-r-4 border-transparent'
                      }`}
                    >
                      <span className={`text-sm font-bold ${templateId === t.id ? 'text-emerald-500' : 'text-foreground'}`}>
                        {t.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-2 gap-6">
          <div className="bg-card overflow-hidden rounded-xl shadow-lg border border-border">
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold text-foreground">
                  Edit Resume Data
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill in your information and compile to preview
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ResumeForm data={resumeData} onChange={setResumeData} />
              </div>
            </div>
          </div>

          <div className="bg-muted overflow-hidden rounded-xl shadow-lg border border-border">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-card">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Live Preview
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {showPreview ? 'Your resume is ready' : 'Compile to see your resume'}
                  </p>
                </div>
                <button
                  onClick={handleCompile}
                  disabled={isCompiling}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-primary transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompiling ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500"></div>
                      Compiling...
                    </span>
                  ) : (
                    <span className='flex items-center'>
                      <HiOutlineArrowPath className="w-5 h-5 mr-2" />
                      Compile Preview
                    </span>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center p-1 bg-card">
                {isCompiling ? (
                  <div className="h-full w-full bg-card rounded-xl overflow-hidden">
                    <div className="h-full w-full animate-pulse space-y-4 p-8">
                      <div className="h-8 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="space-y-2 pt-4">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                      </div>
                      <div className="space-y-2 pt-6">
                        <div className="h-4 bg-emerald-500/20 rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-4/5"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                      <div className="space-y-2 pt-6">
                        <div className="h-4 bg-emerald-500/20 rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ) : showPreview ? (
                  <div className="h-full w-full bg-white overflow-hidden shadow-inner">
                    <PDFViewer width="100%" height="100%" showToolbar={false} className="border-0">
                      <ResumeTemplate templateId={templateId} data={resumeData} />
                    </PDFViewer>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
                      <HiOutlineDocumentText className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Preview Yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Fill in your resume details and click <span className="font-semibold text-emerald-500">Compile Preview</span> to generate your professional resume.
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
