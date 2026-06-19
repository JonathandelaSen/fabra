import { describe, expect, it, vi } from "vitest";
import { createTestUser, getDefaultActivityContextId } from "@/backend/modules/test-helpers/setup";
import { makeReceivedFeedbackDeps } from "../../test-helpers";
import { CreateReceivedFeedbackUseCase } from "./create-received-feedback.use-case";

describe("CreateReceivedFeedbackUseCase", () => {
  it("creates received feedback and publishes domain events", async () => {
    const user = await createTestUser("received-feedback-create");
    const activityContextId = await getDefaultActivityContextId(user.id);
    const { receivedFeedbackRepo } = makeReceivedFeedbackDeps();
    const eventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const feedback = await new CreateReceivedFeedbackUseCase({
      receivedFeedbackRepo,
      eventBus: eventBus as never,
    }).execute({
      userId: user.id,
      activityContextId,
      receivedDate: "2026-05-01",
      giverName: " Manager ",
      feedbackText: " Keep raising risks early. ",
      userNote: "",
      today: "2026-05-12",
    });

    expect(feedback.toPrimitives()).toMatchObject({
      userId: user.id,
      receivedDate: "2026-05-01",
      giverName: "Manager",
      feedbackText: "Keep raising risks early.",
      userNote: null,
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("received_feedback_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: feedback.id,
    });
  });
});
