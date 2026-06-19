"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listWorkJournalContexts,
  listWorkJournalEntries,
  toWorkJournalContextFromActivityContext,
} from "../api/work-journal-api";
import { workJournalQueryKeys } from "../api/work-journal-query-keys";

export function useWorkJournalContexts() {
  return useQuery({
    queryKey: workJournalQueryKeys.contexts(),
    queryFn: async () => {
      const data = await listWorkJournalContexts();
      return {
        contexts: data.contexts.map(toWorkJournalContextFromActivityContext),
        suggestions: [],
      };
    },
  });
}

export function useWorkJournalEntries() {
  return useQuery({
    queryKey: workJournalQueryKeys.entries(),
    queryFn: () => listWorkJournalEntries(),
  });
}
