# IIT Ropar Alumni Website - Working Documentation

## 1. Overview

This project is a React + Supabase alumni platform with role-based access control.

- Frontend: `client/` (Vite + React + Tailwind)
- Backend: `server/` (Node/Express, optional for auxiliary APIs)
- Auth and profile storage: Supabase (`auth` + `profiles` table)

The website supports:

- Public landing, login, register
- Admin-controlled approval flow
- Approved user-only alumni directory, jobs, resources, and volunteer/donation pages

## 2. Route Map (Frontend)

Defined in `client/src/App.jsx`:

- Public routes:
  - `/` -> Home page
  - `/login` -> User login
  - `/register` -> User registration
  - `/auth/callback` -> OAuth/email callback handler
  - `/admin-login` -> Admin login
- Protected (`approved`, `admin`):
  - `/dashboard`
  - `/directory`
  - `/jobs`
  - `/resources`
  - `/donation`
- Admin-only:
  - `/admin`

Route gating is handled by `client/src/components/ProtectedRoute.jsx`.

## 3. Authentication and Approval Flow

1. User registers from `/register`.
2. Supabase Auth account is created.
3. A profile row is maintained in `profiles` with:
   - `user_type` (Student/Alumni/Faculty/Admin)
   - `approval_status` (`PENDING`, `APPROVED`, `REJECTED`)
   - `is_approved` flag
4. Until approved, the user cannot access protected routes.
5. Admin logs in at `/admin-login` and reviews users on `/admin`.
6. Admin can approve or reject users.

## 4. Major Page Behavior

## Home (`client/src/pages/Home.jsx`)

- Hero section with CTA buttons
- Image-based announcement and service cards
- No emoji dependencies; cards use images from `public/`
- Animated card reveal and hover transitions

Expected public image files:

- `/home-card-1.jpg` to `/home-card-6.jpg`
- `/announcement-1.jpg` to `/announcement-3.jpg`
- `/travel-1.jpg` to `/travel-3.jpg`
- `/hero.jpg`, `/image.png`

Note: if a listed image is missing, the UI falls back to `/hero.jpg` on card image load failure.

## Navbar (`client/src/components/Navbar.jsx`)

- Black glass-like top bar with cardinal accent branding
- Desktop + mobile menu support
- Menu items depend on auth state:
  - Guest: Home + login/register
  - Pending: approval status + logout
  - Approved/Admin: full navigation + dashboard/logout
- Search shortcut button points to `/directory`

## Directory (`client/src/pages/Directory.jsx`)

- Supabase-powered, paginated people directory
- Search across `full_name`, `company`, `branch`, `role`, `user_type`
- Filter options:
  - User type (All, Student, Alumni, Faculty)
  - Graduation year
  - Branch
- Shows only `approval_status = APPROVED` profiles

## Donation/Volunteer (`client/src/pages/Donation.jsx`)

- Fully English content
- Donation form with preset/custom INR amounts
- Fund designation selector
- Receipt email capture
- Demo payment success message
- Volunteer section with opportunities:
  - Teaching and mentorship
  - Event planning
  - Research/development support

## Admin Dashboard (`client/src/pages/AdminDashboard.jsx`)

- Tabs for Pending, Approved, Rejected
- Approve/reject workflow with optional rejection note
- Search and user-type filtering (Student/Alumni/etc.) inside active tab
- High-level user stats at top

## 5. Styling and Theme

Primary style tokens are in `client/src/index.css`.

- Cardinal red palette and black navbar tone
- Reusable `surface-card` and `image-card` classes
- Animation helpers:
  - `animate-fade-up`
  - `animate-fade-down`

## 6. Local Run Instructions

1. Frontend:

```bash
cd client
npm install
npm run dev
```

2. Optional backend:

```bash
cd server
npm install
node server.js
```

3. Ensure `client/.env` contains valid Supabase URL/key.

## 7. Quick Validation Checklist

- Guest can open `/`, `/login`, `/register`
- Non-approved user is blocked from `/directory`
- Admin can approve/reject on `/admin`
- Approved users can search/filter students and alumni in `/directory`
- Home cards render image assets from `public/`
- Donation/volunteer page content is fully English
