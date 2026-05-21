import { LuBuilding2, LuUsers, LuClipboardCheck, LuTrendingUp, LuShieldCheck, LuIdCard } from "react-icons/lu";

// Copy for the right-hand showcase panel on organization and staff flows.
// Pass one of these to AuthLayout as `showcase`.
export const ORG_SHOWCASE = {
  title: "Build your hiring team",
  body: "Set up your workspace, invite recruiters, and run every interview from one place.",
  items: [
    { icon: LuBuilding2, label: "Your workspace", desc: "The company profile candidates see on every job" },
    { icon: LuUsers, label: "Invite your team", desc: "Recruiters join with an email invitation" },
    { icon: LuClipboardCheck, label: "Shared scorecards", desc: "Consistent feedback across interviewers" },
    { icon: LuTrendingUp, label: "Pipeline insight", desc: "Track every stage from applied to hired" },
  ],
};

export const STAFF_SHOWCASE = {
  title: "Staff access",
  body: "Verify your email, complete your profile, then create the organization you will manage.",
  items: [
    { icon: LuShieldCheck, label: "Verified access", desc: "Every staff account confirms its email first" },
    { icon: LuIdCard, label: "Your profile", desc: "Name and password, kept private to your team" },
    { icon: LuBuilding2, label: "Create your organization", desc: "Set the company details candidates will see" },
  ],
};
