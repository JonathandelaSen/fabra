# Public CV: owner notes + visitor feedback channel

**Status:** Design agreed with the user on 2026-06-11. Not implemented. This document is self-contained: it assumes no prior conversation context.

## What exists today (verified in code)

- A CV can be published publicly. The public page lives at `src/app/cv/[publicId]/[slug]/page.tsx`, rendered from route `/cv/{publicId}/{slug}`. Access is anonymous (no auth).
- Publishing is controlled by columns on `public.cvs`: `public_enabled`, `public_id` (8-char random, unguessable), `public_slug`. See migration `supabase/migrations/20260509110000_add_public_cv_pages.sql`.
- Domain logic for public CVs: `src/modules/cv-library/domain/services/public-cv.ts`, use cases `get-published-cv-document.use-case.ts` and `update-cv-document-public-settings.use-case.ts` in `src/modules/cv-library/application/use-cases/`.
- The CV content schema is `StandardCVProfile` (`cv-profile.v1`) in `src/modules/cv-library/domain/cv-profile.ts`. **It has no stable IDs**: experiences/education/named items are positional array entries and bullets are plain strings.
- There is an existing `received-feedback` module (`src/modules/received-feedback/`) where the user triages feedback received from other people.

## Product decision summary

The user wants the public CV to serve two audiences with **one single public link** (explicitly decided, no separate "review link"):

1. Recruiters / hiring managers — the CV as a candidacy landing page.
2. Colleagues / mentors — people the owner asks for opinions.

Two features, one release:

### Feature 1 — Public notes written by the CV owner

Notes the owner writes that are **visible to every visitor** of the public CV:

- **Presentation note:** one free-text block rendered above the CV ("Looking for an X role, available from Y").
- **Anchored notes:** notes attached to a section, to a specific item (e.g. one experience entry), or to a single bullet point. Example the user gave: a note on one bullet of their Edpuzzle experience.
- Rendered visually distinct from CV content: the notes are the owner's voice commenting on the document, not part of the document.
- Edited from the in-app CV screen, never from the public view.
- Stored in their own table (suggested name `cv_public_notes`), **not inside the profile JSON**. Rationale: the profile describes the CV; notes comment on it.

### Feature 2 — Visitor feedback (private to the owner)

- Per-CV toggle, **off by default**. The owner decides per published CV whether to accept feedback.
- Public form on the CV page: feedback text + **optional** name/context fields (identity is invited, never required — decided explicitly over anonymous-only and over mandatory identification).
- Feedback is private: visitors never see other visitors' feedback, nor any count of existing feedback.
- The submit endpoint is public (no auth) → must have IP rate-limiting + a honeypot field. No captcha in v1.
- Submitted feedback lands in the existing `received-feedback` module as a new source ("received via public CV"), referencing the originating CV, and is triaged in the existing flow.

### Prerequisite — Stable IDs in the CV profile schema

Anchored notes need stable anchors. Decided approach (explicitly chosen over positional anchors and content-hash anchors, both of which silently mis-attach notes when the CV is edited):

- Additive change to `StandardCVProfile`: experiences, education entries, named items, and bullets get a generated short `id` field, created in the normalizer (`normalizeStandardCVProfile`).
- `cv-profile.v1` stays valid; existing CVs acquire IDs on next save; nothing breaks if IDs are missing.
- Notes reference these IDs and therefore survive reordering and text edits.
- This is the foundation and should be the first implementation step / PR.

## Explicitly out of scope (decided, do not add)

- **Public conversations or visible third-party comments on a CV.** Rejected for moderation cost and reputational risk (a stranger's comment visible while a recruiter reads the CV).
- **Visitor feedback anchored to sections/items.** Stable IDs make it possible later; v1 is one general comment per submission.
- **Separate "review mode" links** (a clean candidacy URL plus a revocable review URL for mentors). Considered and consciously deferred; revisit only if the single link proves insufficient.

## Known implementation questions (resolve during planning, not silently)

- `ReceivedFeedback` entity currently requires `activityContextId` and has `giverName` as required (`src/modules/received-feedback/domain/entities/received-feedback.entity.ts`). Ingesting anonymous public-CV feedback needs a deliberate decision: a `source` field, an optional/default activity context, and how an empty giver name is represented. Do not bolt this on without extending the domain model properly.
- Rate limiting strategy for the public submit endpoint (no auth available; per-IP at minimum).
- Where anchored-note editing lives in the CV screen UI.

## Constraints from repo conventions (see AGENTS.md — read it first)

- Hexagonal modules under `src/modules/`, frontend features under `src/features/`. Public-note logic belongs to the `cv-library` module; feedback ingestion belongs to `received-feedback` (cross-module access via QueryBus / explicit commands, never direct repository imports).
- API routes must follow the controller anatomy in AGENTS.md (`getAuthenticatedRequestContext()`, `bindRequest`, `parse*` validation, `handleApiError`). Note: the public submit endpoint is unauthenticated — it cannot use `getAuthenticatedRequestContext()`; follow the pattern of the existing public CV page/route for anonymous Supabase access.
- New tables need RLS consistent with public read of published CVs only.
- Run `npm run agent:check` before finishing; never apply migrations to production; do not commit automatically.
