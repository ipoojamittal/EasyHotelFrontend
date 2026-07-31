<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HMS Frontend — Project Guide

## Build / verify commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build (must pass before committing)
- `npm run lint` — ESLint (0 errors required; React Compiler `watch()` warnings are expected with React Hook Form)
- `npx tsc --noEmit` — TypeScript typecheck (must pass before committing)

Run all three before considering work complete: `npx tsc --noEmit && npm run lint && npm run build`

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- TanStack Query v5 (server state), Zustand (client UI state), nuqs (URL state)
- React Hook Form + Zod (forms + shared schemas in `src/lib/forms/schemas.ts`)
- Tailwind CSS + shadcn-style primitives in `src/components/ui/` and `src/components/primitives/`
- motion (formerly framer-motion) for animation

## Conventions

- `params` and `searchParams` in page components are **async** in Next 16 — always `await` them.
- `middleware.ts` is renamed to `proxy.ts` in Next 16.
- Push `"use client"` as far down the tree as possible; Server Components for initial data fetch.
- Direct imports, no component barrels (except `src/components/primitives/index.ts` which is intentional).
- Forms use the 3-generic `useForm<Input, Context, Output>` signature when Zod schemas use `z.coerce.*` (input type differs from output).
- All API access goes through `src/lib/api/*` + `src/lib/query/*` hooks — never call `fetch` directly in components.

## Backend caveats (from FRONTEND_PLAN.md §13)

These backend limitations are handled gracefully by the frontend but should be fixed server-side:

1. **Customer booking cancel** — `PATCH /api/booking/:id/cancel` was registered twice; the admin/staff-only route shadowed the customer-inclusive one. **Fixed in backend** (this repo's `hms-backend`). Frontend no longer needs the 403 workaround.
2. **`POST /api/admin` was unguarded** — `checkRole([Role.HotelAdmin])` was commented out, letting any authed user create staff/admin accounts. **Fixed in backend**. Frontend also UI-restricts the action to hotelAdmin as defense in depth.
3. **No superAdmin routes** — superAdmin dashboard is read-only-ish (global hotel directory via public `GET /api/hotels`). Cross-hotel booking analytics aren't possible.
4. **No analytics endpoint** — dashboard KPIs are computed client-side from list endpoints. Fine for MVP; add `GET /api/hotels/:hotelId/analytics` at scale.
5. **No image upload** — image fields are URL arrays. `ArrayField type="url"` manages them with preview.
6. **No public hotelAdmin onboarding** — registration only creates customers; hotelAdmins are created via `/api/admin`. The landing "List your property" CTA routes to a request-access form.
7. **`JWT_EXPIRES_IN` parsed as seconds** (`parseInt('1h')` → `1` sec) — set it as a plain number like `3600` in the backend `.env`.
