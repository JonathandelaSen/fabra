import type { Query } from "@/modules/shared";

export interface EvidenceCandidateResult {
  sourceId: string;
  date: string | null;
  content: string;
}

export interface ListJournalEntriesInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListJournalEntriesInRangeQuery
  implements Query<ListJournalEntriesInRangeInput, EvidenceCandidateResult[]>
{
  static readonly queryName = "work-journal.list-journal-entries-in-range";

  readonly queryName = ListJournalEntriesInRangeQuery.queryName;

  constructor(public readonly payload: ListJournalEntriesInRangeInput) {}
}
