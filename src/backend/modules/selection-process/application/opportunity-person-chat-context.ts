import type { LinkPrimitives } from "@/backend/modules/shared";

export interface OpportunityPersonChatContextPrimitives {
  name: string;
  role: string;
  jobTitle: string | null;
  organization: string | null;
  links: LinkPrimitives[];
  notes: string | null;
}
