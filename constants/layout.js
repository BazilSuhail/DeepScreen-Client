/**
 * Layout configuration and constants
 */

// Paths where only the Top Navbar should be shown (Public Pages)
export const NAVBAR_ONLY_PATHS = [
    '/',
    '/about',
    '/features',
    '/jobs',
    '/pricing',
    '/contact',
];

// Paths where the Dashboard Sidebar should be shown
export const SIDEBAR_PATHS = [
    '/dashboard',
    '/organizations',
    '/users',
    '/analytics',
    '/settings',
    '/candidates',
    '/recruiter',
    '/candidate',
    '/ai-interview',
];

// Paths with NO navigation components at all
export const AUTH_PATHS = [
    '/auth',
];

// Paths where NO sidebar AND NO navbar should render (full-screen routes)
export const NO_LAYOUT_PATHS = [
    '/candidate/resumes',
    '/chats',
    '/recruiter/assessments',
    '/recruiter/ai-interview',
    '/recruiter/problems',
];

export const MENU_CONFIG = {
    'STAFF': [
        { name: "Dashboard", icon: 'HiOutlineHome', path: "/dashboard" },
        { name: "Organization", icon: 'HiOutlineBuildingOffice2', path: "/organizations" },
        { name: "Jobs", icon: 'HiOutlineBriefcase', path: "/jobs" },
        { name: "Candidates", icon: 'HiOutlineUserGroup', path: "/candidates" },
        { name: "Assessments", icon: 'HiOutlineCommandLine', path: "/recruiter/assessments" },
        { name: "AI Interviews", icon: 'HiOutlineSpeakerWave', path: "/recruiter/ai-interview" },
        { name: "Live Interviews", icon: 'HiOutlineVideoCamera', path: "/recruiter/interview" },
        { name: "Problem Bank", icon: 'HiOutlinePuzzlePiece', path: "/recruiter/problems" },
        { name: "Analytics", icon: 'HiOutlineChartBar', path: "/analytics" },
        { name: "Profile", icon: "HiOutlineUser", path: "/users/profile" },
    ],
    'RECRUITER': [
        { name: "Dashboard", icon: 'HiOutlineHome', path: "/recruiter" },
        { name: "My Jobs", icon: 'HiOutlineBriefcase', path: "/recruiter/jobs" },
        { name: "Applications", icon: 'HiOutlineDocumentText', path: "/recruiter/applications" },
        { name: "Assessments", icon: 'HiOutlineCommandLine', path: "/recruiter/assessments" },
        { name: "AI Interviews", icon: 'HiOutlineSpeakerWave', path: "/recruiter/ai-interview" },
        { name: "Live Interviews", icon: 'HiOutlineVideoCamera', path: "/recruiter/interview" },
        { name: "Problem Bank", icon: 'HiOutlinePuzzlePiece', path: "/recruiter/problems" },
        { name: "Messages", icon: 'HiOutlineChatBubbleLeftRight', path: "/chats/recruiter" },
        { name: "Profile", icon: "HiOutlineUser", path: "/users/profile" },
    ],
    'CANDIDATE': [
        { name: "Dashboard", icon: 'HiOutlineHome', path: "/candidate" },
        { name: "My Applications", icon: 'HiOutlineDocumentText', path: "/candidate/applications" },
        { name: "My Resumes", icon: 'HiOutlineDocumentDuplicate', path: "/candidate/resumes" },
        { name: "Technical Tests", icon: 'HiOutlineCommandLine', path: "/candidate/assessments" },
        { name: "AI Interviews", icon: 'HiOutlineSpeakerWave', path: "/candidate/ai-interview" },
        { name: "Live Interviews", icon: 'HiOutlineVideoCamera', path: "/candidate/interview" },
        { name: "Find Jobs", icon: 'HiOutlineBriefcase', path: "/jobs" },
        { name: "Messages", icon: 'HiOutlineChatBubbleLeftRight', path: "/chats/candidate" },
        { name: "Profile", icon: "HiOutlineUser", path: "/users/profile" },
    ]
};
