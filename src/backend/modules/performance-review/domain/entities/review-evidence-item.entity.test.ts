import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/backend/modules/shared";
import { ReviewEvidenceItem } from "./review-evidence-item.entity";
import { EvidenceContent } from "../value-objects/evidence-content.value-object";
import { EvidenceSource } from "../value-objects/evidence-source.value-object";
import { PerformanceReviewId } from "../value-objects/performance-review-id.value-object";
import { ReviewEvidenceItemId } from "../value-objects/review-evidence-item-id.value-object";

function makeItem(): ReviewEvidenceItem {
  const now = Timestamp.fromPrimitives("2026-06-11T00:00:00.000Z");
  return ReviewEvidenceItem.create({
    id: ReviewEvidenceItemId.fromPrimitives(crypto.randomUUID()),
    userId: UserId.fromPrimitives(crypto.randomUUID()),
    reviewId: PerformanceReviewId.fromPrimitives(crypto.randomUUID()),
    source: EvidenceSource.fromPrimitives("custom"),
    sourceId: null,
    content: EvidenceContent.fromPrimitives("did a thing"),
    highlighted: false,
    position: 0,
    createdAt: now,
    updatedAt: now,
  });
}

describe("ReviewEvidenceItem", () => {
  it("records a created event", () => {
    const item = makeItem();
    expect(item.pullDomainEvents().map((e) => e.eventName)).toContain(
      "review_evidence_item_created",
    );
  });

  it("supports highlight, content edit and reorder", () => {
    const item = makeItem();
    item.pullDomainEvents();
    const now = Timestamp.fromPrimitives("2026-06-11T01:00:00.000Z");
    item.highlight(now);
    item.updateContent(EvidenceContent.fromPrimitives("edited"), now);
    item.reorder(3, now);
    expect(item.toPrimitives()).toMatchObject({
      highlighted: true,
      content: "edited",
      position: 3,
    });
  });

  it("round-trips through primitives without re-emitting create events", () => {
    const primitives = makeItem().toPrimitives();
    const restored = ReviewEvidenceItem.fromPrimitives(primitives);
    expect(restored.pullDomainEvents()).toHaveLength(0);
    expect(restored.toPrimitives()).toEqual(primitives);
  });
});
