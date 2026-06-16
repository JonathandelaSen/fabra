import type { QueryHandler } from "@/modules/shared";
import type { WorkJournalEntryPrimitives } from "../../domain/entities/journal-entry.entity";
import type { ListJournalEntriesInRangeUseCase } from "../use-cases/list-journal-entries-in-range.use-case";
import {
  ListJournalEntriesInRangeQuery,
  type ListJournalEntriesInRangeInput,
} from "./list-journal-entries-in-range.query";

export class ListJournalEntriesInRangeQueryHandler
  implements QueryHandler<ListJournalEntriesInRangeQuery, WorkJournalEntryPrimitives[]>
{
  constructor(private readonly useCase: ListJournalEntriesInRangeUseCase) {}

  async handle(
    query: ListJournalEntriesInRangeQuery,
  ): Promise<WorkJournalEntryPrimitives[]> {
    const entries = await this.useCase.execute(query.payload);
    return entries.map((entry) => entry.toPrimitives());
  }
}
