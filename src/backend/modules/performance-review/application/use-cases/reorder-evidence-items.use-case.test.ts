import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { AddEvidenceItemUseCase } from "./add-evidence-item.use-case";
import { ReorderEvidenceItemsUseCase } from "./reorder-evidence-items.use-case";

describe("ReorderEvidenceItemsUseCase", () => {
  it("reorders evidence items by the supplied id order", async () => {
    const user = await createTestUser("evidence-reorder");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);
    const add = new AddEvidenceItemUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    });
    const a = await add.execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "A",
    });
    const b = await add.execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "B",
    });

    const reordered = await new ReorderEvidenceItemsUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    }).execute({
      reviewId: review.id,
      userId: user.id,
      orderedItemIds: [b.id, a.id],
    });

    expect(reordered.map((i) => i.toPrimitives().content)).toEqual(["B", "A"]);
    expect(reordered.map((i) => i.toPrimitives().position)).toEqual([0, 1]);
  });
});
