import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { AddEvidenceItemUseCase } from "./add-evidence-item.use-case";

describe("AddEvidenceItemUseCase", () => {
  it("appends an evidence item with an incrementing position", async () => {
    const user = await createTestUser("evidence-add");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);

    const useCase = new AddEvidenceItemUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    });

    const first = await useCase.execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "Shipped the billing rewrite",
    });
    const second = await useCase.execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "Mentored two engineers",
    });

    expect(first.toPrimitives().position).toBe(0);
    expect(second.toPrimitives().position).toBe(1);
  });
});
