'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiOutlineChevronLeft, HiOutlineSparkles, HiOutlineCheckCircle,
  HiOutlineBriefcase, HiOutlineCog6Tooth, HiOutlineChatBubbleLeftRight,
  HiOutlinePaperAirplane, HiOutlineExclamationCircle, HiOutlineArrowPath,
  HiOutlineDocumentText, HiOutlineClock, HiOutlineStar,
  HiOutlineShieldCheck, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlinePlusCircle, HiOutlineEye,
} from 'react-icons/hi2';

const WIZARD_STEPS = [
  { key: 'job', label: 'Select Job', icon: HiOutlineBriefcase },
  { key: 'method', label: 'Creation Method', icon: HiOutlineCog6Tooth },
  { key: 'generate', label: 'AI Generate', icon: HiOutlineSparkles },
  { key: 'review', label: 'Review & Confirm', icon: HiOutlineCheckCircle },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
          <HiOutlineSparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Back */}
      <button
        onClick={() => step === 'job' ? router.back() : setStep('job')}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-black text-[10px] uppercase tracking-widest group mb-8"
      >
        <HiOutlineChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {step === 'job' ? 'Back to Interviews' : 'Change Job'}
      </button>

      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-12">
        {WIZARD_STEPS.filter(s => method !== 'ai' || s.key !== 'manual').map((s, i) => {
          const isActive = step === s.key;
          const isDone = ['job', 'method', 'generate', 'review'].indexOf(step) > i;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                isDone ? 'bg-emerald-500/5 text-emerald-400' :
                'text-slate-400'
              }`}>
                <s.icon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
              </div>
              {i < WIZARD_STEPS.length - 1 && <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP: Job Selection */}
        {step === 'job' && (
          <motion.div key="job" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="mb-10">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gradient mb-3">Select a Job</h1>
              <p className="text-slate-500 font-medium">Choose which job opening this AI interview will be linked to.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <motion.button
                  key={job.job_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedJob(job); setStep('method'); }}
                  className={`group relative glass p-8 rounded-[2.5rem] border-2 transition-all text-left ${
                    selectedJob?.job_id === job.job_id
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/10'
                      : 'border-border hover:border-emerald-500/30'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-5">
                    <HiOutlineBriefcase className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-emerald-500 transition-colors">
                    {job.job_title}
                  </h3>
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                    <HiOutlineDocumentText className="w-4 h-4" />
                    <span className="line-clamp-1">{job.location || 'Remote'}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP: Method Selection */}
        {step === 'method' && selectedJob && (
          <motion.div key="method" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  {selectedJob.job_title}
                </span>
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gradient mb-3">How would you like to create this interview?</h1>
              <p className="text-slate-500 font-medium">Choose your preferred way to set up the AI interview configuration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startChatGeneration}
                className="group relative glass p-10 rounded-[3rem] border-2 border-emerald-500/20 hover:border-emerald-500/50 transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                    <HiOutlineSparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight mb-3">AI-Assisted</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Let our AI guide you through a conversational setup. Answer a few questions and get a fully generated interview configuration.
                  </p>
                  <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                    <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> Chat Interface
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMethod('manual')}
                className="group relative glass p-10 rounded-[3rem] border-2 border-border hover:border-emerald-500/30 transition-all text-left overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
                    <HiOutlinePencilSquare className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight mb-3">Manual Setup</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Take full control. Configure every detail yourself — prompts, scoring criteria, questions, and session parameters.
                  </p>
                  <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    <HiOutlineCog6Tooth className="w-4 h-4" /> Full Configuration
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP: AI Chat Generation */}
        {step === 'generate' && method === 'ai' && selectedJob && (
          <motion.div key="generate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass border border-border rounded-[2.5rem] overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 p-6 border-b border-border bg-secondary/20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <HiOutlineSparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">AI Interview Designer</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Configuring for {selectedJob.job_title}</p>
                </div>
                {generatedConfig && (
                  <button
                    onClick={() => { setGeneratedConfig(null); setChatMessages([]); setStep('method'); }}
                    className="ml-auto p-2 rounded-lg hover:bg-secondary text-slate-400 transition-all"
                  >
                    <HiOutlineArrowPath className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-secondary/50 border border-border rounded-tl-none'
                    } ${msg.isComplete ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary/50 border border-border">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Thinking</span>
                    </div>
                  </motion.div>
                )}
                {chatError && (
                  <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                    {chatError}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input or Next */}
              {generatedConfig ? (
                <div className="p-6 border-t border-border bg-secondary/10">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('review')}
                    className="w-full py-4 rounded-[1.5rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3"
                  >
                    <HiOutlineEye className="w-5 h-5" /> Preview Generated Configuration
                  </motion.button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }}
                  className="p-4 border-t border-border flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={chatLoading}
                    className="flex-1 px-6 py-3.5 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500/50 transition-all text-sm font-medium disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-3.5 rounded-[1.5rem] bg-emerald-600 text-white disabled:opacity-50 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                  >
                    {chatLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP: Review & Confirm */}
        {step === 'review' && (generatedConfig || method === 'manual') && (
          <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="mb-10">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gradient mb-3">Review Configuration</h1>
              <p className="text-slate-500 font-medium">Review the generated interview setup before saving.</p>
            </div>

            {method === 'manual' ? (
              <form onSubmit={handleManualCreate} className="max-w-4xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Interview Title</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      placeholder="e.g. Senior Frontend AI Screen"
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500 transition-all font-medium" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      rows={3} placeholder="What is this interview about?"
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500 transition-all font-medium resize-none" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">System Prompt (Instructions for AI Evaluator)</label>
                    <textarea required value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})}
                      rows={5} placeholder="You are evaluating a candidate for..."
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500 transition-all font-medium resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Questions Count</label>
                    <input type="number" value={form.number_of_questions} onChange={e => setForm({...form, number_of_questions: +e.target.value})}
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Duration (min)</label>
                    <input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: +e.target.value})}
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-secondary/30 border border-border outline-none focus:border-emerald-500 transition-all font-medium" />
                  </div>
                </div>

                {saveError && (
                  <div className="p-4 rounded-[1rem] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" /> {saveError}
                  </div>
                )}

                <button type="submit" disabled={saving}
                  className="w-full py-5 rounded-[2rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <><HiOutlineSparkles className="w-5 h-5" /> Create Interview</>}
                </button>
              </form>
            ) : (
              /* AI Generated Review */
              <div className="max-w-4xl space-y-8">
                <div className="glass border border-border rounded-[2.5rem] p-10 space-y-8">
                  {/* Title & Meta */}
                  <div className="flex items-start justify-between border-b border-border pb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <HiOutlineSparkles className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-3xl font-black italic uppercase tracking-tight">{generatedConfig.title}</h3>
                      </div>
                      <p className="text-slate-500 text-sm">{generatedConfig.description}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-1.5 text-slate-400 bg-secondary/30 px-4 py-2 rounded-xl">
                        <HiOutlineClock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{generatedConfig.duration_minutes}m</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 bg-secondary/30 px-4 py-2 rounded-xl">
                        <HiOutlineDocumentText className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{generatedConfig.number_of_questions} Q</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl">
                        <HiOutlineShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pass: {generatedConfig.passing_score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                      <HiOutlineCog6Tooth className="w-4 h-4" /> System Prompt
                    </div>
                    <div className="p-6 rounded-[1.5rem] bg-secondary/20 border border-border text-sm leading-relaxed font-medium italic text-slate-600 dark:text-slate-400">
                      {generatedConfig.system_prompt}
                    </div>
                  </div>

                  {/* Context */}
                  {generatedConfig.context_for_ai && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                        <HiOutlineEye className="w-4 h-4" /> Context for AI
                      </div>
                      <div className="p-6 rounded-[1.5rem] bg-secondary/20 border border-border text-sm leading-relaxed font-medium">
                        {generatedConfig.context_for_ai}
                      </div>
                    </div>
                  )}

                  {/* Evaluation Criteria */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                      <HiOutlineStar className="w-4 h-4" /> Evaluation Criteria
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(generatedConfig.evaluation_criteria || {}).map(([name, weight]) => (
                        <div key={name} className="p-5 rounded-[1.5rem] bg-secondary/30 border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-tight italic">{name.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] font-black text-emerald-500">{Math.round(weight * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${weight * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                      <HiOutlineDocumentText className="w-4 h-4" /> Interview Questions
                    </div>
                    <div className="space-y-3">
                      {(generatedConfig.questions || []).map((q, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 rounded-[1.5rem] bg-secondary/20 border border-border">
                          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-[10px] font-black opacity-30 shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-sm font-medium leading-relaxed pt-1">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {saveError && (
                  <div className="p-4 rounded-[1rem] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" /> {saveError}
                  </div>
                )}

                <div className="flex gap-4">
                  <button onClick={() => { setGeneratedConfig(null); setChatMessages([]); setStep('generate'); }}
                    className="flex-1 py-5 rounded-[2rem] bg-secondary font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 transition-all">
                    <HiOutlineArrowPath className="w-4 h-4 inline mr-2" /> Regenerate
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-[2] py-5 rounded-[2rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {saving ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving...</>
                      : <><HiOutlineCheckCircle className="w-5 h-5" /> Confirm & Save Interview</>}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
