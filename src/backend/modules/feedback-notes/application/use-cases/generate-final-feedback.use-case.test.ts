import { describe, expect, it, vi } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  createDefaultContext,
  createEntryFixture,
  createFeedbackFixture,
  makeFeedbackDeps,
} from "../../test-helpers";
import { FeedbackEntriesRequiredError } from "../../domain/errors/feedback-entries-required.error";
import { GenerateFinalFeedbackUseCase } from "./generate-final-feedback.use-case";
import { FinalFeedbackText } from "../../domain/value-objects/final-feedback-text.value-object";

describe("GenerateFinalFeedbackUseCase", () => {
  it("generates and stores final feedback from all entries", async () => {
    const user = await createTestUser("feedback-generate");
    const { feedbackRepo, entryRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id, "Jon");
    await createEntryFixture(user.id, feedback.id, "First note");
    await createEntryFixture(user.id, feedback.id, "Second note");
    const aiService = {
      generateFinalFeedback: vi.fn(async () =>
        FinalFeedbackText.fromPrimitives("Generated feedback"),
      ),
    };

    const updated = await new GenerateFinalFeedbackUseCase({
      feedbackRepo,
      entryRepo,
      aiFactory: { create: vi.fn(() => aiService) },
      eventBus,
    }).execute(user.id, feedback.id, { provider: "mock", model: "mock-model" });

    expect(aiService.generateFinalFeedback).toHaveBeenCalledWith({
      personName: "Jon",
      entries: expect.arrayContaining([
        expect.objectContaining({ content: "First note" }),
        expect.objectContaining({ content: "Second note" }),
      ]),
    });
    expect(updated.toPrimitives().final_feedback).toBe("Generated feedback");

    expect(eventBus.publish).toHaveBeenCalledTimes(4);
    const publishedEvents = eventBus.publish.mock.calls[2][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: feedback.id,
      fields: ["final_feedback"],
    });
  });

  it("requires at least one entry", async () => {
    const user = await createTestUser("feedback-generate-empty");
    const { feedbackRepo, entryRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);

    await expect(
      new GenerateFinalFeedbackUseCase({
        feedbackRepo,
        entryRepo,
        aiFactory: { create: vi.fn(() => ({ generateFinalFeedback: vi.fn() })) },
        eventBus,
      }).execute(user.id, feedback.id, { provider: "mock", model: "mock-model" })
    ).rejects.toBeInstanceOf(FeedbackEntriesRequiredError);
  });
});
