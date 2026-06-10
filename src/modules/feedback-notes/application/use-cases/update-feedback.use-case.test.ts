import { describe, expect, it } from "vitest";
import { createTestUser, getSupabaseClient } from "@/modules/test-helpers/setup";
import { activityContextsModule } from "@/lib/container";
import { createFeedbackFixture, makeFeedbackDeps } from "../../test-helpers";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { UpdateFeedbackUseCase } from "./update-feedback.use-case";

describe("UpdateFeedbackUseCase", () => {
  it("updates person name, final feedback, and context", async () => {
    const user = await createTestUser("feedback-update");
    const { feedbackRepo, eventBus } = makeFeedbackDeps();

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
      eventBus,
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

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(3);
    
    expect(publishedEvents[0].eventName).toBe("feedback_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: feedback.id,
      fields: ["person_name"],
    });

    expect(publishedEvents[1].eventName).toBe("feedback_updated");
    expect(publishedEvents[1].toPrimitives()).toEqual({
      feedbackId: feedback.id,
      fields: ["final_feedback"],
    });

    expect(publishedEvents[2].eventName).toBe("feedback_updated");
    expect(publishedEvents[2].toPrimitives()).toEqual({
      feedbackId: feedback.id,
      fields: ["activity_context_id"],
    });
  });

  it("rejects updates when feedback is closed", async () => {
    const user = await createTestUser("feedback-update-closed");
    const { feedbackRepo, eventBus } = makeFeedbackDeps();

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
      new UpdateFeedbackUseCase({ feedbackRepo, eventBus }).execute(
        user.id,
        feedback.id,
        { final_feedback: "Nope" }
      )
    ).rejects.toBeInstanceOf(FeedbackClosedError);
  });
});
