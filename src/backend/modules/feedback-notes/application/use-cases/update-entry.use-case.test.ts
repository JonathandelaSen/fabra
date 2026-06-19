import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import {
  createDefaultContext,
  createEntryFixture,
  createFeedbackFixture,
  makeFeedbackDeps,
} from "../../test-helpers";
import { UpdateEntryUseCase } from "./update-entry.use-case";

describe("UpdateEntryUseCase", () => {
  it("updates an entry for active feedback", async () => {
    const user = await createTestUser("feedback-update-entry");
    const { feedbackRepo, entryRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);
    const entry = await createEntryFixture(user.id, feedback.id);

    const updated = await new UpdateEntryUseCase({
      feedbackRepo,
      entryRepo,
      eventBus,
    }).execute(user.id, entry.id, "Updated note");

    expect(updated.toPrimitives().content).toBe("Updated note");

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_entry_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      entryId: entry.id,
    });
  });
});
