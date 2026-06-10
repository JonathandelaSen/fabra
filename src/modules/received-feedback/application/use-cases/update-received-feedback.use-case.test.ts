import { describe, expect, it, vi } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import { createReceivedFeedbackFixture, makeReceivedFeedbackDeps } from "../../test-helpers";
import { UpdateReceivedFeedbackUseCase } from "./update-received-feedback.use-case";

describe("UpdateReceivedFeedbackUseCase", () => {
  it("updates feedback and publishes domain events", async () => {
    const user = await createTestUser("received-feedback-update");
    const existing = await createReceivedFeedbackFixture(user.id);
    const { receivedFeedbackRepo } = makeReceivedFeedbackDeps();
    const eventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const updated = await new UpdateReceivedFeedbackUseCase({
      receivedFeedbackRepo,
      eventBus: eventBus as never,
    }).execute(user.id, existing.id, {
      receivedDate: "2026-05-02",
      giverName: "Lead",
      feedbackText: "Updated feedback.",
      userNote: null,
      today: "2026-05-12",
    });

    expect(updated.toPrimitives()).toMatchObject({
      receivedDate: "2026-05-02",
      giverName: "Lead",
      feedbackText: "Updated feedback.",
      userNote: null,
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("received_feedback_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: existing.id,
      fields: expect.arrayContaining(["receivedDate", "giverName", "feedbackText"]),
    });
  });
});
