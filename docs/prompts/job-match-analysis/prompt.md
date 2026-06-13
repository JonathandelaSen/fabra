# Job Match Analysis

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

## Source
- Prompt source file: `src/modules/job-match-analysis/infrastructure/services/job-match-scoring-prompts.ts`
- Integrated prompt builder: `buildJobMatchScoringPrompt`
- Copy Paste prompt builder: `buildJobMatchScoringCopyPastePrompt`
- Model controller: `src/modules/job-match-analysis/infrastructure/services/gemini-job-match-scoring-ai.service.ts`
- Integrated route: `POST /api/job-match-analyses/[id]/score`
- Copy Paste routes:
  - `POST /api/job-match-analyses/[id]/score/copy-paste/prepare`
  - `POST /api/job-match-analyses/[id]/score/copy-paste/preview`
  - `POST /api/job-match-analyses/[id]/score/copy-paste/apply`

## Current Prompt

The prompt frames the model as an elite technical recruiter and hiring-committee screener (agency search, in-house Big Tech recruiting, ATS keyword-matching systems, 50,000+ CVs screened against specs) and structures the analysis in three steps. See `buildJobMatchScoringPrompt` in `src/modules/job-match-analysis/infrastructure/services/job-match-scoring-prompts.ts` for the full literal text.

**Step 1 — Job-posting deconstruction (intake briefing):** separate must-have requirements (explicit "required", years, technologies, certifications, languages, work authorization, location constraints) from nice-to-haves; infer the role's real seniority from scope rather than title; extract structured job data faithfully (never inventing salary, holidays, company, or benefits); surface hidden signals (on-call, travel, equity-heavy comp, scope/title mismatch, red flags) in `notablePoints`.

**Step 2 — Weighted match rubric:**

1. **Must-have requirements coverage (35%)** — semantic matching (synonyms, equivalent tech, umbrella terms), evidence strength (quantified achievement > bare skills-list mention > missing), timeline-based years estimation. A missing true must-have caps the overall score at ~60.
2. **Nice-to-have coverage and differentiators (10%)**.
3. **Seniority and scope alignment (15%)** — penalizes both under- and overqualification, naming which.
4. **Domain, industry and context fit (10%)** — partial credit for transferable domains with explanation.
5. **Recency and currency of matching skills (10%)** — matches weighted by recency and centrality in the history.
6. **ATS keyword alignment (10%)** — literal vocabulary gaps flagged even when the competence exists under another spelling.
7. **Practical and logistical fit (10%)** — location/remote, working language, authorization, contract type; unknowns flagged as risks rather than assumed.

**Step 3 — Score calibration** as a screener deciding who gets a call, using the full 0-100 range without clustering in 70-85: 90-100 fast-track, 75-89 clear interview, 60-74 phone screen at best, 40-59 likely auto-rejected, 0-39 not a match.

Output requirements ask for: feedback that opens with the screener's verdict, then strongest matches with evidence, then decisive gaps by severity, distinguishing real competence gaps from presentation/keyword gaps; improvements prioritized by screening impact, presentation fixes first (exact-term additions, before/after rewrites) then honest guidance on real gaps, never advising invented experience; keyword fields in the posting's terminology, deduplicated and ordered by importance.

The JSON contract is unchanged:

```json
{
  "score": <number from 0 to 100, where 100 means perfect match>,
  "feedback": "<Detailed screener-style analysis, in the response language defined above.>",
  "keywordsFound": ["<keyword from job description found in resume>", ...],
  "jobKeywords": ["<important keyword or requirement from the job posting>", ...],
  "cvKeywords": ["<relevant keyword or skill found in the CV>", ...],
  "matchingKeywords": ["<keyword present in both job posting and CV>", ...],
  "missingKeywords": ["<important job keyword missing from the CV>", ...],
  "improvements": ["<specific change to better match this job posting, in the response language defined above>", ...],
  "jobKeyData": {
    "title": "<job title or null>",
    "company": "<company name or null>",
    "location": "<location or null>",
    "remote": "<remote/hybrid/onsite signal or null>",
    "salary": "<salary/compensation if explicit or null>",
    "seniority": "<seniority if explicit or inferable from requirements, or null>",
    "contractType": "<contract type if explicit or null>",
    "benefits": ["<benefit, vacation, perk, or empty>", ...],
    "requirements": ["<key requirement>", ...],
    "responsibilities": ["<key responsibility>", ...],
    "notablePoints": ["<brief relevant point, condition, warning, or differentiator>", ...]
  }
}
```

If `job_url` is empty, the URL block is omitted.

**Response language:** both builders accept an optional `language` parameter (interface language, currently `en` or `es`). When provided, the prompt instructs the model to write `feedback`, `improvements`, and `jobKeyData.notablePoints` in that language; when absent, to match the predominant language of the CV. Extracted job-posting fields (`requirements`, `responsibilities`, `benefits`, etc.) stay faithful to the posting's own wording. The frontend injects the active `next-intl` locale: `useJobMatchAnalysisMutations().scoreAnalysis` defaults `language` to `useLocale()` for the integrated flow, and the Copy Paste modal passes it on `prepare`. Route handlers validate it with `isInterfaceLanguage` and forward it through `ScoreJobMatchAnalysisUseCase` / `PrepareJobMatchScoreCopyPasteUseCase` into the prompt builders.

## Data Inputs
- User content sent to the model: extracted CV text from the selected analysis.
- System instruction data: `job_description`, optional `job_url`, and optional `language` (interface language used for the response language instruction).
- Output parser: `parseAIResult`, including `jobKeyData`, `jobKeywords`, `matchingKeywords`, and `missingKeywords`.

## Runtime Flow
1. `POST /api/job-match-analyses/[id]/score` validates the authenticated request and scoring payload.
2. `ScoreJobMatchAnalysisUseCase` loads the job-match analysis owned by the current user.
3. `GeminiJobMatchScoringAIService` builds this prompt with `buildJobMatchScoringPrompt` and sends the extracted CV text as the user message.
4. The result is persisted on `job_match_analyses` and later powers offer tabs, tracking, interview questions, and offer chat.

## Copy Paste Workflow

### Envelope
```json
{
  "workflowId": "job_match_analysis.score",
  "schemaVersion": "1",
  "result": { ... same fields as integrated result, using aiKeywords instead of keywordsFound ... }
}
```

### Copy Paste Prompt
`buildJobMatchScoringCopyPastePrompt` reuses the integrated system prompt from `buildJobMatchScoringPrompt` and appends:
- JSON-only transport instructions
- Envelope shape with `workflowId` and `schemaVersion`
- Expected `result` schema
- The extracted CV text

### Copy Paste Runtime Flow
1. `prepare`: Loads analysis, extracts CV text, builds copy-paste prompt, returns prompt + privacy notice.
2. User copies prompt to external chat, runs it, gets JSON response.
3. `preview`: Parses JSON, validates envelope and result schema, returns preview summary + parsed result.
4. `apply`: Revalidates parsed result, persists with `aiModel: "external-chat"`, records observability with `assistanceMode: "copy_paste"`.

### Data Included in Copy Paste Prompt
- Extracted CV text (fallback: textPython > textPdfjs > textNode)
- Job description
- Job URL (if provided)

### Privacy
Non-blocking warning: "This prompt may include CV data and context you entered."

### Validation
- Strict JSON envelope: exact `workflowId` and `schemaVersion`
- Score: number 0-100
- Feedback: non-empty string
- Array fields: arrays of strings
- jobKeyData: object or null
- Extra fields are preserved

## Maintenance
When `buildJobMatchScoringPrompt`, `buildJobMatchScoringCopyPastePrompt`, their output JSON shapes, or the offer fields sent to the model change, update this document in the same change. Integrated and Copy Paste prompt semantics must stay aligned.
