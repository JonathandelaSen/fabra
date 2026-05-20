import { describe, expect, it } from "vitest";
import { createTestUser, getSupabaseClient } from "@/modules/test-helpers/setup";
import { activityContextsModule } from "@/lib/container";
import { makeFeedbackDeps } from "../../test-helpers";
import { CreateFeedbackUseCase } from "./create-feedback.use-case";

describe("CreateFeedbackUseCase", () => {
  it("creates feedback and records observability", async () => {
    const user = await createTestUser("feedback-create");
    const { feedbackRepo, tracker } = makeFeedbackDeps();

    const supabase = getSupabaseClient();
    activityContextsModule.bindRequest(supabase);
    const context = await activityContextsModule.createActivityContext.execute({
      userId: user.id,
      type: "project",
      name: "Test Project",
    });

    const feedback = await new CreateFeedbackUseCase({
      feedbackRepo,
      tracker,
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
    expect(tracker.record).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "feedback_created", status: "success" })
    );
  });
});
