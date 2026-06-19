import { describe, expect, it } from "vitest";
import { IsoDate, Timestamp, UserId } from "@/backend/modules/shared";
import { createTestUser, getSupabaseClient } from "@/backend/modules/test-helpers/setup";
import { PerformanceReview } from "../../domain/entities/performance-review.entity";
import { ReviewEvidenceItem } from "../../domain/entities/review-evidence-item.entity";
import { EvidenceContent } from "../../domain/value-objects/evidence-content.value-object";
import { EvidenceSource } from "../../domain/value-objects/evidence-source.value-object";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { ReviewEvidenceItemId } from "../../domain/value-objects/review-evidence-item-id.value-object";
import { ReviewTitle } from "../../domain/value-objects/review-title.value-object";
import { ReviewType } from "../../domain/value-objects/review-type.value-object";
import { SupabasePerformanceReviewRepository } from "./supabase-performance-review.repository";
import { SupabaseReviewEvidenceItemRepository } from "./supabase-review-evidence-item.repository";

const reviewRepo = new SupabasePerformanceReviewRepository();
const itemRepo = new SupabaseReviewEvidenceItemRepository();
const client = getSupabaseClient();
reviewRepo.bindRequest(client);
itemRepo.bindRequest(client);

async function seedReview(userId: string): Promise<string> {
  const now = Timestamp.fromPrimitives(new Date().toISOString());
  const review = await reviewRepo.save(
    PerformanceReview.create({
      id: PerformanceReviewId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(userId),
      activityContextId: null,
      title: ReviewTitle.fromPrimitives("Review"),
      reviewType: ReviewType.fromPrimitives("performance_review"),
      reviewDate: IsoDate.fromPrimitives("2026-07-01"),
      periodStart: IsoDate.fromPrimitives("2026-01-01"),
      periodEnd: IsoDate.fromPrimitives("2026-06-30"),
      createdAt: now,
      updatedAt: now,
    }),
  );
  return review.id;
}

function makeItem(
  userId: string,
  reviewId: string,
  content: string,
  position: number,
): ReviewEvidenceItem {
  const now = Timestamp.fromPrimitives(new Date().toISOString());
  return ReviewEvidenceItem.create({
    id: ReviewEvidenceItemId.fromPrimitives(crypto.randomUUID()),
    userId: UserId.fromPrimitives(userId),
    reviewId: PerformanceReviewId.fromPrimitives(reviewId),
    source: EvidenceSource.fromPrimitives("custom"),
    sourceId: null,
    content: EvidenceContent.fromPrimitives(content),
    highlighted: false,
    position,
    createdAt: now,
    updatedAt: now,
  });
}

describe("SupabaseReviewEvidenceItemRepository", () => {
  it("saves and lists evidence items ordered by position", async () => {
    const user = await createTestUser("evidence-repo");
    const reviewId = await seedReview(user.id);
    await itemRepo.save(makeItem(user.id, reviewId, "second", 1));
    await itemRepo.save(makeItem(user.id, reviewId, "first", 0));

    const items = await itemRepo.search({
      userId: UserId.fromPrimitives(user.id),
      reviewId: PerformanceReviewId.fromPrimitives(reviewId),
    });
    expect(items.map((i) => i.toPrimitives().content)).toEqual([
      "first",
      "second",
    ]);
  });

  it("finds and deletes an evidence item", async () => {
    const user = await createTestUser("evidence-repo-delete");
    const reviewId = await seedReview(user.id);
    const saved = await itemRepo.save(makeItem(user.id, reviewId, "x", 0));

    const found = await itemRepo.findById(
      ReviewEvidenceItemId.fromPrimitives(saved.id),
      UserId.fromPrimitives(user.id),
    );
    expect(found?.id).toBe(saved.id);

    const deleted = await itemRepo.delete(
      ReviewEvidenceItemId.fromPrimitives(saved.id),
      UserId.fromPrimitives(user.id),
    );
    expect(deleted).toBe(true);
  });
});
