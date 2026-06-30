import { ValueObject } from "@/backend/modules/shared";

export const OPPORTUNITY_PERSON_ROLES = [
  "external_recruiter",
  "internal_recruiter",
  "recruiting_coordinator",
  "human_resources",
  "hiring_manager",
  "potential_manager",
  "technical_interviewer",
  "business_interviewer",
  "culture_interviewer",
  "potential_teammate",
  "cross_functional_stakeholder",
  "department_leader",
  "executive",
  "internal_referral",
  "founder",
  "other",
] as const;

const opportunityPersonRoleSet = new Set<string>(OPPORTUNITY_PERSON_ROLES);

export type OpportunityPersonRoleValue =
  (typeof OPPORTUNITY_PERSON_ROLES)[number];

export class OpportunityPersonRole extends ValueObject<string> {
  private constructor(private readonly value: OpportunityPersonRoleValue) {
    super();
  }

  static fromPrimitives(value: string): OpportunityPersonRole {
    if (!opportunityPersonRoleSet.has(value)) {
      throw new Error(`Invalid opportunity person role: ${value}`);
    }
    return new OpportunityPersonRole(value as OpportunityPersonRoleValue);
  }

  static externalRecruiter() { return new OpportunityPersonRole("external_recruiter"); }
  static internalRecruiter() { return new OpportunityPersonRole("internal_recruiter"); }
  static recruitingCoordinator() { return new OpportunityPersonRole("recruiting_coordinator"); }
  static humanResources() { return new OpportunityPersonRole("human_resources"); }
  static hiringManager() { return new OpportunityPersonRole("hiring_manager"); }
  static potentialManager() { return new OpportunityPersonRole("potential_manager"); }
  static technicalInterviewer() { return new OpportunityPersonRole("technical_interviewer"); }
  static businessInterviewer() { return new OpportunityPersonRole("business_interviewer"); }
  static cultureInterviewer() { return new OpportunityPersonRole("culture_interviewer"); }
  static potentialTeammate() { return new OpportunityPersonRole("potential_teammate"); }
  static crossFunctionalStakeholder() { return new OpportunityPersonRole("cross_functional_stakeholder"); }
  static departmentLeader() { return new OpportunityPersonRole("department_leader"); }
  static executive() { return new OpportunityPersonRole("executive"); }
  static internalReferral() { return new OpportunityPersonRole("internal_referral"); }
  static founder() { return new OpportunityPersonRole("founder"); }
  static other() { return new OpportunityPersonRole("other"); }

  isExternalRecruiter() { return this.value === "external_recruiter"; }
  isInternalRecruiter() { return this.value === "internal_recruiter"; }
  isRecruitingCoordinator() { return this.value === "recruiting_coordinator"; }
  isHumanResources() { return this.value === "human_resources"; }
  isHiringManager() { return this.value === "hiring_manager"; }
  isPotentialManager() { return this.value === "potential_manager"; }
  isTechnicalInterviewer() { return this.value === "technical_interviewer"; }
  isBusinessInterviewer() { return this.value === "business_interviewer"; }
  isCultureInterviewer() { return this.value === "culture_interviewer"; }
  isPotentialTeammate() { return this.value === "potential_teammate"; }
  isCrossFunctionalStakeholder() { return this.value === "cross_functional_stakeholder"; }
  isDepartmentLeader() { return this.value === "department_leader"; }
  isExecutive() { return this.value === "executive"; }
  isInternalReferral() { return this.value === "internal_referral"; }
  isFounder() { return this.value === "founder"; }
  isOther() { return this.value === "other"; }

  toPrimitives(): string {
    return this.value;
  }
}
