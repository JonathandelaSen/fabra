import { describe, expect, it } from "vitest";
import {
  OFFER_CHAT_SYSTEM_PROMPT,
  buildOfferChatPrompt,
} from "./job-analysis-chat-prompts";

describe("job analysis chat prompts", () => {
  it("defines evidence hierarchy and actionable coaching behavior", () => {
    expect(OFFER_CHAT_SYSTEM_PROMPT).toContain(
      "job posting and CV as primary evidence",
    );
    expect(OFFER_CHAT_SYSTEM_PROMPT).toContain(
      "analysis as useful interpretation",
    );
    expect(OFFER_CHAT_SYSTEM_PROMPT).toContain(
      "language of the user's latest message",
    );
    expect(OFFER_CHAT_SYSTEM_PROMPT).not.toContain("Reply in Spanish");
    expect(OFFER_CHAT_SYSTEM_PROMPT).toContain("Lead with the conclusion");
    expect(OFFER_CHAT_SYSTEM_PROMPT).toContain("what the user must not claim");
    expect(OFFER_CHAT_SYSTEM_PROMPT).toContain("Return ONLY valid JSON");
  });

  it("labels primary and secondary context and limits history", () => {
    const prompt = buildOfferChatPrompt({
      message: "¿Cómo explico este gap?",
      analysis: {
        title: "Backend Engineer",
        job_description: "Redis is required.",
        ai_feedback: "Redis is missing.",
      } as never,
      cvText: "Built high-throughput APIs.",
      history: Array.from({ length: 14 }, (_, index) => ({
        role: index % 2 === 0 ? ("user" as const) : ("assistant" as const),
        content: `message-${index}`,
      })),
    });

    expect(prompt).toContain("LATEST USER QUESTION");
    expect(prompt).toContain("JOB POSTING (primary evidence)");
    expect(prompt).toContain("LINKED ANALYSIS (secondary interpretation");
    expect(prompt).not.toMatch(/: message-0(?:\n|$)/);
    expect(prompt).not.toMatch(/: message-1(?:\n|$)/);
    expect(prompt).toMatch(/: message-2(?:\n|$)/);
    expect(prompt).toMatch(/: message-13(?:\n|$)/);
  });
});
