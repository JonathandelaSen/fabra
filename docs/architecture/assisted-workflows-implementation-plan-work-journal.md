# Assisted workflow implementation plan: Work Journal draft

## Workflow summary

Workflow id:

```txt
work_journal.draft_entry
```

Response kind:

```txt
plain_text
```

This workflow turns rough work notes into a polished journal entry. Copy Paste already exists in a basic form, so this plan aligns it with the assisted-workflows architecture and shared UI language.

Manual support:

```txt
supported: true
kind: direct_edit
```

The user can write and save journal entries manually.

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

Do not stop for approval between phases. Implement the complete Work Journal Copy Paste alignment, run verification including E2E, fix failures, and hand off uncommitted changes. The user gives final OK after agent validation and then commits/pushes manually.

Do not call real AI APIs.

## Expected user experience

1. User chooses AI-assisted writing in Work Journal.
2. User enters rough notes and context/date/topic.
3. User can either use integrated AI or Copy Paste.
4. Copy Paste opens a compact panel or modal.
5. User copies the prompt to an external chat.
6. User pastes plain text back into the app.
7. The app fills the editable `final_text` field.
8. User reviews/edits the text.
9. User saves the journal entry through the normal save path.

No JSON envelope is required because the destination is a plain editable text field.

## Shared UI requirements

Use shared text Copy Paste primitives, not the structured JSON modal.

Recommended shared components:

```txt
src/components/shared/copy-paste-workflow-trigger-button.tsx
src/components/shared/copy-paste-text-panel.tsx
src/components/shared/copy-paste-prompt-step.tsx
```

The shared text panel owns:

- prompt display
- prompt copy action
- pasted text textarea
- paste/apply-to-field action
- basic empty response validation
- non-blocking privacy notice

The Work Journal feature wrapper owns:

- prompt builder input
- translated labels
- `onPasteText(finalText)` to update `draft.final_text`
- existing save behavior

## Backend plan

Current likely files:

```txt
src/app/api/work-journal/entries/draft/route.ts
src/app/api/work-journal/validation.ts
src/modules/work-journal/application/use-cases/draft-entry.use-case.ts
src/modules/work-journal/infrastructure/services/work-journal-prompts.ts
docs/prompts/diario-trabajo/prompt.md
```

No new `preview/apply` backend endpoints are required for plain text in this phase unless the prompt must be prepared server-side from private backend-only data.

Preferred approach:

1. Keep integrated drafting endpoint unchanged.
2. Keep or move the Copy Paste prompt builder so it shares semantic instructions with the integrated prompt.
3. If current prompt is built frontend-side, verify it does not duplicate backend prompt semantics in a way that can drift.
4. If drift exists, add a backend `prepare` endpoint:

```txt
POST /api/work-journal/entries/draft/copy-paste/prepare
```

5. Do not add `preview`/`apply` endpoints for plain text unless future validation becomes more complex.

## Frontend plan

Current likely files:

```txt
src/features/work-journal/components/work-journal-view.tsx
src/features/work-journal/api/work-journal-prompt.ts
src/features/work-journal/api/work-journal-api.ts
src/i18n/messages.ts
```

Tasks:

1. Replace feature-local Copy Paste UI with shared text Copy Paste panel pieces.
2. Preserve the existing "copy prompt" behavior.
3. Add/ensure paste-back textarea and "Use pasted text" action.
4. Fill `draft.final_text` without saving automatically.
5. Keep `draft.raw_notes` unchanged.
6. Ensure user can edit `final_text` before save.
7. Ensure Copy Paste does not require API key/provider settings.
8. Add missing English/Spanish translations.

## Prompt documentation

Update:

```txt
docs/prompts/diario-trabajo/prompt.md
```

Document:

- integrated prompt flow
- Copy Paste plain-text flow
- source file path for prompt builders
- data included in copied prompt
- runtime flow
- maintenance note that integrated and Copy Paste semantics must stay aligned

## Tests

Add or update component/hook tests if the repo has established frontend test patterns.

Backend tests are only needed if adding a backend `prepare` endpoint.

## E2E verification

Add or update E2E coverage:

```txt
e2e/work-journal-copy-paste.spec.ts
```

Minimum scenarios:

1. Copy Paste action is visible without API key.
2. Prompt can be copied.
3. Pasted plain text fills `final_text`.
4. User can edit pasted text.
5. Saving persists the edited final text.
6. Integrated AI path remains unchanged.

Recommended command:

```bash
npm run test:e2e -- work-journal-copy-paste
```

Use the actual repo E2E command if different.

## Verification commands

```bash
npm run build
npm run test:e2e -- work-journal-copy-paste
```

If backend/module files change:

```bash
npm run test:backend -- work-journal
npm run ddd:check
```

## Non-goals

- JSON envelope
- preview/apply backend pipeline
- automatic save after paste
- integrated provider changes
- global assistance settings
