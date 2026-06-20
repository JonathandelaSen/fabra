export interface FeedbackNotesFinalPromptEntry {
  content: string;
  created_at: string;
}

export interface FeedbackNotesFinalPromptInput {
  personName: string;
  entries: FeedbackNotesFinalPromptEntry[];
}

export class FeedbackNotesFinalPrompt {
  systemInstruction(): string {
    return `You help users turn private raw feedback notes into useful peer feedback.
Write in the same language as the notes, using the predominant language when notes are mixed.
Use only the notes provided. Do not invent facts, motivations, outcomes, dates, roles, or impact.
Write specific, constructive, kind, professional feedback that can be used in a real conversation.
Base the feedback on observable behavior. Preserve uncertainty when the notes are uncertain.
If the notes are sparse, keep the output appropriately brief instead of adding filler.
Return JSON only.`;
  }

  build(input: FeedbackNotesFinalPromptInput): string {
    return `Write final peer feedback for: ${input.personName}

Use these private raw notes as the only source material:

${this.entries(input)}

Return this JSON shape:
{
  "final_feedback": "free-form feedback text ready for the user to review and edit"
}`;
  }

  buildForClipboard(input: FeedbackNotesFinalPromptInput): string {
    return `Write final peer feedback for: ${input.personName}

You help users turn private raw feedback notes into useful peer feedback.
Write in the same language as the notes, using the predominant language when notes are mixed.
Use only the notes provided. Do not invent facts, motivations, outcomes, dates, roles, or impact.
Write specific, constructive, kind, professional feedback that can be used in a real conversation.
Base the feedback on observable behavior. Preserve uncertainty when the notes are uncertain.
If the notes are sparse, keep the output appropriately brief instead of adding filler.

Use these private raw notes as the only source material:

${this.entries(input)}

Return only the final feedback in plain text.`;
  }

  private entries(input: FeedbackNotesFinalPromptInput): string {
    return input.entries
      .map(
        (entry, index) =>
          `${index + 1}. Date: ${entry.created_at}\n   Note: ${entry.content}`,
      )
      .join("\n\n");
  }
}
