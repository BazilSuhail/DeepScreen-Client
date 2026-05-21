"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import {
  LuCircleAlert, LuX, LuCheck, LuArrowRight, LuArrowLeft,
  LuUser, LuLink, LuTarget, LuBriefcase, LuMapPin, LuCalendar,
  LuCode, LuHeart, LuPlus, LuSkipForward, LuCircleOff, LuBadgeCheck,
} from "react-icons/lu";
import { FaGithub, FaLinkedinIn, FaGlobe } from "react-icons/fa";
import { api } from "@/utils/api";
import AuthGridBackground from "@/components/auth/AuthGridBackground";
import AuthShowcase from "@/components/auth/AuthShowcase";

const steps = [
  { label: "About you", icon: LuUser },
  { label: "Your links", icon: LuLink },
  { label: "What you're after", icon: LuTarget },
];

const headings = {
  1: ["Tell us about yourself", "A headline and location help recruiters find you."],
  2: ["Add your links", "Link your work so reviewers can see what you've built."],
  3: ["What are you looking for?", "Skills and roles help us match you to the right jobs."],
};

const suggestions = {
  skills: ["React", "Python", "SQL", "TypeScript", "Node.js", "Docker"],
  interests: ["Machine learning", "Open source", "System design", "Robotics"],
};

const inputClass =
  "w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground/40 focus:border-emerald-500/60 focus:bg-emerald-500/5 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium";
const labelClass = "text-xs font-semibold text-foreground/50 ml-1 uppercase tracking-wider";

const toList = (text) => text.split(",").map((s) => s.trim()).filter(Boolean);
const toYears = (value) => (value === "" ? null : Number(value));

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    headline: "",
    location: "",
    years_experience: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
    skills: "",
    interests: "",
    desired_roles: "",
    open_to_work: false,
  });
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the profile, bounce users who should not be here, and pre-fill the form
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.replace("/auth/login");
      return;
    }

    let active = true;
    api
      .get("/accounts/profiles/me/")
      .then((profile) => {
        if (!active) return;
        if (profile.user?.role !== "CANDIDATE") return router.replace("/");
        if (profile.setup_completed) return router.replace("/candidate/profile");

        const joinList = (list) => (list || []).join(", ");
        setForm({
          headline: profile.headline || "",
          location: profile.location || "",
          years_experience: profile.years_experience ?? "",
          github_url: profile.github_url || "",
          linkedin_url: profile.linkedin_url || "",
          portfolio_url: profile.portfolio_url || "",
          skills: joinList(profile.skills),
          interests: joinList(profile.interests),
          desired_roles: joinList(profile.desired_roles),
          open_to_work: !!profile.open_to_work,
        });
        setReady(true);
      })
      .catch((err) => {
        if (!active) return;
        if (err?.status === 401) {
          localStorage.removeItem("access_token");
          router.replace("/auth/login");
          return;
        }
        setError(err?.message || "Couldn't load your profile. Please try again.");
      });

    return () => {
      active = false;
    };
  }, [router]);

  const update = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const addSuggestion = (name, value) =>
    setForm((f) => {
      const list = toList(f[name]);
      if (list.some((s) => s.toLowerCase() === value.toLowerCase())) return f;
      return { ...f, [name]: [...list, value].join(", ") };
    });

  const field = (name, label, Icon, props = {}) => (
    <div className="space-y-2">
      <label htmlFor={name} className={labelClass}>{label}</label>
      <div className="relative group">
        <Icon
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/35 transition-colors group-focus-within:text-emerald-400"
        />
        <input id={name} name={name} value={form[name]} onChange={update(name)} className={inputClass} {...props} />
      </div>
    </div>
  );

  const suggestionChips = (name) => (
    <div className="flex flex-wrap gap-1.5">
      {suggestions[name].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => addSuggestion(name, s)}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-medium text-emerald-300/80 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <LuPlus className="w-3 h-3" aria-hidden="true" />
          {s}
        </button>
      ))}
    </div>
  );

  const goTo = (n) => {
    setError("");
    setStep(n);
  };

  const persist = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await api.put("/accounts/profiles/me/", payload);
      return true;
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const finish = async (payload) => {
    if (await persist({ ...payload, setup_completed: true })) router.replace("/");
  };

  const stepPayloads = {
    1: () => ({
      headline: form.headline.trim(),
      location: form.location.trim(),
      years_experience: toYears(form.years_experience),
    }),
    2: () => ({
      github_url: form.github_url.trim(),
      linkedin_url: form.linkedin_url.trim(),
      portfolio_url: form.portfolio_url.trim(),
    }),
    3: () => ({
      skills: toList(form.skills),
      interests: toList(form.interests),
      desired_roles: toList(form.desired_roles),
      open_to_work: form.open_to_work,
    }),
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    if (step === 3) return finish(stepPayloads[3]());
    if (await persist(stepPayloads[step]())) goTo(step + 1);
  };

  const skipStep = () => {
    if (step === 3) return finish({});
    goTo(step + 1);
  };

  const skipSetup = () => finish({});

  const stepIndicator = (
    <div className="flex items-center justify-center mb-6">
      {steps.map((s, i) => {
        const num = i + 1;
        const isDone = num < step;
        const isCurrent = num === step;
        const Icon = s.icon;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => goTo(num)}
                disabled={!isDone || saving}
                aria-label={`Go to step ${num}: ${s.label}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-400 cursor-pointer"
                    : isCurrent
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 cursor-default"
                      : "border-border text-foreground/30 bg-muted cursor-default"
                }`}
              >
                {isDone ? <LuCheck className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </button>
              <span
                className={`hidden sm:block text-xs font-medium tracking-wider whitespace-nowrap ${
                  isCurrent ? "text-emerald-400" : "text-foreground/30"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 mx-1.5 transition-colors ${num < step ? "bg-emerald-500/50" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative min-h-screen flex w-screen max-w-full overflow-hidden bg-background">
      {/* Grid stands in for the showcase panel below lg */}
      <AuthGridBackground className="lg:hidden" />
      <div className="relative flex min-w-0 flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex items-center gap-3">
          <Image src="/deepscreen.webp" alt="DeepScreen" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="text-xl font-semibold tracking-tight text-foreground">DeepScreen</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{headings[step][0]}</h1>
        <p className="text-foreground/50 text-sm mt-1.5 mb-6">{headings[step][1]}</p>

        {ready && stepIndicator}

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
              <LuCircleAlert className="h-4 w-4 text-red-400" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-300">Something went wrong</p>
              <p className="mt-0.5 text-xs leading-relaxed text-red-300/70">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="shrink-0 rounded-md p-1 text-red-300/60 transition-colors hover:bg-red-500/10 hover:text-red-300 focus:outline-none"
            >
              <LuX className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {ready && (
          <form onSubmit={handleContinue} className="space-y-4">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {step === 1 && (
                <>
                  {field("headline", "Headline", LuBriefcase, { placeholder: "e.g. Frontend engineer, React and TypeScript", maxLength: 160 })}
                  {field("location", "Location", LuMapPin, { placeholder: "City, Country", maxLength: 120 })}
                  {field("years_experience", "Years of experience", LuCalendar, { type: "number", min: 0, max: 80, step: 1, placeholder: "e.g. 3" })}
                </>
              )}

              {step === 2 && (
                <>
                  {field("github_url", "GitHub", FaGithub, { type: "url", placeholder: "https://github.com/you" })}
                  {field("linkedin_url", "LinkedIn", FaLinkedinIn, { type: "url", placeholder: "https://linkedin.com/in/you" })}
                  {field("portfolio_url", "Portfolio", FaGlobe, { type: "url", placeholder: "https://your-site.dev" })}
                </>
              )}

              {step === 3 && (
                <>
                  {field("skills", "Skills", LuCode, { placeholder: "Python, React, SQL" })}
                  {suggestionChips("skills")}
                  {field("interests", "Interests", LuHeart, { placeholder: "Machine learning, Open source" })}
                  {suggestionChips("interests")}
                  {field("desired_roles", "Desired roles", LuTarget, { placeholder: "Backend engineer, Data analyst" })}
                  <label
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
                      form.open_to_work
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-border bg-muted/50 hover:border-emerald-500/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.open_to_work}
                      onChange={(e) => setForm((f) => ({ ...f, open_to_work: e.target.checked }))}
                      className="h-4 w-4 accent-emerald-500"
                    />
                    <LuBadgeCheck className={`w-4 h-4 ${form.open_to_work ? "text-emerald-400" : "text-foreground/35"}`} aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground">Open to work</span>
                  </label>
                </>
              )}
            </motion.div>

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-xl border border-border bg-muted hover:bg-accent text-foreground font-semibold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  <LuArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : step === 3 ? "Finish setup" : "Save & continue"}
                {!saving && (step === 3 ? <LuCheck className="w-4 h-4" /> : <LuArrowRight className="w-4 h-4" />)}
              </button>
            </div>

            <button
              type="button"
              onClick={skipStep}
              disabled={saving}
              className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
            >
              <LuSkipForward className="w-4 h-4" aria-hidden="true" />
              Skip for now
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={skipSetup}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs text-foreground/40 hover:text-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <LuCircleOff className="w-3.5 h-3.5" aria-hidden="true" />
                Skip setup entirely
              </button>
            </div>
          </form>
        )}
      </motion.div>
      </div>
      <AuthShowcase />
    </div>
  );
}
