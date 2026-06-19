import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import { createDefaultContext, createFeedbackFixture, makeFeedbackDeps } from "../../test-helpers";
import { ReopenFeedbackUseCase } from "./reopen-feedback.use-case";

describe("ReopenFeedbackUseCase", () => {
  it("reopens closed feedback", async () => {
    const user = await createTestUser("feedback-reopen");
    const { feedbackRepo, eventBus } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);
    feedback.close(new Date().toISOString());
    await feedbackRepo.save(feedback);

    const reopened = await new ReopenFeedbackUseCase({
      feedbackRepo,
      eventBus,
    }).execute(user.id, feedback.id);

    expect(reopened.toPrimitives()).toMatchObject({
      status: "active",
      closed_at: null,
    });

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_reopened");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: feedback.id,
    });
  });
});
