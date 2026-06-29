import { describe, expect, it, vi } from "vitest";
import { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import { FollowUp } from "../../domain/entities/follow-up.entity";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { UpdateFollowUpEntryByAnalysisUseCase } from "./update-follow-up-entry-by-analysis.use-case";
import { eventBus } from "./selection-process-test-helpers.test";

describe("UpdateFollowUpEntryByAnalysisUseCase", () => {
  it("edits history without changing the current follow-up status", async () => {
    const followUp = FollowUp.fromPrimitives({
      id: "follow-1",
      userId: "user-1",
      jobOpportunityId: "job-1",
      status: "offer",
      notes: null,
      nextAction: null,
      nextActionAt: null,
      sourceJobMatchAnalysisId: "analysis-1",
      createdAt: "2026-06-01T09:00:00.000Z",
      updatedAt: "2026-06-29T09:00:00.000Z",
    });
    const existing = FollowUpEntry.fromPrimitives({
      id: "entry-1",
      userId: "user-1",
      followUpId: "follow-1",
      status: "interview",
      title: "Interview",
      notes: null,
      nextAction: null,
      nextActionAt: null,
      updatesCurrentStatus: true,
      occurredAt: "2026-06-20T09:00:00.000Z",
      createdAt: "2026-06-20T09:00:00.000Z",
      updatedAt: "2026-06-20T09:00:00.000Z",
    });
    const followUpRepo = {
      findBySourceJobMatchAnalysisId: vi.fn(async () => followUp),
    } as unknown as FollowUpRepository;
    const entryRepo = {
      findById: vi.fn(async () => existing),
      save: vi.fn(async (item) => item),
    } as unknown as FollowUpEntryRepository;

    const result = await new UpdateFollowUpEntryByAnalysisUseCase({
      followUpRepo,
      entryRepo,
      eventBus: eventBus(),
      now: () => "2026-06-29T12:00:00.000Z",
    }).execute({
      analysisId: "analysis-1",
      entryId: "entry-1",
      userId: "user-1",
      status: "applied",
      title: "Technical interview",
      notes: "Corrected notes",
      nextAction: null,
      nextActionAt: null,
      occurredAt: "2026-06-21T09:00:00.000Z",
    });

    expect(result?.toPrimitives()).toMatchObject({
      status: "applied",
      title: "Technical interview",
      updatesCurrentStatus: true,
    });
    expect(followUp.toPrimitives().status).toBe("offer");
  });
});
