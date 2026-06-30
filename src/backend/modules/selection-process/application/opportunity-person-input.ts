import { Link, type LinkPrimitives, LongText } from "@/backend/modules/shared";
import { OpportunityPersonName } from "../domain/value-objects/opportunity-person-name.value-object";
import { OpportunityPersonRole } from "../domain/value-objects/opportunity-person-role.value-object";

export interface OpportunityPersonProfileInput {
  name: string;
  role: string;
  jobTitle?: string | null;
  organization?: string | null;
  email?: string | null;
  phone?: string | null;
  links?: LinkPrimitives[];
  notes?: string | null;
}

export function toOpportunityPersonProfile(input: OpportunityPersonProfileInput) {
  return {
    name: OpportunityPersonName.fromPrimitives(input.name),
    role: OpportunityPersonRole.fromPrimitives(input.role),
    jobTitle: optionalText(input.jobTitle),
    organization: optionalText(input.organization),
    email: optionalText(input.email),
    phone: optionalText(input.phone),
    links: (input.links ?? []).map(Link.fromPrimitives),
    notes: optionalText(input.notes),
  };
}

function optionalText(value: string | null | undefined): LongText | null {
  const normalized = value?.trim() || null;
  return normalized === null ? null : LongText.fromPrimitives(normalized);
}
