import { describe, expect, it } from "vitest";
import { CVProfileStructuringPromptService } from "./cv-profile-structuring-prompt.service";

describe("CVProfileStructuringPromptService", () => {
  const service = new CVProfileStructuringPromptService();

  it("instructs the model to keep contact fields as plain data", () => {
    const prompt = service.build();

    expect(prompt).toContain("Return plain data strings only");
    expect(prompt).toContain(
      'never return "[name@example.com](mailto:name@example.com)"',
    );
    expect(prompt).toContain("use that same text for both label and url");
    expect(prompt).toContain(
      "URLs and emails become clickable in the template renderer",
    );
  });

  it("instructs the model to build canonical platform URLs from bare handles", () => {
    const prompt = service.build();

    expect(prompt).toContain("https://www.linkedin.com/in/<handle>/");
    expect(prompt).toContain('"label" to "Platform/handle"');
  });

  it("includes the plain-data rules and template context in the copy-paste prompt", () => {
    const prompt = service.buildForClipboard({
      text: "jonathandelasen@gmail.com\ngithub.com/JonathandelaSen",
      templateId: "modern",
      locale: "en",
    });

    expect(prompt).toContain(
      "For basics.email, return only the raw email address exactly as written",
    );
    expect(prompt).toContain("github.com/JonathandelaSen");
    expect(prompt).toContain("Template id: modern");
    expect(prompt).toContain("Template locale: en");
  });
});
