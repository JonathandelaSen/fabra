import { describe, expect, it } from "vitest";
import {
  OPPORTUNITY_PERSON_ROLES,
  OpportunityPersonRole,
} from "./opportunity-person-role.value-object";

describe("OpportunityPersonRole", () => {
  it.each(OPPORTUNITY_PERSON_ROLES)("accepts the %s role", (role) => {
    expect(OpportunityPersonRole.fromPrimitives(role).toPrimitives()).toBe(role);
  });

  it("rejects an unsupported role", () => {
    expect(() => OpportunityPersonRole.fromPrimitives("wizard")).toThrow(
      "Invalid opportunity person role: wizard",
    );
  });

  it.each([
    ["external_recruiter", OpportunityPersonRole.externalRecruiter, "isExternalRecruiter"],
    ["internal_recruiter", OpportunityPersonRole.internalRecruiter, "isInternalRecruiter"],
    ["recruiting_coordinator", OpportunityPersonRole.recruitingCoordinator, "isRecruitingCoordinator"],
    ["human_resources", OpportunityPersonRole.humanResources, "isHumanResources"],
    ["hiring_manager", OpportunityPersonRole.hiringManager, "isHiringManager"],
    ["potential_manager", OpportunityPersonRole.potentialManager, "isPotentialManager"],
    ["technical_interviewer", OpportunityPersonRole.technicalInterviewer, "isTechnicalInterviewer"],
    ["business_interviewer", OpportunityPersonRole.businessInterviewer, "isBusinessInterviewer"],
    ["culture_interviewer", OpportunityPersonRole.cultureInterviewer, "isCultureInterviewer"],
    ["potential_teammate", OpportunityPersonRole.potentialTeammate, "isPotentialTeammate"],
    ["cross_functional_stakeholder", OpportunityPersonRole.crossFunctionalStakeholder, "isCrossFunctionalStakeholder"],
    ["department_leader", OpportunityPersonRole.departmentLeader, "isDepartmentLeader"],
    ["executive", OpportunityPersonRole.executive, "isExecutive"],
    ["internal_referral", OpportunityPersonRole.internalReferral, "isInternalReferral"],
    ["founder", OpportunityPersonRole.founder, "isFounder"],
    ["other", OpportunityPersonRole.other, "isOther"],
  ] as const)(
    "constructs and identifies %s semantically",
    (value, create, checker) => {
      const role = create();
      expect(role.toPrimitives()).toBe(value);
      expect(role[checker]()).toBe(true);
    },
  );
});
