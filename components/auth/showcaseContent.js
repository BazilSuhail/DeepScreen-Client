import { HiOutlineBuildingOffice2, HiOutlineUsers, HiOutlineClipboardDocumentCheck, HiOutlineArrowTrendingUp, HiOutlineShieldCheck, HiOutlineIdentification } from "react-icons/hi2";

// Copy for the right-hand showcase panel on organization and staff flows.
// Pass one of these to AuthLayout as `showcase`.
export const ORG_SHOWCASE = {
  title: "Build your hiring team",
  body: "Set up your workspace, invite recruiters, and run every interview from one place.",
  items: [
    { icon: HiOutlineBuildingOffice2, label: "Your workspace", desc: "The company profile candidates see on every job" },
    { icon: HiOutlineUsers, label: "Invite your team", desc: "Recruiters join with an email invitation" },
    { icon: HiOutlineClipboardDocumentCheck, label: "Shared scorecards", desc: "Consistent feedback across interviewers" },
    { icon: HiOutlineArrowTrendingUp, label: "Pipeline insight", desc: "Track every stage from applied to hired" },
  ],
};

export const STAFF_SHOWCASE = {
  title: "Staff access",
  body: "Verify your email, complete your profile, then create the organization you will manage.",
  items: [
    { icon: HiOutlineShieldCheck, label: "Verified access", desc: "Every staff account confirms its email first" },
    { icon: HiOutlineIdentification, label: "Your profile", desc: "Name and password, kept private to your team" },
    { icon: HiOutlineBuildingOffice2, label: "Create your organization", desc: "Set the company details candidates will see" },
  ],
};
