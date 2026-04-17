'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiOutlineChevronLeft, HiOutlineSparkles, HiOutlineCheckCircle,
  HiOutlineBriefcase, HiOutlineCog6Tooth, HiOutlineChatBubbleLeftRight,
  HiOutlinePaperAirplane, HiOutlineArrowPath,
  HiOutlineDocumentText, HiOutlineClock, HiOutlineStar,
  HiOutlineShieldCheck, HiOutlinePencilSquare, HiOutlineEye,
  HiOutlineHashtag, HiOutlineBars3BottomLeft, HiOutlineMapPin,
  HiOutlineListBullet, HiOutlineDocumentCheck,
} from 'react-icons/hi2';

const WIZARD_STEPS = [
  { key: 'job', label: 'SELECT JOB', icon: HiOutlineBriefcase },
  { key: 'method', label: 'CREATION METHOD', icon: HiOutlineCog6Tooth },
  { key: 'generate', label: 'AI GENERATE', icon: HiOutlineSparkles },
  { key: 'review', label: 'REVIEW & CONFIRM', icon: HiOutlineCheckCircle },
];

export default function CreateAIInterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState('job');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [method, setMethod] = useState(null);

  // Manual form
  const [form, setForm] = useState({
    title: '', description: '', system_prompt: '',
    context_for_ai: '', evaluation_criteria: { technical_depth: 0.4, problem_solving: 0.3, communication: 0.3 },
    number_of_questions: 5, duration_minutes: 20, passing_score: 65, questions: [],
  });

  // AI Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [chatError, setChatError] = useState('');
  const chatEndRef = useRef(null);

  // Save
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchJobs = async () => {
    try {
      const data = await api.get('/jobs/recruiter/');
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startChatGeneration = async () => {
    setChatMessages([{
      role: 'assistant',
      content: `I'll help you design the perfect AI interview for **${selectedJob.job_title}**. Let me ask you a few questions first.\n\nWhat would you like to name this interview?`,
    }]);
    setMethod('ai');
    setStep('generate');
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: chatInput.trim() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError('');

    try {
      const res = await api.post('/ai-interviews/generate/chat/', {
        job_id: selectedJob.job_id,
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
      });

      if (res.type === 'config') {
        setGeneratedConfig(res.config);
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: "Perfect! I've generated the interview configuration. Let me show you the preview.",
          isComplete: true,
        }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: res.content }]);
      }
    } catch (e) {
      setChatError(e.message || 'Failed to generate');
      setChatMessages(chatMessages);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    const payload = {
      job: selectedJob.job_id,
      ...(generatedConfig || form),
    };
    try {
      const res = await api.post('/ai-interviews/generate/confirm/', payload);
      router.push(`/recruiter/ai-interview/${res.interview_id}`);
    } catch (e) {
      if (e.status === 409) {
        setSaveError('An interview already exists for this job. Please select a different job.');
      } else {
        setSaveError(e.message || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleManualCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const res = await api.post('/ai-interviews/generate/confirm/', {
        job: selectedJob.job_id, ...form,
      });
      router.push(`/recruiter/ai-interview/${res.interview_id}`);
    } catch (e) {
      setSaveError(e.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const activeConfig = generatedConfig || form;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-emerald-500" />
          <HiOutlineSparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 text-emerald-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 pb-32 grid grid-cols-1 lg:grid-cols-4 gap-10 items-start pt-6">
      
      {/* LEFT COLUMN: Vertical Header-Style Sidebar Navigation (Matches image_c68dbb.png) */}
      <div className="lg:col-span-1 glass border border-border/80 rounded-2xl p-5 sticky top-10 space-y-6 shadow-xl shadow-black/10 bg-secondary/5">
        <button
          onClick={() => step === 'job' ? router.back() : setStep('job')}
          className="flex items-center gap-2.5 text-muted-foreground hover:text-emerald-400 transition-colors font-black text-xs uppercase tracking-widest group pl-1"
        >
          <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {step === 'job' ? 'Back' : 'Change Setup'}
        </button>

        <div className="flex flex-col gap-2.5">
          {WIZARD_STEPS.map((s, i) => {
            const isActive = step === s.key;
            const isDone = ['job', 'method', 'generate', 'review'].indexOf(step) > i;
            return (
              <div key={s.key} className="flex flex-col w-full">
                <div className={`flex items-center gap-3.5 px-4 py-4 rounded-xl transition-all duration-300 border ${
                  isActive ? 'bg-emerald-500/[0.07] text-emerald-400 border-emerald-500/40 shadow-inner shadow-emerald-500/10 font-bold' :
                  isDone ? 'bg-emerald-500/[0.02] text-emerald-500/70 border-emerald-500/10 opacity-90' :
                  'text-muted-foreground opacity-30 border-transparent'
                }`}>
                  <s.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span className="text-xs font-black tracking-widest text-left">{s.label}</span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className={`w-0.5 h-6 ml-6.5 my-1 border-l-2 ${
                    isDone ? 'border-emerald-500/30 border-solid' : 'border-border border-dashed'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {selectedJob && (
          <div className="mt-6 pt-5 border-t border-border/60 px-1 space-y-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 opacity-60">
              <HiOutlineBriefcase className="w-3.5 h-3.5" /> Target Context
            </span>
            <div className="text-sm font-bold text-emerald-400 bg-emerald-500/[0.03] border border-emerald-500/10 px-3 py-2 rounded-xl truncate">
              {selectedJob.job_title}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Primary Content & Large Workspace Area */}
      <div className="lg:col-span-3 space-y-8">
        <AnimatePresence mode="wait">
          
          {/* STEP: Job Selection */}
          {step === 'job' && (
            <motion.div key="job" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                  <HiOutlineBriefcase className="text-emerald-500" /> Select Target Assignment
                </h1>
                <p className="text-muted-foreground text-base">Select the job profile data architecture to feed directly into the AI interviewer pipeline.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job) => (
                  <button
                    key={job.job_id}
                    onClick={() => { setSelectedJob(job); setStep('method'); }}
                    className={`glass p-6 py-8 rounded-2xl border-2 transition-all duration-300 text-left flex items-start gap-5 ${
                      selectedJob?.job_id === job.job_id ? 'border-emerald-500 bg-emerald-500/[0.03] shadow-lg' : 'border-border/60 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                      <HiOutlineBriefcase className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-bold text-lg tracking-tight truncate">{job.job_title}</h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <HiOutlineMapPin className="w-3.5 h-3.5 shrink-0" /> {job.location || 'Remote'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP: Method Selection */}
          {step === 'method' && selectedJob && (
            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                  <HiOutlineCog6Tooth className="text-emerald-500" /> Choose Engine Integration
                </h1>
                <p className="text-muted-foreground text-base">Determine the generation blueprint for <span className="text-emerald-400 font-bold">{selectedJob.job_title}</span></p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={startChatGeneration} className="glass p-8 rounded-2xl border-2 border-emerald-500/20 hover:border-emerald-500/60 bg-gradient-to-br from-emerald-500/[0.02] to-transparent transition-all duration-300 text-left group shadow-lg">
                  <HiOutlineSparkles className="w-10 h-10 text-emerald-400 mb-5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">AI-Guided Room</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Interactive layout guided by generative checkpoints matching the platform prompt framework.</p>
                </button>
                <button onClick={() => { setMethod('manual'); setStep('review'); }} className="glass p-8 rounded-2xl border-2 border-border/80 hover:border-emerald-500/40 transition-all duration-300 text-left group shadow-lg">
                  <HiOutlinePencilSquare className="w-10 h-10 text-muted-foreground mb-5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Direct Parameter Override</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Manually formulate metrics weights, assessment matrix rules, and system logic guidelines directly.</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP: AI Chat Generation */}
          {step === 'generate' && method === 'ai' && selectedJob && (
            <motion.div key="generate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="glass border border-border/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
                <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/20 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-black tracking-widest text-muted-foreground">AI DESIGN CONSULTANT</span>
                  </div>
                  {generatedConfig && (
                    <button onClick={() => { setGeneratedConfig(null); setChatMessages([]); setStep('method'); }} className="text-muted-foreground hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 bg-secondary/40 px-3 py-1.5 rounded-lg border border-border">
                      <HiOutlineArrowPath className="w-3.5 h-3.5" /> Start Over
                    </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-5 bg-black/[0.08]">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-md border ${
                        msg.role === 'user' 
                          ? 'bg-emerald-600 text-white rounded-tr-none border-emerald-500' 
                          : 'bg-secondary border-border/80 rounded-tl-none text-foreground'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 items-center px-4 py-2.5 bg-secondary/80 rounded-xl border border-border text-xs font-medium text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" /> Updating model weights...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {generatedConfig ? (
                  <div className="p-5 border-t border-border bg-secondary/20 shrink-0">
                    <button onClick={() => setStep('review')} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200">
                      <HiOutlineEye className="w-4 h-4" /> COMPREHENSIVE STRUCTURAL INSPECTION
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }} className="p-4 border-t border-border flex gap-3 bg-secondary/10 shrink-0">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Provide system guidelines or changes..." className="flex-1 px-5 py-3.5 rounded-xl bg-secondary/50 border border-border focus:border-emerald-500/50 outline-none text-sm transition-all" />
                    <button type="submit" disabled={chatLoading || !chatInput.trim()} className="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 transition-all flex items-center justify-center">
                      <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
                    </button>
                  </form>
                )}
              </div>

              {/* LIVE EMBEDDED REALTIME MONITOR IN CHAT */}
              {activeConfig && (
                <div className="glass border border-border rounded-2xl p-6 bg-secondary/5 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <HiOutlineHashtag className="w-4 h-4 text-emerald-400" /> Target Stream Preview
                    </span>
                    <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 truncate max-w-[280px]">
                      {activeConfig.title || 'Drafting Title...'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-secondary/40 p-3 rounded-xl border border-border space-y-1">
                      <HiOutlineClock className="w-4 h-4 mx-auto text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground uppercase block text-[9px] tracking-wider">DURATION</span>
                      <span className="text-sm font-black font-mono block">{activeConfig.duration_minutes} MINS</span>
                    </div>
                    <div className="bg-secondary/40 p-3 rounded-xl border border-border space-y-1">
                      <HiOutlineDocumentText className="w-4 h-4 mx-auto text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground uppercase block text-[9px] tracking-wider">QUESTIONS</span>
                      <span className="text-sm font-black font-mono block">{activeConfig.number_of_questions} PROMPTS</span>
                    </div>
                    <div className="bg-secondary/40 p-3 rounded-xl border border-border space-y-1">
                      <HiOutlineShieldCheck className="w-4 h-4 mx-auto text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground uppercase block text-[9px] tracking-wider">PASS CRITERIA</span>
                      <span className="text-sm font-black font-mono block text-emerald-400">{activeConfig.passing_score}% ACC</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP: Review & Finalize (Render All Data elegantly at the end) */}
          {step === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              
              {method === 'manual' ? (
                <form onSubmit={handleManualCreate} className="space-y-5">
                  <div className="mb-2">
                    <h2 className="text-2xl font-extrabold flex items-center gap-2">
                      <HiOutlinePencilSquare className="text-emerald-500" /> Manual Matrix Configuration
                    </h2>
                    <p className="text-sm text-muted-foreground">Adjust explicit system rules and criteria configurations directly below.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1">INTERVIEW TITLE</span>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Interview Title (e.g., Core React Engineering Architecture)" className="w-full px-5 py-4 rounded-xl bg-secondary/40 border border-border focus:border-emerald-500/50 outline-none text-sm transition-all" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1">DESCRIPTION BRIEF</span>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short Description..." rows={2} className="w-full px-5 py-4 rounded-xl bg-secondary/40 border border-border focus:border-emerald-500/50 outline-none text-sm resize-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1">SYSTEM MATRIX INSTRUCTIONS</span>
                    <textarea required value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})} placeholder="System Evaluation Matrix Instructions..." rows={5} className="w-full px-5 py-4 rounded-xl bg-secondary/40 border border-border focus:border-emerald-500/50 font-mono outline-none text-xs leading-relaxed resize-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1">TOTAL QUESTIONS COUNT</span>
                      <input type="number" placeholder="Questions count" value={form.number_of_questions} onChange={e => setForm({...form, number_of_questions: +e.target.value})} className="w-full px-5 py-4 rounded-xl bg-secondary/40 border border-border text-sm font-mono" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1">MAX TIME GUIDELINE (MINS)</span>
                      <input type="number" placeholder="Duration (min)" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: +e.target.value})} className="w-full px-5 py-4 rounded-xl bg-secondary/40 border border-border text-sm font-mono" />
                    </div>
                  </div>
                  {saveError && <div className="text-red-400 font-bold text-xs bg-red-500/5 border border-red-500/10 p-3 rounded-xl">{saveError}</div>}
                  <button type="submit" disabled={saving} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 font-black text-xs uppercase tracking-widest rounded-xl text-white transition-all duration-200">
                    {saving ? 'DEPLOYING ENGINE MODULE...' : 'DEPLOY INTERVIEW MODEL'}
                  </button>
                </form>
              ) : (
                /* AI Summary End Matrix View */
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
                      <HiOutlineDocumentCheck className="text-emerald-500" /> Blueprint Architecture Review
                    </h2>
                    <p className="text-muted-foreground text-sm">Review full parameters parsed from your generative consultation sequence prior to cluster deployment.</p>
                  </div>

                  <div className="glass border border-border rounded-2xl p-6 space-y-6 shadow-xl bg-secondary/5">
                    <div className="border-b border-border pb-4">
                      <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                        <HiOutlineSparkles className="w-6 h-6 text-emerald-400" /> {activeConfig.title}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{activeConfig.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-secondary/40 border border-border rounded-xl flex items-center gap-3">
                        <HiOutlineClock className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="text-[9px] font-black tracking-wider block text-muted-foreground uppercase">TIME SPECIFICATION</span>
                          <span className="text-sm font-bold">{activeConfig.duration_minutes} Minutes Max</span>
                        </div>
                      </div>
                      <div className="p-4 bg-secondary/40 border border-border rounded-xl flex items-center gap-3">
                        <HiOutlineListBullet className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="text-[9px] font-black tracking-wider block text-muted-foreground uppercase">TOTAL QUESTION BUILDS</span>
                          <span className="text-sm font-bold">{activeConfig.number_of_questions} Active Prompts</span>
                        </div>
                      </div>
                      <div className="p-4 bg-secondary/40 border border-border rounded-xl flex items-center gap-3">
                        <HiOutlineShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="text-[9px] font-black tracking-wider block text-muted-foreground uppercase">PASS SELECTION RATIO</span>
                          <span className="text-sm font-bold text-emerald-400">{activeConfig.passing_score}% Accuracy Score</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-black/20 border border-border/80 rounded-xl space-y-2.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <HiOutlineBars3BottomLeft className="w-4 h-4" /> COMPILATION INSTRUCTIONS PROMPT
                      </span>
                      <p className="text-xs font-mono leading-relaxed text-muted-foreground max-h-[160px] overflow-y-auto whitespace-pre-wrap pr-2">
                        {activeConfig.system_prompt}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block flex items-center gap-1.5">
                        <HiOutlineStar className="w-4 h-4 text-emerald-400" /> Evaluation Vectors & Balanced Weights
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(activeConfig.evaluation_criteria || {}).map(([key, val]) => (
                          <div key={key} className="p-4 bg-secondary/30 border border-border rounded-xl flex flex-col justify-between gap-1.5">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight text-[10px]">{key.replace(/_/g, ' ')}</span>
                            <span className="text-xl font-black text-emerald-400">{Math.round(val * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {saveError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">{saveError}</div>}
                  <div className="flex gap-4">
                    <button onClick={() => { setGeneratedConfig(null); setChatMessages([]); setStep('generate'); }} className="flex-1 py-4 bg-secondary hover:bg-secondary/80 border border-border text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                      RE-GENERATE
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all">
                      {saving ? 'DEPLOYING FRAMEWORK CLUSTER...' : 'CONFIRM & SAVE DEPLOYMENT'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}