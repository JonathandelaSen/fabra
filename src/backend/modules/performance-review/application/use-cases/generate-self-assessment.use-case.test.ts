import { describe, expect, it } from "vitest";
import { AI_PROVIDER } from "@/backend/modules/shared";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { MockReviewSelfAssessmentAIServiceFactory } from "../../infrastructure/services/mock-review-self-assessment-ai.service";
import { AddEvidenceItemUseCase } from "./add-evidence-item.use-case";
import { GenerateSelfAssessmentUseCase } from "./generate-self-assessment.use-case";

describe("GenerateSelfAssessmentUseCase", () => {
  it("generates content via the mock provider and attaches it", async () => {
    const user = await createTestUser("self-assessment-generate");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);
    await new AddEvidenceItemUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    }).execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "Closed the biggest enterprise deal",
    });

    const updated = await new GenerateSelfAssessmentUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
      aiFactory: new MockReviewSelfAssessmentAIServiceFactory(),
      eventBus: deps.eventBusPort,
    }).execute({
      reviewId: review.id,
      userId: user.id,
      provider: AI_PROVIDER.MOCK,
      model: "mock-model",
    });

    expect(updated.toPrimitives().selfAssessmentMode).toBe("integrated");
    expect(updated.toPrimitives().selfAssessmentContent).toContain(
      "Closed the biggest enterprise deal",
    );
  });
});
