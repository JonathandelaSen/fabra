# CV Profile Structuring

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

## Source
- Prompt source file: `src/backend/modules/cv-library/domain/services/cv-profile-structuring.prompt.ts`
- System prompt constant: `CVProfileStructuringPromptService.build()`
- Copy Paste prompt builder: `CVProfileStructuringPromptService.buildForClipboard`
- Use case: `StructureCVProfileWithAIUseCase` in `src/modules/cv-library/application/use-cases/structure-cv-profile-with-ai.use-case.ts`
- Copy Paste use cases: `PrepareCVProfileStructureCopyPasteUseCase`, `PreviewCVProfileStructureCopyPasteUseCase`, and `ApplyCVProfileStructureCopyPasteUseCase` in `src/modules/cv-library/application/use-cases/`
- Model controller: provider-aware `ProviderCVProfileStructuringAIServiceFactory` selects mock or Gemini and delegates Gemini calls to `src/modules/cv-library/infrastructure/services/gemini-cv-profile-structuring-ai.service.ts`
- Schema version: `CV_PROFILE_SCHEMA_VERSION`

## Current Prompt
```text
You are a precise CV data extraction engine.

Extract the user's CV into the standard JSON schema below.

Critical rules:
- Do not invent any facts, dates, employers, education, skills, links, or achievements.
- Do not rewrite, optimize, embellish, or translate the user's professional content.
- Preserve the original language and wording from the CV as much as possible.
- If a field is missing, use null, an empty string, or an empty array as appropriate.
- Keep bullets faithful to the source text; only split obvious list items.
- Return plain data strings only. Do not put Markdown, HTML, mailto:, or clickable-link syntax inside any JSON string.
- For basics.email, return only the raw email address exactly as written, for example "name@example.com"; never return "[name@example.com](mailto:name@example.com)" or "mailto:name@example.com".
- For basics.links, keep each link as plain text: if the CV shows a bare URL such as "github.com/JonathandelaSen", use that same text for both label and url; but if it shows a platform name plus a handle without a full URL (e.g. "LinkedIn: jonathan-de-la-sen"), set "url" to the canonical profile URL and "label" to "Platform/handle" — LinkedIn "https://www.linkedin.com/in/<handle>/", GitHub "https://github.com/<handle>", X/Twitter "https://x.com/<handle>".
- URLs and emails become clickable in the template renderer, not in the extracted JSON.
- Respond ONLY with valid JSON.

JSON format:
{
  "basics": { "name": "string", "headline": "string", "email": "string", "phone": "string", "location": "string", "links": [{ "label": "string", "url": "string" }] },
  "summary": "string",
  "experience": [{ "company": "string", "role": "string", "location": "string", "dates": { "start": "string", "end": "string", "current": false }, "bullets": ["string"] }],
  "education": [{ "institution": "string", "degree": "string", "field": "string", "location": "string", "dates": { "start": "string", "end": "string", "current": false }, "details": ["string"] }],
  "skills": [{ "name": "string", "items": ["string"] }],
  "technicalSkills": ["string"],
  "languages": [{ "name": "string", "level": "string" }],
  "certifications": [{ "name": "string", "issuer": "string", "date": "string", "url": "string", "description": "string", "bullets": ["string"] }],
  "projects": [{ "name": "string", "organization": "string", "date": "string", "url": "string", "description": "string", "bullets": ["string"] }],
  "awards": [{ "name": "string", "issuer": "string", "date": "string", "description": "string", "bullets": ["string"] }],
  "publications": [{ "name": "string", "organization": "string", "date": "string", "url": "string", "description": "string", "bullets": ["string"] }],
  "volunteering": [{ "name": "string", "organization": "string", "date": "string", "description": "string", "bullets": ["string"] }]
}
```

## Copy Paste Prompt
`CVProfileStructuringPromptService.buildForClipboard` reuses the same extraction task as `CVProfileStructuringPromptService.build()`, then adds external-chat transport instructions. The external response must be pure JSON with this envelope:

```json
{
  "workflowId": "cv_profile.structure_for_template",
  "schemaVersion": "1",
  "result": {}
}
```

`result` must contain the standard CV profile shape documented above. The prompt includes the extracted CV text plus optional template context:

- `templateId`, when the structuring flow is launched from template creation.
- `locale`, used as template locale context.

The Copy Paste flow does not call a real AI provider. The user copies the prompt, runs it in an external trusted chat, and pastes the JSON envelope back into the app.

## Data Inputs
- User content sent to the model: extracted CV text.
- System instruction data: fixed standard CV schema and extraction rules.
- Output normalizer: `normalizeStandardCVProfile`.

## Contact Field Rules
- `basics.email` must be the raw email address only, with no Markdown links, HTML anchors, or `mailto:` prefix.
- `basics.links[].label` should preserve the visible link text from the CV. For a bare URL, the label and url should both be that same bare URL.
- `basics.links[].url` must be plain URL text, with no Markdown link syntax.
- When the CV only provides a platform name plus a handle (no domain), the prompt instructs the model to emit the canonical platform URL and a `Platform/handle` label. This is handled in the prompt only; `normalizeStandardCVProfile` does not force link labels or URLs, so manually edited links are preserved verbatim.
- Clickability is handled by the CV template renderer after parsing; the AI response must not encode click behavior in the JSON strings.

## Runtime Flow
1. CV text is extracted before structuring.
2. `StructureCVProfileWithAIUseCase` creates the configured provider-selected structuring service for the request.
3. The service sends the raw CV text as the user message.
4. The JSON response is normalized and returned with `CV_PROFILE_SCHEMA_VERSION`.

## Copy Paste Runtime Flow
1. `prepare` authenticates the user, loads the owned CV, selects the best extracted CV text, adds template/locale context, builds the external-chat prompt, and returns the expected JSON envelope metadata plus a privacy notice.
2. `preview` parses the pasted JSON, validates exact `workflowId` and `schemaVersion`, normalizes the standard profile schema, and returns a read-only preview with detected sections, missing important fields, locale context, completeness, and external-chat origin.
3. `apply` revalidates the parsed profile, upserts the structured profile with `aiModel: "external-chat"`, and, when launched from template creation, creates the editable template CV version through the normal template document flow.

## Maintenance
When `CVProfileStructuringPromptService.build()`, `CVProfileStructuringPromptService.buildForClipboard`, the standard CV profile schema, the Copy Paste envelope, template/locale input context, preview/apply behavior, or `CV_PROFILE_SCHEMA_VERSION` changes, update this document in the same change.
