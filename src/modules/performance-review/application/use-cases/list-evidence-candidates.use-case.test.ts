import { describe, expect, it, vi } from "vitest";
import type { QueryBus } from "@/modules/shared";
import { createTestUser } from "@/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { ListEvidenceCandidatesUseCase } from "./list-evidence-candidates.use-case";

describe("ListEvidenceCandidatesUseCase", () => {
  it("aggregates candidates from the three owning modules with source labels", async () => {
    const user = await createTestUser("evidence-candidates");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);

    const queryBus: QueryBus = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([
          { id: "j1", dateStart: "2026-02-01", finalText: "journal" },
        ])
        .mockResolvedValueOnce([
          { sourceId: "f1", date: "2026-03-01", content: "feedback" },
        ])
        .mockResolvedValueOnce([
          { sourceId: "c1", date: "2026-04-01", content: "commitment" },
        ]),
    };

    const candidates = await new ListEvidenceCandidatesUseCase({
      reviewRepo: deps.reviewRepo,
      queryBus,
    }).execute({ reviewId: review.id, userId: user.id });

    expect(candidates.map((c) => c.source)).toEqual([
      "journal_entry",
      "received_feedback",
      "commitment",
    ]);
  });
});
