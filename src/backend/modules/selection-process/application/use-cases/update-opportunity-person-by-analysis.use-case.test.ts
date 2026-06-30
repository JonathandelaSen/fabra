import { describe, expect, it, vi } from "vitest";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import type { OpportunityPersonRepository } from "../../domain/repositories/opportunity-person.repository";
import { UpdateOpportunityPersonByAnalysisUseCase } from "./update-opportunity-person-by-analysis.use-case";
import {
  eventBus,
  followUp,
  opportunityPerson,
  opportunityPersonInput,
} from "./opportunity-person-test-helpers";

describe("UpdateOpportunityPersonByAnalysisUseCase", () => {
  it("updates a person that belongs to the requested analysis", async () => {
    const person = opportunityPerson();
    const personRepo = {
      findById: vi.fn(async () => person),
      save: vi.fn(async (value) => value),
    } as unknown as OpportunityPersonRepository;
    const bus = eventBus();
    const useCase = new UpdateOpportunityPersonByAnalysisUseCase({
      followUpRepo: {
        findBySourceJobMatchAnalysisId: vi.fn(async () => followUp()),
      } as unknown as FollowUpRepository,
      personRepo,
      eventBus: bus,
      now: () => "2026-06-30T11:00:00.000Z",
    });

    const result = await useCase.execute({
      ...opportunityPersonInput(),
      personId: "person-1",
      name: "Marta G.",
      role: "potential_manager",
    });

    expect(result?.toPrimitives()).toMatchObject({
      name: "Marta G.",
      role: "potential_manager",
      updatedAt: "2026-06-30T11:00:00.000Z",
    });
    expect(personRepo.save).toHaveBeenCalledOnce();
    expect(bus.publish.mock.calls[0][0][0].eventName).toBe(
      "opportunity_person_updated",
    );
  });

  it("does not update a person from another opportunity", async () => {
    const personRepo = {
      findById: vi.fn(async () => opportunityPerson("job-other")),
      save: vi.fn(),
    } as unknown as OpportunityPersonRepository;
    const useCase = new UpdateOpportunityPersonByAnalysisUseCase({
      followUpRepo: {
        findBySourceJobMatchAnalysisId: vi.fn(async () => followUp()),
      } as unknown as FollowUpRepository,
      personRepo,
      eventBus: eventBus(),
    });

    const result = await useCase.execute({
      ...opportunityPersonInput(),
      personId: "person-1",
    });

    expect(result).toBeNull();
    expect(personRepo.save).not.toHaveBeenCalled();
  });
});
