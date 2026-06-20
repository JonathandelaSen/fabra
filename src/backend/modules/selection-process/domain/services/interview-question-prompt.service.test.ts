import { describe, expect, it } from "vitest";
import { InterviewQuestionPromptService } from "./interview-question-prompt.service";

describe("InterviewQuestionPromptService", () => {
  const service = new InterviewQuestionPromptService();
  const input = {
    question: "Tell me about a hard decision",
    context: "Led a migration with a tight deadline",
  };

  it("returns the JSON-shaped system instruction", () => {
    expect(service.systemInstruction()).toContain(
      'Return ONLY valid JSON with this shape: { "answer": "<final answer>" }.',
    );
  });

  it("includes the question and context in the integrated prompt", () => {
    const prompt = service.build(input);

    expect(prompt).toContain("Tell me about a hard decision");
    expect(prompt).toContain("Led a migration with a tight deadline");
    expect(prompt).toContain("Create the best possible answer");
  });

  it("renders a plain-text copy-paste prompt with the privacy note", () => {
    const prompt = service.buildForClipboard(input);

    expect(prompt).toContain("Privacy note for the user");
    expect(prompt).toContain("Return only the answer as plain text");
    expect(prompt).not.toContain('Return ONLY valid JSON with this shape');
  });
});
