# EasyHotel Frontend

The customer-facing and staff dashboard frontend for the EasyHotel Hotel Management System (HMS). Built with Next.js 16 (App Router), React 19, and TypeScript, it provides an immersive marketing landing page, a customer booking flow, an account portal, and a full hotel operations dashboard for staff and hotel admins.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Route Groups & Pages](#route-groups--pages)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Authentication](#authentication)
- [Forms & Validation](#forms--validation)
- [UI Components](#ui-components)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Build & Verify](#build--verify)
- [Known Limitations](#known-limitations)
- [License](#license)

## Features

### Marketing & Public
- **Immersive landing page** with animated hero, featured hotels, experience bento grid, testimonials carousel, and dual CTAs
- **Hotel browse page** (`/hotels`) with city/country filtering and pagination
- **Hotel detail page** (`/hotels/[hotelId]`) with image gallery, amenities, room types, and room selection
- **4-step booking flow** (`/hotels/[hotelId]/rooms/[roomId]/book`) — dates & guests → review → guest details → confirmation

### Customer Account
- **Login / register** pages with role-aware redirects
- **Account home** (`/account`) with upcoming and past bookings
- **Booking detail** (`/account/bookings/[bookingId]`) with status stepper and cancel action
- **Profile management** (`/account/profile`) — edit name, change password

### Hotel Operations Dashboard
- **KPI dashboard** (`/dashboard`) — occupancy %, ADR (average daily rate), arrivals/departures today, room status breakdown, recent bookings
- **Hotel settings** (`/dashboard/hotel`) — full CRUD for the hotelAdmin's hotel
- **Room types** (`/dashboard/room-types`) — full CRUD with amenities, images, pricing, capacity
- **Rooms** (`/dashboard/rooms`) — full CRUD with inline status dropdown (optimistic updates), filter by type/status
- **Bookings** (`/dashboard/bookings`) — list, detail with status stepper, edit, cancel, new-on-behalf-of-customer
- **Staff management** (`/dashboard/staff`) — hotelAdmin can create/edit/delete staff accounts
- **SuperAdmin hotel directory** (`/dashboard`) — global read-only hotel listing for superAdmins
- **Settings** (`/dashboard/settings`) — account preferences
- **Command palette** (Cmd/Ctrl+K) for quick navigation

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Runtime | React 19 |
| Language | TypeScript 5 |
| Server State | TanStack Query v5 |
| Client State | Zustand (booking draft), nuqs (URL state) |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 + shadcn-style primitives |
| Animation | motion (formerly framer-motion), Lenis (smooth scroll) |
| Icons | lucide-react |
| Notifications | sonner (toasts) |
| Date Handling | date-fns + react-day-picker |

## Architecture

```
src/
├── app/                        # Next.js App Router — route groups & pages
│   ├── (auth)/                 # Login + register (auth layout)
│   ├── (marketing)/            # Landing, hotel browse, hotel detail, booking flow
│   ├── account/                # Customer portal (auth-guarded)
│   ├── dashboard/              # Staff/admin operations (auth-guarded)
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # Global 404
│   └── layout.tsx              # Root layout (providers, fonts, theme)
├── components/
│   ├── account/                # Customer portal components
│   ├── auth/                   # Auth guard, session expiry watcher
│   ├── booking/                # 4-step booking flow
│   ├── dashboard/              # Dashboard pages, forms, lists, command menu
│   ├── marketing/              # Hero, hotel cards, gallery, testimonials, etc.
│   ├── primitives/             # Custom UI primitives (animations, fields, badges)
│   ├── providers/              # Auth, Query, Theme, SmoothScroll providers
│   └── ui/                     # shadcn-style base components (button, input, table, etc.)
├── lib/
│   ├── api/                    # API client modules (one per resource)
│   ├── booking-store.ts        # Zustand store for the booking draft
│   ├── format/                 # Currency, date formatting
│   ├── forms/                  # Zod schemas shared with React Hook Form
│   ├── query/                  # TanStack Query hooks + key factories
│   └── animation/              # Animation presets and hooks
├── types/api.ts                # TypeScript interfaces mirroring backend models
└── proxy.ts                    # Next.js 16 proxy (renamed middleware)
```

### Request flow

```
Component → useXxx() hook (TanStack Query) → lib/api/xxx.ts → apiFetch() → backend API
```

Components never call `fetch` directly. Every API interaction goes through:
1. **`src/lib/api/*`** — resource-specific functions (`hotelsApi.list()`, `bookingsApi.create()`, etc.)
2. **`src/lib/api/apiFetch.ts`** — the single fetch wrapper that injects auth headers, normalizes errors, and converts Mongoose `_id` → `id`
3. **`src/lib/query/hooks/*`** — TanStack Query hooks wrapping the API functions with caching, invalidation, and optimistic updates

## Route Groups & Pages

### `(marketing)` — Public, no auth required

| Route | Description |
|---|---|
| `/` | Landing page — hero, featured hotels, experience bento, testimonials, CTAs |
| `/hotels` | Browse all hotels with city/country filters and pagination |
| `/hotels/[hotelId]` | Hotel detail — gallery, amenities, room types, room list |
| `/hotels/[hotelId]/rooms/[roomId]/book` | 4-step booking flow (dates → review → details → confirm) |

### `(auth)` — Login & register

| Route | Description |
|---|---|
| `/login` | Email/password login with redirect-back support |
| `/register` | Customer registration form |

### `/account` — Customer portal (auth-guarded)

| Route | Description |
|---|---|
| `/account` | Home — upcoming & past bookings overview |
| `/account/bookings/[bookingId]` | Booking detail with status stepper and cancel |
| `/account/profile` | Edit first/last name |
| `/account/profile/password` | Change password |

### `/dashboard` — Hotel operations (auth-guarded, staff/hotelAdmin/superAdmin)

| Route | Description |
|---|---|
| `/dashboard` | KPI bento grid (staff/admin) or global hotel directory (superAdmin) |
| `/dashboard/hotel` | Hotel settings CRUD (hotelAdmin) |
| `/dashboard/room-types` | Room type list + CRUD |
| `/dashboard/room-types/new` | Create room type |
| `/dashboard/room-types/[roomTypeId]` | Edit room type |
| `/dashboard/rooms` | Room list with inline status dropdown + CRUD |
| `/dashboard/rooms/new` | Create room |
| `/dashboard/rooms/[roomId]` | Edit room |
| `/dashboard/bookings` | Bookings list |
| `/dashboard/bookings/new` | New booking on behalf of customer |
| `/dashboard/bookings/[bookingId]` | Booking detail with status stepper, edit, cancel |
| `/dashboard/staff` | Staff list (hotelAdmin only) |
| `/dashboard/staff/new` | Create staff member |
| `/dashboard/staff/[userId]` | Edit staff member |
| `/dashboard/settings` | Account settings |

## State Management

Three complementary state systems, each with a clear boundary:

| System | Scope | Usage |
|---|---|---|
| **TanStack Query v5** | Server state | All API data — fetching, caching, invalidation, optimistic updates. Query keys are hierarchical via factory functions in `src/lib/query/keys.ts`. |
| **Zustand** | Client UI state | The booking draft store (`src/lib/booking-store.ts`) holds the in-progress 4-step booking flow state. Ephemeral — resets on navigation away. |
| **nuqs** | URL state | Filter/sort state on list pages is synced to the URL for shareable/bookmarkable views. |

## API Layer

### `apiFetch` — the single fetch wrapper

All API calls go through `src/lib/api/apiFetch.ts`, which handles:

- **Auth injection** — reads the JWT from in-memory mirror + sessionStorage, sends it as the `Authorization` header
- **JSON normalization** — recursively converts Mongoose `_id` → `id` and strips `__v` so frontend types match API responses
- **Error normalization** — parses the backend's error envelope into a typed `ApiError` with status code and body
- **401 handling** — clears the token and redirects to `/login?redirect=...` (suppressible for the login call itself)
- **Network errors** — catches fetch failures and throws `ApiError(0, "Could not reach the server...")`

### Resource modules

| Module | Functions |
|---|---|
| `src/lib/api/auth.ts` | `login()`, `register()`, `status()` |
| `src/lib/api/hotels.ts` | `list()`, `getById()`, `getMyHotel()`, `create()`, `update()`, `deactivate()` |
| `src/lib/api/roomTypes.ts` | `list()`, `getById()`, `create()`, `update()`, `deactivate()` |
| `src/lib/api/rooms.ts` | `list()`, `getById()`, `create()`, `update()`, `deactivate()` |
| `src/lib/api/bookings.ts` | `listMine()`, `listForHotel()`, `getById()`, `create()`, `createForHotel()`, `update()`, `updateStatus()`, `cancel()` |
| `src/lib/api/users.ts` | `getMe()`, `updateMe()`, `changePassword()`, `list()`, `create()`, `getById()`, `update()`, `deactivate()` |
| `src/lib/api/admin.ts` | `createStaffOrAdmin()` |

### Query hooks

Each resource has a hooks file in `src/lib/query/hooks/` exporting `useXxx` (read) and `useXxxMutation` (write) hooks. Mutations invalidate the relevant query keys via the factory in `src/lib/query/keys.ts`.

## Authentication

- **Token storage**: JWT is stored in `sessionStorage` (key: `hms.auth.token`) with an in-memory mirror for synchronous access. The token is sent verbatim as the `Authorization` header (the backend returns `"Bearer <jwt>"`).
- **AuthProvider** (`src/components/providers/auth-provider.tsx`): On mount, reads any persisted token and validates it via `GET /api/auth/status`. Exposes `user`, `status`, `login()`, `register()`, `logout()`, and `refresh()` via `useAuth()`.
- **AuthGuard** (`src/components/auth/auth-guard.tsx`): Client-side route guard wrapping `/account` and `/dashboard` layouts. Redirects unauthenticated users to `/login?redirect=...`.
- **Session expiry watcher**: Monitors token age and proactively logs out when the JWT expires.
- **Proxy** (`src/proxy.ts`): Next.js 16's renamed middleware. Currently a pass-through since the JWT is in sessionStorage (client-only). Ready to host server-side auth if the token moves to an httpOnly cookie.

## Forms & Validation

- **React Hook Form** + **Zod** for all forms (hotel settings, room types, rooms, staff, booking, profile, password change).
- **Shared schemas** in `src/lib/forms/schemas.ts` — Zod schemas are reused between the form and the API payload, ensuring client-side validation matches server expectations.
- **Coercive schemas**: When Zod schemas use `z.coerce.*` (input type differs from output), forms use the three-generic `useForm<Input, Context, Output>` signature.
- **React Hook Form `watch()`**: Used in dashboard forms for dynamic field rendering (amenities, images, status-dependent fields). React Compiler emits expected `incompatible-library` warnings for these — they are documented and acceptable.

## UI Components

### `src/components/ui/` — shadcn-style base primitives

Built on Radix UI (`radix-ui` package) with Tailwind CSS v4 styling. Includes: button, input, textarea, label, checkbox, select, dialog, alert-dialog, sheet, popover, tooltip, dropdown-menu, tabs, table, card, badge, avatar, separator, scroll-area, command, skeleton, sonner (toasts).

### `src/components/primitives/` — Custom HMS components

Higher-level building blocks specific to the hotel app:

| Component | Purpose |
|---|---|
| `array-field` | Reusable add/remove string array editor (amenities, images, tags) |
| `confirm-dialog` | Confirmation modal for destructive actions |
| `date-range-picker` | Calendar-based date range selection for booking flow |
| `guest-selector` | Stepper for guest count |
| `booking-summary` | Live booking cost summary card |
| `status-badge` | Color-coded badges for room and booking statuses |
| `status-stepper` | Visual progress for booking status transitions |
| `kpi-card` | Dashboard metric card with animated counter |
| `empty-state` | Illustrated empty-state placeholder |
| `skeleton` | Loading skeleton |
| `reveal` | Scroll-triggered fade/slide-in animation |
| `kinetic-text` | Animated text on scroll |
| `magnetic-button` | Cursor-magnetic button effect |
| `spotlight-card` | Cursor-tracking spotlight hover effect |
| `scroll-progress-bar` | Top-of-page scroll indicator |
| `page-transition` | Route-level fade transition |

### `src/lib/animation/` — Animation system

Motion presets, reduced-motion detection, and custom hooks (`useMagnetic`, `useSpotlight`, `useKineticText`, `useScroll`). All animations respect `prefers-reduced-motion`.

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- The backend API running (see [EasyHotelBackend](https://github.com/ipoojamittal/EasyHotelBackend))

### Installation

```bash
git clone git@github.com:ipoojamittal/EasyHotelFrontend.git
cd EasyHotelFrontend
npm install
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: `http://localhost:3000`) |

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port shown in the terminal).

## Build & Verify

Before committing, run all three checks:

```bash
npx tsc --noEmit    # TypeScript typecheck (must pass)
npm run lint        # ESLint (0 errors required; React Compiler watch() warnings are expected)
npm run build       # Production build (must pass)
```

Or as a single command:

```bash
npx tsc --noEmit && npm run lint && npm run build
```

### Lint warnings

React Compiler emits `react-hooks/incompatible-library` warnings for React Hook Form's `watch()` calls in `hotel-form.tsx`, `room-form.tsx`, and `room-type-form.tsx`. These are expected and documented in `AGENTS.md` — they do not block the build.

## Known Limitations

- **No server-side auth enforcement** — the JWT lives in `sessionStorage` (client-only), so the proxy is a pass-through. Auth is enforced client-side via `AuthGuard`. Moving the token to an httpOnly cookie would enable server-side protection.
- **No image upload** — image fields are URL arrays managed via `ArrayField type="url"`.
- **No analytics endpoint** — dashboard KPIs (occupancy, ADR, arrivals/departures) are computed client-side from list endpoints. Fine for the demo dataset; a dedicated `GET /api/hotels/:hotelId/analytics` would be better at scale.
- **No automated tests** — no test runner is configured.
- **No CI pipeline** — no GitHub Actions or other CI is configured.

## License

ISC
