"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listWorkJournalContexts,
  listWorkJournalEntries,
  toWorkJournalContextLegacyFromActivityContext,
} from "../api/work-journal-api";
import { toWorkJournalEntryLegacy } from "../api/work-journal-types";
import { workJournalQueryKeys } from "../api/work-journal-query-keys";

export function useWorkJournalContexts() {
  return useQuery({
    queryKey: workJournalQueryKeys.contexts(),
    queryFn: async () => {
      const data = await listWorkJournalContexts();
      return {
        contexts: data.contexts.map(toWorkJournalContextLegacyFromActivityContext),
        suggestions: [],
      };
    },
  });
}

export function useWorkJournalEntries() {
  return useQuery({
    queryKey: workJournalQueryKeys.entries(),
    queryFn: async () => {
      const data = await listWorkJournalEntries();
      return data.map(toWorkJournalEntryLegacy);
    },
  });
}
