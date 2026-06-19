import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import { createDefaultContext, createFeedbackFixture, makeFeedbackDeps } from "../../test-helpers";
import { CloseFeedbackUseCase } from "./close-feedback.use-case";

describe("CloseFeedbackUseCase", () => {
  it("closes feedback and publishes event", async () => {
    const user = await createTestUser("feedback-close");
    const { feedbackRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);

    const closed = await new CloseFeedbackUseCase({
      feedbackRepo,
      eventBus,
    }).execute(user.id, feedback.id);

    expect(closed.toPrimitives().status).toBe("closed");
    expect(closed.toPrimitives().closed_at).toEqual(expect.any(String));

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_closed");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: feedback.id,
    });
  });
});
