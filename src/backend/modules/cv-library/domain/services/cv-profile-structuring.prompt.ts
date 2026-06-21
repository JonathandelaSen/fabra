import {
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
} from "./cv-profile-copy-paste-workflow";

export interface CVProfileStructuringCopyPastePromptInput {
  text: string;
  templateId?: string | null;
  locale?: string | null;
}

export class CVProfileStructuringPrompt {
  build(): string {
    return `You are a precise CV data extraction engine.

Extract the user's CV into the standard JSON schema below.

Critical rules:
- Do not invent any facts, dates, employers, education, skills, links, or achievements.
- Do not rewrite, optimize, embellish, or translate the user's professional content.
- Preserve the original language and wording from the CV as much as possible.
- If a field is missing, use null, an empty string, or an empty array as appropriate.
- Keep bullets faithful to the source text; only split obvious list items.
- Return plain data strings only. Do not put Markdown, HTML, mailto:, or clickable-link syntax inside any JSON string.
- For basics.email, return only the raw email address exactly as written, for example "name@example.com"; never return "[name@example.com](mailto:name@example.com)" or "mailto:name@example.com".
- For basics.links, keep each link as plain text: if the CV shows a bare URL such as "github.com/JonathandelaSen", use that same text for both label and url; but if it shows a platform name plus a handle without a full URL (e.g. "LinkedIn: jonathan-de-la-sen"), set "url" to the canonical profile URL and "label" to "Platform/handle" — LinkedIn "https://www.linkedin.com/in/<handle>/", GitHub "https://github.com/<handle>", X/Twitter "https://x.com/<handle>" (example: { "label": "LinkedIn/jonathan-de-la-sen", "url": "https://www.linkedin.com/in/jonathan-de-la-sen/" }).
- URLs and emails become clickable in the template renderer, not in the extracted JSON.
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
  }

  buildForClipboard(input: CVProfileStructuringCopyPastePromptInput): string {
    return `${this.build()}

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
${this.templateContext(input)}
Extract this CV text:
${input.text}`;
  }

  private templateContext(
    input: CVProfileStructuringCopyPastePromptInput,
  ): string {
    return input.templateId || input.locale
      ? `\nTemplate context:\n- Template id: ${input.templateId ?? "unknown"}\n- Template locale: ${input.locale ?? "es"}\n`
      : "";
  }
}
