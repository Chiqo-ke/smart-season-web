# Frontend Changelog

All notable changes to the SmartSeason frontend will be documented in this file.

---

## [Unreleased]

### Added

- `src/lib/api.ts` — Typed fetch wrapper with auto-refresh JWT logic, token helpers, and all typed API callers (`authApi`, `usersApi`, `fieldsApi`, `updatesApi`, `dashboardApi`). Base URL driven by `VITE_API_URL` env var, falls back to `http://localhost:8000`.
- `src/lib/auth.tsx` — `AuthProvider` context + `useAuth()` hook for global auth state. Validates stored token on mount via `GET /api/v1/users/me/`; clears tokens on validation failure.
- `src/routes/login.tsx` — Login page with react-hook-form + zod validation; redirects to `/` if already authenticated; toast error on failure.

### Changed

- `src/routes/__root.tsx` — Wrapped app in `QueryClientProvider` (`staleTime: 30s`, `retry: 1`) and `AuthProvider`; added `<Toaster richColors>` for toast notifications.
- `src/components/Layout.tsx` — Added auth guard: redirects unauthenticated users to `/login`; shows skeleton while auth state is loading.
- `src/components/AppSidebar.tsx` — Replaced mock user with real auth state; hides "Agents" nav item for `agent` role users; real sign-out via `logout()` + redirect to `/login`.
- `src/routes/index.tsx` — Replaced mock Dashboard with live data from `dashboardApi.summary()` and `fieldsApi.list()`. Shows hero stats, stage distribution bar, recent updates, and field overview table.
- `src/routes/fields.tsx` — Full API integration: list fields, create field (admin), assign agent (admin), advance stage (all roles). Role-gated admin actions. Invalidates `['fields']` and `['dashboard']` on mutation success. Removed mock-only `hectares`/`region` columns.
- `src/routes/agents.tsx` — Replaced mock with live `dashboardApi.agents()` + `fieldsApi.list()`. Agent role users are redirected to `/`. Shows assigned field count and first 3 fields per agent. Removed mock-only `hectares`/`region`.
- `src/routes/updates.tsx` — Replaced mock timeline with live `updatesApi.list()`. Supports paginated "Load more" (appends results). Shows loading skeletons while fetching page 1.
- `src/lib/api.ts` (`DashboardData` type) — Corrected type from nested `{ role, summary: {...} }` shape to flat shape matching the actual `/api/v1/dashboard/` response.
- `src/lib/api.ts` (`updatesApi.list`) — Added optional `page` parameter; passes `?page=N` query string to support pagination.
