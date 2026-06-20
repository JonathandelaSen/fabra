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
import { DeleteEntryUseCase } from "./delete-entry.use-case";

describe("DeleteEntryUseCase", () => {
  it("deletes an entry for active feedback", async () => {
    const user = await createTestUser("feedback-delete-entry");
    const { feedbackRepo, entryRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);
    const entry = await createEntryFixture(user.id, feedback.id);

    await new DeleteEntryUseCase({ feedbackRepo, entryRepo, eventBus }).execute(
      user.id,
      entry.id
    );

    await expect(
      entryRepo.findById(
        FeedbackEntryId.fromPrimitives(entry.id),
        UserId.fromPrimitives(user.id),
      ),
    ).resolves.toBeNull();

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_entry_deleted");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      entryId: entry.id,
    });
  });
});
