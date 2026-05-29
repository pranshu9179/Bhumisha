# Frontend Architecture

## Stack
- React + Vite
- Tailwind CSS
- shadcn-style UI primitives
- React Router DOM
- TanStack Query
- TanStack Table
- React Hook Form
- Redux Toolkit
- Axios + Axios Mock Adapter
- Recharts
- Framer Motion ready

## Structure
- `src/app`: bootstrap and provider composition
- `src/components`: shared primitives and reusable app-level UI
- `src/config`: navigation and permissions
- `src/features`: role-specific pages and shared feature components
- `src/hooks`: lightweight selector hooks
- `src/layouts`: auth shell and app shell
- `src/lib`: constants, formatting, helpers
- `src/mocks`: seed database
- `src/routes`: router and guards
- `src/services`: API client, query hooks, mock adapter, local persistence
- `src/store`: Redux slices and persistence helpers

## State Boundaries
- `Redux Toolkit`: session, layout UI state, persistent preferences
- `React Query`: server-like resource reads/writes against the mock API
- `localStorage`: session persistence, preferences, and mutable mock database snapshot

## RBAC Model
- Route groups are partitioned by `/admin`, `/expert`, `/employee`, `/vendor`
- `ProtectedRoute` enforces authenticated and role-correct access
- Sidebar visibility comes from the central navigation config
- Permission strings live in `src/config/permissions.js` for future fine-grained gating

## Mock API Strategy
- Seed data lives in `src/mocks/db/seed.js`
- `initializeMockApi()` binds Axios endpoints to the local database
- Mutations update localStorage-backed records so CRUD survives refresh
- Audit log entries are appended on important write actions
