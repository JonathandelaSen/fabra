import type { WorkJournalRouteView } from "../hooks/use-work-journal-route-state";

interface WorkJournalAutoSelectionState {
  activeEntryId: string | null;
  entryCount: number;
  isResolvingQueries: boolean;
  showForm: boolean;
  view: WorkJournalRouteView;
}

interface WorkJournalMissingSelectionState {
  isResolvingQueries: boolean;
  routeEntryId: string | null;
  selectedEntryExists: boolean;
}

export function shouldShowWorkJournalMainLoader(state: WorkJournalAutoSelectionState) {
  return state.isResolvingQueries || shouldAutoSelectWorkJournalEntry(state);
}

export function shouldAutoSelectWorkJournalEntry({
  activeEntryId,
  entryCount,
  isResolvingQueries,
  showForm,
  view,
}: WorkJournalAutoSelectionState) {
  return (
    view === "list" &&
    !isResolvingQueries &&
    !activeEntryId &&
    !showForm &&
    entryCount > 0
  );
}

export function shouldClearMissingWorkJournalSelection({
  isResolvingQueries,
  routeEntryId,
  selectedEntryExists,
}: WorkJournalMissingSelectionState) {
  return Boolean(routeEntryId && !isResolvingQueries && !selectedEntryExists);
}
