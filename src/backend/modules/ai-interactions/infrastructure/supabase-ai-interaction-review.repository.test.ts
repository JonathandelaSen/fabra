import { describe, expect, it } from "vitest";
import { createTestUser, getSupabaseClient } from "@/modules/test-helpers/setup";
import { UserId } from "@/modules/shared";
import { AIInteractionReview } from "../domain/entities/ai-interaction-review.entity";
import { SupabaseAIInteractionReviewRepository } from "./supabase-ai-interaction-review.repository";

const repository = new SupabaseAIInteractionReviewRepository();
repository.bindRequest(getSupabaseClient());

describe("SupabaseAIInteractionReviewRepository", () => {
  it("saves and lists reviews", async () => {
    const user = await createTestUser("ai-interaction-review");
    const interactionId = crypto.randomUUID();
    await repository.save(AIInteractionReview.create({
      interactionId, reviewerUserId: user.id, rating: "good", note: "Useful",
      createdAt: "2026-06-13T10:00:00.000Z", updatedAt: "2026-06-13T10:00:00.000Z",
    }));
    const reviews = await repository.searchByReviewer(UserId.fromPrimitives(user.id));
    expect(reviews.map((review) => review.toPrimitives().interactionId)).toContain(interactionId);
  });
});
