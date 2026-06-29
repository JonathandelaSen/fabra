import { describe, expect, it, vi } from "vitest";
import { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import { FollowUp } from "../../domain/entities/follow-up.entity";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { ListFollowUpTrackingByAnalysesUseCase } from "./list-follow-up-tracking-by-analyses.use-case";

describe("ListFollowUpTrackingByAnalysesUseCase", () => {
  it("selects the last-created entry as the operational summary", async () => {
    const followUp = FollowUp.fromPrimitives({
      id: "follow-1",
      userId: "user-1",
      jobOpportunityId: "job-1",
      status: "interview",
      notes: null,
      nextAction: null,
      nextActionAt: null,
      sourceJobMatchAnalysisId: "analysis-1",
      createdAt: "2026-06-01T09:00:00.000Z",
      updatedAt: "2026-06-29T09:00:00.000Z",
    });
    const historicalCreatedLater = FollowUpEntry.fromPrimitives({
      id: "created-last",
      userId: "user-1",
      followUpId: "follow-1",
      status: "interesting",
      title: null,
      notes: null,
      nextAction: "Prepare CV",
      nextActionAt: "2026-07-01T09:00:00.000Z",
      updatesCurrentStatus: false,
      occurredAt: "2026-06-02T09:00:00.000Z",
      createdAt: "2026-06-29T10:00:00.000Z",
      updatedAt: "2026-06-29T10:00:00.000Z",
    });
    const happenedLater = FollowUpEntry.fromPrimitives({
      ...historicalCreatedLater.toPrimitives(),
      id: "happened-last",
      nextAction: null,
      nextActionAt: null,
      occurredAt: "2026-06-20T09:00:00.000Z",
      createdAt: "2026-06-20T09:00:00.000Z",
      updatedAt: "2026-06-20T09:00:00.000Z",
    });
    const followUpRepo = {
      searchBySourceJobMatchAnalysisIds: vi.fn(async () => [followUp]),
    } as unknown as FollowUpRepository;
    const entryRepo = {
      search: vi.fn(async () => [happenedLater, historicalCreatedLater]),
    } as unknown as FollowUpEntryRepository;

    const result = await new ListFollowUpTrackingByAnalysesUseCase({
      followUpRepo,
      entryRepo,
    }).execute({ analysisIds: ["analysis-1"], userId: "user-1" });

    expect(result).toHaveLength(1);
    expect(result[0].entries[0]?.id).toBe("created-last");
  });
});
