import { describe, expect, it } from "vitest";
import { CVPublicNote } from "./cv-public-note.entity";

describe("CVPublicNote", () => {
  it("trims and returns primitives", () => {
    const note = CVPublicNote.fromPrimitives({
      id: crypto.randomUUID(),
      cvId: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      anchorType: "section",
      sectionId: "experience",
      anchorId: null,
      body: " Context ",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(note.toPrimitives().body).toBe("Context");
  });
  it("rejects blank notes", () => {
    expect(() =>
      CVPublicNote.fromPrimitives({
        id: crypto.randomUUID(),
        cvId: crypto.randomUUID(),
        userId: crypto.randomUUID(),
        anchorType: "presentation",
        sectionId: null,
        anchorId: null,
        body: " ",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ).toThrow();
  });
});
