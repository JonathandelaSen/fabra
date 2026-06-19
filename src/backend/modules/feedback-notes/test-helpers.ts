import {
  getSupabaseClient,
} from "@/backend/modules/test-helpers/setup";
import { activityContextsModule } from "@/lib/container";
import { SupabaseFeedbackEntryRepository } from "./infrastructure/repositories/supabase-feedback-entry.repository";
import { SupabaseFeedbackRepository } from "./infrastructure/repositories/supabase-feedback.repository";

import { vi } from "vitest";

export function makeFeedbackDeps() {
  const supabase = getSupabaseClient();
  const feedbackRepo = new SupabaseFeedbackRepository();
  feedbackRepo.bindRequest(supabase);
  const entryRepo = new SupabaseFeedbackEntryRepository();
  entryRepo.bindRequest(supabase);
  const eventBus = {
    publish: vi.fn().mockResolvedValue(undefined),
  };
  return { feedbackRepo, entryRepo, eventBus };
}

export async function createDefaultContext(userId: string) {
  const supabase = getSupabaseClient();
  activityContextsModule.bindRequest(supabase);
  return activityContextsModule.createActivityContext.execute({
    userId,
    type: "project",
    name: "General",
  });
}

export async function createFeedbackFixture(
  userId: string,
  activityContextId: string,
  personName = "Jon"
) {
  const { feedbackRepo } = makeFeedbackDeps();
  return feedbackRepo.save(
    (
      await import("./domain/entities/feedback.entity")
    ).Feedback.create({
      id: crypto.randomUUID(),
      user_id: userId,
      activity_context_id: activityContextId,
      person_name: personName,
      now: new Date().toISOString(),
    })
  );
}

export async function createEntryFixture(
  userId: string,
  feedbackId: string,
  content = "Helped unblock the review."
) {
  const { entryRepo } = makeFeedbackDeps();
  return entryRepo.save(
    (
      await import("./domain/entities/feedback-entry.entity")
    ).FeedbackEntry.create({
      id: crypto.randomUUID(),
      user_id: userId,
      feedback_id: feedbackId,
      content,
      now: new Date().toISOString(),
    })
  );
}
