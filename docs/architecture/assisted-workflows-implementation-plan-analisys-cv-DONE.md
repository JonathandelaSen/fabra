# Assisted workflows
This implementation is already done.

## Product principle

JulyLog is AI driven, but it must not be AI restricted.

The app should help users with AI when they want it, while still remaining useful when they do not want to pay for integrated AI, cannot use a paid provider, prefer a local model, prefer an external chat product, or want to complete the work manually.

This means AI-backed product actions must be designed as assisted workflows, not as hard dependencies on a single paid model API.

## Internal vocabulary

Use this vocabulary in code, architecture docs, and agent handoffs.

### Assistance modes

`manual`

The user completes the task directly in the product UI. This is not an AI provider. It may be a direct editor, form input, textarea, existing manual screen, or another explicit non-AI path.

`copy_paste`

The app prepares a prompt, the user runs it in an external chat product such as ChatGPT or Gemini, then pastes the response back into the app. The app validates, previews, and applies the result. Copy Paste is an interaction mode, not an AI provider.

`integrated`

The app calls a model provider directly from the backend. Integrated mode uses an AI provider.

### Integrated providers

`ollama`

Local model provider. Planned provider category.

`api_key`

User-provided provider key, such as a Gemini API key. Current Gemini behavior belongs in this category even while the implementation still uses provider names such as `gemini`.

`app_subscription`

A future app-managed subscription/provider path where the user does not bring their own provider key.

`mock`

Deterministic local/dev/test provider. Automated tests must not call real providers.

## Assisted workflow contract

Every AI-backed product action should be classified as an assisted workflow, even when the first implementation only supports one mode.

Each workflow should declare:

```ts
type AssistanceMode = "manual" | "copy_paste" | "integrated";

type ManualSupport =
  | { supported: true; kind: "direct_edit" | "form_input" | "existing_screen" | "other" }
  | { supported: false; reason: string };

interface AssistedWorkflowSummary {
  id: string;
  label: string;
  manual: ManualSupport;
  copyPaste: { supported: boolean; status: WorkflowStatus; notes?: string };
  integrated: { supported: boolean; providers: string[]; notes?: string };
}

type WorkflowStatus = "existing" | "pilot" | "planned" | "not_applicable";
```

`manual` is part of the formal workflow description. When a workflow cannot support manual mode, the reason must be explicit. This keeps the product honest about the "AI driven, not AI restricted" principle.

Do not force manual mode through the same technical pipeline as Copy Paste or Integrated. Manual support may simply point to an existing editor or form.

## Copy Paste workflow

Copy Paste workflows use a three-step backend pattern:

1. `prepare`
2. `preview`
3. `apply`

Use feature-specific API routes first. Do not introduce a global `/api/assisted-workflows/:id` router until several workflows prove the abstraction.

Example pilot routes:

```txt
POST /api/cv-analyses/:id/score/copy-paste/prepare
POST /api/cv-analyses/:id/score/copy-paste/preview
POST /api/cv-analyses/:id/score/copy-paste/apply
```

### Prepare

`prepare` builds the external prompt.

Responsibilities:

- authenticate and authorize the user
- load the same source data the integrated workflow would use
- build a Copy Paste prompt with the same semantic task as the integrated prompt
- include clear output format instructions
- include non-blocking privacy warning metadata for the UI when source data may contain personal information
- record observability for prompt preparation where useful

`prepare` must not persist the AI result.

Typical response:

```ts
interface CopyPastePrepareResponse {
  workflowId: string;
  schemaVersion: string;
  prompt: string;
  expectedResponse: { kind: "plain_text" } | { kind: "json"; envelope: true };
  privacyNotice?: string;
}
```

### Preview

`preview` validates and summarizes the pasted response before mutation.

Responsibilities:

- accept the raw pasted response
- parse JSON with minimal tolerance when the workflow expects JSON
- validate `workflowId`, `schemaVersion`, and result schema
- normalize the result if needed
- return a user-readable preview
- return the parsed result so the frontend can pass it to `apply`

`preview` must not persist the final workflow result.

Typical response:

```ts
interface CopyPastePreviewResponse<TParsed, TPreview> {
  parsedResult: TParsed;
  preview: TPreview;
  warnings: string[];
}
```

If validation fails, return a controlled validation error and keep the user's pasted response intact in the UI. Offer a "copy correction instructions" action in the UI instead of attempting to repair the response with another AI call.

### Apply

`apply` persists or applies the already-previewed result.

Responsibilities:

- revalidate the parsed result received from the frontend
- authorize the user again
- call the same persistence/update use case that integrated mode uses after model output is parsed
- record observability with `assistanceMode: "copy_paste"`
- return the updated domain response

The first version should not use a preview token. The frontend sends the parsed result from `preview` back to `apply`, and the backend revalidates it.

## Copy Paste response formats

### Plain text

Use plain text when the workflow destination is plain text, such as a journal final draft, final feedback text, or an interview answer textarea.

The prompt should ask the external chat to return only the final text.

### JSON

Use JSON for structured workflows. JSON responses must use a standard envelope:

```json
{
  "workflowId": "cv_analysis.score",
  "schemaVersion": "1",
  "result": {}
}
```

`workflowId` and `schemaVersion` are mandatory and must match exactly.

The parser should accept:

- pure JSON
- a single fenced `json` Markdown block
- surrounding whitespace

The parser should reject:

- narrative explanation mixed with JSON
- multiple JSON blocks
- responses for another workflow
- heuristic extraction of the first `{ ... }` from a long answer

## Prompt rules

Copy Paste prompts and Integrated prompts must share the same semantic task.

It is acceptable and expected for Copy Paste to use a different renderer:

- same input data
- same scoring/generation criteria
- same output semantics
- extra transport instructions
- required JSON envelope for structured outputs
- stronger "return only JSON" instructions

Technical prompt instructions should generally be written in English for model compliance. User-facing UI remains translated with `next-intl`. Workflow output language should be explicit in the prompt or derived from the workflow context.

When a Copy Paste prompt changes prompt text, input data, response shape, controller behavior, or runtime flow, update the relevant prompt documentation under `docs/prompts/<prompt-type>/prompt.md` in the same change.

## UI pattern

For structured JSON workflows, use a shared large modal with a three-step wizard:

1. Copy prompt
2. Paste response
3. Review and apply

For text workflows, use a compact panel or simple modal that can fill an existing textarea or text field.

The shared JSON modal should include:

- workflow title
- concise instructions
- non-blocking privacy notice when applicable
- prompt copy action
- pasted response textarea
- validation errors
- copy correction instructions action
- read-only preview
- apply or replace action

The preview for structured workflows should be summarized, not a full duplicate of the destination screen.

For the CV Analysis pilot preview, show:

- score
- summary excerpt
- count of strengths
- count of improvement areas
- count of recommendations
- source/origin: external chat
- replacement warning if the analysis already has a result

Do not allow raw JSON editing in the first version. Structured results are review-only in the modal. Manual edits belong in the destination feature UI when that feature supports them.

## Privacy

Copy Paste prompts may include personal CV data, notes, job descriptions, and other user-authored content.

For the pilot, show a clear non-blocking warning before copying:

> This prompt may include CV data and context you entered. Paste it only into external tools you trust.

Do not redact automatically in the pilot. Redaction/minimization can be designed later as an optional workflow feature.

## Observability

All backend interactions in assisted workflows must record observability metadata when the existing action records observability.

Use at least:

```ts
{
  assistanceMode: "copy_paste" | "integrated" | "manual",
  workflowId: "cv_analysis.score",
  schemaVersion: "1"
}
```

Integrated actions should continue to include provider and model metadata.

For Copy Paste, persist or display the model source as:

```ts
aiModel = "external-chat"
```

When the UI has room for source metadata, show a discreet origin label such as:

```txt
External chat
```

## Initial workflow matrix

| Workflow | Manual | Copy Paste | Integrated | Notes |
| --- | --- | --- | --- | --- |
| CV analysis scoring | Planned/manual result editing not yet designed | Pilot | Existing via API key/mock provider-aware factories | First structured Copy Paste pilot. |
| Job match scoring | Planned/manual result editing not yet designed | Planned | Existing via API key/mock provider-aware factories | Should follow CV analysis once the pilot is proven. |
| Work Journal draft | Existing via manual writing and editable final text | Existing text flow, should align to shared UI later | Existing via API key/mock provider-aware factories | Text destination; no JSON envelope needed. |
| Feedback Notes final feedback | Existing via editable final feedback textarea | Existing text flow, should align to shared UI later | Existing via API key/mock provider-aware factories | Text destination; no JSON envelope needed. |
| Interview question answer | Existing via editable answer textarea | Planned text flow | Existing via API key/mock provider-aware factories | Copy Paste can fill the answer textarea. |
| CV profile structuring for templates | Existing indirectly through manual CV editor after profile exists | Planned structured JSON | Existing via API key/mock provider-aware factories | More complex schema; implement after scoring workflows. |
| CV editor instruction | Existing via manual CV editor | Planned structured JSON/diff workflow | Existing via API key/mock provider-aware factories | Needs preview/diff design before implementation. |
| Offer chat | Not applicable; manual mode cannot meaningfully create assistant messages | Special-case planned | Existing via API key/mock provider-aware factories | Copy Paste may insert an assistant message after confirmation. |

## Detailed implementation plan

### Phase 0: documentation baseline

Status: current document.

Tasks:

1. Keep `docs/architecture/assisted-workflows.md` as the stable assisted-workflows entrypoint.
2. Add a short `AGENTS.md` pointer to this document.
3. Add product-level README language that the app supports integrated AI, external chat Copy Paste workflows, local/provider-backed paths, and manual alternatives where practical.

Verification:

- Review docs for consistency with `docs/architecture/ai-service-dependency-injection.md`.
- No build is required for documentation-only changes.

### Phase 1: shared Copy Paste primitives

Goal: add small shared vocabulary without over-abstracting feature routing.

Candidate files:

```txt
src/modules/shared/application/assisted-workflows/copy-paste-workflow.types.ts
src/modules/shared/application/assisted-workflows/copy-paste-json-parser.ts
src/modules/shared/application/assisted-workflows/copy-paste-json-envelope.ts
```

Tasks:

1. Define `AssistanceMode`, `CopyPasteExpectedResponse`, `CopyPasteJsonEnvelope`, and preview response types.
2. Implement minimal JSON parsing:
   - pure JSON
   - one fenced `json` block
   - whitespace trimming
   - reject narrative/multiple blocks
3. Implement envelope validation:
   - exact `workflowId`
   - exact `schemaVersion`
   - object `result`
4. Add colocated tests for parser/envelope behavior.
5. Export only frontend-safe/shared-safe types from `@/modules/shared` if needed.

Verification:

- `npm run test -- copy-paste`
- `npm run ddd:check` if files are under `src/modules/`

### Phase 2: CV Analysis Copy Paste backend

Goal: implement the first structured workflow with feature-specific routes.

Workflow id:

```txt
cv_analysis.score
```

Schema version:

```txt
1
```

Routes:

```txt
src/app/api/cv-analyses/[id]/score/copy-paste/prepare/route.ts
src/app/api/cv-analyses/[id]/score/copy-paste/preview/route.ts
src/app/api/cv-analyses/[id]/score/copy-paste/apply/route.ts
src/app/api/cv-analyses/[id]/score/copy-paste/*/responses.ts
src/app/api/cv-analyses/[id]/score/copy-paste/*/validation.ts
```

Use cases:

```txt
src/modules/cv-analysis/application/use-cases/prepare-cv-score-copy-paste.use-case.ts
src/modules/cv-analysis/application/use-cases/preview-cv-score-copy-paste.use-case.ts
src/modules/cv-analysis/application/use-cases/apply-cv-score-copy-paste.use-case.ts
```

Prompt work:

```txt
src/modules/cv-analysis/infrastructure/services/cv-scoring-prompts.ts
docs/prompts/analisis-cv/prompt.md
```

Tasks:

1. Inspect current `ScoreCVAnalysisUseCase`, `UpdateCVAnalysisAIResultUseCase`, `CVScoringAIService`, and Gemini/mock result shape.
2. Extract or reuse the scoring result schema so Integrated and Copy Paste apply the same domain result.
3. Add `buildCVScoringCopyPastePrompt(input)` using the same semantic criteria as the integrated prompt.
4. `prepare` route:
   - use `getAuthenticatedRequestContext()`
   - validate route/body input before binding
   - bind `cvAnalysisModule`
   - load analysis and required CV text/context through module/application paths
   - return prompt, envelope metadata, expected response, privacy notice
5. `preview` route:
   - parse raw response
   - validate envelope
   - validate CV scoring result shape
   - return parsed result and summarized preview
6. `apply` route:
   - revalidate parsed result
   - bind module
   - call common persistence path, ideally `updateCVAnalysisAIResult.execute(...)`
   - use `aiModel: "external-chat"`
   - record observability with `assistanceMode`, `workflowId`, `schemaVersion`
   - return `ScoreCVAnalysisResponse`
7. Add use-case tests for prepare, preview, and apply.
8. Add route validation/response tests where useful.
9. Update prompt documentation under `docs/prompts/analisis-cv/prompt.md`.

Verification:

- `npm run test:backend -- cv-analysis`
- `npm run ddd:check`
- `npm run build`

### Phase 3: shared frontend Copy Paste wizard

Goal: build reusable UX for structured Copy Paste workflows.

Candidate files:

```txt
src/components/shared/copy-paste-workflow-modal.tsx
src/components/shared/copy-paste-workflow-steps.tsx
```

Or, if feature-specific enough at first:

```txt
src/features/cv-analysis/components/cv-score-copy-paste-modal.tsx
```

Tasks:

1. Add frontend API client functions for CV Analysis Copy Paste endpoints.
2. Add a visible local action in the CV Analysis scoring UI:
   - label recommendation: "Analyze with external AI"
   - Spanish translation: "Analizar con IA externa"
3. Build modal steps:
   - Step 1: privacy notice, prompt, copy button
   - Step 2: paste response, validate
   - Step 3: read-only preview, apply/replace
4. Preserve pasted invalid response after validation errors.
5. Add "copy correction instructions" for invalid responses.
6. Do not require API key/provider settings for Copy Paste.
7. On apply success:
   - update TanStack Query cache or refetch the specific analysis
   - close modal
   - show normal analysis detail view
8. Add `next-intl` keys in `src/i18n/messages.ts` for English and Spanish.

Verification:

- `npm run build`
- Manual browser verification:
  - no API key configured
  - prepare prompt
  - paste invalid response
  - copy correction instructions
  - paste valid response
  - apply new analysis
  - replace existing analysis

### Phase 4: Job Match scoring follow-up

Goal: prove the pattern generalizes to the second structured scoring workflow.

Tasks:

1. Mirror CV Analysis Copy Paste shape for `job_match_analysis.score`.
2. Include job description and job URL/source context.
3. Use envelope:

```json
{
  "workflowId": "job_match_analysis.score",
  "schemaVersion": "1",
  "result": {}
}
```

4. Reuse shared modal where possible.
5. Update `docs/prompts/analisis-oferta/prompt.md`.

Verification:

- Backend tests for job match copy-paste routes/use cases.
- `npm run ddd:check`
- `npm run build`

### Phase 5: Text destination workflows

Goal: align existing text Copy Paste flows with shared language and UI primitives.

Workflows:

- Work Journal draft
- Feedback Notes final feedback
- Interview question answer

Tasks:

1. Keep plain text output for text destinations.
2. Reuse compact Copy Paste panel/modal pieces.
3. Ensure each text workflow has:
   - copy prompt
   - paste/fill destination
   - manual edit before save
4. For interview questions, add prompt copy and paste-to-answer behavior.
5. Update prompt docs:
   - `docs/prompts/diario-trabajo/prompt.md`
   - `docs/prompts/feedback-notes/prompt.md`
   - `docs/prompts/preguntas-entrevista/prompt.md`

Verification:

- `npm run build`
- Manual browser verification for each text workflow.

### Phase 6: complex structured workflows

Goal: handle workflows with larger schemas or diff-like behavior.

Workflows:

- CV profile structuring for templates
- CV editor instruction

Tasks:

1. Design schema-specific previews before implementation.
2. For CV profile structuring, preview profile completeness and sections detected.
3. For CV editor instruction, design a diff/preview flow before apply.
4. Use JSON envelope and strict schema validation.
5. Keep manual CV editor as the manual path.

Verification:

- Backend tests for schema validation and apply behavior.
- Browser verification with before/after previews.
- `npm run build`

### Phase 7: offer chat special case

Goal: decide whether Copy Paste is useful for chat.

Open questions:

1. Should Copy Paste create an assistant message after confirmation?
2. Should the prompt include conversation history and current analysis context?
3. Should the user be able to edit the pasted assistant message before insertion?
4. How should the UI mark an externally generated assistant message?

Recommendation:

- Treat offer chat as a special case.
- Manual mode is not applicable because the product action is generating an assistant message.
- Copy Paste can be supported later as "insert external assistant response" with confirmation.

## Ultra-detailed CV Analysis pilot implementation checklist

This section is the execution plan for the first implementation pass. It intentionally focuses on one workflow:

```txt
cv_analysis.score
```

Do not implement Job Match, CV editor, templates, Work Journal, Feedback Notes, global settings, Ollama, or app subscriptions in the pilot.

### Execution policy for agents

When an agent starts implementing this pilot, it should not stop after each phase to ask for user approval. The phases below are execution boundaries for organization, not approval gates.

The agent must keep working until the whole pilot is implemented and validated, unless it hits a real blocker that cannot be resolved from the codebase.

Expected execution flow:

1. Implement all pilot phases end to end.
2. Run backend, architecture, build, and E2E verification.
3. Fix issues found by those checks.
4. Re-run the relevant checks until the feature is validated or a concrete blocker remains.
5. Hand off the completed, uncommitted changes to the user.
6. The user gives the final OK after reviewing/running the app.
7. The user commits and pushes manually.

Do not ask the user for approval between Phase 1, Phase 2, Phase 3, or any intermediate checklist step. The only expected user approval is the final product/code review after agent validation.

Do not commit or push from the agent. Leave changes uncommitted for the user.

### Expected user experience

Starting point:

- User has a CV analysis draft/extraction screen.
- User may or may not have an integrated AI API key configured.
- User sees the existing integrated AI action.
- User also sees a secondary action: "Analyze with external AI" / "Analizar con IA externa".

Happy path:

1. User clicks "Analyze with external AI".
2. App opens a large Copy Paste modal.
3. App prepares a prompt from backend data.
4. Modal shows a non-blocking privacy warning.
5. User copies the prompt.
6. User pastes the prompt into an external chat app.
7. External chat returns JSON with the required envelope.
8. User pastes the response into the modal.
9. App validates response through backend `preview`.
10. Modal shows a summarized read-only preview.
11. User clicks "Apply analysis".
12. Backend applies the result with `aiModel: "external-chat"`.
13. App closes modal and shows the normal analysis result screen.

Replacement path:

1. If the analysis already has `ai_score !== null`, the preview step shows a replacement warning.
2. Primary action text becomes "Replace analysis" / "Reemplazar análisis".
3. Apply overwrites the current AI result without versioning.

Invalid response path:

1. User pastes invalid response.
2. Backend `preview` returns controlled validation error.
3. Modal keeps pasted text intact.
4. Modal shows a specific error.
5. Modal offers "Copy correction instructions".
6. User can paste correction instructions into the external chat and try again.

### Pilot data contracts

Prepare response:

```ts
interface PrepareCVAnalysisCopyPasteResponse {
  workflowId: "cv_analysis.score";
  schemaVersion: "1";
  prompt: string;
  expectedResponse: {
    kind: "json";
    envelope: true;
  };
  privacyNotice: string;
}
```

Preview request:

```ts
interface PreviewCVAnalysisCopyPasteRequest {
  rawResponse: string;
}
```

Preview response:

```ts
interface PreviewCVAnalysisCopyPasteResponse {
  parsedResult: CVAnalysisCopyPasteResult;
  preview: {
    score: number;
    summary: string;
    strengthsCount: number;
    improvementAreasCount: number;
    recommendationsCount: number;
    originLabel: "external_chat";
    willReplaceExistingResult: boolean;
  };
  warnings: string[];
}
```

Apply request:

```ts
interface ApplyCVAnalysisCopyPasteRequest {
  parsedResult: CVAnalysisCopyPasteResult;
}
```

Apply response:

Use the existing `ScoreCVAnalysisResponse` shape from:

```txt
src/app/api/cv-analyses/responses.ts
```

JSON envelope expected from the external chat:

```json
{
  "workflowId": "cv_analysis.score",
  "schemaVersion": "1",
  "result": {}
}
```

The shape of `result` must match the existing CV scoring AI result as closely as possible. Do not invent a second scoring domain shape unless the current shape cannot be reused.

### Step 1: inspect current CV scoring implementation

Files to read first:

```txt
src/modules/cv-analysis/application/use-cases/score-cv-analysis.use-case.ts
src/modules/cv-analysis/application/use-cases/update-cv-analysis-ai-result.use-case.ts
src/modules/cv-analysis/domain/repositories/cv-scoring-ai.service.ts
src/modules/cv-analysis/infrastructure/services/gemini-cv-scoring-ai.service.ts
src/modules/cv-analysis/infrastructure/services/mock-cv-scoring-ai.service.ts
src/modules/cv-analysis/infrastructure/services/cv-scoring-prompts.ts
src/app/api/cv-analyses/[id]/score/route.ts
src/app/api/cv-analyses/validation.ts
src/app/api/cv-analyses/responses.ts
docs/prompts/analisis-cv/prompt.md
```

Answer these before editing:

1. What exact object does `CVScoringAIService` return?
2. What exact input does `UpdateCVAnalysisAIResultUseCase` need?
3. Where is best CV text selected today?
4. Where is additional context normalized today?
5. Which presenter/response builder should `apply` reuse?
6. Which observability events already exist for scoring?

Expected outcome:

- A concrete mapping from external JSON `result` to existing update/persistence input.
- No new persistence model unless absolutely necessary.

### Step 2: shared Copy Paste parser and envelope

Create shared code only for generic parsing and envelope validation.

Candidate files:

```txt
src/modules/shared/application/assisted-workflows/copy-paste-json-parser.ts
src/modules/shared/application/assisted-workflows/copy-paste-json-envelope.ts
src/modules/shared/application/assisted-workflows/copy-paste-workflow.types.ts
```

Implementation details:

1. `extractCopyPasteJson(raw: string): unknown`
   - trim whitespace
   - if raw is valid JSON, return parsed JSON
   - if raw is exactly one fenced Markdown block with language `json`, parse block contents
   - reject empty input
   - reject multiple fenced blocks
   - reject narrative text outside the fenced block except whitespace
2. `validateCopyPasteEnvelope(input, expected)`
   - require object
   - require exact `workflowId`
   - require exact `schemaVersion`
   - require `result` object
   - return `result`
3. Use controlled errors that route handlers can map to `400`.
4. Keep these utilities free of CV Analysis imports.

Tests:

```txt
src/modules/shared/application/assisted-workflows/copy-paste-json-parser.test.ts
src/modules/shared/application/assisted-workflows/copy-paste-json-envelope.test.ts
```

Test cases:

- parses pure JSON
- parses single fenced `json` block
- trims whitespace
- rejects empty input
- rejects malformed JSON
- rejects text before JSON
- rejects text after JSON
- rejects multiple fenced blocks
- rejects missing `workflowId`
- rejects wrong `workflowId`
- rejects missing `schemaVersion`
- rejects wrong `schemaVersion`
- rejects missing `result`
- rejects non-object `result`

Verification after this step:

```bash
npm run test -- copy-paste-json
npm run ddd:check
```

### Step 3: CV scoring result validation

Add a CV-analysis-specific validator for the pasted result.

Candidate location:

```txt
src/modules/cv-analysis/application/use-cases/preview-cv-score-copy-paste.use-case.ts
```

or if reused by `apply`:

```txt
src/modules/cv-analysis/application/services/cv-score-copy-paste-result.validator.ts
```

Rules:

1. Validate all required fields expected by current CV scoring persistence.
2. Validate score is a number from `0` to `100`.
3. Validate list fields are arrays.
4. Validate text fields are strings.
5. Normalize optional empty strings/arrays only if the integrated result path already allows equivalent values.
6. Do not silently invent missing sections.

Tests:

- valid result passes
- score below 0 fails
- score above 100 fails
- missing summary fails if summary is required
- missing list fields fail if persistence requires them
- wrong field type fails
- extra fields are ignored or preserved according to existing result handling, but the choice must be explicit

### Step 4: Copy Paste prompt builder

Update:

```txt
src/modules/cv-analysis/infrastructure/services/cv-scoring-prompts.ts
```

Add a renderer such as:

```ts
buildCVScoringCopyPastePrompt(input)
```

Rules:

1. Reuse existing task instructions where possible.
2. Reuse the same source context builder where possible.
3. Add Copy Paste transport instructions:
   - return only JSON
   - use exact envelope
   - no Markdown unless the product intentionally accepts a single fenced JSON block
   - no explanation outside JSON
4. Include:
   - `workflowId: "cv_analysis.score"`
   - `schemaVersion: "1"`
   - the expected `result` shape
5. Keep technical instructions in English.
6. Preserve/output user-facing analysis language according to existing CV scoring behavior.

Prompt documentation:

Update:

```txt
docs/prompts/analisis-cv/prompt.md
```

Add:

- Copy Paste prompt renderer
- envelope shape
- prepare/preview/apply runtime flow
- source data included in the copied prompt
- privacy note
- maintenance note that integrated and Copy Paste semantics must stay aligned

### Step 5: module use cases

Add three use cases.

#### Prepare use case

Candidate file:

```txt
src/modules/cv-analysis/application/use-cases/prepare-cv-score-copy-paste.use-case.ts
```

Responsibilities:

1. Receive `{ id, userId, additionalContext? }`.
2. Find analysis by id and user id.
3. Throw/return not found consistently with existing scoring use case.
4. Resolve extracted CV text using the same logic as integrated scoring.
5. Build prompt through `buildCVScoringCopyPastePrompt`.
6. Return prepare response data.
7. Record observability if current scoring preparation has equivalent tracking.

#### Preview use case

Candidate file:

```txt
src/modules/cv-analysis/application/use-cases/preview-cv-score-copy-paste.use-case.ts
```

Responsibilities:

1. Receive `{ id, userId, rawResponse }`.
2. Find analysis to determine whether this will replace an existing result.
3. Parse JSON.
4. Validate envelope.
5. Validate CV scoring result.
6. Build summary preview.
7. Return `parsedResult`, `preview`, and warnings.

#### Apply use case

Candidate file:

```txt
src/modules/cv-analysis/application/use-cases/apply-cv-score-copy-paste.use-case.ts
```

Responsibilities:

1. Receive `{ id, userId, parsedResult }`.
2. Find analysis by id/user id.
3. Revalidate `parsedResult`.
4. Call the common persistence path:
   - prefer `UpdateCVAnalysisAIResultUseCase`
   - or shared domain/application method used by `ScoreCVAnalysisUseCase`
5. Set model/source:
   - `aiModel: "external-chat"`
   - metadata/observability `assistanceMode: "copy_paste"`
6. Return updated aggregate.

Tests:

```txt
src/modules/cv-analysis/application/use-cases/prepare-cv-score-copy-paste.use-case.test.ts
src/modules/cv-analysis/application/use-cases/preview-cv-score-copy-paste.use-case.test.ts
src/modules/cv-analysis/application/use-cases/apply-cv-score-copy-paste.use-case.test.ts
```

Use mocks for repositories/trackers where existing use-case tests do. Do not call real AI services.

### Step 6: module composition

Update:

```txt
src/modules/cv-analysis/cv-analysis.module.ts
src/modules/cv-analysis/index.ts
src/lib/container.ts
```

Tasks:

1. Instantiate new use cases in the module factory.
2. Inject only domain/application dependencies.
3. Preserve singleton module architecture.
4. Preserve `bindRequest(supabase)` behavior.
5. Export public types/use cases through module barrel only when needed by routes.

Verification:

```bash
npm run ddd:check
```

### Step 7: API responses and validation

Create route-local response and validation files.

Candidate structure:

```txt
src/app/api/cv-analyses/[id]/score/copy-paste/prepare/route.ts
src/app/api/cv-analyses/[id]/score/copy-paste/prepare/responses.ts
src/app/api/cv-analyses/[id]/score/copy-paste/prepare/validation.ts
src/app/api/cv-analyses/[id]/score/copy-paste/preview/route.ts
src/app/api/cv-analyses/[id]/score/copy-paste/preview/responses.ts
src/app/api/cv-analyses/[id]/score/copy-paste/preview/validation.ts
src/app/api/cv-analyses/[id]/score/copy-paste/apply/route.ts
src/app/api/cv-analyses/[id]/score/copy-paste/apply/responses.ts
src/app/api/cv-analyses/[id]/score/copy-paste/apply/validation.ts
```

If duplication is high, share route-local helpers under:

```txt
src/app/api/cv-analyses/[id]/score/copy-paste/_shared/
```

Routes must follow API controller anatomy from `AGENTS.md`:

1. `try/catch`.
2. First step inside `try`: `getAuthenticatedRequestContext()`.
3. Parse/validate request body before binding.
4. Bind `cvAnalysisModule`.
5. Execute use case.
6. Use `ok`, `errorResponse`, `notFound`, and `handleApiError`.
7. No manual `NextResponse`.

Validation:

- `prepare` accepts optional additional context if current score flow supports it.
- `preview` requires non-empty `rawResponse`.
- `apply` requires `parsedResult`.
- Validation returns `{ ok: true, value }` or `{ ok: false, error: { message, status } }`.

Response files must be frontend-import-safe:

- no `NextRequest`
- no `NextResponse`
- no Supabase imports
- no `@/lib/container`
- no auth imports
- no infrastructure imports

### Step 8: frontend API client

Update or create:

```txt
src/features/cv-analysis/api/cv-analysis-copy-paste-api.ts
```

or add to:

```txt
src/features/cv-analysis/api/cv-analysis-api.ts
```

Functions:

```ts
prepareCVAnalysisCopyPaste(id, input)
previewCVAnalysisCopyPaste(id, input)
applyCVAnalysisCopyPaste(id, input)
```

Rules:

1. Import response types from `responses.ts`, never from `route.ts`.
2. Use existing `readJsonResponse` style.
3. Keep request/response names feature-specific for pilot clarity.
4. Do not require global AI settings or API key.

### Step 9: frontend modal

Prefer a shared structured Copy Paste modal when the interaction is identical to other workflows. Use a feature-specific wrapper only for CV-specific API functions, labels, and preview composition.

Candidate file:

```txt
src/components/shared/copy-paste-workflow-modal.tsx
src/components/shared/copy-paste-workflow-steps.tsx
src/features/cv-analysis/components/cv-score-copy-paste-modal.tsx
```

State machine:

```ts
type Step = "copy" | "paste" | "review";
```

State:

- `isOpen`
- `step`
- `prepareData`
- `rawResponse`
- `previewData`
- `isPreparing`
- `isPreviewing`
- `isApplying`
- `error`
- `copiedPrompt`
- `copiedCorrectionPrompt`

Behavior:

1. On open, call prepare.
2. If prepare fails, show retry.
3. Copy button writes prompt to clipboard.
4. Continue to paste step after copy or manually via button.
5. Paste step validates through backend preview.
6. Invalid response stays in textarea.
7. Review step shows summary.
8. Apply calls backend apply.
9. On success, call parent `onApplied(updatedAnalysis)`.
10. Close/reset modal after success.

Do not:

- show raw JSON editor in review step
- require API key
- call integrated scoring endpoint
- apply automatically after successful preview

### Step 9.5: shared UI reuse requirements

Copy Paste UI will be used across many features, so duplicated feature-local UI should be treated as temporary.

Reusable UI must live under:

```txt
src/components/shared/
```

Required shared components:

1. `CopyPasteWorkflowTriggerButton`
   - Use for every Copy Paste entry point.
   - Owns the icon, accessible label, responsive hidden text behavior, disabled state, and base styling.
   - Feature screens pass only `label`, `onClick`, optional `disabled`, and optional class overrides.
2. `CopyPasteWorkflowModal`
   - Prefer one shared modal for structured JSON-envelope workflows.
   - Owns copy/paste/review step state, prompt copying, pasted response textarea, validation error display, correction-instructions copy action, loading states, cancel/close controls, and apply/replace action placement.
3. Feature-specific preview composition
   - If a workflow has unique preview fields, pass a feature-specific `renderPreview` component/function into the shared modal.
   - Do not fork the whole modal for a small preview difference.
   - If the preview is identical, reuse the shared preview summary directly.

### Step 10: integrate modal into CV Analysis UI

Likely files:

```txt
src/features/cv-analysis/components/extraction-view.tsx
src/features/cv-analysis/components/general-analysis-form.tsx
src/features/cv-analysis/components/cv-analysis-view.tsx
src/features/cv-analysis/hooks/use-cv-analysis-mutations.ts
```

Implementation approach:

1. Add secondary action near the integrated scoring action.
2. Label:
   - English: "Analyze with external AI"
   - Spanish: "Analizar con IA externa"
3. Show action even when `hasAIApiKey` is false.
4. Keep existing integrated button behavior unchanged.
5. Pass analysis id and existing score state to modal.
6. On apply success:
   - update query cache for analysis detail/list if practical
   - otherwise invalidate/refetch the specific analysis
   - call existing `onAIAnalysisComplete` callback where appropriate

If the current screen splits general CV analysis and job match analysis, only add this pilot to general CV analysis.

### Step 11: translations

Update:

```txt
src/i18n/messages.ts
```

Add feature-scoped keys under an existing CV Analysis namespace or a new nested namespace.

Required copy:

- action label
- modal title
- modal intro
- privacy notice
- copy prompt
- prompt copied
- paste response label
- validate response
- validation failed
- copy correction instructions
- correction instructions copied
- review title
- score label
- summary label
- strengths count label
- improvement areas count label
- recommendations count label
- external chat origin label
- apply analysis
- replace analysis
- replacement warning
- cancel/close
- preparing/loading/applying states

Add both English and Spanish strings. Do not hardcode user-visible strings in React components.

### Step 12: observability

Find existing CV analysis scoring event stages before editing.

Add metadata where the Copy Paste flow records backend interaction:

```ts
{
  assistanceMode: "copy_paste",
  workflowId: "cv_analysis.score",
  schemaVersion: "1",
  model: "external-chat"
}
```

Recommended stages:

- `cv_analysis_copy_paste_prompt_prepared`
- `cv_analysis_copy_paste_response_previewed`
- `cv_analysis_copy_paste_result_applied`

If the existing observability system favors fewer stages, at minimum record apply success/error with the metadata above.

### Step 13: prompt documentation update

Update:

```txt
docs/prompts/analisis-cv/prompt.md
```

Must include:

1. Source file path for integrated prompt builder.
2. Source file path for Copy Paste prompt builder.
3. Current integrated prompt or representative current structure.
4. Current Copy Paste prompt structure.
5. Data used to feed each prompt.
6. Runtime flow for integrated scoring.
7. Runtime flow for Copy Paste:
   - prepare
   - external chat
   - preview
   - apply
8. JSON envelope.
9. Validation notes.
10. Maintenance notes:
    - integrated and Copy Paste semantics must stay aligned
    - update this doc whenever prompt input/output/controller behavior changes

### Step 14: backend tests

Minimum backend test set:

Shared parser/envelope:

- all cases listed in Step 2.

CV Analysis prepare:

- builds prompt for an owned analysis
- includes workflow id and schema version
- includes privacy notice
- fails for missing analysis
- does not call AI service

CV Analysis preview:

- accepts valid enveloped response
- returns parsed result and summary preview
- marks `willReplaceExistingResult` false for unscored analysis
- marks `willReplaceExistingResult` true for scored analysis
- rejects wrong workflow id
- rejects wrong schema version
- rejects invalid score shape
- does not persist result

CV Analysis apply:

- applies valid parsed result
- persists `aiModel: "external-chat"`
- records observability metadata
- replaces existing score when present
- rejects invalid parsed result
- fails for missing analysis
- does not call AI service

Route tests if existing API route test patterns support them:

- validation failure returns `400`
- unauthenticated request returns auth response
- successful apply returns `ScoreCVAnalysisResponse`

### Step 15: frontend verification

Manual browser script:

1. Start app and local Supabase as usual.
2. Seed agent data if needed:

```bash
npm run supabase:seed-agent
```

3. Log in with:

```txt
agent-test@example.com
agent-test-password
```

4. Clear stored AI settings or leave API key empty.
5. Open a CV analysis without score.
6. Confirm integrated scoring remains blocked or asks for settings if no API key.
7. Confirm "Analyze with external AI" remains available.
8. Open modal.
9. Confirm prompt prepares.
10. Confirm privacy notice is visible and non-blocking.
11. Copy prompt.
12. Paste invalid text.
13. Confirm specific validation error and pasted text remains.
14. Copy correction instructions.
15. Paste valid JSON fixture.
16. Confirm preview summary.
17. Apply.
18. Confirm analysis result screen updates.
19. Reopen same analysis.
20. Open Copy Paste modal again.
21. Paste valid JSON fixture.
22. Confirm replacement warning.
23. Apply replacement.
24. Confirm score/result changes.

### Step 16: E2E verification

Add automated E2E coverage for the pilot.

Candidate location:

```txt
tests/e2e/cv-analysis-copy-paste.spec.ts
```

or the project's existing E2E test directory if different.

The E2E test should run against the real local app and local Supabase test/dev stack. It must not call a real AI provider.

Recommended setup:

1. Use the agent test user:

```txt
agent-test@example.com
agent-test-password
```

2. Seed data before the test run:

```bash
npm run supabase:seed-agent
```

3. Ensure the test uses a fixed valid Copy Paste JSON fixture instead of a real external chat call.
4. Ensure AI settings/API key are not required for the Copy Paste path.

Minimum E2E scenarios:

1. Copy Paste action is visible without an API key.
2. Modal opens and prepares a prompt.
3. Privacy notice is visible and non-blocking.
4. Invalid pasted response shows validation error and preserves pasted text.
5. Correction instructions can be copied.
6. Valid JSON fixture previews score/summary/counts.
7. Apply persists the analysis and transitions to the normal analysis result UI.
8. Running the flow again on the same analysis shows replacement warning.
9. Replacement apply updates the displayed score/result.

E2E assertions should verify user-visible behavior, not internal implementation details.

Recommended E2E command:

```bash
npm run test:e2e -- cv-analysis-copy-paste
```

If the repository uses a different E2E script, use the existing script and document the exact command in the handoff.

If no E2E harness exists yet, add the smallest project-consistent harness needed for this feature and document how to run it.

### Step 17: final verification commands

Run:

```bash
npm run test:backend -- cv-analysis
npm run ddd:check
npm run build
npm run test:e2e -- cv-analysis-copy-paste
```

If the E2E command name differs, replace it with the actual repo command.

After automated verification, run the manual browser script from Step 15 as a final human-style gut check before handoff when feasible.

If any command cannot be run, document why in the handoff.

The agent should not stop at the first failing check. It should debug, fix, and re-run the relevant checks until the pilot passes or until it can name a concrete blocker.

### Step 18: user acceptance and handoff

After implementation and validation, the agent handoff must include:

1. Summary of implemented behavior.
2. Files changed.
3. Verification commands run and their results.
4. E2E command run and result.
5. Any residual risks or known limitations.
6. Confirmation that no real AI API calls were used.
7. Confirmation that changes are uncommitted.

The user then reviews the running feature and gives final OK. After that, the user commits and pushes manually.

### Step 19: non-goals for the pilot

Do not include:

- global assistance mode settings
- Ollama setup
- app subscription setup
- feature flag
- preview tokens
- analysis versioning
- automatic redaction
- raw JSON editing
- Job Match Copy Paste
- chat Copy Paste
- CV editor Copy Paste
- template/profile Copy Paste

### Step 20: suggested implementation slices

The user prefers no automatic commits, but implementation should still be grouped mentally in small reviewable slices:

1. Shared parser/envelope types and tests.
2. CV Analysis prompt renderer and prompt docs.
3. CV Analysis prepare/preview/apply use cases and tests.
4. Copy Paste API routes, validation, and responses.
5. Frontend API client and modal.
6. CV Analysis UI integration and translations.
7. Final verification fixes.

## Open decisions

These decisions are intentionally deferred:

1. Global assistance mode settings.
2. Ollama provider configuration UX and backend adapter.
3. App subscription provider design.
4. Optional personal data minimization/redaction before Copy Paste.
5. Preview tokens for strict preview/apply integrity.
6. Versioning of analysis results before replacement.
7. Editing structured JSON results inside the Copy Paste modal.
