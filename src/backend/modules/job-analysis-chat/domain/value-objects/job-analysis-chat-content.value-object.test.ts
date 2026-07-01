import { describe, expect, it } from "vitest";
import { JobAnalysisChatContent, InvalidJobAnalysisChatContentError } from "./job-analysis-chat-content.value-object";

describe("JobAnalysisChatContent", () => {
  it("trims and round-trips content", () => {
    expect(JobAnalysisChatContent.fromPrimitives("  Hola  ").toPrimitives()).toBe(
      "Hola",
    );
  });

  it("rejects blank content", () => {
    expect(() => JobAnalysisChatContent.fromPrimitives(" ")).toThrow(
      InvalidJobAnalysisChatContentError,
    );
  });
});
