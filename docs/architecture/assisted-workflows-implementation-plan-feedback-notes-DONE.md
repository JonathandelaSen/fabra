# Assisted workflow implementation plan: Feedback Notes final feedback

## Workflow summary

Workflow id:

```txt
feedback_notes.final_feedback
```

Response kind:

```txt
plain_text
```

This workflow turns private feedback notes into final peer feedback. Copy Paste already exists as prompt copy plus editable final textarea, so this plan aligns it with the shared text Copy Paste pattern.

Manual support:

```txt
supported: true
kind: direct_edit
```

Integrated support:

```txt
supported: true
providers: api_key, mock
```

Copy Paste support:

```txt
status: existing, align to shared text workflow
```

## Execution policy for agents

Do not stop between phases for approval. Implement the full alignment, run verification including E2E, fix failures, and leave changes uncommitted. The user gives final OK and commits/pushes manually.

Do not call real AI APIs.

## Expected user experience

1. User opens a feedback note with raw entries.
2. User can generate final feedback with integrated AI or use Copy Paste.
3. Copy Paste shows/copies the external chat prompt.
4. User pastes external chat response as plain text.
5. App fills the final feedback textarea.
6. User edits if needed.
7. User saves through the existing final feedback save action.

No JSON envelope is required because final feedback is plain text.

## Shared UI requirements

Use shared text Copy Paste components, not the structured JSON modal.

Recommended shared components:

```txt
src/components/shared/copy-paste-workflow-trigger-button.tsx
src/components/shared/copy-paste-text-panel.tsx
src/components/shared/copy-paste-prompt-step.tsx
```

Feature wrapper responsibilities:

- build/provide prompt
- provide translated labels
- call `setFinalDraft(pastedText)`
- keep save explicit

## Backend plan

Current likely files:

```txt
src/app/api/feedback-notes/feedbacks/[id]/generate/route.ts
src/app/api/feedback-notes/validation.ts
src/modules/feedback-notes/application/use-cases/generate-final-feedback.use-case.ts
src/modules/feedback-notes/domain/services/feedback-notes-prompts.ts
docs/prompts/feedback-notes/prompt.md
```

No new backend `preview/apply` endpoint is required for plain text in this phase.

If prompt construction currently lives only in frontend API helpers, decide whether to move the prompt builder into the module/domain service or expose a backend `prepare` endpoint. Prefer avoiding duplicate prompt semantics.

Optional backend endpoint only if needed:

```txt
POST /api/feedback-notes/feedbacks/[id]/generate/copy-paste/prepare
```

## Frontend plan

Current likely files:

```txt
src/features/feedback-notes/components/feedback-final-panel.tsx
src/features/feedback-notes/api/feedback-notes-api.ts
src/features/feedback-notes/hooks/use-feedback-notes-mutations.ts
src/i18n/messages.ts
```

Tasks:

1. Replace feature-local Copy Paste UI with shared text Copy Paste panel pieces.
2. Preserve current prompt copy functionality.
3. Add or confirm paste-back action fills `finalDraft`.
4. Do not save automatically after paste.
5. Keep final feedback textarea editable.
6. Ensure Copy Paste works without API key/provider configuration.
7. Add/adjust English and Spanish translations.

## Prompt documentation

Update:

```txt
docs/prompts/feedback-notes/prompt.md
```

Document:

- integrated generation flow
- Copy Paste plain-text flow
- source file paths
- input data included in prompt
- save behavior after paste
- maintenance notes

## Tests

Add frontend tests if existing patterns support them.

Backend tests only if a backend `prepare` endpoint is added.

## E2E verification

Add:

```txt
e2e/feedback-notes-copy-paste.spec.ts
```

Minimum scenarios:

1. Copy Paste action is visible without API key.
2. Prompt can be copied.
3. Pasted response fills final feedback textarea.
4. User can edit pasted text.
5. Save persists final feedback.
6. Existing integrated generation action remains available.

Recommended command:

```bash
npm run test:e2e -- feedback-notes-copy-paste
```

## Verification commands

```bash
npm run build
npm run test:e2e -- feedback-notes-copy-paste
```

If backend/module files change:

```bash
npm run test:backend -- feedback-notes
npm run ddd:check
```

## Non-goals

- JSON envelope
- automatic save after paste
- full structured preview
- global assistance settings
