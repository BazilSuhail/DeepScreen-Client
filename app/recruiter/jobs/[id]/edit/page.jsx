'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '@/utils/api';
import { SelectField } from '@/components/forms/FormFields';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    HiOutlineAcademicCap,
    HiOutlineArrowLeft,
    HiOutlineArrowPath,
    HiOutlineArrowRight,
    HiOutlineBookOpen,
    HiOutlineBriefcase,
    HiOutlineBuildingOffice2,
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineClipboardDocumentCheck,
    HiOutlineClock,
    HiOutlineCommandLine,
    HiOutlineCpuChip,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlineExclamationCircle,
    HiOutlineFlag,
    HiOutlineGlobeAlt,
    HiOutlineInboxArrowDown,
    HiOutlineListBullet,
    HiOutlineMapPin,
    HiOutlinePencilSquare,
    HiOutlinePlusCircle,
    HiOutlineRocketLaunch,
    HiOutlineUserGroup,
    HiOutlineWrenchScrewdriver,
    HiOutlineXMark,
} from 'react-icons/hi2';
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
import FormError from '@/components/auth/FormError';
import JobFormLayout from '@/components/jobs/JobFormLayout';
import JobPreviewCard from '@/components/jobs/JobPreviewCard';
import JobChecklist from '@/components/jobs/JobChecklist';
import {
    inputClass,
    FormSection,
    FormRow,
    Field,
    SkillsInput,
    PrimaryButton,
    SecondaryButton,
} from '@/components/jobs/JobFormPrimitives';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const primaryButton = `inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
const secondaryButton = `inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/20 ${focusRing}`;

const STATUS_OPTIONS = ['open', 'draft', 'paused', 'closed', 'filled'].map(value => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const MAX = {
    job_title: 200,
    department: 100,
    location: 200,
    salary_range: 100,
    job_description: 5000,
    key_skills: 20,
    requirements: 30,
    responsibilities: 30,
};

const MAX_ITEM_LENGTH = 200;
const FIELD_KEYS = ['job_title', 'organization', 'department', 'location', 'job_type', 'experience_level', 'salary_range', 'job_description', 'responsibilities', 'requirements', 'key_skills', 'interview_pipeline', 'status'];

const PIPELINE_STEPS = [
    { id: 'shortlist', name: 'AI Shortlist' },
    { id: 'coding', name: 'Coding Test' },
    { id: 'ai_interview', name: 'AI Interview' },
    { id: 'real_interview', name: 'Human Interview' },
];

const JOB_TYPES = ['Full-time', 'Contract', 'Remote', 'Freelance', 'Internship'];
const EXP_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Lead'];

// The form is split into cards. Each card is one step in the progress bar at the top of the form.
const SECTIONS = [
    { id: 'basics', label: 'Basics', title: 'Basics', description: 'Who is hiring, and where the role sits.', icon: HiOutlineBriefcase, fields: ['job_title', 'organization', 'department', 'location'] },
    { id: 'pay', label: 'Pay and type', title: 'Compensation and type', description: 'What the role pays and the kind of commitment it is.', icon: HiOutlineCurrencyDollar, fields: ['job_type', 'experience_level', 'salary_range'] },
    { id: 'skills', label: 'Skills', title: 'Skills and requirements', description: 'What candidates need to bring and what they will do.', icon: HiOutlineWrenchScrewdriver, fields: ['key_skills', 'requirements', 'responsibilities'] },
    { id: 'description', label: 'Description', title: 'Description', description: 'The longer story of the role, the team and the company.', icon: HiOutlineDocumentText, fields: ['job_description'] },
    { id: 'screening', label: 'Screening', title: 'Screening stages', description: 'The stages candidates move through after applying.', icon: HiOutlineCommandLine, fields: ['interview_pipeline'] },
];
const FIELD_ORDER = SECTIONS.flatMap(s => s.fields);

// List editors use these id prefixes, so the first item of each list is focusable by its field key.
const LIST_ID_PREFIX = { responsibilities: 'responsibility', requirements: 'requirement' };

const sectionDomId = (id) => `job-section-${id}`;
const focusTargetId = (key) => (LIST_ID_PREFIX[key] ? `${LIST_ID_PREFIX[key]}-0` : key);
const toOptions = (list) => list.map(value => ({ value, label: value }));
const cleanList = (list) => (list ?? []).filter(v => v.trim());

// Same comparison for dirty checks: empty list items are ignored, nulls are treated as empty, key order is fixed.
function snapshot(form) {
    const normalized = {
        ...form,
        responsibilities: cleanList(form.responsibilities),
        requirements: cleanList(form.requirements),
        key_skills: cleanList(form.key_skills),
    };
    return JSON.stringify(FIELD_KEYS.map(key => normalized[key] ?? ''));
}

function buildBaseline(orgs, initialValues) {
    return {
        ...initialValues,
        organization: initialValues?.organization || orgs[0]?.org_id || '',
    };
}

// Scrolls to an element. Reduced motion users get an instant jump.
function scrollToEl(el, block = 'start') {
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block });
}

function ListEditor({ id, groupLabel, label, icon: Icon, hint, error, items, max, placeholder, onChange, onAdd, onRemove }) {
    return (
        <fieldset aria-labelledby={`${id}-group`} className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                <p id={`${id}-group`} className="text-sm font-medium text-neutral-800 dark:text-slate-200">{groupLabel}</p>
            </div>
            {items.map((item, i) => (
                <div key={i} className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                        <Field id={`${id}-${i}`} label={`${label} ${i + 1}`}>
                            <input
                                id={`${id}-${i}`}
                                name={`${id}-${i}`}
                                type="text"
                                value={item}
                                placeholder={placeholder}
                                maxLength={MAX_ITEM_LENGTH}
                                aria-invalid={error ? true : undefined}
                                className={inputClass}
                                onChange={e => onChange(i, e.target.value.slice(0, MAX_ITEM_LENGTH))}
                            />
                        </Field>
                    </div>
                    {items.length > 1 && (
                        <button
                            type="button"
                            onClick={() => onRemove(i)}
                            title={`Remove ${label.toLowerCase()} ${i + 1}`}
                            aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-rose-600 transition-colors hover:bg-rose-50 dark:border-white/10 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                            <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}
                </div>
            ))}
            <div className="flex items-center justify-between gap-3">
                {items.length < max ? (
                    <button type="button" onClick={onAdd} className={SecondaryButton}>
                        <HiOutlinePlusCircle className="h-5 w-5" aria-hidden="true" /> Add {label.toLowerCase()}
                    </button>
                ) : <span />}
                <span className="text-[11px] tabular-nums text-neutral-500 dark:text-slate-400">{items.length}/{max}</span>
            </div>
            {error ? (
                <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                </p>
            ) : hint && (
                <p id={`${id}-hint`} className="text-xs text-neutral-500 dark:text-slate-400">{hint}</p>
            )}
        </fieldset>
    );
}

// Progress through the form. Each step scrolls to its card.
function SectionSteps({ currentId, errorIds, onSelect }) {
    return (
        <nav aria-label="Form sections">
            <ol className="flex flex-wrap gap-2">
                {SECTIONS.map((section, i) => {
                    const Icon = section.icon;
                    const active = section.id === currentId;
                    const hasError = errorIds.includes(section.id);
                    return (
                        <li key={section.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(section.id)}
                                aria-current={active ? 'step' : undefined}
                                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${focusRing} ${active
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-emerald-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-400/50'
                                    }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums ${active ? 'bg-white/20' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'}`}
                                >
                                    {i + 1}
                                </span>
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                {section.label}
                                {hasError && (
                                    <>
                                        <HiOutlineExclamationCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" aria-hidden="true" />
                                        <span className="sr-only">(needs attention)</span>
                                    </>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// The job form. Mounted once the job has loaded, so its baseline comes from the saved job.
function EditJobForm({ initialValues, orgs, statusControl, onSubmit, submitting, title, onDiscard }) {
    const [baseline] = useState(() => buildBaseline(orgs, initialValues));
    const [formData, setFormData] = useState(baseline);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [activeId, setActiveId] = useState(SECTIONS[0].id);

    const baselineSnapshot = useMemo(() => snapshot(baseline), [baseline]);
    const dirty = snapshot(formData) !== baselineSnapshot;
    const busy = submitting || saving;

    // The step follows the card that is in the upper part of the viewport.
    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActiveId(entry.target.dataset.section);
            });
        }, { rootMargin: '-35% 0px -55% 0px' });
        SECTIONS.forEach((section) => {
            const el = document.getElementById(sectionDomId(section.id));
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const set = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const setListItem = (field, index, value) => {
        set(field, formData[field].map((item, i) => (i === index ? value : item)));
    };

    const addListItem = (field) => {
        if (formData[field].length >= MAX[field]) return;
        set(field, [...formData[field], '']);
    };

    const removeListItem = (field, index) => {
        set(field, formData[field].filter((_, i) => i !== index));
    };

    const togglePipelineStep = (step) => {
        const pipeline = [...formData.interview_pipeline];
        set('interview_pipeline', pipeline.includes(step) ? pipeline.filter(s => s !== step) : [...pipeline, step]);
    };

    const selectSection = (id) => {
        setActiveId(id);
        scrollToEl(document.getElementById(sectionDomId(id)));
    };

    const validate = () => {
        const errs = {};
        if (!formData.organization) errs.organization = 'Choose the organization this job belongs to.';
        if (!formData.job_title.trim()) errs.job_title = 'Add a job title so candidates know the role.';
        if (!formData.location.trim()) errs.location = 'Add a location, or write Remote.';
        if (!formData.job_description.trim()) errs.job_description = 'Describe the role so candidates know what to expect.';
        return errs;
    };

    const focusFirstInvalid = (errs) => {
        const key = FIELD_ORDER.find(k => errs[k]);
        if (!key) return;
        const el = document.getElementById(focusTargetId(key));
        if (!el) return;
        scrollToEl(el, 'center');
        el.focus({ preventScroll: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setFormError('');
            setFieldErrors(errs);
            focusFirstInvalid(errs);
            return;
        }
        setSaving(true);
        setFormError('');
        setFieldErrors({});

        const cleaned = {
            ...formData,
            responsibilities: formData.responsibilities.filter(v => v.trim()),
            requirements: formData.requirements.filter(v => v.trim()),
            key_skills: formData.key_skills.filter(v => v.trim()),
        };

        try {
            await onSubmit(cleaned);
        } catch (err) {
            if (err.errors) {
                const key = Object.keys(err.errors)[0];
                const msg = err.errors[key];
                const text = Array.isArray(msg) ? msg[0] : msg;
                // status is rendered by the page's statusControl, so its errors show as a form-level message.
                if (key in formData && key !== 'status') setFieldErrors({ [key]: text });
                else setFormError(text || 'Something went wrong');
            } else {
                setFormError(err.message || 'Something went wrong');
            }
        } finally {
            setSaving(false);
        }
    };

    const orgName = orgs.find(org => org.org_id === formData.organization)?.name ?? '';

    const checklist = [
        { id: 'job_title', label: 'Job title', done: Boolean(formData.job_title.trim()) },
        { id: 'organization', label: 'Organization', done: Boolean(formData.organization) },
        { id: 'location', label: 'Location', done: Boolean(formData.location.trim()) },
        { id: 'job_description', label: 'Job description', done: Boolean(formData.job_description.trim()) },
    ];

    const nextSteps = [
        { icon: HiOutlineRocketLaunch, title: 'Publish', text: 'Your changes show on the live posting.' },
        { icon: HiOutlineInboxArrowDown, title: 'Candidates apply', text: 'Applications arrive in your pipeline.' },
        { icon: HiOutlineCpuChip, title: 'AI screening', text: 'Candidates move through the stages you picked.' },
    ];

    const errorIds = SECTIONS.filter(s => s.fields.some(f => fieldErrors[f])).map(s => s.id);
    const currentId = errorIds[0] ?? activeId;

    const topBar = (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 space-y-0.5">
                <p className="truncate text-base font-semibold text-neutral-900 dark:text-white">{title ?? 'Edit job'}</p>
                <output className={`flex items-center gap-1.5 text-xs font-semibold ${dirty ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-amber-500 dark:bg-amber-300' : 'bg-emerald-500'}`} />
                    {dirty ? 'Unsaved changes' : 'Saved'}
                </output>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={onDiscard} className={SecondaryButton}>
                    Discard
                </button>
                <button type="submit" form="job-form" disabled={busy} className={PrimaryButton}>
                    {busy ? (
                        <><HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving...</>
                    ) : (
                        <><HiOutlineCheck className="h-4 w-4" aria-hidden="true" /> Save changes</>
                    )}
                </button>
            </div>
        </div>
    );

    const renderSection = (section, body) => {
        const next = SECTIONS[SECTIONS.indexOf(section) + 1];
        return (
            <div key={section.id} id={sectionDomId(section.id)} data-section={section.id} className="scroll-mt-40">
                <FormSection icon={section.icon} title={section.title} description={section.description}>
                    {body}
                    {next && (
                        <div className="flex justify-end">
                            <button type="button" onClick={() => selectSection(next.id)} className={SecondaryButton}>
                                Next: {next.title} <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </FormSection>
            </div>
        );
    };

    const basicsBody = (
        <>
            <FormRow cols={2}>
                <Field id="job_title" label="Job title" icon={HiOutlineBriefcase} required hint="A clear title helps candidates find your role in search." error={fieldErrors.job_title}>
                    <input
                        id="job_title"
                        name="job_title"
                        type="text"
                        value={formData.job_title}
                        maxLength={MAX.job_title}
                        placeholder="e.g. Senior Software Engineer"
                        aria-invalid={fieldErrors.job_title ? true : undefined}
                        className={inputClass}
                        onChange={e => set('job_title', e.target.value.slice(0, MAX.job_title))}
                    />
                </Field>
                <Field id="organization" label="Organization" icon={HiOutlineBuildingOffice2} required hint="Candidates see which company is hiring." error={fieldErrors.organization}>
                    <select
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        aria-invalid={fieldErrors.organization ? true : undefined}
                        className={inputClass}
                        onChange={e => set('organization', e.target.value)}
                    >
                        {orgs.map(org => <option key={org.org_id} value={org.org_id}>{org.name}</option>)}
                    </select>
                </Field>
            </FormRow>
            <FormRow cols={2}>
                <Field id="department" label="Department" icon={HiOutlineUserGroup} hint="Shows candidates which team they would join." error={fieldErrors.department}>
                    <input
                        id="department"
                        name="department"
                        type="text"
                        value={formData.department}
                        maxLength={MAX.department}
                        placeholder="e.g. Engineering"
                        className={inputClass}
                        onChange={e => set('department', e.target.value.slice(0, MAX.department))}
                    />
                </Field>
                <Field id="location" label="Location" icon={HiOutlineMapPin} required hint="Candidates filter by place, so be specific or write Remote." error={fieldErrors.location}>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        maxLength={MAX.location}
                        placeholder="e.g. Remote"
                        aria-invalid={fieldErrors.location ? true : undefined}
                        className={inputClass}
                        onChange={e => set('location', e.target.value.slice(0, MAX.location))}
                    />
                </Field>
            </FormRow>
        </>
    );

    const payBody = (
        <FormRow cols={3}>
            <Field id="job_type" label="Job type" icon={HiOutlineClock} hint="Sets expectations on time commitment and contract length." error={fieldErrors.job_type}>
                <select id="job_type" name="job_type" value={formData.job_type} className={inputClass} onChange={e => set('job_type', e.target.value)}>
                    {toOptions(JOB_TYPES).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </Field>
            <Field id="experience_level" label="Experience level" icon={HiOutlineAcademicCap} hint="Helps candidates judge whether they qualify before applying." error={fieldErrors.experience_level}>
                <select id="experience_level" name="experience_level" value={formData.experience_level} className={inputClass} onChange={e => set('experience_level', e.target.value)}>
                    {toOptions(EXP_LEVELS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </Field>
            <Field id="salary_range" label="Salary range" icon={HiOutlineCurrencyDollar} hint="Candidates are more likely to apply when pay is visible." error={fieldErrors.salary_range}>
                <input
                    id="salary_range"
                    name="salary_range"
                    type="text"
                    value={formData.salary_range}
                    maxLength={MAX.salary_range}
                    placeholder="e.g. $120k - $160k"
                    className={inputClass}
                    onChange={e => set('salary_range', e.target.value.slice(0, MAX.salary_range))}
                />
            </Field>
        </FormRow>
    );

    const skillsBody = (
        <>
            <FormRow cols={2}>
                <SkillsInput
                    id="key_skills"
                    label="Key skills"
                    value={formData.key_skills}
                    max={MAX.key_skills}
                    placeholder="Type a skill and press Enter"
                    hint="Specific skills make it easier for candidates to see the match."
                    error={fieldErrors.key_skills}
                    onChange={list => set('key_skills', list)}
                />
                <ListEditor
                    id="requirement"
                    groupLabel="Requirements"
                    label="Requirement"
                    icon={HiOutlineClipboardDocumentCheck}
                    hint="Must-haves help candidates decide whether to apply."
                    error={fieldErrors.requirements}
                    items={formData.requirements}
                    max={MAX.requirements}
                    placeholder="e.g. 5+ years experience"
                    onAdd={() => addListItem('requirements')}
                    onRemove={(i) => removeListItem('requirements', i)}
                    onChange={(i, v) => setListItem('requirements', i, v)}
                />
            </FormRow>
            <ListEditor
                id="responsibility"
                groupLabel="Responsibilities"
                label="Responsibility"
                icon={HiOutlineListBullet}
                hint="Day-to-day work tells candidates what they will actually do."
                error={fieldErrors.responsibilities}
                items={formData.responsibilities}
                max={MAX.responsibilities}
                placeholder="e.g. Build scalable APIs"
                onAdd={() => addListItem('responsibilities')}
                onRemove={(i) => removeListItem('responsibilities', i)}
                onChange={(i, v) => setListItem('responsibilities', i, v)}
            />
        </>
    );

    const descriptionBody = (
        <Field id="job_description" label="Job description" icon={HiOutlineBookOpen} required hint="A fuller description helps candidates understand the work before they apply." error={fieldErrors.job_description}>
            <textarea
                id="job_description"
                name="job_description"
                rows={8}
                maxLength={MAX.job_description}
                value={formData.job_description}
                placeholder="Describe the role, team, and company culture..."
                aria-invalid={fieldErrors.job_description ? true : undefined}
                className={`${inputClass.replace('h-11', 'h-auto min-h-48 py-3')} resize-y`}
                onChange={e => set('job_description', e.target.value.slice(0, MAX.job_description))}
            />
            <p className="self-end text-[11px] tabular-nums text-neutral-500 dark:text-slate-400">
                {formData.job_description.length}/{MAX.job_description}
            </p>
        </Field>
    );

    const screeningBody = (
        <fieldset
            id="interview_pipeline"
            tabIndex={-1}
            aria-labelledby="interview_pipeline-label"
            className="flex min-w-0 flex-col gap-3 outline-none"
        >
            <div className="flex items-center gap-1.5">
                <HiOutlineCommandLine className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                <p id="interview_pipeline-label" className="text-sm font-medium text-neutral-800 dark:text-slate-200">Screening pipeline</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {PIPELINE_STEPS.map(step => {
                    const active = formData.interview_pipeline.includes(step.id);
                    return (
                        <button
                            key={step.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => togglePipelineStep(step.id)}
                            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${focusRing} ${active
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                : 'border-neutral-200 text-neutral-500 hover:border-emerald-300 dark:border-white/10 dark:text-slate-400'
                                }`}
                        >
                            <HiOutlineCheckCircle className={`h-6 w-6 ${active ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true" />
                            <span className="text-center text-xs font-semibold">{step.name}</span>
                        </button>
                    );
                })}
            </div>
            {fieldErrors.interview_pipeline ? (
                <p id="interview_pipeline-error" role="alert" className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{fieldErrors.interview_pipeline}</span>
                </p>
            ) : (
                <p className="text-xs text-neutral-500 dark:text-slate-400">Pick the stages candidates move through after applying.</p>
            )}
        </fieldset>
    );

    const main = (
        <>
            <div className="lg:hidden">
                <JobChecklist items={checklist} compact />
            </div>

            <SectionSteps currentId={currentId} errorIds={errorIds} onSelect={selectSection} />

            {formError && (
                <FormError title="We could not save this job" message={formError} />
            )}

            {renderSection(SECTIONS[0], basicsBody)}
            {renderSection(SECTIONS[1], payBody)}
            {renderSection(SECTIONS[2], skillsBody)}
            {renderSection(SECTIONS[3], descriptionBody)}
            {renderSection(SECTIONS[4], screeningBody)}

            <section aria-labelledby="job-next-steps" className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6 dark:border-emerald-500/25 dark:bg-emerald-500/5">
                <h2 id="job-next-steps" className="flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white">
                    <HiOutlineCheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> What happens next
                </h2>
                <ol className="grid gap-4 sm:grid-cols-3">
                    {nextSteps.map(step => (
                        <li key={step.title} className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                <step.icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 space-y-0.5">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{step.title}</p>
                                <p className="text-xs leading-relaxed text-neutral-600 dark:text-slate-400">{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>
        </>
    );

    const aside = (
        <>
            <JobPreviewCard values={formData} organizationName={orgName} pipelineCount={formData.interview_pipeline.length} />
            <div className="hidden lg:block">
                <JobChecklist items={checklist} />
            </div>
            {statusControl}
        </>
    );

    return (
        <form id="job-form" onSubmit={handleSubmit} noValidate>
            <JobFormLayout topBar={topBar} main={main} aside={aside} />
        </form>
    );
}

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id;

    const [organizations, setOrganizations] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [status, setStatus] = useState(null);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState(null);
    const publishIntent = useRef(false);

    useEffect(() => {
        if (!jobId) return;
        let cancelled = false;
        Promise.all([
            api.get('/organizations/'),
            api.get(`/jobs/${jobId}/`),
        ])
            .then(([orgs, jobData]) => {
                if (cancelled) return;
                setOrganizations(Array.isArray(orgs) ? orgs : []);
                setJob(jobData || null);
            })
            .catch(() => {
                if (!cancelled) setError('We could not load this job. Check your connection and try again.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [jobId, attempt]);

    // Records which button submitted the form. Only the Publish button sets data-publish.
    useEffect(() => {
        if (loading || !job) return;
        const form = document.getElementById('job-form');
        if (!form) return;
        const record = (e) => {
            publishIntent.current = e.submitter?.dataset.publish === 'true';
        };
        form.addEventListener('submit', record, true);
        return () => form.removeEventListener('submit', record, true);
    }, [loading, job]);

    const retry = () => {
        setLoading(true);
        setError('');
        setAttempt((n) => n + 1);
    };

    const values = job ? {
        job_title: job.job_title || '',
        organization: job.organization || '',
        department: job.department || '',
        location: job.location || '',
        job_type: job.job_type || 'Full-time',
        experience_level: job.experience_level || 'Mid-level',
        salary_range: job.salary_range || '',
        job_description: job.job_description || '',
        responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
        requirements: job.requirements?.length ? job.requirements : [''],
        key_skills: job.key_skills?.length ? job.key_skills : [''],
        interview_pipeline: job.interview_pipeline?.length ? job.interview_pipeline : ['shortlist'],
        status: job.status || 'open',
    } : null;

    const currentStatus = status ?? (job?.status || 'open');
    // A job is public once its saved status is open.
    const isLive = job?.status === 'open';

    // Saves the form exactly as before; when Publish was clicked, publishes the saved job afterwards.
    const save = async (data, publish) => {
        setSaving(true);
        setNotice(null);
        try {
            await api.put(`/jobs/${jobId}/`, data);
            if (!publish) {
                router.push('/recruiter/jobs');
                return;
            }
            try {
                await api.post(`/jobs/${jobId}/publish/`);
            } catch {
                setNotice({ tone: 'error', text: 'Your changes were saved, but the job could not be published. Try again.' });
                return;
            }
            setNotice({ tone: 'success', text: 'Job published. Taking you to your postings...' });
            await new Promise((resolve) => setTimeout(resolve, 900));
            router.push('/recruiter/jobs');
        } finally {
            setSaving(false);
        }
    };

    const statusControl = (
        <SelectField
            id="job-status"
            label="Status"
            icon={HiOutlineFlag}
            options={STATUS_OPTIONS}
            value={currentStatus}
            onChange={e => setStatus(e.target.value)}
        />
    );

    const banner = (
        <DashboardBanner
            loading={loading}
            icon={HiOutlinePencilSquare}
            badge={loading || !job ? undefined : isLive
                ? { label: 'Live', icon: HiOutlineGlobeAlt }
                : { label: `Status: ${currentStatus}`, icon: HiOutlineFlag }}
            title={job?.job_title || 'Edit job'}
            subtitle={loading
                ? 'Loading job details...'
                : job
                    ? 'Update the details, status and interview pipeline for this posting.'
                    : 'This job could not be loaded.'}
            aside={loading ? (
                <div className="flex flex-wrap gap-2">
                    <BannerBlock className="h-11 w-36 rounded-xl" />
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Link href="/recruiter/jobs" title="Back to your job postings" className={secondaryButton}>
                        <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" /> My Jobs
                    </Link>
                    {job && !isLive && (
                        <button
                            type="submit"
                            form="job-form"
                            data-publish="true"
                            disabled={saving}
                            title="Save your changes and make this job visible to candidates"
                            className={primaryButton}
                        >
                            <HiOutlineRocketLaunch className="h-4 w-4" aria-hidden="true" /> Publish job
                        </button>
                    )}
                </div>
            )}
        />
    );

    return (
        <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
            {banner}

            {loading && <PageSkeleton stats={0} cards={2} banner={false} />}

            {!loading && error && !job && (
                <div className="flex flex-col items-start gap-2">
                    <FormError title="Job unavailable" message={error} />
                    <button type="button" onClick={retry} title="Try loading this job again" className={secondaryButton}>
                        <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" /> Try again
                    </button>
                </div>
            )}

            {!loading && job && values && (
                <>
                    {notice && (notice.tone === 'error' ? (
                        <div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                            {notice.text}
                        </div>
                    ) : (
                        <output className="block rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                            {notice.text}
                        </output>
                    ))}
                    <EditJobForm
                        orgs={organizations}
                        initialValues={values}
                        statusControl={statusControl}
                        onSubmit={(data) => save({ ...data, status: currentStatus }, publishIntent.current)}
                        submitting={saving}
                        title={job.job_title}
                        onDiscard={() => router.back()}
                    />
                </>
            )}
        </div>
    );
}
