import { describe, expect, it } from "vitest";
import { JobAnalysisChatTitle } from "./job-analysis-chat-title.value-object";

describe("JobAnalysisChatTitle", () => {
  it("trims a valid title", () => {
    expect(
      JobAnalysisChatTitle.fromPrimitives("  Conversación  ").toPrimitives(),
    ).toBe("Conversación");
  });

  it("rejects blank titles", () => {
    expect(() => JobAnalysisChatTitle.fromPrimitives(" ")).toThrow(
      "Analysis chat title cannot be empty",
    );
  });
});
