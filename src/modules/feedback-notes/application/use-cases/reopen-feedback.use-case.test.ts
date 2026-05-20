import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import { createDefaultContext, createFeedbackFixture, makeFeedbackDeps } from "../../test-helpers";
import { ReopenFeedbackUseCase } from "./reopen-feedback.use-case";

describe("ReopenFeedbackUseCase", () => {
  it("reopens closed feedback", async () => {
    const user = await createTestUser("feedback-reopen");
    const { feedbackRepo, tracker } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);
    feedback.close(new Date().toISOString());
    await feedbackRepo.save(feedback);

    const reopened = await new ReopenFeedbackUseCase({
      feedbackRepo,
      tracker,
    }).execute(user.id, feedback.id);

    expect(reopened.toPrimitives()).toMatchObject({
      status: "active",
      closed_at: null,
    });
    expect(tracker.record).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "feedback_reopened" })
    );
  });
});
