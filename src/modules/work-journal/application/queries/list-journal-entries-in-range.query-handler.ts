import type { QueryHandler } from "@/modules/shared";
import type { ListJournalEntriesInRangeUseCase } from "../use-cases/list-journal-entries-in-range.use-case";
import {
  ListJournalEntriesInRangeQuery,
  type EvidenceCandidateResult,
} from "./list-journal-entries-in-range.query";

export class ListJournalEntriesInRangeQueryHandler
  implements QueryHandler<ListJournalEntriesInRangeQuery, EvidenceCandidateResult[]>
{
  constructor(private readonly useCase: ListJournalEntriesInRangeUseCase) {}

  async handle(
    query: ListJournalEntriesInRangeQuery,
  ): Promise<EvidenceCandidateResult[]> {
    return this.useCase.execute(query.payload);
  }
}
