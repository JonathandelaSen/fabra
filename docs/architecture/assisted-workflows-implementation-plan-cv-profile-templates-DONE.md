# Assisted workflow implementation plan: CV profile structuring for templates
This implementation is already done.

## Workflow summary

Workflow id:

```txt
cv_profile.structure_for_template
```

Response kind:

```txt
json
```

This workflow turns extracted CV text into the structured profile required by CV templates. It is a complex structured workflow and should be implemented after the scoring Copy Paste flows are stable.

Manual support:

```txt
supported: true
kind: existing_screen
```

Manual editing is available through the CV editor after a structured profile/template version exists. A future improvement may allow creating the initial profile manually.

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

Do not stop between phases for approval. Implement end to end, run backend/build/E2E verification, fix failures, and leave changes uncommitted. The user gives final OK and commits/pushes manually.

Do not call real AI APIs.

## Expected user experience

1. User selects a CV and template.
2. If no structured profile exists, user can use integrated AI or Copy Paste.
3. Copy Paste opens the shared structured JSON modal.
4. User copies prompt containing extracted CV text and template/locale context.
5. User pastes JSON response with envelope.
6. App validates profile schema.
7. App shows read-only preview: sections detected, missing important fields, template locale, profile completeness.
8. User applies.
9. Backend saves structured profile and creates/continues template CV creation through the normal flow.

## JSON envelope

```json
{
  "workflowId": "cv_profile.structure_for_template",
  "schemaVersion": "1",
  "result": {}
}
```

`result` must match the current structured CV profile output shape.

## Shared UI requirements

Use the shared structured JSON modal:

```txt
src/components/shared/copy-paste-workflow-modal.tsx
```

Feature wrapper:

```txt
src/features/cv-library/components/cv-profile-structure-copy-paste-modal.tsx
```

The wrapper owns:

- selected CV id
- template id
- locale
- `renderPreview`
- apply continuation after profile creation

Do not fork the shared modal.

## Backend plan

Current likely files:

```txt
src/app/api/cvs/[id]/template/route.ts
src/app/api/cvs/[id]/structured-profile/route.ts
src/app/api/cvs/validation.ts
src/modules/cv-library/application/use-cases/structure-cv-profile-with-ai.use-case.ts
src/modules/cv-library/application/use-cases/upsert-cv-structured-profile.use-case.ts
src/modules/cv-library/infrastructure/services/cv-profile-structuring-prompts.ts
docs/prompts/extraccion-info-cv/prompt.md
```

Add feature-specific routes:

```txt
POST /api/cvs/[id]/structured-profile/copy-paste/prepare
POST /api/cvs/[id]/structured-profile/copy-paste/preview
POST /api/cvs/[id]/structured-profile/copy-paste/apply
```

Prepare:

- authenticate
- load CV document
- get best extracted CV text
- include template id/locale if called from template flow
- build Copy Paste prompt
- return privacy notice and JSON expected response

Preview:

- parse envelope
- validate structured profile schema
- preview completeness, sections, warnings
- do not persist

Apply:

- revalidate parsed result
- upsert structured profile with `aiModel: "external-chat"`
- return structured profile or continue template version creation depending on route design

Prefer separating "apply profile" from "create template version" unless existing route composition makes that awkward.

## Frontend plan

Current likely files:

```txt
src/features/cv-library/components/templates-view.tsx
src/features/cv-editor/components/cv-editor-view.tsx
src/features/cv-library/api/cv-library-api.ts
src/i18n/messages.ts
```

Tasks:

1. Add Copy Paste option when template creation needs profile structuring.
2. Keep Copy Paste available without API key.
3. Use shared structured modal.
4. Show profile preview before apply.
5. After apply, continue the template creation/editor opening flow.
6. Add translations.

## Prompt documentation

Update:

```txt
docs/prompts/extraccion-info-cv/prompt.md
```

Document:

- integrated structuring flow
- Copy Paste JSON envelope
- source data included
- template/locale context
- preview/apply behavior
- maintenance notes

## Tests

Backend:

- prepare prompt for owned CV
- reject missing CV
- reject CV without extracted text
- preview valid profile JSON
- reject invalid profile JSON
- apply saves profile with `external-chat`
- no AI service call

E2E:

```txt
e2e/cv-profile-template-copy-paste.spec.ts
```

Scenarios:

1. Start template creation without API key.
2. Copy Paste option visible.
3. Prompt prepares and copies.
4. Invalid JSON is rejected.
5. Valid profile JSON previews completeness.
6. Apply creates/saves profile.
7. Template editor opens with imported profile.

## Verification commands

```bash
npm run test:backend -- cv-library
npm run ddd:check
npm run build
npm run test:e2e -- cv-profile-template-copy-paste
```

## Non-goals

- manual initial profile creation redesign
- CV editor instruction Copy Paste
- profile diff editor
- redaction/minimization
- preview tokens
