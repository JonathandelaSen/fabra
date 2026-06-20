import type { DraftEntryInput } from "../repositories/journal-ai-service.repository";

export class WorkJournalEntryPrompt {
  systemInstruction(): string {
    return `You help users keep a private work journal.
Rewrite rough notes into a concise first-person factual journal entry.
Keep the language of the user's notes.
Do not invent metrics, outcomes, technologies, dates, roles, or impact.
Preserve uncertainty when the notes are uncertain.
Return JSON only.`;
  }

  build(input: DraftEntryInput): string {
    return `Rewrite these rough work-journal notes into a first-person factual entry.

${this.context(input)}

Original notes:
${input.notes}

Return this JSON shape:
{
  "final_text": "first-person factual journal entry"
}`;
  }

  buildForClipboard(input: DraftEntryInput): string {
    return `You help users keep a private work journal.
Rewrite rough notes into a concise first-person factual journal entry.
Keep the language of the user's notes.
Do not invent metrics, outcomes, technologies, dates, roles, or impact.
Preserve uncertainty when the notes are uncertain.

${this.context(input)}

Original notes:
${input.notes}

Return only the final text in plain text.`;
  }

  private context(input: DraftEntryInput): string {
    return `Context:
- Type: ${input.context.type}
- Name: ${input.context.name}
- Role/label: ${input.context.roleOrLabel ?? "not provided"}
- Date start: ${input.dateStart}
- Date end: ${input.dateEnd ?? "same day / not provided"}
- Topic: ${input.topic ?? "not provided"}`;
  }
}
