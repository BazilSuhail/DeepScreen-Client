/**
 * Layout configuration and constants
 */

// Paths where only the Top Navbar should be shown (Public Pages)
export const NAVBAR_ONLY_PATHS = [
  "/",
  "/about",
  "/features",
  "/jobs",
  "/pricing",
  "/contact",
];

// Paths where the Dashboard Sidebar should be shown
export const SIDEBAR_PATHS = [
  "/dashboard",
  "/organizations",
  "/analytics",
  "/settings",
  "/candidates",
  "/recruiter",
  "/candidate",
  "/ai-interview",
  "/jobs",
  "/team",
];

export const ORG_MENU = {
  title: "Organization",
  items: [
    { name: "Dashboard", icon: "HiOutlineHome", path: "/organizations/:slug" },
    {
      name: "Jobs",
      icon: "HiOutlineBriefcase",
      path: "/organizations/:slug/jobs",
    },
    {
      name: "Team",
      icon: "HiOutlineUserGroup",
      path: "/organizations/:slug/team",
    },
    {
      name: "Analytics",
      icon: "HiOutlineChartBar",
      path: "/organizations/:slug/analytics",
    },
    {
      name: "Assessments",
      icon: "HiOutlineCommandLine",
      path: "/organizations/:slug/assesments",
    },
    {
      name: "AI Interviews",
      icon: "HiOutlineSpeakerWave",
      path: "/organizations/:slug/ai-interviews",
    },
    {
      name: "Live Interviews",
      icon: "HiOutlineVideoCamera",
      path: "/organizations/:slug/interviews",
    },
  ],
};

// Paths with NO navigation components at all
export const AUTH_PATHS = ["/auth"];

// Paths where NO sidebar AND NO navbar should render (full-screen routes)
export const NO_LAYOUT_PATHS = [
  "/candidate/resumes",
  "/chats",
  "/recruiter/assessments",
  "/",
  "/recruiter/ai-interview",
  "/auth",
  "/recruiter/problems",
];

export const MENU_CONFIG = {
  STAFF: [
    {
      title: "Overview",
      items: [
        {
          name: "Analytics",
          icon: "HiOutlineChartBar",
          path: "/organizations/:slug/analytics",
        },
        {
          name: "Jobs",
          icon: "HiOutlineBriefcase",
          path: "/organizations/:slug/jobs",
        },
        {
          name: "Team",
          icon: "HiOutlineUserGroup",
          path: "/organizations/:slug/team",
        },
      ],
    },
    {
      title: "Evaluations & AI",
      items: [
        {
          name: "Assessments",
          icon: "HiOutlineCommandLine",
          path: "/organizations/:slug/assesments",
        },
        {
          name: "AI Interviews",
          icon: "HiOutlineSpeakerWave",
          path: "/organizations/:slug/ai-interviews",
        },
        {
          name: "Live Interviews",
          icon: "HiOutlineVideoCamera",
          path: "/organizations/:slug/interviews",
        },
      ],
    },
  ],
  RECRUITER: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", icon: "HiOutlineHome", path: "/recruiter" },
        {
          name: "Analytics",
          icon: "HiOutlineChartBar",
          path: "/recruiter/analytics",
        },
        {
          name: "My Jobs",
          icon: "HiOutlineBriefcase",
          path: "/recruiter/jobs",
        },
        {
          name: "Applications",
          icon: "HiOutlineDocumentText",
          path: "/recruiter/applications",
        },
      ],
    },
    {
      title: "Evaluations & AI",
      items: [
        {
          name: "Assessments",
          icon: "HiOutlineCommandLine",
          path: "/recruiter/assessments",
        },
        {
          name: "AI Interviews",
          icon: "HiOutlineSpeakerWave",
          path: "/recruiter/ai-interview",
        },
        {
          name: "Live Interviews",
          icon: "HiOutlineVideoCamera",
          path: "/recruiter/interview",
        },
      ],
    },
  ],
  CANDIDATE: [
    {
      title: "Overview",
      items: [
        {
          name: "Find Jobs",
          icon: "HiOutlineMagnifyingGlass",
          path: "/jobs",
          variant: "accent",
        },
        { name: "Dashboard", icon: "HiOutlineHome", path: "/candidate" },
      ],
    },
    {
      title: "Recruitment",
      items: [
        {
          name: "My Applications",
          icon: "HiOutlineDocumentText",
          path: "/candidate/applications",
        },
        {
          name: "My Resumes",
          icon: "HiOutlineDocumentDuplicate",
          path: "/candidate/resumes",
        },
      ],
    },
    {
      title: "Evaluations & AI",
      items: [
        {
          name: "Assessments",
          icon: "HiOutlineCommandLine",
          path: "/candidate/assessments",
        },
        {
          name: "AI Interviews",
          icon: "HiOutlineSpeakerWave",
          path: "/candidate/ai-interview",
        },
        {
          name: "Live Interviews",
          icon: "HiOutlineVideoCamera",
          path: "/candidate/interview",
        },
      ],
    },
  ],
};
