import { describe, expect, it } from "vitest";
import {
  IsoDate,
  Timestamp,
  UserId,
} from "@/backend/modules/shared";
import { createTestUser, getSupabaseClient } from "@/backend/modules/test-helpers/setup";
import { PerformanceReview } from "../../domain/entities/performance-review.entity";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { ReviewTitle } from "../../domain/value-objects/review-title.value-object";
import { ReviewType } from "../../domain/value-objects/review-type.value-object";
import { SupabasePerformanceReviewRepository } from "./supabase-performance-review.repository";

const repo = new SupabasePerformanceReviewRepository();
repo.bindRequest(getSupabaseClient());

function makeReview(userId: string, title: string): PerformanceReview {
  const now = Timestamp.fromPrimitives(new Date().toISOString());
  return PerformanceReview.create({
    id: PerformanceReviewId.fromPrimitives(crypto.randomUUID()),
    userId: UserId.fromPrimitives(userId),
    activityContextId: null,
    title: ReviewTitle.fromPrimitives(title),
    reviewType: ReviewType.fromPrimitives("performance_review"),
    reviewDate: IsoDate.fromPrimitives("2026-07-01"),
    periodStart: IsoDate.fromPrimitives("2026-01-01"),
    periodEnd: IsoDate.fromPrimitives("2026-06-30"),
    createdAt: now,
    updatedAt: now,
  });
}

describe("SupabasePerformanceReviewRepository", () => {
  it("saves, finds, lists and deletes reviews scoped by user", async () => {
    const user = await createTestUser("review-repo");
    const other = await createTestUser("review-repo-other");
    const saved = await repo.save(makeReview(user.id, "Mine"));
    await repo.save(makeReview(other.id, "Theirs"));

    const found = await repo.findById(
      PerformanceReviewId.fromPrimitives(saved.id),
      UserId.fromPrimitives(user.id),
    );
    expect(found?.toPrimitives().title).toBe("Mine");

    const list = await repo.search({ userId: UserId.fromPrimitives(user.id) });
    expect(list.every((r) => r.userId === user.id)).toBe(true);

    const deleted = await repo.delete(
      PerformanceReviewId.fromPrimitives(saved.id),
      UserId.fromPrimitives(user.id),
    );
    expect(deleted).toBe(true);
  });
});
