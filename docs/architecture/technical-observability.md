# Technical observability

## Purpose

This document defines the technical observability architecture for Fabra.

The first provider will be Sentry, but application code must depend on a
provider-agnostic telemetry port. Replacing Sentry will still require changing
framework-specific integration files, but the change must remain concentrated
in a small number of infrastructure and composition files.

The initial implementation must provide:

- automatic error monitoring for Next.js API routes, server rendering, and the
  browser
- explicit capture of every exception handled by the API error boundary
- traces for successful and failed requests
- semantic child spans for every application use case
- semantic child spans for cross-module query bus dispatches
- automatic spans produced by the Sentry SDK for supported framework and
  external operations
- production tracing at a `1.0` sample rate
- observability disabled by default in local development and always disabled in
  automated tests
- best-effort telemetry that can never alter a business result

Technical telemetry does not replace the existing `EventTracker` or
`processing_events`. Those represent explicit product and workflow
observability. Sentry represents technical errors, latency, and execution
hierarchy.

## Status

Design approved through a `grill-me` interview on June 10, 2026.

Implemented locally on June 10, 2026.

Automated verification covers the telemetry port, NoOp and Sentry adapters,
exactly-once execution, use-case instrumentation, query-bus instrumentation,
API exception capture, runtime enablement policy, provider boundaries, frontend
tests, and the production build.

Pending operational verification:

- configure `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and
  `SENTRY_PROJECT` in the deployment environment
- perform the manual local opt-in checks with
  `OBSERVABILITY_ENABLE_LOCAL=true`
- verify production issue capture, traces, release association, and source maps
- configure and record Sentry alert rules

## Raw decision interview

This section preserves the question and answer sequence that produced the
design. Wording is lightly normalized only where needed for readability.

### 1. Successful executions

**Question**

Should Sentry observe only errors, or also successful executions, duration, and
the hierarchy `API route -> use case -> service`?

**Answer**

Also observe successful executions, duration, and hierarchy.

**Decision**

Tracing is part of the initial scope. Technical error monitoring alone is not
enough.

### 2. Free-plan quota and sampling

**Question**

Should successful traces be sampled to protect the free-plan quota?

**Answer**

The expected production traffic is very low, probably fewer than 20 users in
the next few months. If the quota resets monthly, start without sampling.

**Decision**

Use `tracesSampleRate: 1.0` in production. Keep the rate configurable so it can
be reduced later without an architectural change.

**Pricing note**

Sentry pricing is external and mutable. At the time of this design, Sentry
describes quotas and pricing in monthly terms and the Developer plan includes
Error Monitoring and Tracing. Check current quotas in Sentry before rollout;
do not encode quota numbers as architectural facts.

During the interview, the working figures were corrected to approximately
`5,000` errors and `5 million` spans per month for the free Developer plan. The
important approved decision is that quotas are monthly rather than permanently
accumulative. The numeric figures must be reverified before rollout.

### 3. Runtime environments

**Question**

In which environments should Sentry be enabled?

**Answer**

Production at 100%. Local development and tests disabled. Preview environments
are not currently used and should remain disabled initially.

**Decision**

- production: enabled when a DSN exists
- local development: disabled unless explicitly opted in
- automated tests: always disabled
- preview/staging: disabled until explicitly designed

### 4. Meaning of disabled tests

**Question**

What does it mean for tests to have Sentry disabled?

**Answer**

Tests still verify the telemetry abstraction through `NoOpTelemetry` or fake
telemetry, but deliberate test failures never send real events, consume quota,
or generate notifications.

**Decision**

No automated test may initialize or communicate with the real Sentry project.

### 5. Local opt-in

**Question**

Should local Sentry testing be possible?

**Answer**

Yes. Add an environment variable that activates localhost only when it
explicitly says so. Missing or ambiguous values must leave it disabled.

**Decision**

`OBSERVABILITY_ENABLE_LOCAL=true` is the only value that enables local
telemetry. Values such as `1`, `yes`, or `TRUE` do not enable it.

### 6. Error capture scope

**Question**

Should only unexpected `500` errors create Sentry issues?

**Answer**

No. Capture everything initially. Filtering can be refined later.

**Decision**

Every exception reaching the configured API error handler is captured,
including `HttpError`, `DomainError`, and unexpected errors.

### 7. Failed HTTP responses without exceptions

**Question**

Should failed HTTP responses that do not throw, such as authentication and
validation responses, create Sentry issues?

**Answer**

No.

**Decision**

Non-throwing `4xx` or `5xx` responses may appear as failed HTTP spans through
framework instrumentation, but the application does not explicitly create an
issue for them.

### 8. Privacy and payload filtering

**Question**

Should the application exclude use-case arguments, request bodies, and AI
content?

**Answer**

Do not add custom filtering initially, but keep the risk in mind.

**Follow-up question**

Should the application use Sentry's default configuration or explicitly attach
complete use-case arguments to spans?

**Answer**

Use the default configuration.

**Decision**

- preserve Sentry's default privacy and scrubbing behavior
- do not add custom application-side filtering initially
- do not disable Sentry's default protections
- do not explicitly attach complete use-case arguments to spans
- do not enable Session Replay
- do not explicitly enable `sendDefaultPii`

This decision must be revisited before intentionally attaching free-form user
content, CV text, prompts, AI responses, credentials, or request bodies.

### 9. Browser monitoring

**Question**

Should automatic browser errors and navigation tracing be included?

**Answer**

Yes.

**Decision**

Enable automatic browser error capture and router navigation tracing. Do not
add Session Replay or manual component/hook instrumentation initially.

### 10. Provider abstraction

**Question**

Should Fabra use a small custom telemetry port or depend directly on
OpenTelemetry?

**Answer**

Use a small custom telemetry port.

**Decision**

Application-facing code depends on a minimal `Telemetry` port. The first
adapters are `SentryTelemetry` and `NoOpTelemetry`.

### 11. Use-case instrumentation

**Question**

Should each use case be decorated explicitly, or should module composition
roots instrument all exported use cases?

**Answer**

Instrument each module explicitly from its composition root.

**Decision**

Each module composition root calls one shared `instrumentUseCases(...)`
function. Individual use cases do not import or invoke telemetry.

### 12. Meaning of automatic instrumentation

**Question**

Why does Sentry automatic instrumentation cover external repository/service
operations but not custom use cases?

**Answer**

Sentry recognizes supported framework and library operations, such as Next.js
requests and `fetch`, but does not understand Fabra's semantic class boundaries.

**Decision**

The initial trace hierarchy is:

```text
Next.js API route                         automatic
└── Fabra use case                        custom decorator
    ├── Fabra query bus dispatch          custom shared instrumentation
    │   └── Fabra use case                custom decorator
    └── supported fetch/external call     automatic when supported
```

Repository and service class boundaries are not custom-instrumented initially.
Their supported external calls may still appear automatically.

### 13. Initial semantic span scope

**Question**

Should repositories and services also receive custom semantic spans?

**Answer**

No, not initially.

**Decision**

Create custom spans only for use cases and query bus dispatches. Add repository
or service spans later only when a demonstrated visibility gap justifies them.

### 14. Query bus

**Question**

Should the query bus receive a semantic span?

**Answer**

Yes.

**Decision**

Every `QueryBus.execute()` creates a `query_bus.execute` span named with the
query's stable `queryName`.

### 15. API exception capture point

**Question**

Should `handleApiError()` be the only explicit API exception capture point?

**Answer**

Yes.

**Decision**

Use-case and query-bus spans mark errors and rethrow them. They do not call
`captureException`. The configured API error handler captures the exception
once.

### 16. Configured API error handler

**Question**

How should `handleApiError()` receive telemetry without passing it from every
route or using a generic service locator?

**Answer**

Use a factory plus an HTTP composition root.

**Decision**

`createApiErrorHandler(telemetry)` lives in shared HTTP infrastructure. A
configured `handleApiError` lives under `src/app/api/_shared/`, and routes
import that configured function.

### 17. Framework-specific dependencies

**Question**

May Next.js framework integration files depend directly on Sentry?

**Answer**

Yes.

**Decision**

Framework adapter files such as `instrumentation.ts`,
`instrumentation-client.ts`, Sentry runtime configs, `global-error.tsx`, and
`next.config.ts` may import Sentry directly. Application code may not.

### 18. User context

**Question**

Should authenticated API requests be associated with a user automatically?

**Answer**

Yes.

**Decision**

`getAuthenticatedRequestContext()` associates only `user.id` with telemetry.
It does not attach email or the complete Supabase user object.

### 19. Cross-system request correlation

**Question**

Should Fabra introduce `AsyncLocalStorage` so Sentry traces and existing
`processing_events` share a request ID?

**Answer**

No. Use the Sentry trace ID initially and keep `processing_events` independent.

**Decision**

Do not introduce request context storage or change `EventTracker` for this
implementation. Revisit only after a real cross-system correlation need
appears.

### 20. Read-only use cases

**Question**

Should all use cases be instrumented, including simple reads?

**Answer**

Yes.

**Decision**

Instrument every use case exported by a module composition root.

### 21. Telemetry failures

**Question**

May a Sentry failure, delay, or rejected event affect a request?

**Answer**

Never.

**Decision**

Telemetry is always best effort. Provider failures must not alter return
values, thrown business errors, status codes, or execution count.

### 22. Releases and source maps

**Question**

Should deployments be associated with releases and upload source maps?

**Answer**

Yes.

**Decision**

Production builds use Sentry's Next.js build integration for releases and
source-map upload. Build integration failures should be logged and should not
fail the application build initially.

### 23. Environment variables

**Question**

Which environment variables should configure the integration?

**Answer**

Use `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`,
`SENTRY_TRACES_SAMPLE_RATE=1`, and an explicit local opt-in variable.

**Decision**

Use:

```text
SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
SENTRY_TRACES_SAMPLE_RATE
OBSERVABILITY_ENABLE_LOCAL
```

Do not require a separately managed `NEXT_PUBLIC_SENTRY_DSN`. The build must
inject the non-secret DSN into the client bundle in a controlled way.

### 24. Alerts

**Question**

Should every captured exception notify the developer?

**Answer**

No. Capture all exceptions, but alert only for new/regressed issues, `500`
responses, and abnormal error increases.

**Decision**

Collection policy and notification policy are separate. Initial notification
rules are intentionally narrower than collection.

### 25. Tests

**Question**

Should tests use mocks/no-op telemetry and avoid the real Sentry SDK?

**Answer**

Yes.

**Decision**

Automated tests never emit real Sentry data. Test the port, decorators, handler,
failure isolation, and execution semantics with fake telemetry. Perform one
manual local opt-in verification.

## Architectural principles

### Dependency direction

The dependency direction is:

```text
application use cases
    no telemetry dependency

shared application telemetry port
    no provider dependency

shared infrastructure decorators and HTTP handler factory
    depend on the Telemetry port

SentryTelemetry adapter
    depends on Telemetry port and @sentry/nextjs

composition roots
    select and inject SentryTelemetry or NoOpTelemetry

Next.js framework adapters
    may depend directly on @sentry/nextjs
```

No domain entity, value object, domain service, repository port, application
use case, or feature module internal may import `@sentry/nextjs`.

### Technical telemetry versus business observability

Keep the two systems separate:

| Concern | Owner |
| --- | --- |
| Exception stack traces | Sentry technical telemetry |
| Request and use-case duration | Sentry technical telemetry |
| Execution hierarchy | Sentry technical telemetry |
| Browser errors and navigation | Sentry technical telemetry |
| Explicit product action occurred | Existing `EventTracker` |
| Workflow status and business metadata | Existing `processing_events` |
| Admin-facing processing event history | Existing Supabase observability |

Do not migrate `EventTracker` to Sentry as part of this work.

### Best-effort invariant

The most important invariant is:

> Removing, disabling, timing out, or breaking the telemetry provider must not
> change application behavior.

In particular:

- an operation callback is executed exactly once
- a successful operation remains successful if telemetry fails
- a failed operation throws the original failure if telemetry fails
- telemetry never changes HTTP status mapping
- tests never require network access to Sentry

## Target trace model

### Example

```text
POST /api/cvs/[id]/save-as-cv
└── use_case cv-library.saveAsCV
    ├── query_bus.execute GetCVAnalysisByIdQuery
    │   └── use_case cv-analysis.getCVAnalysisById
    │       └── http.client POST <supabase-host>/rest/v1/...
    └── http.client POST <supabase-host>/rest/v1/...
```

### Stable span naming

Do not use `constructor.name` as the primary use-case name. Constructor names can
change during minification and refactoring.

Use the stable key exposed by the module composition root:

```text
use_case <module-name>.<use-case-key>
```

Examples:

```text
use_case analysis-chat.sendMessage
use_case cv-library.prepareCVAnalysisInput
use_case work-journal.createEntry
```

Query spans use the existing stable `query.queryName`:

```text
query_bus.execute GetCVAnalysisByIdQuery
```

### Span operations and attributes

Initial custom operations:

| Boundary | Span `op` |
| --- | --- |
| Use case | `use_case.execute` |
| Query bus | `query_bus.execute` |

Initial custom span attributes:

```text
fabra.layer
fabra.module
fabra.use_case
fabra.query
```

Do not attach use-case arguments or results automatically.

## Telemetry port

### Location

```text
src/modules/shared/application/telemetry/telemetry.ts
```

The port belongs to shared application concerns because it expresses an
application-facing technical capability without naming a provider.

### Proposed contract

```ts
export type TelemetryAttribute = string | number | boolean;

export interface TelemetrySpanOptions {
  name: string;
  operation: string;
  attributes?: Record<string, TelemetryAttribute>;
}

export interface TelemetryCaptureOptions {
  attributes?: Record<string, TelemetryAttribute>;
}

export interface TelemetryUser {
  id: string;
}

export interface Telemetry {
  trace<T>(
    options: TelemetrySpanOptions,
    operation: () => Promise<T>,
  ): Promise<T>;

  captureException(
    error: unknown,
    options?: TelemetryCaptureOptions,
  ): void;

  setUser(user: TelemetryUser | null): void;
}
```

The initial port intentionally excludes:

- provider-specific scope objects
- raw Sentry spans
- breadcrumbs
- Session Replay
- logs
- metrics
- attachments
- transaction IDs
- generic arbitrary contexts

Extend the port only when a real application requirement appears.

## Telemetry adapters

### Locations

```text
src/modules/shared/infrastructure/telemetry/no-op-telemetry.ts
src/modules/shared/infrastructure/telemetry/sentry-telemetry.ts
```

### `NoOpTelemetry`

`NoOpTelemetry`:

- executes `trace` callbacks exactly once
- returns or throws the callback outcome unchanged
- ignores `captureException`
- ignores `setUser`
- has no Sentry import

It is the required adapter for tests and disabled runtimes.

### `SentryTelemetry`

`SentryTelemetry` maps:

| Port operation | Sentry operation |
| --- | --- |
| `trace` | `Sentry.startSpan` |
| `captureException` | `Sentry.captureException` |
| `setUser` | `Sentry.setUser` |

`trace` marks the span as failed when the business callback throws, then
rethrows the original business error. It does not call `captureException`.

### Failure isolation and exactly-once execution

A naive best-effort adapter can accidentally execute a business callback twice:

```ts
try {
  return await provider.trace(operation);
} catch {
  return operation(); // unsafe: provider may have failed after operation ran
}
```

The implementation must track whether the business operation started and retain
its outcome. If provider instrumentation fails after the callback ran, return or
throw the stored business outcome instead of retrying the callback.

Conceptual implementation:

```ts
async trace<T>(options: TelemetrySpanOptions, operation: () => Promise<T>) {
  let started = false;
  let outcome:
    | { ok: true; value: T }
    | { ok: false; error: unknown }
    | undefined;

  const runOnce = async () => {
    if (started) return outcome;
    started = true;

    try {
      outcome = { ok: true, value: await operation() };
    } catch (error) {
      outcome = { ok: false, error };
    }

    return outcome;
  };

  try {
    await Sentry.startSpan(toSentrySpanOptions(options), async (span) => {
      const result = await runOnce();
      if (result && !result.ok) markSpanFailed(span, result.error);
    });
  } catch (telemetryError) {
    reportTelemetryFailureToConsole(telemetryError);
    await runOnce();
  }

  if (!outcome) {
    throw new Error("Telemetry failed to execute the wrapped operation.");
  }
  if (!outcome.ok) throw outcome.error;
  return outcome.value;
}
```

The final implementation may differ, but must preserve the invariant and tests.
The defensive final error above should be unreachable and must not replace a
known business outcome.

`captureException` and `setUser` must catch provider errors internally and log a
short console warning without sensitive payloads.

## Runtime selection

### Location

```text
src/lib/telemetry.ts
```

This is the application composition root for the provider-agnostic telemetry
instance.

### Enablement policy

```ts
export function isTechnicalObservabilityEnabled(env: NodeJS.ProcessEnv) {
  if (!env.SENTRY_DSN) return false;
  if (env.NODE_ENV === "test") return false;
  if (env.NODE_ENV === "production") return true;

  return (
    env.NODE_ENV === "development" &&
    env.OBSERVABILITY_ENABLE_LOCAL === "true"
  );
}
```

Tests must also explicitly guard known test-runner indicators if the repository
test environment does not set `NODE_ENV=test` consistently. The implementation
must verify Vitest and backend-test behavior before relying only on
`NODE_ENV`.

### Environment variables

| Variable | Runtime | Purpose |
| --- | --- | --- |
| `SENTRY_DSN` | build/server/client-injected | Sentry project destination |
| `SENTRY_AUTH_TOKEN` | build only | Release and source-map upload |
| `SENTRY_ORG` | build only | Sentry organization slug |
| `SENTRY_PROJECT` | build only | Sentry project slug |
| `SENTRY_TRACES_SAMPLE_RATE` | build/runtime | Trace sampling, initially `1` |
| `OBSERVABILITY_ENABLE_LOCAL` | local build/runtime | Explicit local opt-in |

`SENTRY_AUTH_TOKEN` is secret. It must never be exposed to client code, checked
into git, or retained in runtime responses.

The DSN is not a secret, but `SENTRY_DSN` is not automatically visible in
browser code. Because this design intentionally avoids a separately managed
`NEXT_PUBLIC_SENTRY_DSN`, `next.config.ts` must inject the DSN into the client
bundle only as a build-time public value when observability is enabled. The
implementation must verify this behavior in a production build.

Recommended build-time injection:

```ts
const observabilityEnabled = isBuildObservabilityEnabled(process.env);

const nextConfig: NextConfig = {
  // Preserve all existing options.
  env: {
    FABRA_PUBLIC_OBSERVABILITY_ENABLED: String(observabilityEnabled),
    FABRA_PUBLIC_SENTRY_DSN: observabilityEnabled
      ? process.env.SENTRY_DSN ?? ""
      : "",
  },
};
```

`FABRA_PUBLIC_SENTRY_DSN` and `FABRA_PUBLIC_OBSERVABILITY_ENABLED` are generated
build constants, not separately managed deployment variables. Their names make
their public nature explicit. Client initialization reads these constants.
Server initialization reads the original server environment.

Do not silently enable telemetry merely because `SENTRY_AUTH_TOKEN`,
`SENTRY_ORG`, or `SENTRY_PROJECT` exists. Runtime event delivery requires an
enabled runtime and a DSN.

## Use-case instrumentation

### Location

```text
src/modules/shared/infrastructure/telemetry/instrument-use-cases.ts
```

### Behavior

`instrumentUseCases(moduleName, useCases, telemetry)` returns an object with the
same public shape. Every property exposing an async `execute(...)` method is
wrapped in a telemetry span.

Requirements:

- preserve all non-`execute` properties and methods
- preserve the original `execute` arguments, result, and thrown error
- preserve `this` binding
- execute the original method exactly once
- do not call `captureException`
- use the composition-root property key as the stable use-case name
- do not inspect or attach arguments/results
- support use cases with zero, one, or multiple arguments
- avoid wrapping `bindRequest`

Conceptual API:

```ts
const useCases = instrumentUseCases(
  "analysis-chat",
  createUseCases(queryBus, contextReader),
  telemetry,
);

return {
  ...useCases,
  bindRequest(client: SupabaseClient) {
    // existing binding
    return this;
  },
};
```

### Composition-root changes

Every migrated module composition root receives `Telemetry` explicitly:

```ts
export function createAnalysisChatModule(
  queryBus: QueryBus,
  telemetry: Telemetry,
): AnalysisChatModule
```

Modules without a query bus receive only telemetry:

```ts
export function createWorkJournalModule(
  telemetry: Telemetry,
): WorkJournalModule
```

`src/lib/container.ts` passes the single configured telemetry instance into all
modules.

Tests that construct modules directly pass `NoOpTelemetry` or a fake telemetry
instance.

### Expected affected composition roots

At design time, the primary composition roots include:

```text
src/modules/activity-context/activity-contexts.module.ts
src/modules/admin/admin.module.ts
src/modules/admin-users/admin-users.module.ts
src/modules/analysis-chat/analysis-chat.module.ts
src/modules/commitments/commitments.module.ts
src/modules/cv-analysis/cv-analysis.module.ts
src/modules/cv-library/cv-library.module.ts
src/modules/feedback-notes/feedback-notes.module.ts
src/modules/job-match-analysis/job-match-analysis.module.ts
src/modules/received-feedback/received-feedback.module.ts
src/modules/selection-process/selection-process.module.ts
src/modules/work-journal/work-journal.module.ts
```

Re-scan the repository during implementation. Do not treat this list as an
allowlist.

## Query bus instrumentation

### Location

```text
src/modules/shared/application/query-bus/in-memory-query-bus.ts
```

### Design

`InMemoryQueryBus` receives the `Telemetry` port through constructor injection:

```ts
const queryBus = new InMemoryQueryBus({ telemetry });
```

`execute(query)` wraps handler dispatch with:

```text
name: query_bus.execute <query.queryName>
operation: query_bus.execute
attributes:
  fabra.layer: application
  fabra.query: <query.queryName>
```

The query bus does not capture exceptions. It marks the span failed through
`Telemetry.trace` and preserves the original error.

## API error handling

### Current state

Most API routes already converge on:

```ts
return handleApiError(error);
```

At design time, 65 of 68 API route files imported or called `handleApiError`.
Re-scan during implementation.

### Factory

Create:

```text
src/modules/shared/infrastructure/http/create-api-error-handler.ts
```

Conceptual API:

```ts
export function createApiErrorHandler(telemetry: Telemetry) {
  return function handleApiError(error: unknown) {
    telemetry.captureException(error, {
      attributes: {
        "fabra.layer": "http",
        "fabra.error_type": getErrorType(error),
        "http.status_code": getMappedStatus(error),
      },
    });

    return mapApiErrorToResponse(error);
  };
}
```

The existing status mapping remains unchanged:

- `HttpError`: its explicit status and message
- `DomainError` ending in `NotFoundError`: `404`
- other `DomainError`: `400`
- unknown error: `500` and generic client message

Unexpected errors continue to be logged to the console.

### Configured HTTP composition

Create:

```text
src/app/api/_shared/api-error-handler.ts
```

```ts
import { telemetry } from "@/lib/telemetry";
import { createApiErrorHandler } from "@/modules/shared";

export const handleApiError = createApiErrorHandler(telemetry);
```

Routes import:

```ts
import { handleApiError } from "@/app/api/_shared/api-error-handler";
```

Routes continue importing `ok`, `created`, `errorResponse`, `notFound`,
`badRequest`, `forbidden`, and `conflict` from `@/modules/shared`.

Remove the already-configured `handleApiError` export from
`@/modules/shared`. Shared infrastructure exports the factory, not an instance
with a hidden provider selection.

### Duplicate capture policy

The API error handler is the only explicit capture point for API exceptions.

- `Telemetry.trace`: mark span failed and rethrow
- use-case decorator: no capture
- query bus: no capture
- `createApiErrorHandler`: capture once
- Next.js automatic hooks: retain framework defaults

During manual verification, confirm that explicit API captures do not produce
duplicate Sentry issues through `onRequestError`. If the SDK also captures
handled route exceptions, add a provider-adapter deduplication rule without
leaking provider behavior into application code.

## Authenticated user context

### Location

```text
src/app/api/_shared/auth/request-context.ts
```

After successful authentication:

```ts
telemetry.setUser({ id: user.id });
```

For an unauthenticated request:

```ts
telemetry.setUser(null);
```

Requirements:

- attach only the stable user ID
- do not attach email or the complete Supabase user
- telemetry failure must not change authentication behavior
- retain the current discriminated-union response contract
- do not create an exception for the direct unauthenticated `401` response

This HTTP helper may depend on the configured provider-agnostic telemetry
instance because it is part of the HTTP composition layer. It must not import
Sentry.

## Next.js and Sentry framework integration

Framework integration files are provider-specific adapters and may import
`@sentry/nextjs` directly.

### Dependency

Add:

```text
@sentry/nextjs
```

Pin through the repository's normal npm lockfile workflow. Verify compatibility
with the installed Next.js version before merging.

### Files

Create:

```text
src/instrumentation.ts
src/instrumentation-client.ts
src/sentry.server.config.ts
src/sentry.edge.config.ts
src/app/global-error.tsx
```

Modify:

```text
next.config.ts
```

### `src/instrumentation.ts`

Responsibilities:

- dynamically import server config for `NEXT_RUNTIME=nodejs`
- dynamically import edge config for `NEXT_RUNTIME=edge`
- export Sentry's `captureRequestError` as `onRequestError`

This covers unhandled errors from framework surfaces such as Server Components
and middleware/proxy execution.

### Runtime Sentry configs

All Sentry runtime configs use the same enablement policy and sample rate.

Initial options:

```text
dsn: configured DSN when enabled
enabled: true only when enabled by policy
tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE, default 1.0 when enabled
environment: production or local
sendDefaultPii: leave unset
enableLogs: false
Session Replay: not configured
```

Do not initialize the SDK at all when disabled if the SDK permits conditional
registration cleanly. Merely setting `enabled: false` may retain instrumentation
overhead.

### Client navigation tracing

`src/instrumentation-client.ts` exports:

```ts
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

Only export/use it when compatible with conditional initialization. Verify local
disabled behavior and production navigation traces.

### `src/app/global-error.tsx`

Capture otherwise unhandled App Router render errors using Sentry directly,
following the official Next.js integration pattern.

This file is intentionally provider-specific because it is a framework adapter.
Do not add Session Replay.

### `next.config.ts`

Wrap the existing config with `withSentryConfig`.

Required behavior:

- preserve all existing Next.js options
- configure `org`, `project`, and `authToken` from environment variables
- upload source maps for production builds
- associate builds with releases using Sentry defaults unless a stable release
  name is already available from deployment infrastructure
- keep build output quiet outside CI
- use an `errorHandler` that logs source-map/release upload failure without
  failing the build
- do not configure a Sentry tunnel initially
- do not enable Session Replay or Sentry Logs
- inject the non-secret DSN into client code without exposing
  `SENTRY_AUTH_TOKEN`

Do not enable `widenClientFileUpload` initially. It increases build time and can
be enabled later if stack traces demonstrate missing client frames.

### Source maps

Source maps are uploaded only for production builds with the required build
credentials. The auth token must remain in the build environment only.

Verify that client source maps are not publicly exposed after upload and that a
production error resolves to TypeScript source lines.

## Privacy policy

Initial policy:

- rely on Sentry's default SDK and server-side scrubbing
- do not implement custom `beforeSend`, `beforeSendSpan`, or custom scrubbing
  initially
- do not attach complete use-case inputs or outputs
- do not enable `sendDefaultPii`
- do not enable Session Replay
- associate authenticated requests only with `user.id`

This is not a statement that all application data is safe to send. Before
adding request bodies, prompts, CV content, AI output, authentication headers,
or arbitrary metadata, revise this document and add explicit filtering.

## Alerts

Collection:

- capture all exceptions that reach the configured API error handler
- retain automatic unhandled frontend and framework error capture

Notifications:

- notify on new issues
- notify on regressions
- notify on errors mapped to HTTP `500`
- notify on abnormal error increases when the selected Sentry plan supports the
  desired alert
- do not notify merely because a known `4xx` exception occurred

Alert rules are configured in Sentry, not in application code. Document the
actual configured rules after project setup.

## Testing strategy

### Unit tests for `NoOpTelemetry`

Verify:

- returns successful values unchanged
- rethrows the original error object
- executes callbacks exactly once
- ignores capture and user context

### Unit tests for `SentryTelemetry`

Mock the Sentry SDK module. Do not send network events.

Verify:

- maps trace options correctly
- maps exception capture correctly
- maps user ID and clearing user correctly
- marks failed spans
- never captures exceptions from `trace`
- returns successful business outcomes
- rethrows original business errors
- provider failure before callback executes falls back and runs callback once
- provider failure after callback executes does not rerun callback
- provider failure after business failure preserves the original business error
- `captureException` provider failure is swallowed
- `setUser` provider failure is swallowed

### Unit tests for use-case instrumentation

Verify:

- wraps every executable property
- leaves non-executable properties unchanged
- uses stable module and property-key naming
- preserves arguments and results
- preserves `this`
- preserves thrown error identity
- does not capture exceptions
- executes once when telemetry fails

### Query bus tests

Extend the colocated query-bus tests to verify:

- registered queries create a trace
- the query name is attached
- successful and failed handler outcomes are preserved
- unregistered query errors are traced and preserved
- query bus does not capture exceptions

### API error handler tests

Add colocated tests for `createApiErrorHandler`.

Verify:

- every thrown error category is captured exactly once
- `HttpError` status/message mapping is unchanged
- `DomainError` status/message mapping is unchanged
- unexpected error returns generic `500`
- unknown errors are accepted
- telemetry capture failure does not change the response

### Runtime policy tests

Verify the enablement matrix:

| `NODE_ENV` | DSN | Local flag | Expected |
| --- | --- | --- | --- |
| production | present | absent | enabled |
| production | absent | any | disabled |
| development | present | `true` | enabled |
| development | present | absent/other | disabled |
| development | absent | `true` | disabled |
| test | present | `true` | disabled |

### Build and repository verification

Run:

```text
npm run ddd:check
npm run test:frontend
npm run test:backend
npm run build
```

The implementation must also verify that no feature module or use case imports
`@sentry/nextjs`.

Add a repository boundary check:

```text
scripts/verify-technical-observability-boundaries.mjs
```

Wire it into `scripts/verify-ddd.mjs`. It should fail when:

- `@sentry/nextjs` is imported outside approved provider-specific
  infrastructure, framework adapter, and build configuration files
- a domain or application use-case file imports `SentryTelemetry`
- a use case calls `captureException` or creates a technical span directly
- a framework/API route imports `SentryTelemetry` instead of the configured
  composition
- a test initializes the real Sentry adapter without an explicit boundary-test
  exemption

The check should use a small explicit allowlist of provider adapter files,
because the purpose is to keep provider-specific change surface deliberately
bounded.

### Manual local verification

With:

```text
OBSERVABILITY_ENABLE_LOCAL=true
SENTRY_DSN=<dsn>
SENTRY_TRACES_SAMPLE_RATE=1
```

Verify:

1. A successful API request produces an HTTP trace with use-case spans.
2. A cross-module query produces a query-bus child span.
3. A thrown `DomainError` creates one issue and failed spans.
4. An unexpected error creates one issue and maps to HTTP `500`.
5. An unauthenticated direct `401` does not create an explicit issue.
6. A browser render error is captured.
7. A navigation trace is visible.
8. The event is associated only with `user.id`.
9. Disabling/removing the local flag stops event delivery.
10. A simulated adapter failure does not change application behavior.

### Production verification

After deployment:

1. Confirm environment is marked as production.
2. Confirm trace sample rate is `1.0`.
3. Confirm source-mapped TypeScript stack frames.
4. Confirm release association.
5. Confirm alert rules.
6. Confirm no local/test events appear.
7. Review quota usage after the first week.

## Implementation plan

Each phase should be a separate commit. Do not combine broad module
instrumentation with unrelated feature work.

### Phase 1: Provider-agnostic telemetry core

Create:

```text
src/modules/shared/application/telemetry/telemetry.ts
src/modules/shared/infrastructure/telemetry/no-op-telemetry.ts
src/modules/shared/infrastructure/telemetry/sentry-telemetry.ts
src/modules/shared/infrastructure/telemetry/instrument-use-cases.ts
scripts/verify-technical-observability-boundaries.mjs
```

Add all colocated tests.

Export only the contracts and helpers needed by composition roots through
`@/modules/shared`. Do not expose raw Sentry types.

Wire the boundary verifier into `scripts/verify-ddd.mjs`.

Acceptance:

- all adapter and decorator tests pass
- exactly-once behavior is demonstrated
- no application use case imports telemetry or Sentry

### Phase 2: Runtime composition and query bus

Create:

```text
src/lib/telemetry.ts
```

Modify:

```text
src/modules/shared/application/query-bus/in-memory-query-bus.ts
src/lib/container.ts
```

Inject telemetry into the query bus and all module factories. Instrument all
use cases from their module composition roots.

Acceptance:

- every composed use case receives a semantic span
- query bus spans nest beneath calling use cases
- local/test default is no-op
- `npm run ddd:check` passes

### Phase 3: Configured API error boundary and user context

Create:

```text
src/modules/shared/infrastructure/http/create-api-error-handler.ts
src/app/api/_shared/api-error-handler.ts
```

Modify:

```text
src/modules/shared/infrastructure/http/api-errors.ts
src/modules/shared/index.ts
src/app/api/_shared/auth/request-context.ts
src/app/api/**/route.ts
```

Change route imports, not catch-body behavior.

Acceptance:

- every API exception reaching `handleApiError` is captured once
- status mappings remain unchanged
- authenticated requests attach only user ID
- direct validation/auth responses do not explicitly capture issues

### Phase 4: Sentry Next.js integration

Install `@sentry/nextjs`.

Create:

```text
src/instrumentation.ts
src/instrumentation-client.ts
src/sentry.server.config.ts
src/sentry.edge.config.ts
src/app/global-error.tsx
```

Modify:

```text
next.config.ts
```

Acceptance:

- browser, server, and edge initialization obey runtime policy
- source-map upload is configured
- build failure isolation is configured
- no Session Replay, Sentry Logs, or tunnel is enabled
- local is opt-in only
- tests cannot emit Sentry events

### Phase 5: Verification and operational setup

- perform manual local verification
- perform a production build
- configure Sentry alert rules
- deploy production
- verify release, source maps, issue capture, and trace hierarchy
- record actual Sentry project setup and alert rules in this document
- review quotas after one week and decide whether sampling remains `1.0`

## Migration and provider replacement

Changing from Sentry to another provider should primarily affect:

```text
src/modules/shared/infrastructure/telemetry/sentry-telemetry.ts
src/lib/telemetry.ts
src/instrumentation.ts
src/instrumentation-client.ts
src/sentry.server.config.ts
src/sentry.edge.config.ts
src/app/global-error.tsx
next.config.ts
package.json
```

The following should not change:

- domain entities and value objects
- use-case implementation files
- repository ports
- feature module internals
- API route catch bodies
- query contracts
- `EventTracker` business events

Some framework integration replacement is unavoidable because automatic
instrumentation, source-map upload, browser hooks, and framework error hooks are
provider-specific.

## Non-goals

The initial implementation does not:

- replace `EventTracker` or `processing_events`
- correlate Sentry trace IDs with processing-event request IDs
- introduce `AsyncLocalStorage`
- instrument repositories or services as semantic spans
- add OpenTelemetry
- add Session Replay
- add Sentry Logs
- add profiling
- add metrics
- add uptime or cron monitoring
- add a Sentry tunnel
- attach complete use-case inputs or outputs
- implement custom privacy filtering
- add preview or staging environment behavior

## Open operational follow-ups

These do not block implementation:

- record the created Sentry organization and project slugs
- record the final alert rules after configuring them in Sentry
- verify the actual Developer-plan quotas at rollout time
- inspect production quota consumption after one week
- decide later whether selected slow repositories/services need semantic spans
- decide later whether `processing_events` and Sentry need shared correlation
- revisit payload privacy before adding richer context

## Official references

- Sentry Next.js manual setup:
  <https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/>
- Sentry Next.js source maps:
  <https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/>
- Sentry JavaScript configuration options:
  <https://docs.sentry.io/platforms/javascript/configuration/options/>
- Sentry Next.js collected data:
  <https://docs.sentry.io/platforms/javascript/guides/nextjs/data-management/data-collected/>
- Sentry pricing:
  <https://sentry.io/pricing/>
