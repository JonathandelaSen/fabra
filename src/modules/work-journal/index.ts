export { createWorkJournalModule } from "./work-journal.module";

export type { ContextType, ContextStatus } from "./domain/entities/journal-context.entity";
export type { EntryInputMode } from "./domain/entities/journal-entry.entity";

export { ListJournalEntriesInRangeQuery } from "./application/queries/list-journal-entries-in-range.query";
export type {
  EvidenceCandidateResult,
  ListJournalEntriesInRangeInput,
} from "./application/queries/list-journal-entries-in-range.query";
export { ListJournalEntriesInRangeQueryHandler } from "./application/queries/list-journal-entries-in-range.query-handler";

export { ContextNotFoundError } from "./domain/errors/context-not-found.error";
export { ContextArchivedError } from "./domain/errors/context-archived.error";
export { EntryNotFoundError } from "./domain/errors/entry-not-found.error";
