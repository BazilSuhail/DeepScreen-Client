# DeepScreen

<p>
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-443E38?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/React_Query-5-FF4154?style=flat-square&logo=reactquery" alt="React Query" />
  <img src="https://img.shields.io/badge/LiveKit-0F9D58?style=flat-square&logo=webrtc" alt="LiveKit" />
  <img src="https://img.shields.io/badge/Motion-12-0055FF?style=flat-square" alt="Motion" />
  <img src="https://img.shields.io/badge/Bun-000?style=flat-square&logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint" alt="ESLint" />
</p>

AI-powered recruitment and candidate assessment platform. Provides end-to-end hiring pipeline management with AI-driven resume parsing, coding assessments, video interviews, candidate shortlisting, and real-time communication for recruiters and candidates.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Backend Services](#backend-services)
- [Architecture](#architecture)
- [Routing](#routing)
- [State Management](#state-management)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

DeepScreen is a full-stack recruitment platform built with Next.js (App Router). It connects three backend services to deliver an AI-native hiring experience:

- **Candidate portal** -- Browse jobs, submit applications, take coding assessments, complete AI interviews, attend live video interviews, manage resumes, and message recruiters.
- **Recruiter portal** -- Post jobs, review applications, configure assessments and AI interviews, schedule live interviews, shortlist candidates via AI scoring, and chat with candidates.
- **Staff/Organization portal** -- Multi-tenant organization management with team roles, analytics, and centralized configuration for assessments, AI interviews, and live interviews.

Key capabilities include:

- AI-powered resume parsing via a dedicated microservice
- Automated candidate shortlisting with skill/experience/project scoring
- Coding assessments with a Monaco code editor and auto-grading
- AI interviews with speech recognition and natural language evaluation
- Live video interviews powered by LiveKit with screen sharing and chat
- Real-time messaging between recruiters and candidates
- Role-based dashboards with granular navigation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion) |
| State Management | Zustand v5 + React Context |
| Server State | TanStack React Query v5 |
| Icons | React Icons (Heroicons v2) |
| Charts | Visx (by Airbnb) |
| Code Editor | Monaco Editor |
| PDF Generation | React-PDF |
| Video/RTC | LiveKit |
| Cryptography | @noble/curves, @noble/hashes |
| Package Manager | Bun (npm-compatible) |

---

## Project Structure

```
deepscreen-client/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication (login, register, verify, OAuth)
│   ├── candidate/                # Candidate portal (dashboard, applications, assessments, interviews, resumes)
│   ├── chats/                    # Real-time messaging (candidate + recruiter)
│   ├── interview/                # Live video interview join flow
│   ├── jobs/                     # Public job listings and apply flow
│   ├── organizations/            # Staff/org management (multi-tenant)
│   ├── recruiter/                # Recruiter portal (jobs, applications, assessments, interviews, analytics)
│   └── users/                    # Profile and settings
├── components/
│   ├── ai-interview/             # AI interview components (candidate + recruiter)
│   ├── applications/             # Shared application UI components
│   ├── assessments/              # Coding assessment components
│   ├── auth/                     # Auth showcase/decorative components
│   ├── display/                  # Bar chart (Visx wrapper)
│   ├── interview/                # Live interview components (LiveKit room, scheduling)
│   ├── jobs/                     # Job card and form components
│   ├── layout/                   # App shell (sidebar, navbar, layout wrapper)
│   └── resume/                   # Resume builder, review modal, templates
├── constants/                    # Layout config, menu config, shared constants
├── context/                      # Auth context (legacy) and Zustand auth store
├── public/                       # Static assets (images, icons)
├── utils/                        # API clients and configuration
│   ├── api.js                    # Main Django backend API client
│   ├── resume_api.js             # Resume parsing microservice client
│   ├── interview_api.js          # LiveKit/RTC API client
│   └── config.js                 # Centralized environment configuration
├── .env.local                    # Environment variables (see below)
├── next.config.mjs               # Next.js configuration
├── tailwind.config.mjs           # Tailwind CSS configuration
├── jsconfig.json                 # Path alias (@/ maps to ./)
└── package.json                  # Dependencies and scripts
```

---

## Prerequisites

- **Node.js** 18.17 or later (LTS recommended)
- **Bun** (recommended) or **npm** / **yarn** / **pnpm**
- **Git** (for version control)
- A running instance of the **DeepScreen Django backend** (default: http://localhost:8000)
- A running instance of the **DeepScreen Rocket resume microservice** (default: http://localhost:10000)
- A **LiveKit** server or cloud project (for video interviews)

---

## Setup Instructions

### Windows

1. **Install Node.js**
   Download and install the LTS version from https://nodejs.org

2. **Install Bun** (recommended -- faster installs and builds)
   Open PowerShell as Administrator and run:
   ```
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
   Restart your terminal, then verify:
   ```
   bun --version
   ```

   Alternatively, use npm (comes with Node.js):
   ```
   npm --version
   ```

3. **Clone and install dependencies**
   ```
   git clone <repository-url>
   cd deepscreen-client
   bun install
   ```
   or with npm:
   ```
   npm install
   ```

4. **Configure environment**
   Copy or edit `.env.local` with your backend URLs (defaults work for local development).

5. **Start the development server**
   ```
   bun run dev
   ```
   or:
   ```
   npm run dev
   ```

### macOS

1. **Install Node.js**
   Using Homebrew:
   ```
   brew install node
   ```
   Or download from https://nodejs.org

2. **Install Bun** (recommended)
   ```
   curl -fsSL https://bun.sh/install | bash
   ```
   Verify:
   ```
   bun --version
   ```

3. **Clone and install dependencies**
   ```
   git clone <repository-url>
   cd deepscreen-client
   bun install
   ```

4. **Configure environment**
   Edit `.env.local` with your backend URLs.

5. **Start the development server**
   ```
   bun run dev
   ```

### Linux

1. **Install Node.js**
   Using apt (Debian/Ubuntu):
   ```
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
   Using dnf (Fedora):
   ```
   sudo dnf install nodejs
   ```

2. **Install Bun** (recommended)
   ```
   curl -fsSL https://bun.sh/install | bash
   ```
   Verify:
   ```
   bun --version
   ```

3. **Clone and install dependencies**
   ```
   git clone <repository-url>
   cd deepscreen-client
   bun install
   ```

4. **Configure environment**
   Edit `.env.local` with your backend URLs.

5. **Start the development server**
   ```
   bun run dev
   ```

---

## Environment Variables

Create or edit `.env.local` in the project root:

```
# Main Django backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# LiveKit WebSocket URL (local or cloud)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-instance.livekit.cloud

# Resume parsing microservice
NEXT_PUBLIC_RESUME_API_URL=http://localhost:10000

# RTC API endpoint (usually same as main API with /rtc suffix)
NEXT_PUBLIC_RTC_API_URL=http://localhost:8000/rtc
```

For production deployment, uncomment and update the Render URLs in `.env.local`.

---

## Running the Application

### Development

```
bun run dev
```

Opens at http://localhost:3000. Hot reload is enabled.

### Production Build

```
bun run build
bun run start
```

### Linting

```
bun run lint
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start development server with hot reload |
| `build` | `next build` | Create optimized production build |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint across the project |

---

## Backend Services

The frontend communicates with three backend services:

| Service | Default URL | Purpose |
|---|---|---|
| DeepScreen Server | http://localhost:8000 | Main Django REST API (auth, jobs, applications, assessments, interviews, organizations, chat) |
| DeepScreen Rocket | http://localhost:10000 | Resume parsing microservice (PDF extraction, skill parsing) |
| LiveKit | wss://*.livekit.cloud | WebRTC video/audio for live interviews |

The main Django backend provides endpoints under `/api/` (though the frontend strips this prefix in some API utilities). The chat API is prefixed with `/chat/`. The resume API operates independently on a separate port.

---

## Architecture

### Layout Engine

The application uses a dynamic layout system (`LayoutWrapper`) that selects between three shells based on the current route:

- **No layout** -- Full-screen pages (chat rooms, assessment sessions, resume builder, interview join)
- **Navbar only** -- Public pages (home, job listings, pricing, about)
- **Sidebar + content** -- Dashboard pages (all authenticated routes for candidates, recruiters, and staff)

The sidebar is role-aware, rendering different navigation items for `CANDIDATE`, `RECRUITER`, and `STAFF` roles.

### Authentication

Two parallel auth implementations exist (migration in progress):

1. **Zustand store** (`context/authStore.js`) -- Primary auth system. Handles login, registration, email verification, OAuth, and token management with JWT expiry checking.
2. **React Context** (`context/AuthContext.jsx`) -- Legacy wrapper used by the root layout.

The application reads the JWT access token from `localStorage` and attaches it as a Bearer token to all API requests.

### API Clients

All API calls use native `fetch` wrapped in custom utilities. Each utility:

- Injects the JWT token from localStorage
- Sets `Content-Type: application/json` (removed for FormData)
- Parses JSON responses
- Throws structured errors with `{ status, message, errors }` on non-2xx responses
- Handles DRF-style validation error formatting

---

## Routing

### Public Routes

| Path | Description |
|---|---|
| `/` | Home page (role-based redirect) |
| `/auth/login` | Login with email or Google OAuth |
| `/auth/register` | Multi-step registration |
| `/jobs` | Public job listings |
| `/jobs/[id]` | Job detail |

### Candidate Routes

| Path | Description |
|---|---|
| `/candidate` | Dashboard |
| `/candidate/applications` | Track application pipeline |
| `/candidate/assessments` | Take coding assessments |
| `/candidate/ai-interview` | Complete AI interviews |
| `/candidate/interview` | Attend live video interviews |
| `/candidate/resumes` | Manage and build resumes |

### Recruiter Routes

| Path | Description |
|---|---|
| `/recruiter` | Dashboard with stats and funnel |
| `/recruiter/jobs` | Manage job postings |
| `/recruiter/applications` | Review and shortlist candidates |
| `/recruiter/assessments` | Configure coding assessments |
| `/recruiter/ai-interview` | Configure AI interviews |
| `/recruiter/interview` | Schedule live interviews |
| `/recruiter/analytics` | Hiring analytics |

### Organization Routes (Staff)

| Path | Description |
|---|---|
| `/organizations/[slug]` | Organization dashboard |
| `/organizations/[slug]/jobs` | Org job management |
| `/organizations/[slug]/team` | Team and role management |
| `/organizations/[slug]/assesments` | Org assessment configs |
| `/organizations/[slug]/ai-interviews` | Org AI interview configs |
| `/organizations/[slug]/interviews` | Org live interview configs |
| `/organizations/[slug]/analytics` | Org analytics |

### Shared Routes

| Path | Description |
|---|---|
| `/chats/candidate` | Candidate messaging |
| `/chats/recruiter` | Recruiter messaging inbox |
| `/users/profile` | User profile |
| `/users/settings` | Account settings |

---

## State Management

- **Zustand v5** (`context/authStore.js`) -- Primary auth and user state
- **React Context** (`context/AuthContext.jsx`) -- Legacy auth provider
- **TanStack React Query v5** -- Server state for data fetching and caching
- **Component-local state** with `useState` and `useEffect` for UI state

The `useAuth()` hook provides a unified interface to the auth store, returning `{ user, login, logout, register, ... }`.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m "Add your feature"`)
4. Push the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please follow the existing code conventions:
- Use `"use client"` for all pages and components (no Server Components)
- Use `motion/react` for animations
- Follow Tailwind CSS utility patterns
- Use the existing API client utilities for all backend communication

---

## License

Educational and Non-Commercial Use License

Copyright (c) 2026 BazilSuhail

DeepScreen Rocket -- Heavy-Lifting AI Microservice for Resume Parsing,
Semantic Embedding, and AI-Powered Candidate Shortlisting.

Permission is hereby granted to any person obtaining a copy of this software
and associated documentation files (the "Software"), to use, copy, modify,
merge, and distribute the Software for **educational and non-commercial
purposes only**, subject to the following conditions:

1. **Non-Commercial Use Only** -- This Software may not be used, in whole
   or in part, for commercial purposes, including but not limited to:
   selling, licensing, leasing, using the Software in a product or service
   that generates revenue, or deploying it as a hosted service for a fee.

2. **Attribution** -- The above copyright notice and this permission notice
   shall be included in all copies or substantial portions of the Software.

3. **No Warranty** -- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
   ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
   WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
   NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION
   OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
   WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

For commercial licensing inquiries, contact the copyright holder.
