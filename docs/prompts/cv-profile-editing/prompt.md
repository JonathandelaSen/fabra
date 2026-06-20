# CV Profile Editing

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

## Source
- Prompt source file: `src/backend/modules/cv-library/domain/services/cv-profile-editing-prompts.ts`
- Copy Paste prompt service: `src/backend/modules/cv-library/infrastructure/services/cv-profile-editing-copy-paste-prompt.service.ts`
- System prompt constant: `SYSTEM_PROMPT`
- Use case (integrated): `EditCVProfileWithAIUseCase` in `src/backend/modules/cv-library/application/use-cases/edit-cv-profile-with-ai.use-case.ts`
- Use cases (copy paste): `PrepareCVEditorCopyPasteUseCase`, `PreviewCVEditorCopyPasteUseCase`, `ApplyCVEditorCopyPasteUseCase`
- Model controller: provider-aware `ProviderCVProfileEditingAIServiceFactory` selects mock or Gemini and delegates Gemini calls to `src/backend/modules/cv-library/infrastructure/services/gemini-cv-profile-editing-ai.service.ts`
- Response parser: `parseEditedCVProfile` (integrated), `validateCVProfileCopyPasteResult` (copy paste)

## Current Prompt
```text
You are an expert CV editor.

Edit the provided structured CV profile according to the user's natural-language instruction.

Critical rules:
- Return ONLY valid JSON matching the same structured CV profile schema.
- Preserve all factual information unless the user explicitly asks to replace or remove it.
- Do not invent employers, dates, titles, metrics, credentials, links, or skills.
- You may rewrite, shorten, reorder, or clarify existing text when requested.
- Keep the profile language consistent with the user's CV unless the user explicitly asks for another language.
- Do not change visual styling, colors, fonts, template configuration, or layout metadata.
- Preserve the "presentation" object exactly if it exists; it controls user-owned section titles, section order, and accent color.
- Keep every field inside the JSON profile shape; do not include commentary or markdown.
- Limited Markdown is allowed only in narrative fields: profile summary, experience bullets, education details, and named-item descriptions or bullets. You may preserve existing Markdown and may add moderate emphasis, but do not overuse it.
- The only Markdown syntax allowed in narrative fields is **bold**, *italic*, ***bold italic***, and explicit links like [label](https://example.com).
- Do not invent links. Add Markdown links only when the URL is already present or the user explicitly provides it.
- Never use Markdown in names, roles, companies, institutions, degrees, fields, dates, locations, direct URL fields, section titles, skills, language labels, or technical-skill chips. Emails must be plain addresses, and URL fields must be plain URLs or domains.
- Ensure every JSON string is closed before the next field; do not let link, email, or URL text absorb adjacent JSON keys or values.
```

## Copy Paste JSON Envelope

```json
{
  "workflowId": "cv_editor.apply_instruction",
  "schemaVersion": "1",
  "result": { /* full edited CV profile JSON */ }
}
```

The result shape is the full edited profile (same schema as integrated mode), not a patch.

Copy Paste transport rules additionally require:
- No Markdown outside the JSON object.
- Markdown inside JSON string values only where the system prompt allows narrative-field Markdown.
- Contact fields remain scalar and clean: `email` is a plain address, and `url` is a plain URL/domain.
- Links use separate `label` and `url` fields instead of Markdown link syntax.
- The model must verify that URL/email strings are closed before the next JSON key.

## Data Inputs
- User content sent to the model:
  - `instruction`
  - template context: `templateId` and `locale`
  - optional recommendations from previous analysis
  - structured CV profile JSON
- System instruction data: editing safety rules and output contract.
- The integrated controller always restores the original `presentation` object after parsing.
- The Copy Paste prompt service (`CVProfileEditingCopyPastePromptService`) includes the system prompt, envelope instructions, template context, recommendations, instruction, and full profile JSON in a single prompt string.
- Narrative fields may contain limited inline Markdown that is stored as plain strings and rendered by the manual editor preview/public CV/PDF surfaces. Non-narrative fields remain plain text.

## Runtime Flow

### Integrated mode
1. `EditCVProfileWithAIUseCase` creates the configured provider-selected editing service for the request.
2. The service builds a user message from the instruction, template context, recommendations, and profile JSON.
3. The selected provider receives the fixed `SYSTEM_PROMPT` as `systemInstruction`.
4. `parseEditedCVProfile` normalizes and validates the returned profile.
5. The original presentation metadata is preserved before returning.

### Copy Paste mode
1. `PrepareCVEditorCopyPasteUseCase` loads the template CV, builds a prompt including the current profile, instruction, template context, and recommendations.
2. User copies the prompt into an external chat and pastes the JSON response.
3. `PreviewCVEditorCopyPasteUseCase` extracts the JSON envelope, validates the workflow ID and schema version, validates the profile data, and computes a diff preview (changed sections).
4. `ApplyCVEditorCopyPasteUseCase` re-validates the profile and persists via `UpdateTemplateCVDocumentProfileUseCase` with `aiModel: "external-chat"`.

## Diff Preview Behavior
The preview step compares the current profile against the edited profile section by section (basics, summary, experience, education, skills, etc.) and reports which sections changed. A warning is shown when more than 5 sections changed (large rewrite).

## Maintenance
When `SYSTEM_PROMPT`, `EditCVProfileWithAIUseCase`, `CVProfileEditingCopyPastePromptService`, recommendations handling, narrative Markdown rules, or presentation preservation changes, update this document in the same change.
