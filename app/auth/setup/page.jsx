"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  HiOutlineCheck, HiOutlineArrowRight, HiOutlineArrowLeft,
  HiOutlineUser, HiOutlineLink, HiOutlineFlag, HiOutlineBriefcase, HiOutlineMapPin, HiOutlineCalendar,
  HiOutlineCodeBracket, HiOutlineHeart, HiOutlinePlus, HiOutlineForward, HiOutlineNoSymbol, HiOutlineCheckBadge,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { FaGithub, FaLinkedinIn, FaGlobe } from "react-icons/fa";
import { api } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import StepIndicator from "@/components/auth/StepIndicator";
import FormError from "@/components/auth/FormError";
import AuthFormSkeleton from "@/components/skeletons/auth/AuthFormSkeleton";
import { TextField } from "@/components/forms/FormFields";
import { ghostButton, primaryButton, secondaryButton } from "@/components/ui/styles";
import { base } from "@/constants/motion";

const steps = [
  { label: "About you", icon: HiOutlineUser },
  { label: "Your links", icon: HiOutlineLink },
  { label: "What you're after", icon: HiOutlineFlag },
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


const toList = (text) => text.split(",").map((s) => s.trim()).filter(Boolean);
const toYears = (value) => (value === "" ? null : Number(value));

export default function SetupPage() {
  const router = useRouter();
  const { logout } = useAuth();
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
          logout();
          return;
        }
        setError(err?.message || "Couldn't load your profile. Please try again.");
      });

    return () => {
      active = false;
    };
  }, [router, logout]);

  const update = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const addSuggestion = (name, value) =>
    setForm((f) => {
      const list = toList(f[name]);
      if (list.some((s) => s.toLowerCase() === value.toLowerCase())) return f;
      return { ...f, [name]: [...list, value].join(", ") };
    });

  const field = (name, label, Icon, props = {}) => (
    <TextField id={name} name={name} label={label} icon={Icon} value={form[name]} onChange={update(name)} {...props} />
  );

  const suggestionChips = (name) => (
    <div className="flex flex-wrap gap-1.5">
      {suggestions[name].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => addSuggestion(name, s)}
          disabled={saving}
          className="inline-flex items-center gap-1 min-h-10 rounded-sm border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-[color,background-color,border-color,transform,translate,scale,rotate] active:scale-[0.97] motion-reduce:transform-none disabled:opacity-50 cursor-pointer"
        >
          <HiOutlinePlus className="w-3 h-3" aria-hidden="true" />
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
    if (await persist({ ...payload, setup_completed: true })) router.replace("/candidate");
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

  if (!ready && !error) return <AuthFormSkeleton fields={3} steps label="Loading your profile" />;

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{headings[step][0]}</h1>
      <p className="mb-6 mt-1.5 text-sm text-muted-foreground">{headings[step][1]}</p>

      {ready && <StepIndicator steps={steps} current={step} onSelect={saving ? undefined : goTo} />}

      <FormError message={error} onDismiss={() => setError("")} />

      {ready && (
        <form onSubmit={handleContinue} className="space-y-4">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={base}
            className="space-y-4"
          >
            {step === 1 && (
              <>
                {field("headline", "Headline", HiOutlineBriefcase, { placeholder: "e.g. Frontend engineer, React and TypeScript", maxLength: 160 })}
                {field("location", "Location", HiOutlineMapPin, { placeholder: "City, Country", maxLength: 120 })}
                {field("years_experience", "Years of experience", HiOutlineCalendar, { type: "number", min: 0, max: 80, step: 1, placeholder: "e.g. 3" })}
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
                {field("skills", "Skills", HiOutlineCodeBracket, { placeholder: "Python, React, SQL" })}
                {suggestionChips("skills")}
                {field("interests", "Interests", HiOutlineHeart, { placeholder: "Machine learning, Open source" })}
                {suggestionChips("interests")}
                {field("desired_roles", "Desired roles", HiOutlineFlag, { placeholder: "Backend engineer, Data analyst" })}
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-emerald-500 ${
                    form.open_to_work
                      ? "border-emerald-500 bg-emerald-50/70 dark:border-emerald-500/50 dark:bg-emerald-500/10"
                      : "border-border bg-muted/50 hover:border-emerald-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.open_to_work}
                    onChange={(e) => setForm((f) => ({ ...f, open_to_work: e.target.checked }))}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <HiOutlineCheckBadge className={`h-4 w-4 ${form.open_to_work ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">Open to work</span>
                </label>
              </>
            )}
          </motion.div>

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button type="button" onClick={() => goTo(step - 1)} disabled={saving} className={`${secondaryButton} flex-1`}>
                <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
            )}
            <button type="submit" disabled={saving} aria-busy={saving} className={`${primaryButton} flex-[2]`}>
              {saving ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Saving...
                </>
              ) : step === 3 ? (
                <>Finish setup <HiOutlineCheck className="h-4 w-4" aria-hidden="true" /></>
              ) : (
                <>Save &amp; continue <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" /></>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
            <button type="button" onClick={skipStep} disabled={saving} className={`${ghostButton} w-full sm:w-auto`}>
              <HiOutlineForward className="h-4 w-4" aria-hidden="true" />
              Skip for now
            </button>
            <button type="button" onClick={skipSetup} disabled={saving} className={`${ghostButton} w-full text-xs sm:w-auto`}>
              <HiOutlineNoSymbol className="h-4 w-4" aria-hidden="true" />
              Skip setup entirely
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
