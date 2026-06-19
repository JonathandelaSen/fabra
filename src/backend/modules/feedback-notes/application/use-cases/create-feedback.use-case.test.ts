import { describe, expect, it } from "vitest";
import { createTestUser, getSupabaseClient } from "@/modules/test-helpers/setup";
import { activityContextsModule } from "@/lib/container";
import { makeFeedbackDeps } from "../../test-helpers";
import { CreateFeedbackUseCase } from "./create-feedback.use-case";

describe("CreateFeedbackUseCase", () => {
  it("creates feedback and publishes event", async () => {
    const user = await createTestUser("feedback-create");
    const { feedbackRepo, eventBus } = makeFeedbackDeps();

    const supabase = getSupabaseClient();
    activityContextsModule.bindRequest(supabase);
    const context = await activityContextsModule.createActivityContext.execute({
      userId: user.id,
      type: "project",
      name: "Test Project",
    });

    const feedback = await new CreateFeedbackUseCase({
      feedbackRepo,
      eventBus,
    }).execute({
      user_id: user.id,
      person_name: " Jon ",
      activity_context_id: context.id,
    });

    expect(feedback.toPrimitives()).toMatchObject({
      user_id: user.id,
      activity_context_id: context.id,
      person_name: "Jon",
      status: "active",
    });

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("feedback_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      feedbackId: feedback.id,
    });
  });
});
