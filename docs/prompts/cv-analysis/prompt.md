# CV Analysis

## Source
- Prompt source file: `src/backend/modules/cv-analysis/domain/services/cv-scoring.prompt.ts`
- Integrated prompt builder: `CVScoringPromptService.build`
- Copy Paste prompt builder: `CVScoringPromptService.buildForClipboard`
- Model controller: `src/modules/cv-analysis/infrastructure/services/gemini-cv-scoring-ai.service.ts`
- Route: `POST /api/cv-analyses/[id]/score`
- Copy Paste routes:
  - `POST /api/cv-analyses/[id]/score/copy-paste/prepare`
  - `POST /api/cv-analyses/[id]/score/copy-paste/preview`
  - `POST /api/cv-analyses/[id]/score/copy-paste/apply`

## Current Prompt

The prompt frames the model as an elite recruiter (Big Tech technical recruiting, executive search, ATS implementation, 50,000+ CVs screened) and evaluates the CV against a weighted expert rubric. See `CVScoringPromptService.build` in `src/backend/modules/cv-analysis/domain/services/cv-scoring.prompt.ts` for the full literal text.

Rubric dimensions and weights:

1. **First impression and positioning (10%)** — 6-8 second scan test on the top third, professional summary quality, penalizes generic objectives and unproven adjectives.
2. **Quantified impact and achievements (20%)** — XYZ test ("Accomplished X, measured by Y, by doing Z"), metric density across bullets, action verbs vs. responsibility-speak, inflated-claim detection.
3. **ATS readability and extraction quality (15%)** — extraction artifacts as proxy for real ATS parsing failures (columns, tables, graphics), standard section headings, contact info in body text, parseable month+year dates.
4. **Structure, organization and length (10%)** — section order by seniority, length norms (~1 page <5 years, 2 pages standard), bullet discipline, recency-weighted detail.
5. **Career narrative and timeline (15%)** — gaps >6 months, job-hopping patterns, progression coherence, visible internal promotions, plausible titles.
6. **Skills, keywords and credibility (15%)** — skills backed by experience evidence, keyword-stuffing detection, skills taxonomy, currency of technologies, missing industry-standard keywords.
7. **Language, consistency and professionalism (10%)** — single language, tense consistency, spelling/grammar as attention-to-detail proxy, no risky personal data.
8. **Differentiation and seniority calibration (5%)** — expectations calibrated to apparent seniority, genuine differentiators (OSS, publications, talks, awards).

Scoring calibration bands instruct the model to use the full 0-100 range and avoid clustering in the 70-85 comfort zone: 90-100 exceptional (top 1-2%), 75-89 strong, 60-74 solid with clear weaknesses, 40-59 substantial rework needed, 0-39 fails basic screening.

Output requirements ask for: a diagnosis that opens with the verdict and strongest asset and references concrete CV fragments as evidence; improvements ordered by screening impact and specific to the analyzed CV (e.g., before/after bullet rewrites); and keywords actually present in the CV.

**Response language:** both builders accept an optional `language` parameter (interface language, currently `en` or `es`). When provided, the prompt instructs the model to write `feedback` and `improvements` in that language. When absent, the model is told to match the predominant language of the CV itself. The frontend injects the active `next-intl` locale: `useScoreCVAnalysis()` defaults `language` to `useLocale()` for the integrated flow, and the Copy Paste modal passes it on `prepare`; the route handlers validate it with `isInterfaceLanguage` and forward it through `ScoreCVAnalysisUseCase` / `PrepareCVScoreCopyPasteUseCase` into the prompt builders.

The JSON contract is unchanged:

```json
{
  "score": <number from 0 to 100>,
  "feedback": "<Comprehensive summary of strengths and weaknesses. Be specific and actionable, in the response language defined above.>",
  "keywordsFound": ["<relevant keyword or skill found in the CV>", ...],
  "cvKeywords": ["<relevant keyword or skill found in the CV>", ...],
  "improvements": ["<specific, actionable improvement in the response language defined above>", ...]
}
```

If `ai_context.additionalContext` is empty, the context block is omitted. When present, it is used to calibrate seniority expectations without assuming a specific target role unless the context states one.

## Current Copy Paste Prompt

`CVScoringPromptService.buildForClipboard` reuses the same semantic CV scoring task as `CVScoringPromptService.build`, then adds transport instructions for external chat usage:

```text
Copy Paste transport instructions:
- Return only valid JSON.
- Do not include Markdown, comments, or explanation outside the JSON object.
- Inside string values, never use raw double-quote characters. When you quote a fragment of the CV, wrap it in single quotes ('like this'). This is critical: an unescaped double quote inside a string makes the whole response unparseable.
- Use this exact envelope:
{
  "workflowId": "cv_analysis.score",
  "schemaVersion": "1",
  "result": {
    "score": <number from 0 to 100>,
    "feedback": "<Comprehensive summary of strengths and weaknesses. Be specific and actionable, in the response language defined above.>",
    "keywords": ["<relevant keyword or skill found in the CV>", ...],
    "improvements": ["<specific, actionable improvement in the response language defined above>", ...]
  }
}

Analyze this extracted CV text:
{extracted CV text}
```

The Copy Paste parser accepts pure JSON or one fenced `json` block, but the prompt asks for pure JSON to reduce user correction loops.

## Data Inputs
- User content sent to the model: extracted CV text from the selected analysis.
- System instruction data: optional `ai_context.additionalContext` and optional `language` (interface language used for the response language instruction).
- Output parser: `parseAIResult`, which reads score, feedback, keywords, CV keywords, and improvements.
- Copy Paste source data: the same extracted CV text selection used by integrated scoring, plus optional additional context entered in the CV analysis form.
- Copy Paste output parser: shared envelope validation for `workflowId: "cv_analysis.score"` and `schemaVersion: "1"`, followed by CV scoring result validation for score, feedback, keywords, and improvements.

## Runtime Flow
1. `POST /api/cv-analyses/[id]/score` validates the authenticated request and scoring payload.
2. `ScoreCVAnalysisUseCase` loads the analysis owned by the current user.
3. `ScoreCVAnalysisUseCase` creates an AI interaction and attempt ID, publishes infrastructure events for the prepared prompt and sent request, and calls the provider-aware AI service.
4. The provider service builds this prompt with `CVScoringPromptService.build` and sends the extracted CV text as the user message.
5. The parsed JSON result produces a validated-response infrastructure event before it is applied to the analysis.
6. The JSON result is persisted on `cv_analyses`, the domain event is published, and an applied infrastructure event completes the interaction.
7. Provider failures publish an `ai_runtime.failed` infrastructure event before being rethrown.

## Copy Paste Runtime Flow

1. `prepare` authenticates the user, loads the selected analysis, selects the extracted CV text, builds the external-chat prompt, creates interaction and attempt IDs, publishes `ai_runtime.prompt_prepared`, and returns the prompt with its correlation IDs.
2. The user runs the prompt in an external chat product and pastes the response back into the app.
3. `preview` receives the correlation IDs, publishes the raw received response, parses and validates the envelope and result shape, publishes the validated result or validation failure, and returns a summary preview without persisting the analysis.
4. `apply` receives the same correlation IDs, revalidates the previewed result, persists it on `cv_analyses` with `aiModel: "external-chat"`, and publishes `ai_runtime.result_applied`.

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
Integrated and Copy Paste prompts must stay semantically aligned: same scoring criteria, same data meaning, and same persisted result shape. When `CVScoringPromptService.build`, `CVScoringPromptService.buildForClipboard`, expected JSON output, model input data, Copy Paste envelope validation, or scoring controller behavior changes, update this document in the same change.
