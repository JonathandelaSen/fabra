import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { ApplySelfAssessmentCopyPasteUseCase } from "./apply-self-assessment-copy-paste.use-case";
import {
  SELF_ASSESSMENT_SCHEMA_VERSION,
  SELF_ASSESSMENT_WORKFLOW_ID,
} from "./prepare-self-assessment-copy-paste.use-case";

describe("ApplySelfAssessmentCopyPasteUseCase", () => {
  it("validates the envelope and attaches the pasted content", async () => {
    const user = await createTestUser("self-assessment-apply");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);

    const useCase = new ApplySelfAssessmentCopyPasteUseCase({
      reviewRepo: deps.reviewRepo,
      eventBus: deps.eventBusPort,
    });

    const updated = await useCase.execute({
      reviewId: review.id,
      userId: user.id,
      envelope: {
        workflowId: SELF_ASSESSMENT_WORKFLOW_ID,
        schemaVersion: SELF_ASSESSMENT_SCHEMA_VERSION,
        result: { content: "Pasted self-assessment" },
      },
    });

    expect(updated.toPrimitives()).toMatchObject({
      selfAssessmentContent: "Pasted self-assessment",
      selfAssessmentMode: "copy_paste",
    });

    await expect(
      useCase.execute({
        reviewId: review.id,
        userId: user.id,
        envelope: { workflowId: "other", schemaVersion: "1", result: {} },
      }),
    ).rejects.toThrow();
  });
});
