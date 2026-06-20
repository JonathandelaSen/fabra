import { describe, expect, it } from "vitest";
import { CVScoringPromptService } from "./cv-scoring-prompt.service";

describe("CVScoringPromptService", () => {
  const service = new CVScoringPromptService();

  it("includes the persona and JSON contract in the integrated prompt", () => {
    const prompt = service.build({});

    expect(prompt).toContain("elite recruiter and CV consultant");
    expect(prompt).toContain("You must respond ONLY with valid JSON");
  });

  it("adds the additional-context block only when provided", () => {
    const withContext = service.build({ additionalContext: "targeting staff role" });
    const withoutContext = service.build({});

    expect(withContext).toContain("targeting staff role");
    expect(withoutContext).not.toContain("Additional context from the user");
  });

  it("uses the named-language instruction for a known language", () => {
    expect(service.build({ language: "es" })).toContain(
      '"feedback" and "improvements" in Spanish.',
    );
    expect(service.build({ language: "zz" })).toContain(
      "in the same language as the CV",
    );
  });

  it("wraps the integrated prompt in the copy-paste envelope", () => {
    const prompt = service.buildForClipboard({ text: "CV body" });

    expect(prompt).toContain("elite recruiter and CV consultant");
    expect(prompt).toContain('"workflowId": "cv_analysis.score"');
    expect(prompt).toContain("CV body");
  });
});
