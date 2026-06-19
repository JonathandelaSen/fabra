import { describe, expect, it, vi } from "vitest";
import { ReplaceCVPublicNotesUseCase } from "./manage-cv-public-notes.use-case";

describe("ReplaceCVPublicNotesUseCase", () => {
  it("hydrates notes before saving them", async () => {
    const repo = { listForOwner: vi.fn(), listForPublishedCV: vi.fn(), replaceForOwner: vi.fn(async (input) => input.notes) };
    const result = await new ReplaceCVPublicNotesUseCase(repo).execute({ cvId: crypto.randomUUID(), userId: crypto.randomUUID(), notes: [{ anchorType: "presentation", sectionId: null, anchorId: null, body: "Hello" }] });
    expect(result[0].toPrimitives().body).toBe("Hello");
  });
});
