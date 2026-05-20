import { describe, expect, it } from "vitest";
import { createTestUser, getSupabaseClient } from "@/modules/test-helpers/setup";
import { activityContextsModule } from "@/lib/container";
import { createFeedbackFixture, makeFeedbackDeps } from "../../test-helpers";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { UpdateFeedbackUseCase } from "./update-feedback.use-case";

describe("UpdateFeedbackUseCase", () => {
  it("updates person name, final feedback, and context", async () => {
    const user = await createTestUser("feedback-update");
    const { feedbackRepo, tracker } = makeFeedbackDeps();

    const supabase = getSupabaseClient();
    activityContextsModule.bindRequest(supabase);
    const context1 = await activityContextsModule.createActivityContext.execute({
      userId: user.id,
      type: "project",
      name: "Context 1",
    });
    const context2 = await activityContextsModule.createActivityContext.execute({
      userId: user.id,
      type: "project",
      name: "Context 2",
    });

    const feedback = await createFeedbackFixture(user.id, context1.id, "Jon");

    const updated = await new UpdateFeedbackUseCase({
      feedbackRepo,
      tracker,
    }).execute(user.id, feedback.id, {
      person_name: "Jon - 2026",
      final_feedback: "Final",
      activity_context_id: context2.id,
    });

    expect(updated.toPrimitives()).toMatchObject({
      person_name: "Jon - 2026",
      final_feedback: "Final",
      activity_context_id: context2.id,
    });
    expect(tracker.record).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "feedback_final_feedback_updated" })
    );
  });

  it("rejects updates when feedback is closed", async () => {
    const user = await createTestUser("feedback-update-closed");
    const { feedbackRepo, tracker } = makeFeedbackDeps();

    const supabase = getSupabaseClient();
    activityContextsModule.bindRequest(supabase);
    const context = await activityContextsModule.createActivityContext.execute({
      userId: user.id,
      type: "project",
      name: "Context",
    });

    const feedback = await createFeedbackFixture(user.id, context.id, "Jon");
    feedback.close(new Date().toISOString());
    await feedbackRepo.save(feedback);

    await expect(
      new UpdateFeedbackUseCase({ feedbackRepo, tracker }).execute(
        user.id,
        feedback.id,
        { final_feedback: "Nope" }
      )
    ).rejects.toBeInstanceOf(FeedbackClosedError);
  });
});
