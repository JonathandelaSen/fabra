import type { QueryHandler } from "@/backend/modules/shared";
import type { ListOpportunityPeopleForChatUseCase } from "../use-cases/list-opportunity-people-for-chat.use-case";
import {
  ListOpportunityPeopleForChatQuery,
  type OpportunityPersonChatContextPrimitives,
} from "./list-opportunity-people-for-chat.query";

export class ListOpportunityPeopleForChatQueryHandler
  implements
    QueryHandler<
      ListOpportunityPeopleForChatQuery,
      OpportunityPersonChatContextPrimitives[]
    >
{
  constructor(
    private readonly useCase: ListOpportunityPeopleForChatUseCase,
  ) {}

  async handle(
    query: ListOpportunityPeopleForChatQuery,
  ): Promise<OpportunityPersonChatContextPrimitives[]> {
    const people = await this.useCase.execute(query.payload);
    return people.map((person) => {
      const primitives = person.toPrimitives();
      return {
        name: primitives.name,
        role: primitives.role,
        jobTitle: primitives.jobTitle,
        organization: primitives.organization,
        links: primitives.links,
        notes: primitives.notes,
      };
    });
  }
}
