'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FormError from '@/components/auth/FormError';
import JobFormLayout from '@/components/jobs/JobFormLayout';
import JobPreviewCard from '@/components/jobs/JobPreviewCard';
import JobChecklist from '@/components/jobs/JobChecklist';
import {
    inputClass,
    SecondaryButton,
    FormSection,
    FormRow,
    Field,
    SkillsInput,
    StepPipeline,
} from '@/components/jobs/JobFormPrimitives';
import {
    HiOutlineBuildingOffice2,
    HiOutlineUserGroup,
    HiOutlineMapPin,
    HiOutlineClock,
    HiOutlineAcademicCap,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineBookOpen,
    HiOutlineListBullet,
    HiOutlineClipboardDocumentCheck,
    HiOutlineWrenchScrewdriver,
    HiOutlineCurrencyDollar,
    HiOutlineCommandLine,
    HiOutlinePlusCircle,
    HiOutlineXMark,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineArrowRight,
    HiOutlineRocketLaunch,
    HiOutlineInboxArrowDown,
    HiOutlineCpuChip,
} from 'react-icons/hi2';

// The one job form: used by the create page (mode="create") and the edit page (mode="edit", prefilled).
// `onSubmit(payload)` is supplied by the page and makes the API call, so both pages keep their own endpoint and redirect.
// `initialValues` is the baseline for the "Unsaved changes" check. `statusControl` is rendered in the aside (edit only);
// status is not part of the form state, so the page owns that value and merges it into its own payload.

const FORM_ID = 'job-form';

export const DEFAULT_FORM = {
    job_title: '',
    organization: '',
    department: '',
    location: '',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_range: '',
    job_description: '',
    responsibilities: [''],
    requirements: [''],
    key_skills: [''],
    interview_pipeline: ['shortlist', 'coding', 'ai_interview', 'real_interview'],
    status: 'open',
};

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

const PIPELINE_STEPS = [
    { id: 'shortlist', name: 'AI Shortlist' },
    { id: 'coding', name: 'Coding Test' },
    { id: 'ai_interview', name: 'AI Interview' },
    { id: 'real_interview', name: 'Human Interview' },
];

// Form sections in reading order. Each one is a step in the pipeline at the top of the form.
// `fields` lists the state keys a section holds, so the step can show an error and the first invalid field can be found.
const SECTIONS = [
    {
        id: 'basics',
        name: 'Basics',
        title: 'Basics',
        description: 'Who is hiring, and where the role sits.',
        icon: HiOutlineBriefcase,
        fields: ['job_title', 'organization', 'department', 'location'],
    },
    {
        id: 'pay',
        name: 'Pay and type',
        title: 'Compensation and type',
        description: 'How the role is employed and what it pays.',
        icon: HiOutlineCurrencyDollar,
        fields: ['job_type', 'experience_level', 'salary_range'],
    },
    {
        id: 'skills',
        name: 'Skills',
        title: 'Skills and requirements',
        description: 'What candidates need to bring to the work.',
        icon: HiOutlineWrenchScrewdriver,
        fields: ['key_skills', 'requirements', 'responsibilities'],
    },
    {
        id: 'description',
        name: 'Description',
        title: 'Description',
        description: 'What the work is and what it is like day to day.',
        icon: HiOutlineDocumentText,
        fields: ['job_description'],
    },
    {
        id: 'screening',
        name: 'Screening',
        title: 'Screening pipeline',
        description: 'The stages candidates move through after applying.',
        icon: HiOutlineCommandLine,
        fields: ['interview_pipeline'],
    },
];

const FIELD_ORDER = SECTIONS.flatMap(section => section.fields);

// The element that receives focus for a field with an error. List fields use their first input.
const FOCUS_ID = {
    key_skills: 'skill',
    requirements: 'requirement-0',
    responsibilities: 'responsibility-0',
};
const focusIdFor = (key) => FOCUS_ID[key] ?? key;

const JOB_TYPES = ['Full-time', 'Contract', 'Remote', 'Freelance', 'Internship'];
const EXP_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Lead'];

const FIELD_KEYS = Object.keys(DEFAULT_FORM);

// Same look as inputClass, but a tall, resizable box for the long description.
const textareaClass = 'rounded-md border border-emerald-200 bg-card px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 min-h-36 w-full resize-y dark:border-white/10 dark:bg-white/5 dark:focus:border-emerald-400';

const counterClass = 'self-end text-[11px] tabular-nums text-muted-foreground';
const errorClass = 'flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400';

const toOptions = (list) => list.map(value => ({ value, label: value }));

const cleanList = (list) => (list ?? []).filter(v => v.trim());

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

// Links an input to its error or hint line for screen readers.
const describe = (id, error, hasHint) => ({
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
});

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
        ...DEFAULT_FORM,
        ...initialValues,
        organization: initialValues?.organization || orgs[0]?.org_id || '',
    };
}

// A list of short text items (responsibilities, requirements). Skills use SkillsInput instead.
function ListInput({ id, label, icon, items, max, onAdd, onRemove, onChange, placeholder, hint, error }) {
    const itemLabel = label.toLowerCase();
    return (
        <Field id={`${id}-0`} label={label} icon={icon} hint={hint} error={error}>
            <div className="flex flex-col gap-2.5">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            id={`${id}-${i}`}
                            aria-label={`${label} ${i + 1}`}
                            value={item}
                            placeholder={placeholder}
                            maxLength={MAX_ITEM_LENGTH}
                            className={`${inputClass} min-w-0 flex-1`}
                            {...describe(`${id}-0`, error, Boolean(hint))}
                            onChange={e => onChange(i, e.target.value.slice(0, MAX_ITEM_LENGTH))}
                        />
                        {items.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemove(i)}
                                title={`Remove ${itemLabel} ${i + 1}`}
                                aria-label={`Remove ${itemLabel} ${i + 1}`}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-emerald-200 text-red-600 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/10 dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                                <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                ))}
                <div className="flex items-center justify-between gap-3">
                    {items.length < max ? (
                        <button
                            type="button"
                            onClick={onAdd}
                            className="flex items-center gap-2 rounded-md border border-dashed border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/20 dark:text-emerald-400 dark:hover:bg-white/5"
                        >
                            <HiOutlinePlusCircle className="h-5 w-5" aria-hidden="true" /> Add {itemLabel}
                        </button>
                    ) : <span />}
                    <span className={counterClass}>{items.length}/{max}</span>
                </div>
            </div>
        </Field>
    );
}

export default function JobCreateForm({
    mode = 'create',
    initialValues = null,
    orgs = [],
    statusControl = null,
    onSubmit,
    submitting = false,
    title,
    onDiscard,
    onDirtyChange,
}) {
    const router = useRouter();
    const isEdit = mode === 'edit';

    const [baseline] = useState(() => buildBaseline(orgs, initialValues));
    const [formData, setFormData] = useState(baseline);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

    const sectionRefs = useRef({});
    const focusKey = useRef(null);

    const baselineSnapshot = useMemo(() => snapshot(baseline), [baseline]);
    const dirty = useMemo(() => snapshot(formData) !== baselineSnapshot, [formData, baselineSnapshot]);
    const busy = submitting || saving;

    useEffect(() => {
        onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

    // After a failed check, move to the first invalid field: scroll its section into view and focus it.
    useEffect(() => {
        const key = focusKey.current;
        if (!key) return;
        focusKey.current = null;
        const el = document.getElementById(focusIdFor(key));
        if (!el) return;
        el.closest('[data-section]')?.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
        el.focus({ preventScroll: true });
    }, [fieldErrors]);

    // The pipeline step follows the section in view.
    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible[0]) setActiveSection(visible[0].target.dataset.section);
        }, { rootMargin: '-30% 0px -60% 0px' });
        Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const goToSection = (id) => {
        setActiveSection(id);
        sectionRefs.current[id]?.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
    };

    const set = useCallback((key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    }, []);

    const handleArrayChange = (field, index, value) => {
        const list = [...formData[field]];
        list[index] = value;
        set(field, list);
    };

    const addArrayItem = (field) => {
        if (formData[field].length >= MAX[field]) return;
        set(field, [...formData[field], '']);
    };

    const removeArrayItem = (field, index) => {
        set(field, formData[field].filter((_, i) => i !== index));
    };

    const togglePipelineStep = (step) => {
        const pipeline = [...formData.interview_pipeline];
        set('interview_pipeline', pipeline.includes(step) ? pipeline.filter(s => s !== step) : [...pipeline, step]);
    };

    const validate = () => {
        const errs = {};
        if (!formData.organization) errs.organization = 'Choose the organization this job belongs to.';
        if (!formData.job_title.trim()) errs.job_title = 'Add a job title so candidates know the role.';
        if (!formData.location.trim()) errs.location = 'Add a location, or write Remote.';
        if (!formData.job_description.trim()) errs.job_description = 'Describe the role so candidates know what to expect.';
        return errs;
    };

    // Shows the errors, moves the pipeline to the first section with one, and queues focus on its first field.
    const showErrors = (errs) => {
        const first = FIELD_ORDER.find(key => errs[key]);
        const section = SECTIONS.find(s => s.fields.includes(first));
        if (section) setActiveSection(section.id);
        focusKey.current = first ?? null;
        setFieldErrors(errs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setFormError('');
            showErrors(errs);
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
                if (key in DEFAULT_FORM && key !== 'status') showErrors({ [key]: text });
                else setFormError(text || 'We could not save this job. Check the fields and try again.');
            } else {
                setFormError(err.message || 'Something went wrong');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (onDiscard) return onDiscard();
        if (isEdit && dirty) {
            setFormData(baseline);
            setFieldErrors({});
            setFormError('');
            return;
        }
        router.back();
    };

    const orgName = orgs.find(org => org.org_id === formData.organization)?.name ?? '';

    const checklist = [
        { id: 'job_title', label: 'Job title', done: Boolean(formData.job_title.trim()) },
        { id: 'organization', label: 'Organization', done: Boolean(formData.organization) },
        { id: 'location', label: 'Location', done: Boolean(formData.location.trim()) },
        { id: 'job_description', label: 'Job description', done: Boolean(formData.job_description.trim()) },
    ];

    const nextSteps = [
        {
            icon: HiOutlineRocketLaunch,
            title: 'Publish',
            text: isEdit ? 'Your changes show on the live posting.' : 'The posting goes live for candidates to find.',
        },
        { icon: HiOutlineInboxArrowDown, title: 'Candidates apply', text: 'Applications arrive in your pipeline.' },
        { icon: HiOutlineCpuChip, title: 'AI screening', text: 'Candidates move through the stages you picked.' },
    ];

    const topBar = (
        <div className="mx-auto flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 space-y-0.5">
                <p className="truncate text-base font-semibold text-foreground">{title ?? (isEdit ? 'Edit job' : 'Create job')}</p>
                <output className={`flex items-center gap-1.5 text-xs font-semibold ${dirty ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-amber-500 dark:bg-amber-300' : 'bg-emerald-500'}`} />
                    {dirty ? 'Unsaved changes' : 'Saved'}
                </output>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={handleDiscard} disabled={busy} className={SecondaryButton}>
                    Discard
                </button>
            </div>
        </div>
    );

    // Wraps one FormSection so the pipeline can scroll to it and the observer can track it.
    // The Next button sits at the end of each section except the last.
    const renderSection = (index, children) => {
        const section = SECTIONS[index];
        const next = SECTIONS[index + 1];
        return (
            <div
                data-section={section.id}
                ref={el => { sectionRefs.current[section.id] = el; }}
                className="scroll-mt-40"
            >
                <FormSection icon={section.icon} title={section.title} description={section.description}>
                    {children}
                    {next && (
                        <div className="flex justify-end">
                            <button type="button" onClick={() => goToSection(next.id)} className={SecondaryButton}>
                                <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" /> Next: {next.name}
                            </button>
                        </div>
                    )}
                </FormSection>
            </div>
        );
    };

    const main = (
        <>
            <div className="lg:hidden">
                <JobChecklist items={checklist} compact />
            </div>

            <StepPipeline
                steps={SECTIONS.map(({ id, name, icon }) => ({ key: id, label: name, icon }))}
                current={activeSection}
                onSelect={goToSection}
            />

            {formError && (
                <FormError title={isEdit ? 'We could not save this job' : 'We could not post this job'} message={formError} />
            )}

            {renderSection(0, (
                <>
                    <Field
                        id="job_title"
                        label="Job title *"
                        icon={HiOutlineBriefcase}
                        hint="A clear title helps candidates find your role in search."
                        error={fieldErrors.job_title}
                    >
                        <input
                            id="job_title"
                            value={formData.job_title}
                            maxLength={MAX.job_title}
                            placeholder="e.g. Senior Software Engineer"
                            className={inputClass}
                            {...describe('job_title', fieldErrors.job_title, true)}
                            onChange={e => set('job_title', e.target.value.slice(0, MAX.job_title))}
                        />
                        <span className={counterClass}>{formData.job_title.length}/{MAX.job_title}</span>
                    </Field>
                    <FormRow cols={3}>
                        <Field
                            id="organization"
                            label="Organization *"
                            icon={HiOutlineBuildingOffice2}
                            hint="Candidates see which company is hiring."
                            error={fieldErrors.organization}
                        >
                            <select
                                id="organization"
                                value={formData.organization}
                                className={inputClass}
                                {...describe('organization', fieldErrors.organization, true)}
                                onChange={e => set('organization', e.target.value)}
                            >
                                {orgs.map(org => (
                                    <option key={org.org_id} value={org.org_id}>{org.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field
                            id="department"
                            label="Department"
                            icon={HiOutlineUserGroup}
                            hint="Shows candidates which team they would join."
                            error={fieldErrors.department}
                        >
                            <input
                                id="department"
                                value={formData.department}
                                maxLength={MAX.department}
                                placeholder="e.g. Engineering"
                                className={inputClass}
                                {...describe('department', fieldErrors.department, true)}
                                onChange={e => set('department', e.target.value.slice(0, MAX.department))}
                            />
                        </Field>
                        <Field
                            id="location"
                            label="Location *"
                            icon={HiOutlineMapPin}
                            hint="Candidates filter by place, so be specific or write Remote."
                            error={fieldErrors.location}
                        >
                            <input
                                id="location"
                                value={formData.location}
                                maxLength={MAX.location}
                                placeholder="e.g. Remote"
                                className={inputClass}
                                {...describe('location', fieldErrors.location, true)}
                                onChange={e => set('location', e.target.value.slice(0, MAX.location))}
                            />
                        </Field>
                    </FormRow>
                </>
            ))}

            {renderSection(1, (
                <FormRow cols={3}>
                    <Field
                        id="job_type"
                        label="Job type"
                        icon={HiOutlineClock}
                        hint="Sets expectations on time commitment and contract length."
                        error={fieldErrors.job_type}
                    >
                        <select
                            id="job_type"
                            value={formData.job_type}
                            className={inputClass}
                            {...describe('job_type', fieldErrors.job_type, true)}
                            onChange={e => set('job_type', e.target.value)}
                        >
                            {toOptions(JOB_TYPES).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </Field>
                    <Field
                        id="experience_level"
                        label="Experience level"
                        icon={HiOutlineAcademicCap}
                        hint="Helps candidates judge whether they qualify before applying."
                        error={fieldErrors.experience_level}
                    >
                        <select
                            id="experience_level"
                            value={formData.experience_level}
                            className={inputClass}
                            {...describe('experience_level', fieldErrors.experience_level, true)}
                            onChange={e => set('experience_level', e.target.value)}
                        >
                            {toOptions(EXP_LEVELS).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </Field>
                    <Field
                        id="salary_range"
                        label="Salary range"
                        icon={HiOutlineCurrencyDollar}
                        hint="Candidates are more likely to apply when pay is visible."
                        error={fieldErrors.salary_range}
                    >
                        <input
                            id="salary_range"
                            value={formData.salary_range}
                            maxLength={MAX.salary_range}
                            placeholder="e.g. $120k - $160k"
                            className={inputClass}
                            {...describe('salary_range', fieldErrors.salary_range, true)}
                            onChange={e => set('salary_range', e.target.value.slice(0, MAX.salary_range))}
                        />
                    </Field>
                </FormRow>
            ))}

            {renderSection(2, (
                <>
                    <FormRow cols={2}>
                        <SkillsInput
                            id="skill"
                            label="Skills"
                            value={formData.key_skills.filter(v => v.trim())}
                            max={MAX.key_skills}
                            placeholder="e.g. React, then press Enter"
                            hint="Specific skills make it easier for candidates to see the match."
                            error={fieldErrors.key_skills}
                            onChange={list => set('key_skills', list)}
                        />
                        <ListInput
                            id="requirement"
                            label="Requirement"
                            icon={HiOutlineClipboardDocumentCheck}
                            hint="Must-haves help candidates decide whether to apply."
                            error={fieldErrors.requirements}
                            items={formData.requirements}
                            max={MAX.requirements}
                            placeholder="e.g. 5+ years experience"
                            onAdd={() => addArrayItem('requirements')}
                            onRemove={(i) => removeArrayItem('requirements', i)}
                            onChange={(i, v) => handleArrayChange('requirements', i, v)}
                        />
                    </FormRow>
                    <ListInput
                        id="responsibility"
                        label="Responsibility"
                        icon={HiOutlineListBullet}
                        hint="Day-to-day work tells candidates what they will actually do."
                        error={fieldErrors.responsibilities}
                        items={formData.responsibilities}
                        max={MAX.responsibilities}
                        placeholder="e.g. Build scalable APIs"
                        onAdd={() => addArrayItem('responsibilities')}
                        onRemove={(i) => removeArrayItem('responsibilities', i)}
                        onChange={(i, v) => handleArrayChange('responsibilities', i, v)}
                    />
                </>
            ))}

            {renderSection(3, (
                <Field
                    id="job_description"
                    label="Job description *"
                    icon={HiOutlineBookOpen}
                    hint="A fuller description helps candidates understand the work before they apply."
                    error={fieldErrors.job_description}
                >
                    <textarea
                        id="job_description"
                        rows={8}
                        maxLength={MAX.job_description}
                        value={formData.job_description}
                        placeholder="Describe the role, team, and company culture..."
                        className={textareaClass}
                        {...describe('job_description', fieldErrors.job_description, true)}
                        onChange={e => set('job_description', e.target.value.slice(0, MAX.job_description))}
                    />
                    <span className={counterClass}>{formData.job_description.length}/{MAX.job_description}</span>
                </Field>
            ))}

            {renderSection(4, (
                <fieldset className="flex flex-col gap-1.5" aria-describedby={fieldErrors.interview_pipeline ? 'interview-pipeline-error' : 'interview-pipeline-hint'}>
                    <legend className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <HiOutlineCommandLine className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" /> Stages
                    </legend>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {PIPELINE_STEPS.map(step => {
                            const active = formData.interview_pipeline.includes(step.id);
                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => togglePipelineStep(step.id)}
                                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 transition-all active:scale-[0.97] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${active
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/5 dark:text-emerald-400'
                                        : 'border-emerald-200 text-muted-foreground hover:border-emerald-300 dark:border-white/10'
                                        }`}
                                >
                                    <HiOutlineCheckCircle className={`h-6 w-6 ${active ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true" />
                                    <span className="text-center text-[10px] font-semibold uppercase tracking-widest">{step.name}</span>
                                </button>
                            );
                        })}
                    </div>
                    {fieldErrors.interview_pipeline ? (
                        <p id="interview-pipeline-error" role="alert" className={errorClass}>
                            <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{fieldErrors.interview_pipeline}</span>
                        </p>
                    ) : (
                        <p id="interview-pipeline-hint" className="text-xs text-muted-foreground">
                            Pick the stages candidates move through after applying.
                        </p>
                    )}
                </fieldset>
            ))}

            <section aria-labelledby="job-next-steps" className="flex flex-col gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 md:p-6 dark:border-emerald-500/25 dark:bg-emerald-500/5">
                <h2 id="job-next-steps" className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <HiOutlineCheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> What happens next
                </h2>
                <ol className="grid gap-4 sm:grid-cols-3">
                    {nextSteps.map(step => (
                        <li key={step.title} className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                                <step.icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 space-y-0.5">
                                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                                <p className="text-xs leading-relaxed text-muted-foreground">{step.text}</p>
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
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
            <JobFormLayout topBar={topBar} main={main} aside={aside} />
        </form>
    );
}
