import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { EditSelfAssessmentUseCase } from "./edit-self-assessment.use-case";

describe("EditSelfAssessmentUseCase", () => {
  it("saves manual content and moves the review to prepared", async () => {
    const user = await createTestUser("self-assessment-edit");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);

    const updated = await new EditSelfAssessmentUseCase({
      reviewRepo: deps.reviewRepo,
      eventBus: deps.eventBusPort,
    }).execute({
      id: review.id,
      userId: user.id,
      content: "# My self-assessment",
      mode: "manual",
    });

    expect(updated.toPrimitives()).toMatchObject({
      selfAssessmentContent: "# My self-assessment",
      selfAssessmentMode: "manual",
      status: "prepared",
    });
  });
});
