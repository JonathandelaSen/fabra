import type { Query } from "@/backend/modules/shared";
import type { WorkJournalEntryPrimitives } from "../../domain/entities/journal-entry.entity";

export interface ListJournalEntriesInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListJournalEntriesInRangeQuery
  implements Query<ListJournalEntriesInRangeInput, WorkJournalEntryPrimitives[]>
{
  static readonly queryName = "work-journal.list-journal-entries-in-range";

  readonly queryName = ListJournalEntriesInRangeQuery.queryName;

  constructor(public readonly payload: ListJournalEntriesInRangeInput) {}
}
