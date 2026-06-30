import type { OpportunityPerson } from "../../domain/entities/opportunity-person.entity";
import type {
  ListOpportunityPeopleByAnalysisInput,
  ListOpportunityPeopleByAnalysisUseCase,
} from "./list-opportunity-people-by-analysis.use-case";

export class ListOpportunityPeopleForChatUseCase {
  constructor(
    private readonly listPeople: ListOpportunityPeopleByAnalysisUseCase,
  ) {}

  async execute(
    input: ListOpportunityPeopleByAnalysisInput,
  ): Promise<OpportunityPerson[]> {
    return this.listPeople.execute(input);
  }
}
