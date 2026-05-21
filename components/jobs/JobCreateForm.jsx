'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, SelectField, TextAreaField } from '@/components/forms/FormFields';
import FormError from '@/components/auth/FormError';
import JobFormLayout from '@/components/jobs/JobFormLayout';
import JobFormSection from '@/components/jobs/JobFormSection';
import JobPreviewCard from '@/components/jobs/JobPreviewCard';
import JobChecklist from '@/components/jobs/JobChecklist';
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
    HiOutlineArrowPath,
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

const JOB_TYPES = ['Full-time', 'Contract', 'Remote', 'Freelance', 'Internship'];
const EXP_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Lead'];

const FIELD_KEYS = Object.keys(DEFAULT_FORM);
const FIELD_RADIUS = 'lg';

const labelClass = 'flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/50';
const hintClass = 'text-xs leading-relaxed text-foreground/40';
const errorClass = 'flex items-start gap-1.5 text-xs font-medium text-red-400';

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
        ...DEFAULT_FORM,
        ...initialValues,
        organization: initialValues?.organization || orgs[0]?.org_id || '',
    };
}

// Group wraps controls that are not FormFields (list editors, pipeline toggles) and labels them as one group.
function Group({ id, label, icon: Icon, hint, error, children }) {
    const labelId = `${id}-label`;
    const describedBy = error ? `${id}-error` : `${id}-hint`;
    return (
        <div className="space-y-2">
            <p id={labelId} className={labelClass}>
                <Icon className="h-4 w-4 text-foreground/35" aria-hidden="true" /> {label}
            </p>
            <div role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
                {children}
            </div>
            {error ? (
                <p id={`${id}-error`} role="alert" className={errorClass}>
                    <HiOutlineExclamationCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                </p>
            ) : (
                <p id={`${id}-hint`} className={hintClass}>{hint}</p>
            )}
        </div>
    );
}

function ListInput({ items, max, onAdd, onRemove, onChange, placeholder, label, icon, hint, error }) {
    const id = label.toLowerCase().replace(/\s+/g, '-');
    return (
        <Group id={id} label={label} icon={icon} hint={hint} error={error}>
            <div className="space-y-2.5">
                {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <TextField
                                id={`${id}-${i}`}
                                label={`${label} ${i + 1}`}
                                icon={icon}
                                value={item}
                                placeholder={placeholder}
                                maxLength={MAX_ITEM_LENGTH}
                                radius={FIELD_RADIUS}
                                onChange={e => onChange(i, e.target.value.slice(0, MAX_ITEM_LENGTH))}
                            />
                        </div>
                        {items.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemove(i)}
                                title={`Remove ${label.toLowerCase()} ${i + 1}`}
                                aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
                                className="mt-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
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
                            className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-emerald-500 hover:text-emerald-500"
                        >
                            <HiOutlinePlusCircle className="h-5 w-5" aria-hidden="true" /> Add {label.toLowerCase()}
                        </button>
                    ) : <span />}
                    <span className="text-[11px] tabular-nums text-foreground/35">{items.length}/{max}</span>
                </div>
            </div>
        </Group>
    );
}

export default function JobCreateForm({
    mode = 'create',
    initialValues = null,
    orgs = [],
    statusControl = null,
    onSubmit,
    submitting = false,
    primaryLabel,
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

    const baselineSnapshot = useMemo(() => snapshot(baseline), [baseline]);
    const dirty = useMemo(() => snapshot(formData) !== baselineSnapshot, [formData, baselineSnapshot]);
    const busy = submitting || saving;

    useEffect(() => {
        onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setFormError('');
            setFieldErrors(errs);
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
                if (key in DEFAULT_FORM && key !== 'status') setFieldErrors({ [key]: text });
                else setFormError(`${key}: ${text}`);
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

    const counter = (value, max) => <span className="text-[11px] tabular-nums text-foreground/35">{value.length}/{max}</span>;

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
                <p role="status" className={`flex items-center gap-1.5 text-xs font-semibold ${dirty ? 'text-amber-300' : 'text-emerald-500'}`}>
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-amber-300' : 'bg-emerald-500'}`} />
                    {dirty ? 'Unsaved changes' : 'Saved'}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={handleDiscard}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                    Discard
                </button>
                <button
                    type="submit"
                    form={FORM_ID}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:opacity-50"
                >
                    {busy ? (
                        <><HiOutlineArrowPath className="h-4 w-4 animate-spin" aria-hidden="true" /> {isEdit ? 'Saving...' : 'Posting...'}</>
                    ) : (primaryLabel ?? (isEdit ? 'Save changes' : 'Post job'))}
                </button>
            </div>
        </div>
    );

    const main = (
        <>
            <div className="lg:hidden">
                <JobChecklist items={checklist} compact />
            </div>

            {formError && (
                <FormError title={isEdit ? 'We could not save this job' : 'We could not post this job'} message={formError} />
            )}

            <JobFormSection index={0} icon={HiOutlineBriefcase} title="Basics" description="Who is hiring, and where the role sits.">
                <TextField
                    id="job_title"
                    label="Job title *"
                    icon={HiOutlineBriefcase}
                    radius={FIELD_RADIUS}
                    hintVariant="tooltip"
                    hint="A clear title helps candidates find your role in search."
                    error={fieldErrors.job_title}
                    counter={counter(formData.job_title, MAX.job_title)}
                    value={formData.job_title}
                    maxLength={MAX.job_title}
                    placeholder="e.g. Senior Software Engineer"
                    onChange={e => set('job_title', e.target.value.slice(0, MAX.job_title))}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField
                        id="organization"
                        label="Organization *"
                        icon={HiOutlineBuildingOffice2}
                        radius={FIELD_RADIUS}
                        hintVariant="tooltip"
                        hint="Candidates see which company is hiring."
                        error={fieldErrors.organization}
                        value={formData.organization}
                        onChange={e => set('organization', e.target.value)}
                        options={orgs.map(org => ({ value: org.org_id, label: org.name }))}
                    />
                    <TextField
                        id="department"
                        label="Department"
                        icon={HiOutlineUserGroup}
                        radius={FIELD_RADIUS}
                        hintVariant="tooltip"
                        hint="Shows candidates which team they would join."
                        error={fieldErrors.department}
                        value={formData.department}
                        maxLength={MAX.department}
                        placeholder="e.g. Engineering"
                        onChange={e => set('department', e.target.value.slice(0, MAX.department))}
                    />
                    <TextField
                        id="location"
                        label="Location *"
                        icon={HiOutlineMapPin}
                        radius={FIELD_RADIUS}
                        hintVariant="tooltip"
                        hint="Candidates filter by place, so be specific or write Remote."
                        error={fieldErrors.location}
                        value={formData.location}
                        maxLength={MAX.location}
                        placeholder="e.g. Remote"
                        onChange={e => set('location', e.target.value.slice(0, MAX.location))}
                    />
                    <SelectField
                        id="job_type"
                        label="Job type"
                        icon={HiOutlineClock}
                        radius={FIELD_RADIUS}
                        hintVariant="tooltip"
                        hint="Sets expectations on time commitment and contract length."
                        error={fieldErrors.job_type}
                        value={formData.job_type}
                        onChange={e => set('job_type', e.target.value)}
                        options={toOptions(JOB_TYPES)}
                    />
                    <SelectField
                        id="experience_level"
                        label="Experience level"
                        icon={HiOutlineAcademicCap}
                        radius={FIELD_RADIUS}
                        hintVariant="tooltip"
                        hint="Helps candidates judge whether they qualify before applying."
                        error={fieldErrors.experience_level}
                        value={formData.experience_level}
                        onChange={e => set('experience_level', e.target.value)}
                        options={toOptions(EXP_LEVELS)}
                    />
                </div>
            </JobFormSection>

            <JobFormSection index={1} icon={HiOutlineDocumentText} title="The role" description="What the work is and what it takes.">
                <TextAreaField
                    id="job_description"
                    label="Job description *"
                    icon={HiOutlineBookOpen}
                    radius={FIELD_RADIUS}
                    hintVariant="tooltip"
                    hint="A fuller description helps candidates understand the work before they apply."
                    error={fieldErrors.job_description}
                    rows={8}
                    maxLength={MAX.job_description}
                    value={formData.job_description}
                    placeholder="Describe the role, team, and company culture..."
                    onChange={e => set('job_description', e.target.value.slice(0, MAX.job_description))}
                />

                <ListInput
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

                <ListInput
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

                <ListInput
                    label="Skill"
                    icon={HiOutlineWrenchScrewdriver}
                    hint="Specific skills make it easier for candidates to see the match."
                    error={fieldErrors.key_skills}
                    items={formData.key_skills}
                    max={MAX.key_skills}
                    placeholder="e.g. React"
                    onAdd={() => addArrayItem('key_skills')}
                    onRemove={(i) => removeArrayItem('key_skills', i)}
                    onChange={(i, v) => handleArrayChange('key_skills', i, v)}
                />
            </JobFormSection>

            <JobFormSection index={2} icon={HiOutlineCurrencyDollar} title="Pay and screening" description="What the role pays and how candidates move through the process.">
                <TextField
                    id="salary_range"
                    label="Salary range"
                    icon={HiOutlineCurrencyDollar}
                    radius={FIELD_RADIUS}
                    hintVariant="tooltip"
                    hint="Candidates are more likely to apply when pay is visible."
                    error={fieldErrors.salary_range}
                    value={formData.salary_range}
                    maxLength={MAX.salary_range}
                    placeholder="e.g. $120k - $160k"
                    onChange={e => set('salary_range', e.target.value.slice(0, MAX.salary_range))}
                />

                <Group
                    id="interview-pipeline"
                    label="Screening pipeline"
                    icon={HiOutlineCommandLine}
                    hint="Pick the stages candidates move through after applying."
                    error={fieldErrors.interview_pipeline}
                >
                    <div className="grid grid-cols-2 gap-3">
                        {PIPELINE_STEPS.map(step => {
                            const active = formData.interview_pipeline.includes(step.id);
                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => togglePipelineStep(step.id)}
                                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${active
                                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500'
                                        : 'border-border text-muted-foreground opacity-60 hover:border-muted-foreground/30 hover:opacity-90'
                                        }`}
                                >
                                    <HiOutlineCheckCircle className={`h-6 w-6 ${active ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true" />
                                    <span className="text-center text-[10px] font-semibold uppercase tracking-widest">{step.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </Group>
            </JobFormSection>

            <section aria-labelledby="job-next-steps" className="space-y-4 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-5 md:p-6">
                <h2 id="job-next-steps" className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" /> What happens next
                </h2>
                <ol className="grid gap-4 sm:grid-cols-3">
                    {nextSteps.map(step => (
                        <li key={step.title} className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
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
