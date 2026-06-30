import { describe, expect, it, vi } from "vitest";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import type { OpportunityPersonRepository } from "../../domain/repositories/opportunity-person.repository";
import { CreateOpportunityPersonByAnalysisUseCase } from "./create-opportunity-person-by-analysis.use-case";
import {
  eventBus,
  followUp,
  opportunityPersonInput,
} from "./opportunity-person-test-helpers";

describe("CreateOpportunityPersonByAnalysisUseCase", () => {
  it("creates a person for the ensured opportunity and publishes its event", async () => {
    const personRepo = {
      save: vi.fn(async (person) => person),
    } as unknown as OpportunityPersonRepository;
    const followUpRepo = {
      ensureBySourceJobMatchAnalysisId: vi.fn(async () => followUp()),
    } as unknown as FollowUpRepository;
    const bus = eventBus();
    const useCase = new CreateOpportunityPersonByAnalysisUseCase({
      followUpRepo,
      personRepo,
      eventBus: bus,
      randomId: () => "person-new",
      now: () => "2026-06-30T10:00:00.000Z",
    });

    const result = await useCase.execute(opportunityPersonInput());

    expect(result?.toPrimitives()).toMatchObject({
      id: "person-new",
      jobOpportunityId: "job-1",
      name: "Marta García",
      role: "hiring_manager",
    });
    expect(personRepo.save).toHaveBeenCalledOnce();
    expect(bus.publish).toHaveBeenCalledOnce();
    expect(bus.publish.mock.calls[0][0][0].eventName).toBe(
      "opportunity_person_created",
    );
  });

  it("returns null when the analysis cannot resolve an opportunity", async () => {
    const personRepo = {
      save: vi.fn(),
    } as unknown as OpportunityPersonRepository;
    const useCase = new CreateOpportunityPersonByAnalysisUseCase({
      followUpRepo: {
        ensureBySourceJobMatchAnalysisId: vi.fn(async () => null),
      } as unknown as FollowUpRepository,
      personRepo,
      eventBus: eventBus(),
    });

    expect(await useCase.execute(opportunityPersonInput())).toBeNull();
    expect(personRepo.save).not.toHaveBeenCalled();
  });
});
