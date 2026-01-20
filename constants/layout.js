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
// (Note: Usually these also show the Navbar, but we'll control them separately)
export const SIDEBAR_PATHS = [
    '/dashboard',
    '/organizations',
    '/users',
    '/profile',
    '/analytics',
    '/settings',
    '/jobs',
    '/candidates',
];

// Paths with NO navigation components at all
export const AUTH_PATHS = [
    '/auth',
];
