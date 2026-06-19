import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { AddEvidenceItemUseCase } from "./add-evidence-item.use-case";
import {
  PrepareSelfAssessmentCopyPasteUseCase,
  SELF_ASSESSMENT_WORKFLOW_ID,
} from "./prepare-self-assessment-copy-paste.use-case";

describe("PrepareSelfAssessmentCopyPasteUseCase", () => {
  it("builds a prompt embedding the curated evidence", async () => {
    const user = await createTestUser("self-assessment-prepare");
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
      content: "Led the migration",
    });

    const result = await new PrepareSelfAssessmentCopyPasteUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
    }).execute({ reviewId: review.id, userId: user.id });

    expect(result.workflowId).toBe(SELF_ASSESSMENT_WORKFLOW_ID);
    expect(result.prompt).toContain("Led the migration");
    expect(result.expectedResponse).toEqual({ kind: "json", envelope: true });
  });
});
