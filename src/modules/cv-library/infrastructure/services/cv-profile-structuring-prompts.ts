import {
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-profile-copy-paste-workflow";

export const SYSTEM_PROMPT = `You are a precise CV data extraction engine.

Extract the user's CV into the standard JSON schema below.

Critical rules:
- Do not invent any facts, dates, employers, education, skills, links, or achievements.
- Do not rewrite, optimize, embellish, or translate the user's professional content.
- Preserve the original language and wording from the CV as much as possible.
- If a field is missing, use null, an empty string, or an empty array as appropriate.
- Keep bullets faithful to the source text; only split obvious list items.
- Respond ONLY with valid JSON.

JSON format:
{
  "basics": {
    "name": "string",
    "headline": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "links": [{ "label": "string", "url": "string" }]
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "dates": { "start": "string", "end": "string", "current": false },
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "location": "string",
      "dates": { "start": "string", "end": "string", "current": false },
      "details": ["string"]
    }
  ],
  "skills": [{ "name": "string", "items": ["string"] }],
  "technicalSkills": ["string"],
  "languages": [{ "name": "string", "level": "string" }],
  "certifications": [{ "name": "string", "issuer": "string", "date": "string", "url": "string", "description": "string", "bullets": ["string"] }],
  "projects": [{ "name": "string", "organization": "string", "date": "string", "url": "string", "description": "string", "bullets": ["string"] }],
  "awards": [{ "name": "string", "issuer": "string", "date": "string", "description": "string", "bullets": ["string"] }],
  "publications": [{ "name": "string", "organization": "string", "date": "string", "url": "string", "description": "string", "bullets": ["string"] }],
  "volunteering": [{ "name": "string", "organization": "string", "date": "string", "description": "string", "bullets": ["string"] }]
}`;

export function buildCVProfileStructuringCopyPastePrompt(input: {
  text: string;
  templateId?: string | null;
  locale?: string | null;
}): string {
  const templateContext =
    input.templateId || input.locale
      ? `\nTemplate context:\n- Template id: ${input.templateId ?? "unknown"}\n- Template locale: ${input.locale ?? "es"}\n`
      : "";

  return `${SYSTEM_PROMPT}

Copy Paste transport instructions:
- Return only valid JSON.
- Do not include Markdown, comments, or explanation outside the JSON object.
- Use this exact envelope:
{
  "workflowId": "${CV_PROFILE_COPY_PASTE_WORKFLOW_ID}",
  "schemaVersion": "${CV_PROFILE_COPY_PASTE_SCHEMA_VERSION}",
  "result": {
    "basics": {
      "name": "string",
      "headline": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "links": [{ "label": "string", "url": "string" }]
    },
    "summary": "string",
    "experience": [],
    "education": [],
    "skills": [],
    "technicalSkills": [],
    "languages": [],
    "certifications": [],
    "projects": [],
    "awards": [],
    "publications": [],
    "volunteering": []
  }
}
${templateContext}
Extract this CV text:
${input.text}`;
}
