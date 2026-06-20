import { describe, expect, it } from "vitest";
import { FeedbackNotesFinalPromptService } from "./feedback-notes-final-prompt.service";

describe("FeedbackNotesFinalPromptService", () => {
  const service = new FeedbackNotesFinalPromptService();
  const input = {
    personName: "Jon",
    entries: [
      {
        content: "Helped unblock the release.",
        created_at: "2026-05-11T10:00:00.000Z",
      },
    ],
  };

  it("returns the JSON-only system instruction", () => {
    expect(service.systemInstruction()).toContain("Return JSON only.");
  });

  it("includes the person name and dated entries in the integrated prompt", () => {
    const prompt = service.build(input);

    expect(prompt).toContain("Write final peer feedback for: Jon");
    expect(prompt).toContain("Date: 2026-05-11T10:00:00.000Z");
    expect(prompt).toContain("Helped unblock the release.");
    expect(prompt).toContain('"final_feedback"');
  });

  it("embeds the rules and asks for plain text in the copy-paste prompt", () => {
    const prompt = service.buildForClipboard(input);

    expect(prompt).toContain(
      "You help users turn private raw feedback notes into useful peer feedback.",
    );
    expect(prompt).toContain("Return only the final feedback in plain text.");
    expect(prompt).not.toContain('"final_feedback"');
  });
});
