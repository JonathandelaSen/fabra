import { describe, expect, it } from "vitest";
import { IsoDate, Timestamp, UserId } from "@/backend/modules/shared";
import { PerformanceReview } from "./performance-review.entity";
import { PerformanceReviewId } from "../value-objects/performance-review-id.value-object";
import { ReviewTitle } from "../value-objects/review-title.value-object";
import { ReviewType } from "../value-objects/review-type.value-object";
import { SelfAssessmentMode } from "../value-objects/self-assessment-mode.value-object";

function makeReview(): PerformanceReview {
  const now = Timestamp.fromPrimitives("2026-06-11T00:00:00.000Z");
  return PerformanceReview.create({
    id: PerformanceReviewId.fromPrimitives(crypto.randomUUID()),
    userId: UserId.fromPrimitives(crypto.randomUUID()),
    activityContextId: null,
    title: ReviewTitle.fromPrimitives("H1"),
    reviewType: ReviewType.fromPrimitives("performance_review"),
    reviewDate: IsoDate.fromPrimitives("2026-07-01"),
    periodStart: IsoDate.fromPrimitives("2026-01-01"),
    periodEnd: IsoDate.fromPrimitives("2026-06-30"),
    createdAt: now,
    updatedAt: now,
  });
}

describe("PerformanceReview", () => {
  it("creates a draft and records a created event", () => {
    const review = makeReview();
    expect(review.toPrimitives().status).toBe("draft");
    const events = review.pullDomainEvents();
    expect(events.map((e) => e.eventName)).toContain(
      "performance_review_created",
    );
  });

  it("attachSelfAssessment moves a draft to prepared", () => {
    const review = makeReview();
    review.pullDomainEvents();
    const now = Timestamp.fromPrimitives("2026-06-11T01:00:00.000Z");
    review.attachSelfAssessment({
      content: "doc",
      mode: SelfAssessmentMode.fromPrimitives("manual"),
      generatedAt: now,
      updatedAt: now,
    });
    expect(review.toPrimitives()).toMatchObject({
      status: "prepared",
      selfAssessmentContent: "doc",
      selfAssessmentMode: "manual",
    });
  });

  it("complete sets status to completed", () => {
    const review = makeReview();
    review.complete(Timestamp.fromPrimitives("2026-07-02T00:00:00.000Z"));
    expect(review.toPrimitives().status).toBe("completed");
  });

  it("round-trips through primitives without re-emitting create events", () => {
    const primitives = makeReview().toPrimitives();
    const restored = PerformanceReview.fromPrimitives(primitives);
    expect(restored.pullDomainEvents()).toHaveLength(0);
    expect(restored.toPrimitives()).toEqual(primitives);
  });
});
