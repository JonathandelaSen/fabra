import {
  CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
  CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
} from "./cv-editor-copy-paste-workflow";
import type { BuildCVProfileEditingCopyPastePromptInput } from "./cv-profile-editing-copy-paste-prompt-service";

export class CVProfileEditingPrompt {
  build(): string {
    return `You are an expert CV editor.

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
- Ensure every JSON string is closed before the next field; do not let link, email, or URL text absorb adjacent JSON keys or values.`;
  }

  buildForClipboard(input: BuildCVProfileEditingCopyPastePromptInput): string {
    return `${this.build()}

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
${this.templateContext(input)}${this.recommendations(input)}

Instruction:
${input.instruction}

Structured CV profile JSON:
${JSON.stringify(input.profile)}`;
  }

  private templateContext(
    input: BuildCVProfileEditingCopyPastePromptInput,
  ): string {
    return input.templateId || input.locale
      ? `\nTemplate context:\n- Template id: ${input.templateId ?? "unknown"}\n- Template locale: ${input.locale ?? "es"}`
      : "";
  }

  private recommendations(
    input: BuildCVProfileEditingCopyPastePromptInput,
  ): string {
    return input.recommendations?.length
      ? `\nRelevant recommendations from previous analysis:\n${input.recommendations
          .map((item) => `- ${item}`)
          .join("\n")}`
      : "";
  }
}
