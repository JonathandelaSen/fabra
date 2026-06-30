import { describe, expect, it, vi } from "vitest";
import { ExecutionResult } from "@/backend/modules/shared";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import type { OpportunityPersonRepository } from "../../domain/repositories/opportunity-person.repository";
import { DeleteOpportunityPersonByAnalysisUseCase } from "./delete-opportunity-person-by-analysis.use-case";
import {
  eventBus,
  followUp,
  opportunityPerson,
} from "./opportunity-person-test-helpers";

describe("DeleteOpportunityPersonByAnalysisUseCase", () => {
  it("deletes a person in the requested opportunity and publishes its event", async () => {
    const person = opportunityPerson();
    const personRepo = {
      findById: vi.fn(async () => person),
      delete: vi.fn(async () => ExecutionResult.ok()),
    } as unknown as OpportunityPersonRepository;
    const bus = eventBus();
    const useCase = new DeleteOpportunityPersonByAnalysisUseCase({
      followUpRepo: {
        findBySourceJobMatchAnalysisId: vi.fn(async () => followUp()),
      } as unknown as FollowUpRepository,
      personRepo,
      eventBus: bus,
    });

    const result = await useCase.execute({
      analysisId: "analysis-1",
      personId: "person-1",
      userId: "user-1",
    });

    expect(result.toPrimitives()).toBe(true);
    expect(bus.publish.mock.calls[0][0][0].eventName).toBe(
      "opportunity_person_deleted",
    );
  });

  it("does not delete a person from another opportunity", async () => {
    const personRepo = {
      findById: vi.fn(async () => opportunityPerson("job-other")),
      delete: vi.fn(),
    } as unknown as OpportunityPersonRepository;
    const useCase = new DeleteOpportunityPersonByAnalysisUseCase({
      followUpRepo: {
        findBySourceJobMatchAnalysisId: vi.fn(async () => followUp()),
      } as unknown as FollowUpRepository,
      personRepo,
      eventBus: eventBus(),
    });

    const result = await useCase.execute({
      analysisId: "analysis-1",
      personId: "person-1",
      userId: "user-1",
    });

    expect(result.toPrimitives()).toBe(false);
    expect(personRepo.delete).not.toHaveBeenCalled();
  });
});
