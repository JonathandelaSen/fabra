import type { LinkPrimitives } from "@/backend/modules/shared";
import type {
  OpportunityPersonPrimitives,
  OpportunityPersonRoleValue,
} from "@/backend/modules/selection-process";

export interface OpportunityPersonResponse {
  id: string;
  name: string;
  role: OpportunityPersonRoleValue;
  jobTitle: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  links: LinkPrimitives[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ListOpportunityPeopleResponse = OpportunityPersonResponse[];
export type CreateOpportunityPersonResponse = OpportunityPersonResponse;

export function toOpportunityPersonResponse(
  person: OpportunityPersonPrimitives,
): OpportunityPersonResponse {
  return {
    id: person.id,
    name: person.name,
    role: person.role as OpportunityPersonRoleValue,
    jobTitle: person.jobTitle,
    organization: person.organization,
    email: person.email,
    phone: person.phone,
    links: person.links,
    notes: person.notes,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  };
}

export function toOpportunityPeopleResponse(
  people: OpportunityPersonPrimitives[],
): ListOpportunityPeopleResponse {
  return people.map(toOpportunityPersonResponse);
}
