import type { Query } from "@/backend/modules/shared";
import type { OpportunityPersonChatContextPrimitives } from "../opportunity-person-chat-context";

export type { OpportunityPersonChatContextPrimitives } from "../opportunity-person-chat-context";

export interface ListOpportunityPeopleForChatInput {
  analysisId: string;
  userId: string;
}

export class ListOpportunityPeopleForChatQuery
  implements
    Query<
      ListOpportunityPeopleForChatInput,
      OpportunityPersonChatContextPrimitives[]
    >
{
  static readonly queryName =
    "selection-process.list-opportunity-people-for-chat";

  readonly queryName = ListOpportunityPeopleForChatQuery.queryName;

  constructor(public readonly payload: ListOpportunityPeopleForChatInput) {}
}
