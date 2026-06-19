import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { AddEvidenceItemUseCase } from "./add-evidence-item.use-case";
import { UpdateEvidenceItemUseCase } from "./update-evidence-item.use-case";

describe("UpdateEvidenceItemUseCase", () => {
  it("updates content and highlight state", async () => {
    const user = await createTestUser("evidence-update");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);
    const item = await new AddEvidenceItemUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    }).execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "Original",
    });

    const updated = await new UpdateEvidenceItemUseCase({
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    }).execute({
      id: item.id,
      userId: user.id,
      content: "Edited",
      highlighted: true,
    });

    expect(updated.toPrimitives()).toMatchObject({
      content: "Edited",
      highlighted: true,
    });
  });
});
