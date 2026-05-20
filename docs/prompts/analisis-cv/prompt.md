# Analisis de CV

## Source
- Prompt source file: `src/modules/cv-analysis/infrastructure/services/cv-scoring-prompts.ts`
- Integrated prompt builder: `buildGeneralScoringPrompt`
- Copy Paste prompt builder: `buildCVScoringCopyPastePrompt`
- Model controller: `src/modules/cv-analysis/infrastructure/services/gemini-cv-scoring-ai.service.ts`
- Route: `POST /api/cv-analyses/[id]/score`
- Copy Paste routes:
  - `POST /api/cv-analyses/[id]/score/copy-paste/prepare`
  - `POST /api/cv-analyses/[id]/score/copy-paste/preview`
  - `POST /api/cv-analyses/[id]/score/copy-paste/apply`

## Current Prompt
```text
You are a senior CV/Resume consultant and ATS (Applicant Tracking System) expert. Your task is to perform a comprehensive general evaluation of the extracted text from a PDF resume.

The user provided the following context about their profile:
- Additional context from the user: {ai_context.additionalContext}
Use this information to tailor your general evaluation without assuming a specific role.

Evaluate ATS readability, text extraction quality, structure, organization, clarity, quantified impact, relevant skills, length, language consistency, and timeline clarity.

You must respond ONLY with valid JSON using this exact format:
{
  "score": <number from 0 to 100>,
  "feedback": "<Comprehensive summary of strengths and weaknesses. Be specific, actionable, and reply in Spanish.>",
  "keywordsFound": ["<relevant keyword or skill found in the CV>", ...],
  "cvKeywords": ["<relevant keyword or skill found in the CV>", ...],
  "improvements": ["<specific, actionable improvement in Spanish>", ...]
}
```

If `ai_context.additionalContext` is empty, the context block is omitted.

## Current Copy Paste Prompt

`buildCVScoringCopyPastePrompt` reuses the same semantic CV scoring task as `buildGeneralScoringPrompt`, then adds transport instructions for external chat usage:

```text
Copy Paste transport instructions:
- Return only valid JSON.
- Do not include Markdown, comments, or explanation outside the JSON object.
- Use this exact envelope:
{
  "workflowId": "cv_analysis.score",
  "schemaVersion": "1",
  "result": {
    "score": <number from 0 to 100>,
    "feedback": "<Comprehensive summary of strengths and weaknesses. Be specific, actionable, and reply in Spanish.>",
    "keywords": ["<relevant keyword or skill found in the CV>", ...],
    "improvements": ["<specific, actionable improvement in Spanish>", ...]
  }
}

Analyze this extracted CV text:
{extracted CV text}
```

The Copy Paste parser accepts pure JSON or one fenced `json` block, but the prompt asks for pure JSON to reduce user correction loops.

## Data Inputs
- User content sent to the model: extracted CV text from the selected analysis.
- System instruction data: optional `ai_context.additionalContext`.
- Output parser: `parseAIResult`, which reads score, feedback, keywords, CV keywords, and improvements.
- Copy Paste source data: the same extracted CV text selection used by integrated scoring, plus optional additional context entered in the CV analysis form.
- Copy Paste output parser: shared envelope validation for `workflowId: "cv_analysis.score"` and `schemaVersion: "1"`, followed by CV scoring result validation for score, feedback, keywords, and improvements.

## Runtime Flow
1. `POST /api/cv-analyses/[id]/score` validates the authenticated request and scoring payload.
2. `ScoreCVAnalysisUseCase` loads the analysis owned by the current user.
3. `GeminiCVScoringAIService` builds this prompt with `buildGeneralScoringPrompt` and sends the extracted CV text as the user message.
4. The JSON result is persisted through `UpdateCVAnalysisAIResultUseCase` on `cv_analyses`.

## Copy Paste Runtime Flow

1. `prepare` authenticates the user, loads the selected analysis, selects the extracted CV text, builds the external-chat prompt, returns the expected JSON envelope, and shows a privacy notice.
2. The user runs the prompt in an external chat product and pastes the response back into the app.
3. `preview` parses the response, validates the envelope and result shape, and returns a summary preview without persisting the analysis.
4. `apply` revalidates the previewed result, persists it on `cv_analyses` with `aiModel: "external-chat"`, and records Copy Paste observability metadata.

## JSON Envelope

```json
{
  "workflowId": "cv_analysis.score",
  "schemaVersion": "1",
  "result": {
    "score": 88,
    "feedback": "Resumen accionable en español.",
    "keywords": ["TypeScript", "React"],
    "improvements": ["Añade métricas de impacto."]
  }
}
```

Validation rejects responses for another workflow, unsupported schema versions, missing result objects, scores outside `0..100`, missing feedback, and non-string list items.

## Maintenance
Integrated and Copy Paste prompts must stay semantically aligned: same scoring criteria, same data meaning, and same persisted result shape. When `buildGeneralScoringPrompt`, `buildCVScoringCopyPastePrompt`, expected JSON output, model input data, Copy Paste envelope validation, or scoring controller behavior changes, update this document in the same change.
