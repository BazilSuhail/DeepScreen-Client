# DeepScreen Client

A **Next.js** web application for autonomous AI‑driven recruiting. This README focuses on the core enhancements added in the `core-enhancements` branch.

---

## New Features

### 1️⃣ Role‑Based Access Control (RBAC)
- The user object now includes a `role` field (e.g., `candidate`, `recruiter`, `admin`).
- Added `useHasRole(requiredRole)` hook in `context/AuthContext.jsx` to simplify permission checks throughout the UI.
- Authentication context now exports both `useAuth` and `useHasRole`.

### 2️⃣ Recruiter Dashboard
- New route: **`/dashboard`** (file: `app/dashboard/page.jsx`).
- Displays key recruitment metrics: total candidates processed, screened candidates, scheduled interviews, and average AI score.
- Uses a placeholder fetch to `/api/analytics` – ready for a real analytics endpoint.
- Styled with Tailwind CSS and animated with `motion/react` for a polished look.

### 3️⃣ Conditional Navigation
- Updated navigation bar (`components/layout/Navbar.jsx`):
  - Imports `useHasRole`.
  - Shows a **Dashboard** link only for users with `recruiter` or `admin` roles.
  - Retains existing breadcrumb navigation.

### 4️⃣ Project Structure
- Added `app/dashboard/` directory for the new page.
- Updated `AuthContext.jsx` to populate the role from the profile API response.

---

## Development

```bash
# Install dependencies
npm install   # or yarn / pnpm / bun

# Run the dev server
npm run dev   # or yarn dev, pnpm dev, bun dev
```

The app runs at **http://localhost:3000**.  Sign‑in as a recruiter/admin to see the new Dashboard link.

---

## Future Work
- Implement the real `/api/analytics` endpoint to supply live metrics.
- Add interview‑scheduling UI and calendar integration.
- Expand RBAC to protect API routes and server‑side logic.

---

*This project was bootstrapped with `create‑next‑app`.  For more on Next.js, visit the official documentation.*