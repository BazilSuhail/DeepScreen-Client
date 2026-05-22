"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlineFlag,
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineCodeBracket,
  HiOutlineGlobeAlt,
  HiOutlineLink,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineIdentification,
  HiOutlineWrenchScrewdriver,
  HiOutlineFolderOpen,
  HiOutlineEnvelope,
  HiOutlinePhone,
} from "react-icons/hi2";
import { api } from "@/utils/api";
import { parseResumeList } from "@/utils/resumeList";
import { EmptyState, ErrorAlert, focusRing, formatDate } from "./ui";

const LOAD_ERROR = "We could not load this candidate. Check your connection and try again.";
const AI_NOTE = "Scores come from the AI screening step. Treat them as guidance, not a decision.";

const SCORE_BARS = [
  { key: "skills_score", label: "Skills match", bar: "bg-emerald-500" },
  { key: "workexp_score", label: "Work experience", bar: "bg-blue-500" },
  { key: "projects_score", label: "Projects", bar: "bg-violet-500" },
  { key: "summary_score", label: "Summary", bar: "bg-amber-500" },
];

const TABS = [
  { key: "profile", label: "Profile", icon: HiOutlineUser },
  { key: "resume", label: "Resume", icon: HiOutlineDocumentText },
];

const skeletonBlock = "animate-pulse rounded-md bg-emerald-200/70 dark:bg-white/10";
const linkButton = `inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 dark:border-white/15 dark:bg-white/5 dark:text-emerald-100 dark:hover:bg-white/10 ${focusRing}`;
const bodyText = "whitespace-pre-line text-sm leading-relaxed text-emerald-900/90 dark:text-slate-300";
const metaText = "inline-flex items-center gap-1.5 text-sm text-emerald-800/80 dark:text-slate-400";
const chip = "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-white/5 dark:text-emerald-200";
const skillChip = "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200";

const toPercent = (value) => Math.round(Math.min(Math.max(Number(value) || 0, 0), 1) * 100);
const humanize = (value) => String(value || "").replace(/_/g, " ");
const toList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

// Experience, education and skills may arrive as strings or objects; read both shapes.
const itemParts = (item) => {
  if (typeof item === "string") return { title: item, detail: "" };
  if (!item || typeof item !== "object") return { title: "", detail: "" };
  return {
    title: item.title || item.role || item.degree || item.name || "",
    detail: [item.company || item.institution || item.school || item.organization, item.description]
      .filter(Boolean)
      .join(" · "),
  };
};

// Only http(s) links are offered as buttons, since the values are user-supplied.
const toHref = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
};

// Phone numbers become tel: links with only digits and a leading plus kept.
const toTel = (phone) => {
  const digits = String(phone || "").trim().replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
};

const toResumeFileHref = (value) => {
  const raw = String(value || "").trim();
  return /^https?:\/\//i.test(raw) ? raw : null;
};

function Section({ icon: Icon, title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-950 dark:text-foreground">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function ContactRows({ items }) {
  const rows = items.filter((item) => item.value);
  if (rows.length === 0) return null;
  return (
    <ul className="flex flex-col gap-3">
      {rows.map(({ label, icon: Icon, value, href }) => (
        <li key={label} className="flex items-start gap-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-800/80 dark:text-slate-400">{label}</p>
            <p className="break-words text-sm text-emerald-950 dark:text-foreground">
              {href ? (
                <a href={href} className={`rounded-sm underline-offset-2 hover:underline ${focusRing}`}>
                  {value}
                </a>
              ) : (
                value
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function LinkButtons({ links }) {
  const items = links
    .map((link) => ({ ...link, href: toHref(link.url) }))
    .filter((link) => link.href);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ label, href, icon: Icon }) => (
        <a
          key={`${label}-${href}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkButton}
        >
          <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="truncate">{label}</span>
          <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}

function ItemList({ items }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => {
        const { title, detail } = itemParts(item);
        if (!title && !detail) return null;
        return (
          <li key={i} className="rounded-xl border border-emerald-100 p-3 dark:border-white/10">
            <p className="font-medium text-emerald-950 dark:text-foreground">{title}</p>
            {detail && <p className="mt-0.5 text-sm text-emerald-800/80 dark:text-slate-400">{detail}</p>}
          </li>
        );
      })}
    </ul>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 dark:bg-white/5">
      <p className="text-xs font-medium text-emerald-800/80 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-950 dark:text-foreground">{value}</p>
    </div>
  );
}

function ScoreBars({ scores }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SCORE_BARS.map(({ key, label, bar }) => {
        const value = toPercent(scores[key]);
        return (
          <div key={key}>
            <div className="flex justify-between text-xs">
              <span className="text-emerald-800/80 dark:text-slate-400">{label}</span>
              <span className="font-semibold text-emerald-950 dark:text-foreground">{value}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-white/10">
              <div className={`h-full rounded-full ${bar}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfileTab({ detail }) {
  const profile = detail.profile;
  const shortlist = detail.stage_results?.shortlist;
  const rank = detail.shortlist_rank;
  const skills = toList(profile?.skills);
  const experience = toList(profile?.experience);
  const education = toList(profile?.education);
  const links = [
    { label: "GitHub", icon: HiOutlineCodeBracket, url: profile?.github_url },
    { label: "LinkedIn", icon: HiOutlineGlobeAlt, url: profile?.linkedin_url },
    { label: "Portfolio", icon: HiOutlineLink, url: profile?.portfolio_url },
  ];
  const hasLinks = links.some((link) => toHref(link.url));
  const contact = detail.candidate || {};
  const phone = profile?.phone || contact.phone;

  return (
    <>
      <Section icon={HiOutlineSparkles} title="AI analysis">
        <div className="flex flex-wrap gap-3">
          <Stat label="Score" value={detail.shortlist_score != null ? `${toPercent(detail.shortlist_score)}%` : "Not scored"} />
          <Stat label="Rank" value={rank ? `#${rank}` : "Not ranked"} />
        </div>
        {shortlist && (
          <div className="rounded-xl bg-emerald-50/60 p-4 dark:bg-white/5">
            <ScoreBars scores={shortlist} />
          </div>
        )}
        <p className="text-xs text-emerald-800/80 dark:text-slate-400">{AI_NOTE}</p>
      </Section>

      <ContactRows
        items={[
          { label: "Email", icon: HiOutlineEnvelope, value: contact.email, href: contact.email && `mailto:${contact.email}` },
          { label: "Phone", icon: HiOutlinePhone, value: phone, href: toTel(phone) },
          { label: "Location", icon: HiOutlineMapPin, value: profile?.location },
          {
            label: "Experience",
            icon: HiOutlineBriefcase,
            value: profile?.years_experience != null ? `${profile.years_experience} yrs` : "",
          },
        ]}
      />

      {!profile ? (
        <EmptyState
          icon={HiOutlineUser}
          title="No profile yet"
          text="This candidate has not added profile details."
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {profile.headline && (
              <p className="font-semibold text-emerald-950 dark:text-foreground">{profile.headline}</p>
            )}
            {profile.bio && <p className={bodyText}>{profile.bio}</p>}
          </div>

          {skills.length > 0 && (
            <Section icon={HiOutlineWrenchScrewdriver} title="Skills">
              <ul aria-label="Skills" className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <li key={`${itemParts(skill).title}-${i}`} className={chip}>{itemParts(skill).title}</li>
                ))}
              </ul>
            </Section>
          )}

          {experience.length > 0 && (
            <Section icon={HiOutlineBriefcase} title="Experience">
              <ItemList items={experience} />
            </Section>
          )}

          {education.length > 0 && (
            <Section icon={HiOutlineAcademicCap} title="Education">
              <ItemList items={education} />
            </Section>
          )}

          {hasLinks && (
            <Section icon={HiOutlineLink} title="Links">
              <LinkButtons links={links} />
            </Section>
          )}
        </>
      )}
    </>
  );
}

// Splits "Title — body" or "Title - body" (or en dash) at the first separator; text without one is all body.
const splitEntry = (text) => {
  const match = text.match(/\s[—–-]\s/);
  if (!match) return { title: "", body: text };
  return {
    title: text.slice(0, match.index).trim(),
    body: text.slice(match.index + match[0].length).trim(),
  };
};

// Pulls a trailing "Tech stack: A, B." list out of an entry body.
const splitTechStack = (body) => {
  const match = body.match(/^([\s\S]*?)\s*Tech stack:\s*([\s\S]*)$/i);
  if (!match) return { summary: body, stack: [] };
  return {
    summary: match[1].trim(),
    stack: match[2].replace(/\.\s*$/, "").split(",").map((s) => s.trim()).filter(Boolean),
  };
};

function ResumeEntry({ text, icon: Icon }) {
  const { title, body } = splitEntry(text);
  const { summary, stack } = splitTechStack(body);
  return (
    <li className="flex items-start gap-3 rounded-xl border border-emerald-100 p-3 dark:border-white/10">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold text-emerald-950 dark:text-foreground">{title}</p>}
        {summary && <p className={`${title ? "mt-1" : ""} ${bodyText}`}>{summary}</p>}
        {stack.length > 0 && (
          <ul aria-label="Tech stack" className="mt-2 flex flex-wrap gap-1.5">
            {stack.map((tech, i) => (
              <li key={`${tech}-${i}`} className={chip}>{tech}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function EmptyLine({ icon: Icon, text }) {
  return (
    <p className="flex items-center gap-2 text-sm text-emerald-800/80 dark:text-slate-400">
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
}

function ResumeTab({ detail }) {
  const resume = detail.resume;
  if (!resume) {
    return (
      <EmptyState
        icon={HiOutlineDocumentText}
        title="No resume yet"
        text="This candidate has not uploaded a resume for this application."
      />
    );
  }

  const links = toList(resume.links).map((link) => {
    const url = typeof link === "string" ? link : link?.url;
    const href = toHref(url);
    const label = (typeof link === "object" && link?.label) || (href ? new URL(href).hostname : "");
    return { label: label || "Resume link", icon: HiOutlineLink, url };
  });
  const fileHref = toResumeFileHref(resume.file_url);
  const uploaded = formatDate(resume.upload_date);
  const skills = parseResumeList(resume.skills_text);
  const experience = parseResumeList(resume.experience_text);
  const projects = parseResumeList(resume.projects_text);

  return (
    <>
      {fileHref ? (
        <a
          href={fileHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-h-11 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition-colors hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:hover:bg-emerald-400/15 ${focusRing}`}
        >
          <HiOutlineArrowTopRightOnSquare className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-emerald-900 dark:text-emerald-100">Open resume PDF</span>
            {resume.title && <span className="block truncate text-xs text-emerald-800/80 dark:text-slate-400">{resume.title}</span>}
          </span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <p className="text-sm text-emerald-800/80 dark:text-slate-400">No resume file linked</p>
      )}

      <div className="flex flex-col gap-4">
        {!fileHref && resume.title && <p className="font-semibold text-emerald-950 dark:text-foreground">{resume.title}</p>}
        <ContactRows
          items={[
            { label: "Candidate", icon: HiOutlineUser, value: resume.candidate_name },
            { label: "Email", icon: HiOutlineEnvelope, value: resume.candidate_email, href: resume.candidate_email && `mailto:${resume.candidate_email}` },
            { label: "Phone", icon: HiOutlinePhone, value: resume.candidate_phone, href: toTel(resume.candidate_phone) },
            {
              label: "Experience",
              icon: HiOutlineBriefcase,
              value: resume.years_experience != null ? `${resume.years_experience} yrs` : "",
            },
            { label: "Education", icon: HiOutlineAcademicCap, value: resume.education_level },
          ]}
        />
        {uploaded && <span className={metaText}>Uploaded {uploaded}</span>}
      </div>

      <LinkButtons links={links} />

      {resume.summary_text && (
        <Section icon={HiOutlineIdentification} title="Summary">
          <p className={bodyText}>{resume.summary_text}</p>
        </Section>
      )}

      <Section icon={HiOutlineWrenchScrewdriver} title="Skills">
        {skills.length > 0 ? (
          <ul aria-label="Skills" className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <li key={`${skill}-${i}`} className={skillChip}>{skill}</li>
            ))}
          </ul>
        ) : (
          <EmptyLine icon={HiOutlineWrenchScrewdriver} text="No skills listed" />
        )}
      </Section>

      <Section icon={HiOutlineBriefcase} title="Experience">
        {experience.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {experience.map((text, i) => (
              <ResumeEntry key={`${i}-${text}`} text={text} icon={HiOutlineBriefcase} />
            ))}
          </ul>
        ) : (
          <EmptyLine icon={HiOutlineBriefcase} text="No experience listed" />
        )}
      </Section>

      <Section icon={HiOutlineFolderOpen} title="Projects">
        {projects.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {projects.map((text, i) => (
              <ResumeEntry key={`${i}-${text}`} text={text} icon={HiOutlineFolderOpen} />
            ))}
          </ul>
        ) : (
          <EmptyLine icon={HiOutlineFolderOpen} text="No projects listed" />
        )}
      </Section>
    </>
  );
}

function DetailSkeleton() {
  return (
    <output className="flex flex-col gap-4">
      <span className="sr-only">Loading candidate details</span>
      <div className={`h-24 w-full ${skeletonBlock}`} />
      <div className={`h-5 w-2/3 ${skeletonBlock}`} />
      <div className={`h-4 w-full ${skeletonBlock}`} />
      <div className={`h-4 w-5/6 ${skeletonBlock}`} />
    </output>
  );
}

export default function CandidateDetailPanel({ applicationId, app, onClose }) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const panelId = `${baseId}-panel`;
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [tab, setTab] = useState("profile");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus the close button on open, close on Escape, and return focus to the opener on close.
  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  useEffect(() => {
    // The cleanup flag drops a response that arrives after the panel closed or retried.
    let active = true;
    api.get(`/applications/${applicationId}/candidate/`)
      .then((data) => {
        if (!active) return;
        setDetail(data ?? null);
        setError("");
      })
      .catch(() => {
        if (active) setError(LOAD_ERROR);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId, reloadKey]);

  const retry = () => {
    setError("");
    setLoading(true);
    setReloadKey((n) => n + 1);
  };

  const source = detail || {};
  const candidate = source.candidate || app?.candidate_details || {};
  const name = source.resume?.candidate_name
    || [candidate.first_name, candidate.last_name].filter(Boolean).join(" ")
    || candidate.email
    || app?.resume_details?.candidate_name
    || "Candidate";
  const jobTitle = source.job_title || app?.job_title || "";
  const statusText = humanize(source.status || app?.status || source.current_stage || app?.current_stage);

  let content;
  if (loading) content = <DetailSkeleton />;
  else if (error) content = <ErrorAlert message={error} onRetry={retry} />;
  else if (tab === "profile") content = <ProfileTab detail={source} />;
  else content = <ResumeTab detail={source} />;

  return (
    <>
      <motion.div
        aria-hidden="true"
        onClick={() => onClose()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 bg-emerald-950/40 backdrop-blur-sm"
      />
      <motion.dialog
        open
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-y-0 left-auto right-0 z-50 m-0 flex h-full max-h-none w-full max-w-none flex-col border-l border-emerald-100 bg-white p-0 text-foreground shadow-2xl sm:w-[480px] dark:border-white/10 dark:bg-card"
      >
        <header className="flex items-start gap-3 border-b border-emerald-100 p-5 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-lg font-semibold text-emerald-950 dark:text-foreground">
              {name}
            </h2>
            {jobTitle && <p className="truncate text-sm text-emerald-800/80 dark:text-slate-400">{jobTitle}</p>}
            {statusText && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-800 dark:bg-white/5 dark:text-emerald-200">
                <HiOutlineFlag className="h-3.5 w-3.5" aria-hidden="true" />
                {statusText}
              </span>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onClose()}
            aria-label="Close candidate details"
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-emerald-800 hover:bg-emerald-50 dark:text-emerald-100 dark:hover:bg-white/10 ${focusRing}`}
          >
            <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div role="tablist" aria-label="Candidate details" className="flex gap-1 border-b border-emerald-100 px-3 dark:border-white/10">
          {TABS.map(({ key, label, icon: Icon }) => {
            const selected = tab === key;
            return (
              <button
                key={key}
                id={`${baseId}-tab-${key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                onClick={() => setTab(key)}
                className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors ${focusRing} ${selected
                  ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
                  : "border-transparent text-emerald-800/80 hover:text-emerald-950 dark:text-slate-400 dark:hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={`${baseId}-tab-${tab}`}
            className="flex flex-col gap-6"
          >
            {content}
          </div>
        </div>
      </motion.dialog>
    </>
  );
}
