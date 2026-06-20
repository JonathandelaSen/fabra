import { describe, expect, it } from "vitest";
import { CVProfileEditingPromptService } from "./cv-profile-editing-prompt.service";
import type { StandardCVProfile } from "../cv-profile";

describe("CVProfileEditingPromptService", () => {
  const service = new CVProfileEditingPromptService();
  const profile = { basics: { name: "Jane" } } as unknown as StandardCVProfile;

  it("includes the editor rules in the integrated prompt", () => {
    const prompt = service.build();

    expect(prompt).toContain("You are an expert CV editor");
    expect(prompt).toContain("Return ONLY valid JSON");
    expect(prompt).toContain('Preserve the "presentation" object exactly');
  });

  it("includes the envelope, instruction and profile in the copy-paste prompt", () => {
    const prompt = service.buildForClipboard({
      profile,
      instruction: "Shorten the summary",
      templateId: "modern",
      locale: "en",
      recommendations: ["Add metrics"],
    });

    expect(prompt).toContain("You are an expert CV editor");
    expect(prompt).toContain("Shorten the summary");
    expect(prompt).toContain("Template id: modern");
    expect(prompt).toContain("Add metrics");
    expect(prompt).toContain('"name":"Jane"');
  });
});
