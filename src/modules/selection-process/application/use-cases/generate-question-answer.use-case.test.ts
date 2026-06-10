import { describe, expect, it, vi } from "vitest";
import { GenerateQuestionAnswerUseCase } from "./generate-question-answer.use-case";
import {
  processQuestionRepo,
  eventBus,
} from "./selection-process-test-helpers.test";
import type { InterviewQuestionAIService } from "../../domain/repositories/interview-question-ai.service";

function aiService(
  overrides: Partial<InterviewQuestionAIService> = {},
): InterviewQuestionAIService {
  return {
    generateAnswer: vi.fn(async () => "Generated answer"),
    editAnswer: vi.fn(async () => "Edited answer"),
    ...overrides,
  };
}

describe("GenerateQuestionAnswerUseCase", () => {
  it("generates an answer via AI and saves it", async () => {
    const ai = aiService();
    const repo = processQuestionRepo();
    const bus = eventBus();
    const result = await new GenerateQuestionAnswerUseCase({
      questionRepo: repo,
      aiFactory: { create: vi.fn(() => ai) },
      eventBus: bus,
    }).execute({
      id: "question-1",
      userId: "user-1",
      provider: "mock",
      apiKey: "key",
      model: "gemini-test",
      context: "My context",
    });

    expect(ai.generateAnswer).toHaveBeenCalledOnce();
    expect(result?.question.toPrimitives()).toMatchObject({
      answer: "Generated answer",
      aiModel: "gemini-test",
    });

    expect(bus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = bus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("process_question_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      questionId: result?.question.id,
      fields: ["context", "answer", "aiModel", "aiGeneratedAt"],
    });
  });

  it("returns null when question does not exist", async () => {
    const repo = processQuestionRepo({ findById: async () => null });
    const ai = aiService();
    const bus = eventBus();
    const result = await new GenerateQuestionAnswerUseCase({
      questionRepo: repo,
      aiFactory: { create: vi.fn(() => ai) },
      eventBus: bus,
    }).execute({
      id: "missing",
      userId: "user-1",
      provider: "mock",
      apiKey: "key",
      model: "gemini-test",
      context: "ctx",
    });

    expect(result).toBeNull();
  });
});
