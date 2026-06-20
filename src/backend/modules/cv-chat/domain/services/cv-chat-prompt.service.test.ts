import { describe, expect, it } from "vitest";
import { CVChatPromptService } from "./cv-chat-prompt.service";

describe("CVChatPromptService", () => {
  const service = new CVChatPromptService();

  it("returns the JSON-shaped system instruction", () => {
    expect(service.systemInstruction()).toContain(
      '{ "answer": "<final assistant answer>" }',
    );
  });

  it("uses the current CV and recent conversation without offer context", () => {
    const prompt = service.build({
      message: "How can I improve the summary?",
      cv: {
        id: "cv-1",
        name: "Current CV",
        type: "template",
        profile: { basics: { summary: "Frontend engineer" } },
      } as never,
      cvText: "Frontend engineer with React experience",
      history: [{ role: "assistant", content: "Previous advice" }],
    });

    expect(prompt).toContain("CURRENT CV SUMMARY");
    expect(prompt).toContain("Current CV");
    expect(prompt).toContain("CURRENT CV EXTRACTED TEXT");
    expect(prompt).toContain("Previous advice");
    expect(prompt).not.toContain("JOB POSTING");
    expect(prompt).not.toContain("LINKED ANALYSIS");
  });

  it("requires the answer to match the language of the latest user message", () => {
    const prompt = service.build({
      message: "¿Cómo puedo mejorar el resumen?",
      history: [{ role: "assistant", content: "Previous advice" }],
    });

    expect(prompt).toContain(
      "Reply in the language used by the latest user message",
    );
    expect(prompt).toContain(
      "Do not default to English because the CV context or conversation history is in English",
    );
  });
});
