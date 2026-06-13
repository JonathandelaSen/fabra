# Review Self-Assessment

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

Generates a self-assessment document for a performance review or promotion case, grouping achievements by theme with each claim citing its curated evidence (source + date).

## Source

- Integrated prompt source file: `src/modules/performance-review/infrastructure/services/review-self-assessment-prompts.ts`
  - System prompt builder: `buildSelfAssessmentSystemPrompt`
  - User prompt builder: `buildSelfAssessmentUserPrompt`
- Copy Paste prompt builder: `src/modules/performance-review/application/services/review-self-assessment-copy-paste-prompts.ts` (`buildSelfAssessmentCopyPastePrompt`)
- AI input builder (curated evidence shape): `src/modules/performance-review/application/services/build-self-assessment-input.ts`
- AI services (controllers):
  - `src/modules/performance-review/infrastructure/services/gemini-review-self-assessment-ai.service.ts`
  - `src/modules/performance-review/infrastructure/services/openai-review-self-assessment-ai.service.ts`
  - `src/modules/performance-review/infrastructure/services/ollama-review-self-assessment-ai.service.ts`
  - `src/modules/performance-review/infrastructure/services/mock-review-self-assessment-ai.service.ts` (deterministic mock; used in dev/test)
- Provider-aware factory: `src/modules/performance-review/infrastructure/services/provider-review-self-assessment-ai-service.factory.ts`
- Use cases:
  - Integrated: `src/modules/performance-review/application/use-cases/generate-self-assessment.use-case.ts`
  - Copy Paste prepare: `src/modules/performance-review/application/use-cases/prepare-self-assessment-copy-paste.use-case.ts`
  - Copy Paste apply: `src/modules/performance-review/application/use-cases/apply-self-assessment-copy-paste.use-case.ts`
- API routes:
  - `POST src/app/api/reviews/[id]/self-assessment/generate/route.ts` (integrated)
  - `POST src/app/api/reviews/[id]/self-assessment/prepare/route.ts` (copy paste)
  - `POST src/app/api/reviews/[id]/self-assessment/apply/route.ts` (copy paste)
  - `PUT  src/app/api/reviews/[id]/self-assessment/route.ts` (manual edit/save)

## Current Prompt

System instruction:

```text
You are an assistant that helps an employed professional write a self-assessment document for an upcoming performance review or promotion case. Group achievements by theme. Every claim must cite the supporting evidence by referencing its source and date. Be concise, factual, and first-person. Do not invent achievements that are not backed by the provided evidence. Give highlighted evidence greater prominence in the document while still using the rest of the curated evidence where relevant.
```

User message (built by `buildSelfAssessmentUserPrompt`):

```text
Title: {title}
Type: {performance review | promotion case}
Review period: {periodStart} to {periodEnd}

Curated evidence:
1. [{source} ({date})] [HIGHLIGHTED] {content}
2. [{source} ({date})] {content}
...

Write the self-assessment as Markdown with achievements grouped by theme.
Each claim should cite its evidence (source + date) inline.
```

## How it is fed with data

`buildReviewSelfAssessmentAIInput(review, items)` maps a `PerformanceReview` aggregate plus its curated `ReviewEvidenceItem` aggregates into:

```ts
{
  title: string;
  reviewType: "performance_review" | "promotion_case";
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  evidence: Array<{
    source: "journal_entry" | "received_feedback" | "commitment" | "custom";
    date: string | null;     // snapshot date (evidence item createdAt)
    content: string;         // snapshot of the evidence text at curation time
    highlighted: boolean;
  }>;
}
```

Only curated (persisted) evidence items are included — discarded candidates are never stored, so they never reach the prompt. Highlighted evidence is marked with `[HIGHLIGHTED]` and the prompt instructs the model to give it greater prominence.

## Runtime flow

### Integrated (`generate`)

1. Route validates provider-agnostic body (`provider`, `apiKey`, `model`) and parses the provider.
2. `GenerateSelfAssessmentUseCase` loads the review + evidence, builds the AI input, and asks the provider-aware factory for a service. The factory calls `assertAIProviderAllowedForRuntime(provider)` (mock-only in tests, no mock in production) and delegates to the matching provider.
3. The service sends the system + user prompt and returns Markdown.
4. The use case attaches the result via `review.attachSelfAssessment(content, "integrated")`, moving a draft review to `prepared`.

### Copy Paste (`prepare` / `apply`)

1. `prepare` builds a single prompt embedding the curated evidence and the expected JSON envelope, returning `{ workflowId: "performance_review.self_assessment", schemaVersion: "1", prompt, expectedResponse: { kind: "json", envelope: true }, privacyNotice }`.
2. The user runs the prompt in an external chat and pastes back the JSON envelope.
3. `apply` validates the envelope with `validateCopyPasteEnvelope(...)`, reads `result.content`, and attaches it via `attachSelfAssessment(content, "copy_paste")`.

### Manual

No AI call. The structured outline is the review plus its ordered evidence read model; user-written prose is saved through `PUT .../self-assessment` (`EditSelfAssessmentUseCase`, mode `manual`). The same use case is also used to hand-edit AI output.

## Maintenance notes

- Keep prompt builders prompt-only. The integrated system/user builders live in `infrastructure/services/`; the copy-paste builder lives in `application/services/` (it cannot import infrastructure). They are intentionally duplicated rather than shared across the DDD boundary.
- The copy-paste envelope `workflowId`/`schemaVersion` constants are defined in `prepare-self-assessment-copy-paste.use-case.ts` and reused by `apply`. Update both if the envelope changes.
- When changing the curated-evidence shape, update `build-self-assessment-input.ts`, both prompt builders, the mock service output, and this document together.
- Observability: AI-backed actions are instrumented via `instrumentUseCases` (Sentry); `provider` and `model` come in on the request body for integrated runs.
