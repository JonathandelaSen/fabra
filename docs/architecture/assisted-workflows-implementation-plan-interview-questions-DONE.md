# Assisted workflow implementation plan: Interview question answer

## Workflow summary

Workflow id:

```txt
interview_question.answer
```

Response kind:

```txt
plain_text
```

This workflow generates or improves an answer to an interview question. The destination is the editable answer textarea, so Copy Paste should fill text, not persist blindly.

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
status: planned
```

## Execution policy for agents

Do not stop between phases for approval. Implement the complete Copy Paste flow, run verification including E2E, fix failures, and leave changes uncommitted. The user gives final OK and commits/pushes manually.

Do not call real AI APIs.

## Expected user experience

1. User opens an interview question detail.
2. User can manually edit the question/context/answer.
3. User can use integrated AI or Copy Paste for answer generation/editing.
4. Copy Paste prepares a prompt from question, context, linked CV, linked job match analysis, and optional edit instruction.
5. User copies prompt into external chat.
6. User pastes plain text answer back into the app.
7. App fills the answer textarea.
8. User reviews/edits.
9. User saves through existing manual save/autosave behavior.

No JSON envelope is required for the Copy Paste UI because the destination is a plain answer field, even if the integrated provider internally parses JSON.

## Shared UI requirements

Use shared text Copy Paste components.

Recommended shared components:

```txt
src/components/shared/copy-paste-workflow-trigger-button.tsx
src/components/shared/copy-paste-text-panel.tsx
```

Feature-specific wrapper:

```txt
src/features/interview-questions/components/interview-question-copy-paste-panel.tsx
```

The wrapper owns:

- generate vs edit mode
- optional edit instruction
- linked CV/analysis context wiring
- `onPasteAnswer(answer)`

## Backend plan

Current likely files:

```txt
src/app/api/interview-questions/[id]/generate/route.ts
src/app/api/interview-questions/[id]/edit/route.ts
src/app/api/interview-questions/validation.ts
src/modules/selection-process/application/use-cases/generate-question-answer.use-case.ts
src/modules/selection-process/application/use-cases/edit-question-answer.use-case.ts
src/modules/selection-process/infrastructure/services/interview-question-prompts.ts
docs/prompts/preguntas-entrevista/prompt.md
```

Add a backend `prepare` endpoint if the prompt needs backend-only context:

```txt
POST /api/interview-questions/[id]/copy-paste/prepare
```

Request:

```ts
{
  mode: "generate" | "edit";
  instruction?: string;
}
```

Response:

```ts
{
  workflowId: "interview_question.answer";
  schemaVersion: "1";
  prompt: string;
  expectedResponse: { kind: "plain_text" };
  privacyNotice?: string;
}
```

No backend `preview` or `apply` is required. Applying means filling the answer textarea and saving through the existing update route.

## Frontend plan

Current likely files:

```txt
src/features/interview-questions/components/interview-question-ai-panel.tsx
src/features/interview-questions/components/interview-question-detail.tsx
src/features/interview-questions/api/interview-questions-api.ts
src/i18n/messages.ts
```

Tasks:

1. Add Copy Paste action next to integrated generate/edit actions.
2. Keep Copy Paste available without API key.
3. Prepare prompt through backend if needed.
4. Show privacy notice.
5. Copy prompt.
6. Paste plain text answer.
7. Fill answer textarea without automatic save, unless current detail screen intentionally autosaves textareas.
8. Keep existing manual save action as the final persistence step.
9. Add English/Spanish translations.

## Prompt documentation

Update:

```txt
docs/prompts/preguntas-entrevista/prompt.md
```

Document:

- integrated generate/edit flow
- Copy Paste plain-text flow
- prompt source files
- linked CV/analysis data included
- mode-specific behavior
- maintenance notes

## Tests

Backend tests:

- prepare generate prompt for owned question
- prepare edit prompt with instruction
- reject missing question
- no AI service call

Frontend tests if available:

- paste fills answer field
- no API key required for Copy Paste

## E2E verification

Add:

```txt
e2e/interview-question-copy-paste.spec.ts
```

Minimum scenarios:

1. Open interview question detail.
2. Copy Paste action visible without API key.
3. Prepare/copy prompt for generate mode.
4. Paste answer text.
5. Answer textarea updates.
6. Manual save persists answer.
7. Edit mode prompt can be prepared with instruction.

Recommended command:

```bash
npm run test:e2e -- interview-question-copy-paste
```

## Verification commands

```bash
npm run test:backend -- selection-process
npm run ddd:check
npm run build
npm run test:e2e -- interview-question-copy-paste
```

## Non-goals

- JSON envelope for pasted answer
- direct backend apply endpoint
- automatic save after paste unless already standard in the screen
- changing integrated AI response parser
