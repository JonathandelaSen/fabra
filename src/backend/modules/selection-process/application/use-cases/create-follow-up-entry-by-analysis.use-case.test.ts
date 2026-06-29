import { describe, expect, it, vi } from "vitest";
import { FollowUp } from "../../domain/entities/follow-up.entity";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { CreateFollowUpEntryByAnalysisUseCase } from "./create-follow-up-entry-by-analysis.use-case";
import { eventBus } from "./selection-process-test-helpers.test";

function followUp() {
  return FollowUp.fromPrimitives({
    id: "follow-1",
    userId: "user-1",
    jobOpportunityId: "job-1",
    status: "interesting",
    notes: null,
    nextAction: null,
    nextActionAt: null,
    sourceJobMatchAnalysisId: "analysis-1",
    createdAt: "2026-06-29T09:00:00.000Z",
    updatedAt: "2026-06-29T09:00:00.000Z",
  });
}

describe("CreateFollowUpEntryByAnalysisUseCase", () => {
  it("appends an entry and explicitly updates the current status", async () => {
    const currentFollowUp = followUp();
    const followUpRepo = {
      ensureBySourceJobMatchAnalysisId: vi.fn(async () => currentFollowUp),
    } as unknown as FollowUpRepository;
    const entryRepo = {
      save: vi.fn(async (entry) => entry),
    } as unknown as FollowUpEntryRepository;
    const bus = eventBus();
    const useCase = new CreateFollowUpEntryByAnalysisUseCase({
      followUpRepo,
      entryRepo,
      eventBus: bus,
      randomId: () => "entry-1",
      now: () => "2026-06-29T10:05:00.000Z",
    });

    const result = await useCase.execute({
      analysisId: "analysis-1",
      userId: "user-1",
      status: "applied",
      title: "Application sent",
      notes: "Used the tailored CV",
      nextAction: "Wait for recruiter",
      nextActionAt: "2026-07-03T09:00:00.000Z",
      occurredAt: "2026-06-29T10:00:00.000Z",
      updateCurrentStatus: true,
    });

    expect(result?.toPrimitives()).toMatchObject({
      id: "entry-1",
      followUpId: "follow-1",
      status: "applied",
      title: "Application sent",
      occurredAt: "2026-06-29T10:00:00.000Z",
      updatesCurrentStatus: true,
    });
    expect(currentFollowUp.toPrimitives().status).toBe("applied");
    expect(entryRepo.save).toHaveBeenCalledOnce();
    expect(bus.publish).toHaveBeenCalledOnce();
    expect(
      bus.publish.mock.calls[0][0].map(
        (event: { eventName: string }) => event.eventName,
      ),
    ).toEqual([
      "follow_up_updated",
      "follow_up_status_changed",
      "follow_up_entry_created",
    ]);
  });

  it("keeps the current status for a historical entry", async () => {
    const currentFollowUp = followUp();
    const followUpRepo = {
      ensureBySourceJobMatchAnalysisId: vi.fn(async () => currentFollowUp),
    } as unknown as FollowUpRepository;
    const entryRepo = {
      save: vi.fn(async (entry) => entry),
    } as unknown as FollowUpEntryRepository;
    const useCase = new CreateFollowUpEntryByAnalysisUseCase({
      followUpRepo,
      entryRepo,
      eventBus: eventBus(),
      randomId: () => "entry-history",
      now: () => "2026-06-29T10:05:00.000Z",
    });

    await useCase.execute({
      analysisId: "analysis-1",
      userId: "user-1",
      status: "interview",
      occurredAt: "2026-06-20T10:00:00.000Z",
      updateCurrentStatus: false,
    });

    expect(currentFollowUp.toPrimitives().status).toBe("interesting");
    expect(entryRepo.save).toHaveBeenCalledOnce();
  });
});
