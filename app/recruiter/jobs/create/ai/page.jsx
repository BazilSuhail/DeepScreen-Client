'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HiOutlineSparkles,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineCheck,
  HiOutlineExclamationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineMinusCircle,
  HiOutlineLightBulb,
} from 'react-icons/hi2';
import { api } from '@/utils/api';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import FormError from '@/components/auth/FormError';
import JobAiChat from '@/components/jobs/JobAiChat';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const secondaryButton = `inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/20 ${focusRing}`;

const JOB_FIELDS = [
  { key: 'job_title', label: 'Job title' },
  { key: 'organization', label: 'Organization' },
  { key: 'department', label: 'Department' },
  { key: 'location', label: 'Location' },
  { key: 'job_type', label: 'Job type' },
  { key: 'experience_level', label: 'Experience level' },
  { key: 'salary_range', label: 'Salary range' },
  { key: 'job_description', label: 'Description' },
  { key: 'responsibilities', label: 'Responsibilities' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'key_skills', label: 'Key skills' },
  { key: 'interview_pipeline', label: 'Interview pipeline' },
  { key: 'status', label: 'Status' },
];

const LABELS = Object.fromEntries(JOB_FIELDS.map((f) => [f.key, f.label]));
const STAGE_NAMES = { shortlist: 'AI Shortlist', coding: 'Coding Test', ai_interview: 'AI Interview', real_interview: 'Human Interview' };

const GREETING = 'Hi, I will help you set up a job posting. Describe the role in your own words, and I will ask about the title, location, job type, experience level, responsibilities, requirements, key skills and salary range. The draft on the right fills in as we go, and you review everything before the job is created.';

const MAX_HISTORY = 30;

const isFilled = (v) => (Array.isArray(v) ? v.some((x) => String(x).trim() !== '') : v !== undefined && v !== null && String(v).trim() !== '');

// Turns { field: string | string[] } from the server into { field: string }.
const toMessages = (errors) => {
  if (!errors || typeof errors !== 'object') return {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? String(v[0] ?? '') : String(v)]));
};

const fieldList = (keys) => keys.map((k) => LABELS[k] || 'the job details').join(', ');

const STATUS = {
  invalid: { Icon: HiOutlineExclamationTriangle, className: 'text-red-400' },
  missing: { Icon: HiOutlineExclamationCircle, className: 'text-amber-500' },
  filled: { Icon: HiOutlineCheck, className: 'text-emerald-600 dark:text-emerald-500' },
  optional: { Icon: HiOutlineMinusCircle, className: 'text-emerald-700/50 dark:text-slate-500' },
};

function FieldValue({ fieldKey, value }) {
  if (Array.isArray(value) && fieldKey === 'interview_pipeline') {
    return <p>{value.map((v) => STAGE_NAMES[v] || v).join(' → ')}</p>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-0.5 pl-4">
        {value.filter((x) => String(x).trim()).map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    );
  }
  return <p className="line-clamp-4 whitespace-pre-wrap">{String(value)}</p>;
}

export default function CreateJobWithAiPage() {
  const router = useRouter();
  const idRef = useRef(1);
  const newId = () => ++idRef.current;

  const [messages, setMessages] = useState(() => [{ id: 1, role: 'assistant', content: GREETING }]);
  const [draft, setDraft] = useState({});
  const [missing, setMissing] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Sends the full history (without failed-reply bubbles) and applies the assistant's answer.
  const requestReply = async (history) => {
    const base = history.filter((m) => !m.failed);
    setMessages(base);
    setPending(true);
    setError(null);
    try {
      const payload = base.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
      const res = await api.post('/jobs/ai-setup/', { messages: payload, draft });
      setMessages([...base, { id: newId(), role: 'assistant', content: res.reply }]);
      setDraft(res.draft || {});
      setMissing(res.missing || []);
      setFieldErrors(toMessages(res.errors));
      setReady(Boolean(res.ready));
    } catch {
      setMessages([
        ...base,
        {
          id: newId(),
          role: 'assistant',
          failed: true,
          content: 'I could not reach the assistant, so your last message has not been answered yet. Try again when you are ready.',
        },
      ]);
      setError({ title: 'Assistant unavailable', message: 'We could not reach the assistant. Check your connection and try again.' });
    } finally {
      setPending(false);
    }
  };

  const send = (text) => requestReply([...messages, { id: newId(), role: 'user', content: text }]);
  const retry = () => requestReply(messages);

  const createJob = async () => {
    if (!ready) return;
    setCreating(true);
    setError(null);
    try {
      await api.post('/jobs/ai-setup/create/', { draft });
      router.push('/recruiter/jobs');
    } catch (err) {
      // api.js puts the parsed body on err.errors, so the backend's {errors, missing} sits one level down.
      const body = err?.errors;
      if (err?.status === 400 && body && typeof body === 'object' && body.errors && typeof body.errors === 'object') {
        const errs = toMessages(body.errors);
        const keys = [...new Set([...Object.keys(errs), ...(Array.isArray(body.missing) ? body.missing : [])])];
        setFieldErrors(errs);
        setMissing(Array.isArray(body.missing) ? body.missing : []);
        setFieldErrors(errs);
        setReady(false);
        setMessages((prev) => [
          ...prev.filter((m) => !m.failed),
          {
            id: newId(),
            role: 'assistant',
            content: `The job was not created. Please fix these fields: ${fieldList(keys)}. Tell me the changes in the chat and I will update the draft.`,
          },
        ]);
      } else {
        setError({ title: 'Job not created', message: 'The job could not be created. Try again in a moment.' });
      }
    } finally {
      setCreating(false);
    }
  };

  const filledCount = JOB_FIELDS.filter((f) => isFilled(draft[f.key])).length;

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      <DashboardBanner
        icon={HiOutlineSparkles}
        badge={{ label: 'AI setup', icon: HiOutlineSparkles }}
        title="Create a job with AI"
        subtitle="Chat with the assistant and review the draft before the job is created."
        footer={
          <span className="flex items-start gap-2">
            <HiOutlineLightBulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <span>The draft fills in as you chat. Nothing is created until you review it.</span>
          </span>
        }
        aside={
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link
              href="/recruiter/jobs/create"
              title="Go back to the manual job form"
              className={secondaryButton}
            >
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to manual form
            </Link>
          </div>
        }
      />

      {error && <FormError title={error.title} message={error.message} />}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <JobAiChat messages={messages} pending={pending} onSend={send} onRetry={retry} />

        <aside aria-label="Job draft" className="min-w-0 rounded-2xl border border-emerald-100 bg-white dark:border-white/10 dark:bg-card lg:sticky lg:top-6">
          <div className="border-b border-emerald-100 p-4 md:p-5 dark:border-white/10">
            <h2 className="text-sm font-semibold text-emerald-950 dark:text-white">Job draft</h2>
            <p className="mt-0.5 text-xs text-emerald-800/70 dark:text-slate-400">{filledCount} of {JOB_FIELDS.length} fields filled</p>
          </div>

          {missing.length > 0 && (
            <div className="m-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-500">Still needed</p>
              <p className="mt-0.5 break-words text-xs text-emerald-800/80 dark:text-slate-400">
                {missing.map((k) => LABELS[k] || k).join(', ')}
              </p>
            </div>
          )}

          <ul className="divide-y divide-emerald-100 dark:divide-white/10">
            {JOB_FIELDS.map((f) => {
              const value = draft[f.key];
              const isMissing = missing.includes(f.key);
              const invalid = Boolean(fieldErrors[f.key]);
              const status = invalid ? 'invalid' : isMissing ? 'missing' : isFilled(value) ? 'filled' : 'optional';
              const { Icon, className } = STATUS[status];
              return (
                <li key={f.key} className="flex gap-3 px-4 py-3 md:px-5">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${className}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-800/80 dark:text-slate-400">
                      {f.label}
                      {isMissing && <span className="text-amber-600 dark:text-amber-500">Required</span>}
                    </p>
                    {invalid && <p className="mt-0.5 break-words text-xs text-red-400">{fieldErrors[f.key]}</p>}
                    <div className="mt-0.5 min-w-0 break-words text-sm text-emerald-950 dark:text-foreground">
                      {isFilled(value) ? (
                        <FieldValue fieldKey={f.key} value={value} />
                      ) : (
                        <span className="text-xs text-emerald-800/60 dark:text-slate-500">Not set yet</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {ready && (
            <div className="border-t border-emerald-100 p-4 md:p-5 dark:border-white/10">
              <button
                type="button"
                onClick={createJob}
                disabled={pending || creating}
                className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50 ${focusRing}`}
              >
                <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
                {creating ? 'Creating job...' : 'Create job'}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
