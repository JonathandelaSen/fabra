import { describe, expect, it, vi } from "vitest";
import { ExecutionResult } from "@/backend/modules/shared";
import { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import { FollowUp } from "../../domain/entities/follow-up.entity";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { DeleteFollowUpEntryByAnalysisUseCase } from "./delete-follow-up-entry-by-analysis.use-case";

describe("DeleteFollowUpEntryByAnalysisUseCase", () => {
  it("deletes a scoped entry without changing the current status", async () => {
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
    const entry = FollowUpEntry.fromPrimitives({
      id: "entry-1",
      userId: "user-1",
      followUpId: "follow-1",
      status: "interview",
      title: null,
      notes: null,
      nextAction: null,
      nextActionAt: null,
      updatesCurrentStatus: true,
      occurredAt: "2026-06-20T09:00:00.000Z",
      createdAt: "2026-06-20T09:00:00.000Z",
      updatedAt: "2026-06-20T09:00:00.000Z",
    });
    const entryRepo = {
      findById: vi.fn(async () => entry),
      delete: vi.fn(async () => ExecutionResult.ok()),
    } as unknown as FollowUpEntryRepository;

    const result = await new DeleteFollowUpEntryByAnalysisUseCase({
      followUpRepo: {
        findBySourceJobMatchAnalysisId: vi.fn(async () => followUp),
      } as unknown as FollowUpRepository,
      entryRepo,
    }).execute({
      analysisId: "analysis-1",
      entryId: "entry-1",
      userId: "user-1",
    });

    expect(result.toPrimitives()).toBe(true);
    expect(followUp.toPrimitives().status).toBe("offer");
    expect(entryRepo.delete).toHaveBeenCalledOnce();
  });
});
