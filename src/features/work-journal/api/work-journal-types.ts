import type {
  WorkJournalContextResponse,
  WorkJournalEntryResponse,
} from "@/app/api/work-journal/entries/responses";

export type {
  WorkJournalContextType,
  WorkJournalContextStatus,
  WorkJournalEntryInputMode,
  WorkJournalContextResponse,
  WorkJournalEntryResponse,
} from "@/app/api/work-journal/entries/responses";

export type WorkJournalContext = WorkJournalContextResponse;
export type WorkJournalEntry = WorkJournalEntryResponse;
