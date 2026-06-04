import { describe, expect, it } from "vitest";
import { buildCVProfileStructuringCopyPastePrompt, SYSTEM_PROMPT } from "./cv-profile-structuring-prompts";

describe("cv profile structuring prompts", () => {
  it("instructs the model to keep contact fields as plain data", () => {
    expect(SYSTEM_PROMPT).toContain("Return plain data strings only");
    expect(SYSTEM_PROMPT).toContain("never return \"[name@example.com](mailto:name@example.com)\"");
    expect(SYSTEM_PROMPT).toContain("use that same text for both label and url");
    expect(SYSTEM_PROMPT).toContain("URLs and emails become clickable in the template renderer");
  });

  it("includes the plain-data rules in the copy-paste prompt", () => {
    const prompt = buildCVProfileStructuringCopyPastePrompt({
      text: "jonathandelasen@gmail.com\ngithub.com/JonathandelaSen",
      templateId: "modern",
      locale: "en",
    });

    expect(prompt).toContain("For basics.email, return only the raw email address exactly as written");
    expect(prompt).toContain("github.com/JonathandelaSen");
    expect(prompt).toContain("Template id: modern");
    expect(prompt).toContain("Template locale: en");
  });
});
