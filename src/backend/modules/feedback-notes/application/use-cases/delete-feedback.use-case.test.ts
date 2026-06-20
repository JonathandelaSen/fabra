import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import { UserId } from "@/backend/modules/shared";
import {
  createDefaultContext,
  createEntryFixture,
  createFeedbackFixture,
  makeFeedbackDeps,
} from "../../test-helpers";
import { FeedbackEntryId } from "../../domain/value-objects/feedback-entry-id.value-object";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";
import { DeleteFeedbackUseCase } from "./delete-feedback.use-case";

describe("DeleteFeedbackUseCase", () => {
  it("hard deletes feedback and cascades entries", async () => {
    const user = await createTestUser("feedback-delete");
    const { feedbackRepo, entryRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);
    const entry = await createEntryFixture(user.id, feedback.id);

    await new DeleteFeedbackUseCase({ feedbackRepo, eventBus }).execute(
      user.id,
      feedback.id
    );

    const userId = UserId.fromPrimitives(user.id);
    await expect(
      feedbackRepo.findById(FeedbackId.fromPrimitives(feedback.id), userId),
    ).resolves.toBeNull();
    await expect(
      entryRepo.findById(FeedbackEntryId.fromPrimitives(entry.id), userId),
    ).resolves.toBeNull();

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_deleted");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: feedback.id,
    });
  });
});
