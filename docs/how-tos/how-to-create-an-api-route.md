# How to Create an API Route

API routes live under `src/app/api/**` and are the HTTP boundary of the app. They authenticate the request, validate input, bind the Supabase client to the modules they use, call module use cases, and shape the HTTP response. They contain **no business logic** — that belongs in module use cases.

This guide covers the full anatomy of a route and, in detail, how responses must be prepared.

## Folder layout

Every route folder owns three colocated files:

```
src/app/api/<route>/route.ts        ← HTTP handlers (GET/POST/PATCH/DELETE)
src/app/api/<route>/responses.ts    ← response contracts + response builders
src/app/api/<route>/validation.ts   ← request parsing/normalization
```

Nested dynamic segments get their own folder with the same trio:

```
src/app/api/<route>/[id]/route.ts
src/app/api/<route>/[id]/responses.ts
src/app/api/<route>/[id]/validation.ts
```

## Step 1: Validate the request (`validation.ts`)

Parse and normalize query params or body before touching modules. `parse*` functions return a discriminated result so the handler can short-circuit on bad input:

```ts
export function parseCreateMyEntityRequest(
  body: unknown,
): { ok: true; value: CreateMyEntityInput } | { ok: false; error: { message: string; status: number } } {
  // ...validate and normalize...
}
```

## Step 2: Define the response contract and builders (`responses.ts`)

**This is the only place a route's response shape is defined.** Routes must not import application-layer presenters (e.g. `presentXxx` functions from `@/backend/modules/<module>`) to shape responses. Instead, each route folder owns a `responses.ts` that declares the response type **and** a `toXxxResponse(data)` builder that maps boundary data (domain primitives) into that response.

Rules:

1. `responses.ts` describes the exact serialized route response and lives in the HTTP layer.
2. Provide a `toXxxResponse(data)` builder for every response. The builder takes the use case's boundary data — call `aggregate.toPrimitives()` in the route and pass the primitives — and returns the response type. Do **not** delegate shaping to an application-layer presenter.
3. `responses.ts` must be **frontend-import-safe**: no `NextRequest`/`NextResponse` (`next/server`), no `server-only`, no Supabase imports, no `@/lib/container`, no auth request context, no module `infrastructure/` imports. Type-only imports from a module barrel (`import type { ... } from "@/backend/modules/<module>"`) are fine because they are erased at compile time.
4. New response contracts are camelCase. Legacy snake_case responses may be migrated progressively.
5. Frontend code must never import from `route.ts`. Frontend API clients import the **response types** (with `import type`) from `responses.ts`.

Example:

```ts
import type {
  OpportunityPersonLinkPrimitives,
  OpportunityPersonPrimitives,
  OpportunityPersonRoleValue,
} from "@/backend/modules/selection-process";

export interface OpportunityPersonResponse {
  id: string;
  name: string;
  role: OpportunityPersonRoleValue;
  links: OpportunityPersonLinkPrimitives[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ListOpportunityPeopleResponse = OpportunityPersonResponse[];
export type CreateOpportunityPersonResponse = OpportunityPersonResponse;

export function toOpportunityPersonResponse(
  person: OpportunityPersonPrimitives,
): OpportunityPersonResponse {
  return {
    id: person.id,
    name: person.name,
    role: person.role as OpportunityPersonRoleValue,
    links: person.links,
    notes: person.notes,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  };
}

export function toOpportunityPeopleResponse(
  people: OpportunityPersonPrimitives[],
): ListOpportunityPeopleResponse {
  return people.map(toOpportunityPersonResponse);
}
```

A nested route's `responses.ts` may re-export builders/types from its parent rather than duplicating them:

```ts
export {
  toOpportunityPersonResponse,
  type OpportunityPersonResponse as UpdateOpportunityPersonResponse,
} from "../responses";

export interface DeleteOpportunityPersonResponse {
  success: true;
}
```

## Step 3: Write the handlers (`route.ts`)

Every handler follows this exact structure. There are no exceptions.

### 3.1 Auth + Supabase client — always via `getAuthenticatedRequestContext()`

```ts
const authContext = await getAuthenticatedRequestContext();
if (!authContext.ok) return authContext.response;
const { supabase, user } = authContext;
```

- Never call `createClient()` directly in a route handler.
- Never call `supabase.auth.getUser()` manually.

### 3.2 Validate before binding

Run the `parse*` function from `validation.ts` before binding any module:

```ts
const parsed = parseCreateMyEntityRequest(body);
if (!parsed.ok) return errorResponse(parsed.error);
```

`errorResponse` is imported from `@/backend/modules/shared`.

### 3.3 Bind the Supabase client to each module

After obtaining `supabase`, bind every module used in the request **before** calling any use case:

```ts
myModule.bindRequest(supabase);
```

### 3.4 Call the use case, then build the response

The use case returns domain aggregates. Convert them to primitives and pass them to the `toXxxResponse` builder from `responses.ts`:

```ts
const people = await selectionProcessModule.listOpportunityPeopleByAnalysis.execute({
  analysisId: id,
  userId: user.id,
});

return ok(toOpportunityPeopleResponse(people.map((person) => person.toPrimitives())));
```

### 3.5 Response helpers

Use the helpers from `@/backend/modules/shared` — never construct `NextResponse` manually:

| Helper                 | Status     | Use for                              |
| ---------------------- | ---------- | ------------------------------------ |
| `ok(data)`             | 200        | Successful reads                     |
| `created(data)`        | 201        | Successful creates                   |
| `errorResponse(error)` | variable   | Validation failures (from `parse*`)  |
| `notFound(msg)`        | throws 404 | Resource not found                   |
| `badRequest(msg)`      | throws 400 | Invalid state detected in controller |
| `forbidden(msg)`       | throws 403 | Authorization failure beyond auth    |
| `conflict(msg)`        | throws 409 | Conflicting resource state           |

### 3.6 Error handling — always `handleApiError` in the `catch`

Wrap the whole handler body in `try/catch` and delegate to `handleApiError` (from `@/app/api/_shared/api-error-handler`). Do **not** use the legacy `handleDomainError()`.

```ts
} catch (error: unknown) {
  return handleApiError(error);
}
```

## Complete canonical example

```ts
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { created, errorResponse, notFound, ok } from "@/backend/modules/shared";
import { selectionProcessModule } from "@/lib/container";
import {
  toOpportunityPeopleResponse,
  toOpportunityPersonResponse,
} from "./responses";
import { parseOpportunityPersonRequest } from "./validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    selectionProcessModule.bindRequest(supabase);
    const people = await selectionProcessModule.listOpportunityPeopleByAnalysis.execute({
      analysisId: id,
      userId: user.id,
    });

    return ok(toOpportunityPeopleResponse(people.map((person) => person.toPrimitives())));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseOpportunityPersonRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    selectionProcessModule.bindRequest(supabase);
    const person = await selectionProcessModule.createOpportunityPersonByAnalysis.execute({
      analysisId: id,
      userId: user.id,
      ...parsed.value,
    });
    if (!person) notFound("Job match analysis not found");

    return created(toOpportunityPersonResponse(person.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
```

## Frontend consumption

The allowed data flow is:

```
src/backend/modules/<module> (domain primitives via toPrimitives())
        ↓
src/app/api/**/responses.ts  (toXxxResponse builders + response types)
        ↓
src/frontend/features/<feature>/api/*-api.ts  (import type { XxxResponse })
        ↓
src/frontend/features/<feature>/hooks/*
        ↓
src/frontend/features/<feature>/components/*
```

Frontend API clients import response types with `import type` and read them through `readJsonResponse<XxxResponse>(...)`.

## Reference implementation

`src/app/api/job-match-analyses/[id]/people/` — list/create at the folder root and update/delete under `[personId]/`, with `responses.ts` owning the `toOpportunityPersonResponse` / `toOpportunityPeopleResponse` builders.
