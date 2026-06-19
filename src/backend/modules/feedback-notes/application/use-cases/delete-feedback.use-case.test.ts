import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  createDefaultContext,
  createEntryFixture,
  createFeedbackFixture,
  makeFeedbackDeps,
} from "../../test-helpers";
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

    await expect(feedbackRepo.findById(feedback.id, user.id)).resolves.toBeNull();
    await expect(entryRepo.findById(entry.id, user.id)).resolves.toBeNull();

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_deleted");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: feedback.id,
    });
  });
});
