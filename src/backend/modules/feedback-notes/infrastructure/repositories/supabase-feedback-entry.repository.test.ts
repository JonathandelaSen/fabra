import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import { createDefaultContext, createFeedbackFixture } from "../../test-helpers";
import { FeedbackEntry } from "../../domain/entities/feedback-entry.entity";
import { UserId } from "@/backend/modules/shared";
import { FeedbackEntryId } from "../../domain/value-objects/feedback-entry-id.value-object";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";
import { SupabaseFeedbackEntryRepository } from "./supabase-feedback-entry.repository";
import { getSupabaseClient } from "@/backend/modules/test-helpers/setup";

const repo = new SupabaseFeedbackEntryRepository();
repo.bindRequest(getSupabaseClient());

describe("SupabaseFeedbackEntryRepository", () => {
  it("persists entries and lists them chronologically for a feedback", async () => {
    const user = await createTestUser("feedback-entry-repo-list");
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);
    const first = await repo.save(
      FeedbackEntry.create({
        id: crypto.randomUUID(),
        user_id: user.id,
        feedback_id: feedback.id,
        content: "First",
        now: "2026-05-01T10:00:00.000Z",
      })
    );
    const second = await repo.save(
      FeedbackEntry.create({
        id: crypto.randomUUID(),
        user_id: user.id,
        feedback_id: feedback.id,
        content: "Second",
        now: "2026-05-02T10:00:00.000Z",
      })
    );

    await expect(
      repo.listByFeedback(
        FeedbackId.fromPrimitives(feedback.id),
        UserId.fromPrimitives(user.id),
      ).then((entries) =>
        entries.map((entry) => entry.id)
      )
    ).resolves.toEqual([first.id, second.id]);
  });

  it("updates and deletes entries", async () => {
    const user = await createTestUser("feedback-entry-repo-update");
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);
    const entry = await repo.save(
      FeedbackEntry.create({
        id: crypto.randomUUID(),
        user_id: user.id,
        feedback_id: feedback.id,
        content: "Original",
        now: new Date().toISOString(),
      })
    );
    entry.updateContent("Updated");
    await repo.save(entry);

    await expect(
      repo.findById(
        FeedbackEntryId.fromPrimitives(entry.id),
        UserId.fromPrimitives(user.id),
      ).then((item) => item?.toPrimitives())
    ).resolves.toMatchObject({ content: "Updated" });

    const entryId = FeedbackEntryId.fromPrimitives(entry.id);
    const userId = UserId.fromPrimitives(user.id);
    await repo.delete(entryId, userId);
    await expect(repo.findById(entryId, userId)).resolves.toBeNull();
  });
});
