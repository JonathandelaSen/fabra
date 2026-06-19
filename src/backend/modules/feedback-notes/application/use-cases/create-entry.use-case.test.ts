import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import { createDefaultContext, createFeedbackFixture, makeFeedbackDeps } from "../../test-helpers";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { CreateEntryUseCase } from "./create-entry.use-case";

describe("CreateEntryUseCase", () => {
  it("creates an entry for active feedback", async () => {
    const user = await createTestUser("feedback-create-entry");
    const { feedbackRepo, entryRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);

    const entry = await new CreateEntryUseCase({
      feedbackRepo,
      entryRepo,
      eventBus,
    }).execute({
      user_id: user.id,
      feedback_id: feedback.id,
      content: "Strong ownership.",
    });

    expect(entry.toPrimitives()).toMatchObject({
      feedback_id: feedback.id,
      content: "Strong ownership.",
    });

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_entry_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      entryId: entry.id,
      feedbackId: feedback.id,
    });
  });

  it("rejects entry creation for closed feedback", async () => {
    const user = await createTestUser("feedback-create-entry-closed");
    const { feedbackRepo, entryRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);
    feedback.close(new Date().toISOString());
    await feedbackRepo.save(feedback);

    await expect(
      new CreateEntryUseCase({ feedbackRepo, entryRepo, eventBus }).execute({
        user_id: user.id,
        feedback_id: feedback.id,
        content: "Nope",
      })
    ).rejects.toBeInstanceOf(FeedbackClosedError);
  });
});
