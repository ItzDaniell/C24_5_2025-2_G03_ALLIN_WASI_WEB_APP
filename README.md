# TECSUP Rooms — Web App (Dashboard + Landing)

## Overview
A web application built with Next.js (App Router) to manage room and property rentals.

- Public landing with Google authentication.
- Landlord dashboard for properties, files, and user settings.
- API proxy layer in Next.js (`app/api`) to communicate with the backend using the NextAuth session token.

## Folder Structure
```
tecsup-rooms-webapp/
├─ .env
├─ .git/
├─ .gitignore
├─ .next/
├─ README.md
├─ README.en.md
├─ app/
│  ├─ api/
│  ├─ complete-registration/
│  ├─ dashboard/
│  ├─ login/
│  ├─ store/
│  ├─ styles/
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ providers.tsx
├─ eslint.config.mjs
├─ lib/
│  ├─ auth/
│  ├─ axios.ts
│  ├─ constants.ts
│  └─ server-fetch.ts
├─ middleware.ts
├─ modules/
│  ├─ auth/
│  ├─ dashboard/
│  └─ landing/
├─ next-env.d.ts
├─ next.config.ts
├─ node_modules/
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public/
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ tsconfig.json
├─ types/
│  └─ userType.ts
└─ ui/
   ├─ accordion.tsx
   ├─ alert-dialog.tsx
   ├─ alert.tsx
   ├─ aspect-ratio.tsx
   ├─ avatar.tsx
   ├─ badge.tsx
   ├─ breadcrumb.tsx
   ├─ button.tsx
   ├─ calendar.tsx
   ├─ card.tsx
   ├─ carousel.tsx
   ├─ checkbox.tsx
   ├─ collapsible.tsx
   ├─ command.tsx
   ├─ context-menu.tsx
   ├─ dialog.tsx
   ├─ drawer.tsx
   ├─ dropdown-menu.tsx
   ├─ form.tsx
   ├─ hover-card.tsx
   ├─ input-otp.tsx
   ├─ input.tsx
   ├─ label.tsx
   ├─ menubar.tsx
   ├─ navigation-menu.tsx
   ├─ pagination.tsx
   ├─ popover.tsx
   ├─ progress.tsx
   ├─ radio-group.tsx
   ├─ resizable.tsx
   ├─ scroll-area.tsx
   ├─ select.tsx
   ├─ separator.tsx
   ├─ sheet.tsx
   ├─ sidebar.tsx
   ├─ skeleton.tsx
   ├─ slider.tsx
   ├─ sonner.tsx
   ├─ switch.tsx
   ├─ table.tsx
   ├─ tabs.tsx
   ├─ textarea.tsx
   ├─ toggle-group.tsx
   ├─ toggle.tsx
   ├─ tooltip.tsx
   ├─ use-mobile.ts
   └─ utils.ts
```

### Descriptions
- **.env** — Environment variables for local configuration.
- **.next/** — Next.js build output (generated).
- **app/** — Next.js App Router entry with routes, layouts, providers, local state, and styles.
- **app/api/** — API route handlers served by Next.js.
- **app/complete-registration/** — Route segment for completing user registration.
- **app/dashboard/** — Dashboard entry route.
- **app/login/** — Login route.
- **app/store/** — App-level client state/store setup.
- **app/styles/** — Global or route-level styles.
- **app/layout.tsx** — Root layout for the App Router.
- **app/page.tsx** — Root landing page.
- **app/providers.tsx** — Global React/Next providers (e.g., themes, query clients).
- **eslint.config.mjs** — ESLint configuration.
- **lib/** — Utilities, configs, and shared helpers.
- **lib/auth/** — Auth-related helpers or server utilities.
- **lib/axios.ts** — Preconfigured Axios instance.
- **lib/constants.ts** — Global constants.
- **lib/server-fetch.ts** — Server-side fetch helpers.
- **middleware.ts** — Next.js middleware (e.g., auth checks, redirects).
- **modules/** — Feature-oriented modules grouping UI and logic by domain.
- **modules/auth/** — Authentication feature module.
- **modules/dashboard/** — Dashboard feature module.
- **modules/landing/** — Landing/home feature module.
- **types/** — Shared TypeScript types.
- **types/userType.ts** — User-related type definitions.
- **ui/** — Reusable UI components (shadcn/ui-style primitives and wrappers).

## Technologies
- Next.js (App Router), TypeScript, React
- NextAuth (Google) with JWT and custom callbacks
- TanStack React Query
- Zustand (lightweight global state)
- TailwindCSS + internal UI (shadcn/ui)
- Axios for client calls; `fetch` for server proxy

## Environment Variables
Set these in `.env`:
- `NEXTAUTH_SECRET=`
- `GOOGLE_CLIENT_ID=`
- `GOOGLE_CLIENT_SECRET=`
- `BACKEND_SYNC_URL=` (optional; sync user after login)
- `BACKEND_API_URL=` (backend URL for server-side proxy)
- `API_BASE_URL=` (fallback if `BACKEND_API_URL` is missing)
- `NEXT_PUBLIC_API_BASE_URL=` (for initial server fetch)
- `NEXT_PUBLIC_HOST_URL=` (baseURL for the client Axios instance)

## Installation
1) Install dependencies
```bash
npm install
```
2) Create a `.env` file with the variables above
3) Run in development
```bash
npm run dev
```
4) Open http://localhost:3000

## Useful Scripts
From `package.json`:
- `dev` — Start the development server (Turbopack)
- `build` — Build the app for production (Turbopack)
- `start` — Start the production server
- `lint` — Run ESLint
