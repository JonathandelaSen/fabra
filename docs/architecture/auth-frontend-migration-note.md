# Auth Frontend Migration Note

## Decision

Section label: Auth
Route segments: `/login`, `/account/update-password`
Primary detail resource: none
Query params: `accountDeleted` and `resetError` on `/login`
Existing legacy entry point: `src/components/auth/*`
New feature owner: `src/features/auth`
Existing server actions: `src/app/login/actions.ts`
Backend mutations: yes, through Supabase Auth server actions and password recovery client call
AI prompt impact: none

Auth is a small route-owned feature rather than an AppShell section. It does not
need section layout persistence, route state hooks, or TanStack Query because it
does not load reusable server state. It still follows the feature boundary by
owning its components, action wrappers, client API helper, and form-state hooks
under `src/features/auth`.

## State Ownership

Server/backend interactions:
- `signIn`, `signUp`, `resendConfirmationEmail`, and `updatePasswordFromRecovery`
  are exposed to the feature through `src/features/auth/api/auth-actions.ts`.
- Password recovery email sending is exposed through
  `src/features/auth/api/auth-api.ts`.

Local UI state:
- login/signup/recover mode
- email input draft
- password visibility
- action pending states
- action messages and errors

## Route Wiring

`src/app/login/page.tsx` and `src/app/account/update-password/page.tsx` import
only from the feature barrel at `@/features/auth`.

## E2E Coverage

`e2e/auth.spec.ts` covers:
- anonymous API guard behavior
- successful UI login with a confirmed local user
- login/signup/password recovery mode navigation on `/login`
- authenticated access to `/account/update-password`
