import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { AddEvidenceItemUseCase } from "./add-evidence-item.use-case";
import { ListEvidenceItemsUseCase } from "./list-evidence-items.use-case";

describe("ListEvidenceItemsUseCase", () => {
  it("lists items in position order for a review", async () => {
    const user = await createTestUser("evidence-list");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);

    const add = new AddEvidenceItemUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    });
    await add.execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "First",
    });
    await add.execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "Second",
    });

    const items = await new ListEvidenceItemsUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
    }).execute({ reviewId: review.id, userId: user.id });

    expect(items.map((i) => i.toPrimitives().content)).toEqual([
      "First",
      "Second",
    ]);
  });
});
