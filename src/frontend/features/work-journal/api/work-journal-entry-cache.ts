import type { WorkJournalEntry } from "./work-journal-types";

export function addWorkJournalEntryToCache(
  entries: WorkJournalEntry[] | undefined,
  entry: WorkJournalEntry
) {
  return [entry, ...(entries ?? []).filter((item) => item.id !== entry.id)];
}

export function replaceWorkJournalEntryInCache(
  entries: WorkJournalEntry[] | undefined,
  entry: WorkJournalEntry
) {
  return (entries ?? []).map((item) => (item.id === entry.id ? entry : item));
}

export function removeWorkJournalEntryFromCache(
  entries: WorkJournalEntry[] | undefined,
  id: string
) {
  return (entries ?? []).filter((item) => item.id !== id);
}
