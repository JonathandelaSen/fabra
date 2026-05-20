# Assisted workflow implementation plan: CV editor instruction

## Workflow summary

Workflow id:

```txt
cv_editor.apply_instruction
```

Response kind:

```txt
json
```

This workflow applies a natural-language edit instruction to a structured CV profile. It is complex because users need a before/after diff before applying.

Manual support:

```txt
supported: true
kind: existing_screen
```

The CV editor already supports manual editing.

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

Do not stop for approval between phases. Implement end to end, validate with tests/build/E2E, fix failures, and leave changes uncommitted. The user gives final OK and commits/pushes manually.

Do not call real AI APIs.

## Expected user experience

1. User opens a template CV in the editor.
2. User writes an edit instruction.
3. User can use integrated AI or Copy Paste.
4. Copy Paste opens the shared structured JSON modal.
5. User copies prompt containing current profile, template context, recommendations, and instruction.
6. User pastes JSON response.
7. App validates edited profile or patch.
8. App shows a before/after diff preview.
9. User applies.
10. App updates the editor state/profile.
11. User saves through existing editor save behavior if that is how the editor works today.

## JSON envelope

```json
{
  "workflowId": "cv_editor.apply_instruction",
  "schemaVersion": "1",
  "result": {}
}
```

Result shape decision:

Prefer full edited profile if that matches current integrated service behavior. Use patch only if integrated editing already returns patch-like output.

## Shared UI requirements

Use shared structured JSON modal for copy/paste/review mechanics.

Feature wrapper:

```txt
src/features/cv-editor/components/cv-editor-copy-paste-modal.tsx
```

The wrapper owns:

- current profile
- instruction
- selected template/locale
- recommendations/context
- diff preview renderer
- editor state update after apply

Do not duplicate the shared modal.

## Backend plan

Current likely files:

```txt
src/app/api/cvs/[id]/edit/route.ts
src/app/api/cvs/[id]/structured-profile/edit/route.ts
src/modules/cv-library/application/use-cases/edit-cv-profile-with-ai.use-case.ts
src/modules/cv-library/infrastructure/services/cv-profile-editing-prompts.ts
docs/prompts/editado-cv/prompt.md
```

Add feature-specific routes:

```txt
POST /api/cvs/[id]/edit/copy-paste/prepare
POST /api/cvs/[id]/edit/copy-paste/preview
POST /api/cvs/[id]/edit/copy-paste/apply
```

Prepare:

- authenticate
- load current template CV/profile
- include instruction/template/locale/recommendations
- build Copy Paste prompt

Preview:

- validate envelope
- validate edited profile shape
- compute diff summary
- do not persist

Apply:

- revalidate edited profile
- persist or return updated version using existing edit/save use case
- mark `aiModel: "external-chat"` if persisted as AI-produced profile

## Frontend plan

Current likely files:

```txt
src/features/cv-editor/components/cv-editor-view.tsx
src/features/cv-editor/api/cv-editor-api.ts
src/features/cv-editor/hooks/use-cv-editor-mutations.ts
src/i18n/messages.ts
```

Tasks:

1. Add Copy Paste option beside integrated "apply instruction".
2. Keep Copy Paste available without API key.
3. Use shared structured modal.
4. Render diff preview:
   - changed sections
   - added/removed entries
   - summary changes
   - warnings if large rewrite
5. Apply updates editor state consistently with integrated edit behavior.
6. Do not autosave unless integrated edit currently autosaves.
7. Add translations.

## Prompt documentation

Update:

```txt
docs/prompts/editado-cv/prompt.md
```

Document:

- integrated edit flow
- Copy Paste JSON envelope
- full profile vs patch result shape
- diff preview behavior
- source data included
- maintenance notes

## Tests

Backend:

- prepare prompt for owned template CV
- reject non-template CV when required
- preview validates edited profile
- preview rejects invalid profile
- apply updates profile with external-chat provenance
- no AI service call

E2E:

```txt
e2e/cv-editor-copy-paste.spec.ts
```

Scenarios:

1. Open CV editor without API key.
2. Copy Paste action visible.
3. Prompt prepares from instruction.
4. Invalid JSON rejected.
5. Valid edited profile previews diff.
6. Apply updates editor preview/profile.
7. Manual editor still works.

## Verification commands

```bash
npm run test:backend -- cv-library
npm run ddd:check
npm run build
npm run test:e2e -- cv-editor-copy-paste
```

## Non-goals

- redesigning the manual CV editor
- implementing profile structuring Copy Paste
- global assistance settings
- preview tokens
- raw JSON editing in the modal
