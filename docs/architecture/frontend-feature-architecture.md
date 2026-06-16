# Frontend Feature Architecture

New substantial frontend work lives in `src/features/<feature-name>/`, not in legacy component-only folders. Feature folders own their API client, query hooks, route state hooks, and feature-specific components. Other code imports a feature only through its `index.ts` public barrel.

## Folder Shape

```txt
src/features/<feature-name>/
  api/
  hooks/
  components/
  index.ts
```

Shared frontend infrastructure belongs in `src/frontend/`. Generic UI primitives stay in `src/components/ui/`, and cross-feature reusable UI components stay in `src/components/shared/`.

## HTTP Contracts

Frontend API clients import response types from colocated API `responses.ts` files. Components and hooks must never import from `route.ts` or from `src/modules/**`.

Allowed flow:

```txt
src/modules/<module>/application presenters
  -> src/app/api/**/responses.ts
  -> src/features/<feature>/api/*-api.ts
  -> src/features/<feature>/hooks/*
  -> src/features/<feature>/components/*
```

`responses.ts` files must stay frontend-import-safe: no Next runtime imports, Supabase clients, module container imports, auth request context, or infrastructure imports.

### Canonical response type ownership (BE → FE)

The serialized response shape has **one owner**: the route's `responses.ts`. That file owns both the response **type** and the domain → response **mapping**. The same camelCase type then flows unchanged through every layer down to the components. There must be exactly one shape conversion in the whole chain, and it lives in `responses.ts` — never in the application layer and never in the frontend.

```txt
domain aggregate/VO  (camelCase via toPrimitives)
  -> app/api/**/responses.ts   (THE response type + to*Response builders; route uses `satisfies`)
  -> features/<f>/api/*-api.ts (fetch returns the *Response type)
  -> features/<f>/hooks/*      (consume *Response, or a derived alias)
  -> features/<f>/components/* (consume *Response)
```

Rules:

1. **Serialization is an API-layer responsibility, not an application-layer one.** The route handler resolves domain aggregates from use cases/queries and passes them to a `to*Response` builder defined in `responses.ts`: `return ok(toXResponse(aggregate) satisfies XResponse)`. Do **not** add HTTP-shaping "presenter" functions in `src/modules/**/application`. Application-layer presenters that exist only to shape HTTP output are legacy and should be folded into `responses.ts` builders when touched. (`performance-review` still has application presenters pending this migration.)
2. **`responses.ts` builders stay frontend-import-safe via structural typing.** A builder accepts the aggregate through a local structural source interface (`{ toPrimitives(): { ... } }`) and reads `toPrimitives()`. This keeps `responses.ts` from importing `@/modules/**`, so the file remains importable from frontend code. Builders are reusable across the route's verbs (list/create/update).
3. **No snake_case in the frontend.** `snake_case` belongs only to DB rows and legacy HTTP **request** payloads. The response path is camelCase end to end.
4. **No reverse mappers.** The frontend must never convert a camelCase response back into a snake_case shape for components (no `to*Legacy`). A camelCase → snake_case → camelCase round trip is a bug.
5. **A feature may re-export, never redeclare.** A feature-local `*-types.ts` may re-export the contract types from `responses.ts` (and derive aliases like `export type WorkJournalEntry = WorkJournalEntryResponse`). It must not duplicate the interface definitions or define conversion functions. Duplicated interfaces are two sources of truth and drift.
6. **Requests are a separate contract.** Request payloads may still be `snake_case` on the wire where the route validation expects it. When a write endpoint takes `snake_case` but the editable draft is the camelCase response shape, map camelCase → snake_case in **one** place: the feature API client (e.g. `updateWorkJournalEntry`). Migrating request contracts to camelCase is a separate, independent change.

Reference implementation: the `work-journal` feature and `src/app/api/work-journal/entries/responses.ts` (`toWorkJournalEntryResponse` / `toWorkJournalContextResponse`).

## Server State

TanStack Query owns data loaded from the backend, mutation state, invalidation, refetching, and optimistic updates. React local state owns UI-only state such as form drafts, inline edit IDs, modal open state, copied indicators, and selected local control values.

Feature views should not become monolithic UI files. Keep `*-view.tsx` components focused on orchestration: route state, query/mutation hooks, top-level draft state, and high-level conditional rendering. Extract substantial UI regions into sibling components inside the same feature folder, including sidebars, detail panels, create/edit forms, inline editors, repeated rows, modals, and domain-specific sections. If a view is approaching 250-300 lines or contains several independent UI regions, split it as part of the same change.

Do not copy query data into local state unless it is intentionally becoming an editable draft.

## Routing

Route-driven features should use real route segments. The Feedback Notes pilot supports:

```txt
/feedback-notes
/feedback-notes/[feedbackId]
/feedback-notes/[feedbackId]?status=active|closed|all
```

The `feedbackId` path segment controls the detail resource. The `status` query param controls only the sidebar list. Selecting the first loaded note automatically should use `router.replace`; user selection should use `router.push`.

## E2E Navigation Coverage

Every migrated route-driven feature should include Playwright coverage for its core navigation paths. These tests should exercise direct URL entry, automatic default selection, tab/filter query params, item selection, global shell navigation, and browser back/forward behavior.

When adding those E2E tests, instrument frontend API request logging inside the test run. For now, use the logs as review evidence instead of strict request-budget assertions. The logs should group requests by HTTP method and URL so duplicate list/detail calls caused by route effects, unstable query keys, broad invalidation, or changing `enabled` conditions are easy to spot.

If navigation produces obvious duplicate or unnecessary backend requests during the E2E run, treat that as part of the migration and fix the route state, TanStack Query key, `enabled` guard, or invalidation scope before finishing.

## Verification

Run `npm run build` after changes under `src/app`, `src/components`, `src/features`, or `src/frontend`. Run `npm run ddd:check` when architecture boundaries may be affected. `scripts/verify-frontend-boundaries.mjs` currently enforces migrated frontend roots (`src/features` and `src/frontend`) plus unsafe `responses.ts` imports; legacy `src/components/<module-name>` screens should be migrated into feature folders before being brought under the stricter check.
