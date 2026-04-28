# DeepScreen Client

DeepScreen Client is the web frontend for the DeepScreen recruiting platform. It is built with Next.js App Router and provides candidate, recruiter, organization, messaging, and profile flows backed by an API.

## Features

- Authentication and account setup for login, registration, verification, staff registration, and recruiter completion flows
- Candidate, recruiter, and organization dashboards
- Organization creation, organization pages, and invite flows
- Messaging and notification UI
- User profile viewing and editing
- API-backed session handling with bearer-token authentication

## Requirements

- Node.js 18 or newer
- npm, pnpm, yarn, or bun

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file if your backend is not running at the default address:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

The client reads `NEXT_PUBLIC_API_URL` from the environment and falls back to `http://localhost:8000/api`.

## Run Locally

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production build
- `npm run lint` - run ESLint

## Route Map

- `/` - landing page
- `/auth/login` - login
- `/auth/register` - candidate registration
- `/auth/staff/register` - staff registration
- `/auth/verify` - verification
- `/auth/recruiter/complete` - recruiter onboarding completion
- `/candidate` - candidate dashboard
- `/recruiter` - recruiter dashboard
- `/organizations` - organization list
- `/organizations/create` - create organization
- `/organizations/[slug]` - organization details
- `/organizations/[slug]/invite` - organization invite flow
- `/messaging` - messaging
- `/users/profile` - user profile

## Project Structure

- `app/` - route segments and pages
- `components/` - shared UI components
- `context/` - auth state and session helpers
- `utils/` - API client utilities
- `constants/` - shared constants

## Notes

The app uses `next/font` with Geist and wraps the UI in an auth provider plus layout shell in the root layout.
