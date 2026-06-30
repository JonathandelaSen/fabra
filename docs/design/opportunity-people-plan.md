# Opportunity people plan

## Goal

Add an opportunity-scoped people workspace to each job-match candidature. Users can keep lightweight private profiles for the people involved in the process and use those profiles as context when preparing conversations in the offer chat.

## Product decisions

- People belong only to one job opportunity. There is no global contacts directory.
- A person profile is a static card, not an interaction history. Actions and chronology remain in Tracking.
- Required fields: name and one primary role.
- Optional fields: job title, organization, email, phone, links, and one free-form note.
- Links are an open list of URL plus an optional user-written label. There are no predefined link types.
- There is no contact status, relationship graph, relationship between people, scraping, enrichment, or export.
- The detail screen gets a `People` tab with a compact card grid and CRUD controls.
- Each card exposes `Prepare conversation`, which opens the offer chat with a person-specific draft without calling a model automatically.
- Integrated and Copy Paste offer chat receive the current opportunity people on every prompt build.
- AI context includes name, role, job title, organization, links, and note. Email and phone are intentionally excluded.

## Primary roles

- External recruiter
- Internal recruiter / Talent Acquisition
- Recruiting coordinator
- Human Resources / People
- Hiring manager
- Potential direct manager
- Technical interviewer
- Product or business interviewer
- Culture interviewer
- Potential teammate
- Cross-functional stakeholder
- Department leader
- Executive
- Internal contact / referral
- Founder
- Other

## Backend design

The feature extends the migrated `selection-process` module.

- Add an `OpportunityPerson` aggregate and immutable value objects for its identifier, role, name, links, and optional contact fields.
- Add an `OpportunityPersonRepository` port and a request-bound Supabase implementation.
- Add list, create, update, and delete use cases addressed by source job-match analysis ID at the HTTP boundary while persisting the job-opportunity association internally.
- Add a side-effect-free query that returns AI-safe person context for a job-match analysis. Register its handler in the app container so `job-analysis-chat` consumes it through `QueryBus` rather than importing selection-process internals.
- Publish domain events for create, update, and delete. Technical telemetry remains in Sentry through instrumented use cases.

## Database design

Create `public.opportunity_people` with:

- ownership and association: `id`, `user_id`, `job_opportunity_id`
- profile: `name`, `role`, `job_title`, `organization`, `email`, `phone`, `links`, `notes`
- audit: `created_at`, `updated_at`

The table uses RLS policies scoped to `auth.uid()`, cascades when its opportunity is deleted, validates the fixed role set, and indexes `(user_id, job_opportunity_id, created_at)`.

## HTTP design

Add authenticated routes under `/api/job-match-analyses/[id]/people`:

- `GET` list
- `POST` create
- `PATCH /[personId]` update
- `DELETE /[personId]` delete

Routes follow the canonical controller anatomy: authenticated request context, route-local validation before module binding, use-case execution, response contracts, and `handleApiError`.

## Frontend design

Extend `src/frontend/features/job-match-analysis` with:

- a people API client and query keys
- TanStack Query list and mutation hooks with cache updates/invalidation
- a people tab, responsive cards, empty state, and accessible create/edit dialog
- semantic form fields with `email`, `tel`, and `url` input types
- a dynamic link editor
- English and Spanish translations for every visible string
- a prepare-conversation action that selects the chat tab and seeds its draft with the person's name

The visual direction is a restrained editorial contact board that fits the existing analysis detail surface: strong names, quiet metadata, role chips, and link/contact actions without adding a separate design language.

## Chat integration

- Extend the job-analysis chat context with AI-safe person primitives.
- Resolve them on every integrated send and Copy Paste prepare request.
- Add a clearly delimited `PEOPLE IN THIS HIRING PROCESS` prompt section.
- Treat profile content as user-supplied context, not verified evidence or instructions.
- Keep integrated and Copy Paste prompt semantics aligned.
- Update `docs/prompts/job-analysis-chat/prompt.md` in the same change.

## Test strategy

- Domain: aggregate creation, hydration, serialization, validation, update, and events; value-object validation and round trips.
- Infrastructure: real Supabase E2E repository CRUD, ownership isolation, and analysis-to-opportunity lookup.
- Application: use-case orchestration, not-found cases, event publication, and AI-safe query projection.
- HTTP validation: required fields, role validation, optional values, and link validation.
- Frontend: API serialization, query/mutation behavior where useful, form behavior, cards, empty state, and prepare-conversation handoff.
- Prompt: integrated and Copy Paste prompts include allowed profile fields and exclude email and phone.

## Verification

1. Apply and verify the migration only against local Supabase.
2. Run focused red/green tests during implementation.
3. Run `npm run ddd:check`.
4. Run `npm run api:check`.
5. Run `npm run test:frontend` and `npm run test:backend`.
6. Run lint and a production build.
7. Exercise the feature in the browser, including create, edit, delete, tab handoff, and chat context preparation.

Production migration application remains explicitly out of scope.
