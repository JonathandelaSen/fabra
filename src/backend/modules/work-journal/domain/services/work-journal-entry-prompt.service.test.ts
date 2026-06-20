import { describe, expect, it } from "vitest";
import { WorkJournalEntryPromptService } from "./work-journal-entry-prompt.service";
import type { DraftEntryInput } from "../repositories/journal-ai-service.repository";

describe("WorkJournalEntryPromptService", () => {
  const service = new WorkJournalEntryPromptService();
  const input = {
    context: { type: "project", name: "Apollo", roleOrLabel: "Lead" },
    dateStart: "2026-06-01",
    dateEnd: null,
    topic: "migration",
    notes: "shipped the new pipeline",
  } as unknown as DraftEntryInput;

  it("returns the JSON-only system instruction", () => {
    expect(service.systemInstruction()).toContain("Return JSON only.");
  });

  it("builds an integrated prompt asking for the final_text JSON shape", () => {
    const prompt = service.build(input);

    expect(prompt).toContain("Rewrite these rough work-journal notes");
    expect(prompt).toContain("Apollo");
    expect(prompt).toContain("shipped the new pipeline");
    expect(prompt).toContain('"final_text"');
  });

  it("builds a plain-text copy-paste prompt with the rules embedded", () => {
    const prompt = service.buildForClipboard(input);

    expect(prompt).toContain("You help users keep a private work journal.");
    expect(prompt).toContain("Return only the final text in plain text.");
    expect(prompt).not.toContain('"final_text"');
  });
});
