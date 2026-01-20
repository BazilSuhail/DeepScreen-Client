/**
 * Layout configuration and constants
 */

// Paths where only the Top Navbar should be shown (Public Pages)
export const NAVBAR_ONLY_PATHS = [
    '/',
    '/about',
    '/features',
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
    '/jobs',
    '/candidates',
    '/recruiter',
    '/candidate',
];

// Paths with NO navigation components at all
export const AUTH_PATHS = [
    '/auth',
];

export const MENU_CONFIG = {
    'STAFF': [
        { name: "Dashboard", icon: 'HiOutlineHome', path: "/dashboard" },
        { name: "Organization", icon: 'HiOutlineBuildingOffice2', path: "/organizations" },
        { name: "Jobs", icon: 'HiOutlineBriefcase', path: "/jobs" },
        { name: "Candidates", icon: 'HiOutlineUserGroup', path: "/candidates" },
        { name: "Analytics", icon: 'HiOutlineChartBar', path: "/analytics" },
    ],
    'RECRUITER': [
        { name: "Dashboard", icon: 'HiOutlineHome', path: "/recruiter" },
        { name: "My Jobs", icon: 'HiOutlineBriefcase', path: "/recruiter/jobs" },
        { name: "Applications", icon: 'HiOutlineDocumentText', path: "/recruiter/applications" },
    ],
    'CANDIDATE': [
        { name: "Dashboard", icon: 'HiOutlineHome', path: "/candidate" },
        { name: "My Applications", icon: 'HiOutlineDocumentText', path: "/candidate/applications" },
        { name: "Find Jobs", icon: 'HiOutlineBriefcase', path: "/candidate/jobs" },
    ]
};
