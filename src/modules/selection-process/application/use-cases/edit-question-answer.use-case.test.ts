import { describe, expect, it, vi } from "vitest";
import { EditQuestionAnswerUseCase } from "./edit-question-answer.use-case";
import {
  processQuestion,
  processQuestionRepo,
  readModel,
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

describe("EditQuestionAnswerUseCase", () => {
  it("edits an answer via AI and saves it", async () => {
    const existing = readModel({
      question: processQuestion({ answer: "Old answer" }),
    });
    const ai = aiService();
    const repo = processQuestionRepo({ findById: async () => existing });
    const bus = eventBus();
    const result = await new EditQuestionAnswerUseCase({
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
      instruction: "Make it shorter",
    });

    expect(ai.editAnswer).toHaveBeenCalledOnce();
    expect(ai.editAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        currentAnswer: "Old answer",
        instruction: "Make it shorter",
      }),
    );
    expect(result?.question.toPrimitives()).toMatchObject({
      answer: "Edited answer",
      aiModel: "gemini-test",
    });

    expect(bus.publish).toHaveBeenCalledTimes(4);
    const publishedEvents = bus.publish.mock.calls[2][0];
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
    const result = await new EditQuestionAnswerUseCase({
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
      instruction: "edit",
    });

    expect(result).toBeNull();
  });
});
