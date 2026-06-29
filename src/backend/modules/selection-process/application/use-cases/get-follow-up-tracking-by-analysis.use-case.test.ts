import { describe, expect, it, vi } from "vitest";
import { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import { FollowUp } from "../../domain/entities/follow-up.entity";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { GetFollowUpTrackingByAnalysisUseCase } from "./get-follow-up-tracking-by-analysis.use-case";

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

function entry(id: string, occurredAt: string) {
  return FollowUpEntry.fromPrimitives({
    id,
    userId: "user-1",
    followUpId: "follow-1",
    status: "interview",
    title: null,
    notes: null,
    nextAction: null,
    nextActionAt: null,
    updatesCurrentStatus: false,
    occurredAt,
    createdAt: occurredAt,
    updatedAt: occurredAt,
  });
}

describe("GetFollowUpTrackingByAnalysisUseCase", () => {
  it("returns entries in historical descending order", async () => {
    const followUpRepo = {
      findBySourceJobMatchAnalysisId: vi.fn(async () => followUp),
    } as unknown as FollowUpRepository;
    const entryRepo = {
      search: vi.fn(async () => [
        entry("older", "2026-06-10T10:00:00.000Z"),
        entry("newer", "2026-06-20T10:00:00.000Z"),
      ]),
    } as unknown as FollowUpEntryRepository;

    const result = await new GetFollowUpTrackingByAnalysisUseCase({
      followUpRepo,
      entryRepo,
    }).execute({ analysisId: "analysis-1", userId: "user-1" });

    expect(result?.followUp.id).toBe("follow-1");
    expect(result?.entries.map((item) => item.id)).toEqual(["newer", "older"]);
  });
});
