import {
  JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
  JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
} from "../value-objects/job-match-copy-paste-constants";

const RESPONSE_LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
};

function resolveResponseLanguageInstruction(
  language?: string | null,
): string {
  const languageName = language
    ? RESPONSE_LANGUAGE_NAMES[language.trim().toLowerCase()]
    : undefined;
  return languageName
    ? `Write "feedback", "improvements", and "jobKeyData.notablePoints" in ${languageName}.`
    : `Write "feedback", "improvements", and "jobKeyData.notablePoints" in the same language as the CV, using its predominant language when the CV mixes languages.`;
}

export function buildJobMatchScoringPrompt(
  jobDescription: string,
  jobUrl?: string | null,
  language?: string | null,
): string {
  const languageInstruction = resolveResponseLanguageInstruction(language);
  const urlBlock = jobUrl?.trim()
    ? `\nThe source URL provided by the user is: ${jobUrl.trim()}\n`
    : "";

  return `You are an elite technical recruiter and hiring-committee screener with 20+ years of experience across agency search, in-house Big Tech recruiting, and ATS keyword-matching systems. You have screened over 50,000 CVs against job specifications and you know exactly how a real screen works: a hard-requirements gate, an ATS keyword match, and a hiring-manager judgement call on seniority, domain, and evidence. Your task is to compare the extracted text from a PDF resume against a specific job posting and produce the most complete match analysis available.

The job description is:
---
${jobDescription}
---
${urlBlock}
Step 1 — Deconstruct the job posting like a recruiter taking an intake briefing:
- Separate MUST-HAVE requirements (explicit "required", years of experience, specific technologies, certifications, languages, work authorization, location/on-site constraints) from NICE-TO-HAVE ones ("plus", "bonus", "ideally", "valorable").
- Identify the real seniority of the role from scope and responsibilities, not just the title.
- Extract the structured job data faithfully. If a field is not present in the job posting, use null or an empty array. Do not invent salary, holidays, company, or benefits.
- Note hidden signals worth surfacing in "notablePoints": unusual conditions, on-call duties, travel, equity-heavy compensation, vague responsibilities, scope/title mismatch, or red flags a candidate should weigh.

Step 2 — Evaluate the match using this expert rubric. Each dimension contributes to the final 0-100 score with the indicated weight:

1. Must-have requirements coverage (35%) — the gate that decides most rejections
- Check each must-have against the CV. Match semantically, not just literally: count synonyms, equivalent technologies, and umbrella terms (e.g., "React" satisfies "modern JavaScript framework"; "GCP" partially covers "cloud experience" when AWS is asked).
- Distinguish evidence strength: a requirement backed by a quantified achievement in a recent role counts fully; a bare mention in a skills list counts weakly; absence counts as missing.
- Years-of-experience requirements: estimate from the CV timeline; do not take the skills list's word for it.
- A candidate missing one or more true must-haves cannot score above ~60 overall, no matter how strong the rest is. Say which must-haves fail.

2. Nice-to-have coverage and differentiators (10%)
- Coverage of preferred qualifications, plus extras the posting did not ask for but the hiring team would value (domain-adjacent experience, OSS, certifications).

3. Seniority and scope alignment (15%)
- Compare the role's real seniority with the candidate's trajectory: team size led, ownership scope, strategic vs. executional work.
- Penalize both underqualification and significant overqualification (flight risk / salary mismatch in a screener's eyes), and say which one applies.

4. Domain, industry and context fit (10%)
- Same industry, similar product type, similar company stage (startup vs. enterprise), similar regulatory context. Transferable but non-identical domain experience earns partial credit — explain the transfer.

5. Recency and currency of matching skills (10%)
- A required skill last used 8 years ago is a weak match. Weight matches by how recently and how centrally they appear in the work history.

6. ATS keyword alignment (10%)
- How well the CV's literal vocabulary matches the posting's vocabulary. Exact-term gaps matter even when the competence exists, because real ATS filters miss synonyms — flag terms the candidate demonstrably has but spells differently than the posting.

7. Practical and logistical fit (10%)
- Location/relocation/remote compatibility, working language requirements, work authorization if mentioned, contract type expectations. Use only what the CV and posting state; flag unknowns as risks to verify rather than assuming.

Step 3 — Score calibration. Use the full 0-100 range like a screener deciding who gets a phone call:
- 90-100: exceptional match — all must-haves with strong evidence, right seniority, right domain. Would be fast-tracked. Rare.
- 75-89: strong match — all or nearly all must-haves covered, minor gaps in nice-to-haves or domain. Clear interview.
- 60-74: plausible match — most must-haves covered but with weak evidence, or a seniority/domain stretch. Phone screen at best.
- 40-59: weak match — at least one true must-have missing or major seniority/domain mismatch. Likely auto-rejected.
- 0-39: not a match for this posting as the CV stands.
Do not cluster scores in the 70-85 comfort zone; the score must follow from the rubric, and the feedback must justify it.

Output requirements:
- ${languageInstruction} Keep extracted job-posting fields ("requirements", "responsibilities", "benefits", "title", etc.) faithful to the posting's own wording and language.
- "feedback": open with the screener's verdict (would this CV pass the screen for this posting, and why), then the strongest matches with their evidence, then the decisive gaps in order of severity, distinguishing real competence gaps from presentation/keyword gaps. Reference concrete fragments of the CV and the posting. Be direct and specific — no generic filler.
- "improvements": concrete, prioritized actions to raise THIS CV's chances for THIS posting, ordered by screening impact. Presentation fixes first (rewording, surfacing buried evidence, adding the posting's exact terms the candidate already has, quantifying a relevant achievement — suggest before/after where useful), then honest guidance on real gaps (what to learn or how to reframe transferable experience). Never advise inventing experience.
- Keyword fields: use the posting's terminology, deduplicated, most important first. "matchingKeywords" must appear in both texts (semantic equivalents allowed — use the posting's spelling); "missingKeywords" are important posting terms with no equivalent in the CV.

You must respond ONLY with valid JSON using this exact format:
{
  "score": <number from 0 to 100, where 100 means perfect match>,
  "feedback": "<Detailed screener-style analysis of how well the resume matches the job posting, in the response language defined above.>",
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
}`;
}

export function buildJobMatchScoringCopyPastePrompt(input: {
  text: string;
  jobDescription: string;
  jobUrl?: string | null;
  language?: string | null;
}): string {
  const systemTask = buildJobMatchScoringPrompt(
    input.jobDescription,
    input.jobUrl,
    input.language,
  );

  return `${systemTask}

Copy Paste transport instructions:
- Return only valid JSON.
- Do not include Markdown, comments, or explanation outside the JSON object.
- Use this exact envelope:
{
  "workflowId": "${JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID}",
  "schemaVersion": "${JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION}",
  "result": {
    "score": <number from 0 to 100>,
    "feedback": "<Detailed screener-style analysis in the response language defined above>",
    "aiKeywords": ["<keyword from job description found in resume>", ...],
    "jobKeywords": ["<important keyword from the job posting>", ...],
    "cvKeywords": ["<relevant keyword found in the CV>", ...],
    "matchingKeywords": ["<keyword present in both job posting and CV>", ...],
    "missingKeywords": ["<important job keyword missing from the CV>", ...],
    "improvements": ["<specific change to better match this job posting, in the response language defined above>", ...],
    "jobKeyData": {
      "title": "<job title or null>",
      "company": "<company name or null>",
      "location": "<location or null>",
      "remote": "<remote/hybrid/onsite signal or null>",
      "salary": "<salary/compensation if explicit or null>",
      "seniority": "<seniority if explicit or inferable, or null>",
      "contractType": "<contract type if explicit or null>",
      "benefits": ["<benefit or empty>", ...],
      "requirements": ["<key requirement>", ...],
      "responsibilities": ["<key responsibility>", ...],
      "notablePoints": ["<brief relevant point>", ...]
    }
  }
}

Analyze this extracted CV text:
${input.text}`;
}
