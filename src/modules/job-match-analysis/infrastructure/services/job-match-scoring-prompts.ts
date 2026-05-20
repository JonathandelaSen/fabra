import {
  JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
  JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/value-objects/job-match-copy-paste-constants";

export function buildJobMatchScoringPrompt(
  jobDescription: string,
  jobUrl?: string | null,
): string {
  const urlBlock = jobUrl?.trim()
    ? `\nThe source URL provided by the user is: ${jobUrl.trim()}\n`
    : "";

  return `You are a strict ATS recruiter and job-posting analyst. Compare the extracted text from a PDF resume against a specific job posting.

The job description is:
---
${jobDescription}
---
${urlBlock}
Return the comparison and the job-posting summary as structured data. If a field is not present in the job posting, use null or an empty array. Do not invent salary, holidays, company, or benefits.

You must respond ONLY with valid JSON using this exact format:
{
  "score": <number from 0 to 100, where 100 means perfect match>,
  "feedback": "<Detailed analysis in Spanish of how well the resume matches the job posting. Highlight strongest matches and biggest gaps.>",
  "keywordsFound": ["<keyword from job description found in resume>", ...],
  "jobKeywords": ["<important keyword or requirement from the job posting>", ...],
  "cvKeywords": ["<relevant keyword or skill found in the CV>", ...],
  "matchingKeywords": ["<keyword present in both job posting and CV>", ...],
  "missingKeywords": ["<important job keyword missing from the CV>", ...],
  "improvements": ["<specific change to better match this job posting, in Spanish>", ...],
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
}): string {
  const systemTask = buildJobMatchScoringPrompt(
    input.jobDescription,
    input.jobUrl,
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
    "feedback": "<Detailed analysis in Spanish>",
    "aiKeywords": ["<keyword from job description found in resume>", ...],
    "jobKeywords": ["<important keyword from the job posting>", ...],
    "cvKeywords": ["<relevant keyword found in the CV>", ...],
    "matchingKeywords": ["<keyword present in both job posting and CV>", ...],
    "missingKeywords": ["<important job keyword missing from the CV>", ...],
    "improvements": ["<specific change to better match this job posting, in Spanish>", ...],
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
