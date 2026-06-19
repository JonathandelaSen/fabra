import {
  CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
  CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-editor-copy-paste-workflow";
import { SYSTEM_PROMPT } from "./cv-profile-editing-prompts";
import type { StandardCVProfile } from "../../domain/cv-profile";

export function buildCVProfileEditingCopyPastePrompt(input: {
  profile: StandardCVProfile;
  instruction: string;
  templateId?: string | null;
  locale?: string | null;
  recommendations?: string[];
}): string {
  const recommendations = input.recommendations?.length
    ? `\nRelevant recommendations from previous analysis:\n${input.recommendations
        .map((item) => `- ${item}`)
        .join("\n")}`
    : "";

  const templateContext =
    input.templateId || input.locale
      ? `\nTemplate context:\n- Template id: ${input.templateId ?? "unknown"}\n- Template locale: ${input.locale ?? "es"}`
      : "";

  return `${SYSTEM_PROMPT}

Copy Paste transport instructions:
- Return only valid JSON.
- Do not include Markdown, comments, or explanation outside the JSON object.
- Inside JSON string values, use Markdown only where the system prompt allows narrative-field Markdown.
- Contact fields must stay scalar and clean: use "email": "name@example.com" and "url": "https://example.com", never "email": "[name@example.com](mailto:name@example.com)" or "url": "[example](https://example.com)".
- Before returning, verify that every URL, email, and string field ends before the next JSON key. If a link-like value would require Markdown, split it into the existing "label" and "url" fields instead.
- Use this exact envelope:
{
  "workflowId": "${CV_EDITOR_COPY_PASTE_WORKFLOW_ID}",
  "schemaVersion": "${CV_EDITOR_COPY_PASTE_SCHEMA_VERSION}",
  "result": { /* the full edited CV profile JSON */ }
}
${templateContext}${recommendations}

Instruction:
${input.instruction}

Structured CV profile JSON:
${JSON.stringify(input.profile)}`;
}
