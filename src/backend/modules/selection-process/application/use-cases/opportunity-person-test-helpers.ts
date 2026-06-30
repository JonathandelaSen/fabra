import { vi } from "vitest";
import type { EventBus } from "@/backend/modules/shared";
import { FollowUp } from "../../domain/entities/follow-up.entity";
import { OpportunityPerson } from "../../domain/entities/opportunity-person.entity";

export function followUp(jobOpportunityId = "job-1") {
  return FollowUp.fromPrimitives({
    id: "follow-1",
    userId: "user-1",
    jobOpportunityId,
    status: "interesting",
    notes: null,
    nextAction: null,
    nextActionAt: null,
    sourceJobMatchAnalysisId: "analysis-1",
    createdAt: "2026-06-30T09:00:00.000Z",
    updatedAt: "2026-06-30T09:00:00.000Z",
  });
}

export function opportunityPerson(jobOpportunityId = "job-1") {
  return OpportunityPerson.fromPrimitives({
    id: "person-1",
    userId: "user-1",
    jobOpportunityId,
    name: "Marta García",
    role: "hiring_manager",
    jobTitle: "Engineering Manager",
    organization: "Acme",
    email: "marta@example.com",
    phone: "+34 600 000 000",
    links: [{ url: "https://linkedin.com/in/marta", label: "LinkedIn" }],
    notes: "Platform reliability matters to her.",
    createdAt: "2026-06-30T09:00:00.000Z",
    updatedAt: "2026-06-30T09:00:00.000Z",
  });
}

export function opportunityPersonInput() {
  return {
    analysisId: "analysis-1",
    userId: "user-1",
    name: " Marta García ",
    role: "hiring_manager",
    jobTitle: "Engineering Manager",
    organization: "Acme",
    email: "marta@example.com",
    phone: "+34 600 000 000",
    links: [{ url: "https://linkedin.com/in/marta", label: "LinkedIn" }],
    notes: "Platform reliability matters to her.",
  };
}

export function eventBus(): EventBus & { publish: ReturnType<typeof vi.fn> } {
  return {
    publish: vi.fn(async () => undefined),
    subscribe: vi.fn(),
  } as unknown as EventBus & { publish: ReturnType<typeof vi.fn> };
}
