import { describe, expect, it } from "vitest";
import { createTestUser, getSupabaseClient } from "@/backend/modules/test-helpers/setup";
import { activityContextsModule } from "@/lib/container";
import { Feedback } from "../../domain/entities/feedback.entity";
import { SupabaseFeedbackRepository } from "./supabase-feedback.repository";

const repo = new SupabaseFeedbackRepository();
repo.bindRequest(getSupabaseClient());

describe("SupabaseFeedbackRepository", () => {
  it("persists and lists feedbacks for a user by status", async () => {
    const user = await createTestUser("feedback-repo-list");
    const otherUser = await createTestUser("feedback-repo-other");
    const supabase = getSupabaseClient();
    activityContextsModule.bindRequest(supabase);

    const context = await activityContextsModule.createActivityContext.execute({
      userId: user.id,
      type: "project",
      name: "Test Context",
    });

    const otherContext = await activityContextsModule.createActivityContext.execute({
      userId: otherUser.id,
      type: "project",
      name: "Other Context",
    });

    const now = new Date().toISOString();
    const active = await repo.save(
      Feedback.create({
        id: crypto.randomUUID(),
        user_id: user.id,
        activity_context_id: context.id,
        person_name: "Jon",
        now,
      })
    );
    const closed = Feedback.create({
      id: crypto.randomUUID(),
      user_id: user.id,
      activity_context_id: context.id,
      person_name: "Ana",
      now,
    });
    closed.close(now);
    await repo.save(closed);
    await repo.save(
      Feedback.create({
        id: crypto.randomUUID(),
        user_id: otherUser.id,
        activity_context_id: otherContext.id,
        person_name: "Other",
        now,
      })
    );

    const result = await repo.list({ userId: user.id, status: "active" });

    expect(result.map((feedback) => feedback.id)).toEqual([active.id]);
    expect(result[0].toPrimitives().activity_context_id).toBe(context.id);
  });

  it("updates and deletes feedback", async () => {
    const user = await createTestUser("feedback-repo-update");
    const supabase = getSupabaseClient();
    activityContextsModule.bindRequest(supabase);
    const context = await activityContextsModule.createActivityContext.execute({
      userId: user.id,
      type: "project",
      name: "Test Context",
    });

    const feedback = await repo.save(
      Feedback.create({
        id: crypto.randomUUID(),
        user_id: user.id,
        activity_context_id: context.id,
        person_name: "Jon",
        now: new Date().toISOString(),
      })
    );
    feedback.updateFinalFeedback("Final text");
    await repo.save(feedback);

    await expect(
      repo.findById(feedback.id, user.id).then((item) => item?.toPrimitives())
    ).resolves.toMatchObject({
      final_feedback: "Final text",
      activity_context_id: context.id,
    });

    await repo.delete(feedback.id, user.id);
    await expect(repo.findById(feedback.id, user.id)).resolves.toBeNull();
  });
});
