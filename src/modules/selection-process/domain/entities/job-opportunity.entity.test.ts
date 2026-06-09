import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/modules/shared";
import { JobOpportunity } from "./job-opportunity.entity";
import { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";

const now = "2026-05-13T10:00:00.000Z";

describe("JobOpportunity", () => {
  it("creates and serializes job data", () => {
    const opportunity = JobOpportunity.create({
      id: JobOpportunityId.fromPrimitives("job-1"),
      userId: UserId.fromPrimitives("user-1"),
      title: "Frontend Engineer",
      company: "Acme",
      location: "Madrid",
      remote: "Hybrid",
      salary: null,
      seniority: "Senior",
      contractType: null,
      benefits: ["Stock"],
      requirements: ["React"],
      responsibilities: ["Build UI"],
      notablePoints: ["Fast team"],
      description: "Role description",
      url: "https://example.com/job",
      sourceJobMatchAnalysisId: "analysis-1",
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    expect(opportunity.toPrimitives()).toMatchObject({
      id: "job-1",
      userId: "user-1",
      title: "Frontend Engineer",
      company: "Acme",
      requirements: ["React"],
    });
  });

  const buildParams = () => ({
    id: JobOpportunityId.fromPrimitives("job-1"),
    userId: UserId.fromPrimitives("user-1"),
    title: "Frontend Engineer",
    company: "Acme",
    location: "Madrid",
    remote: "Hybrid",
    salary: null,
    seniority: "Senior",
    contractType: null,
    benefits: ["Stock"],
    requirements: ["React"],
    responsibilities: ["Build UI"],
    notablePoints: ["Fast team"],
    description: "Role description",
    url: "https://example.com/job",
    sourceJobMatchAnalysisId: "analysis-1",
    createdAt: Timestamp.fromPrimitives(now),
    updatedAt: Timestamp.fromPrimitives(now),
  });

  it("records a created event on create", () => {
    const events = JobOpportunity.create(buildParams()).pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["job_opportunity_created"]);
    expect(events[0].toPrimitives()).toEqual({ opportunityId: "job-1" });
  });

  it("does not record events when hydrated from primitives", () => {
    const opportunity = JobOpportunity.create(buildParams());
    const hydrated = JobOpportunity.fromPrimitives(opportunity.toPrimitives());
    expect(hydrated.pullDomainEvents()).toEqual([]);
  });
});
