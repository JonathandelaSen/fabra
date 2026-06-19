import { describe, expect, it, vi } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import { createReceivedFeedbackFixture, makeReceivedFeedbackDeps } from "../../test-helpers";
import { DeleteReceivedFeedbackUseCase } from "./delete-received-feedback.use-case";

describe("DeleteReceivedFeedbackUseCase", () => {
  it("deletes feedback and publishes domain events", async () => {
    const user = await createTestUser("received-feedback-delete");
    const existing = await createReceivedFeedbackFixture(user.id);
    const { receivedFeedbackRepo } = makeReceivedFeedbackDeps();
    const eventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    await new DeleteReceivedFeedbackUseCase({
      receivedFeedbackRepo,
      eventBus: eventBus as never,
    }).execute(user.id, existing.id);

    await expect(receivedFeedbackRepo.findById(existing.idValue, existing.userIdValue)).resolves.toBeNull();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("received_feedback_deleted");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: existing.id,
    });
  });
});
