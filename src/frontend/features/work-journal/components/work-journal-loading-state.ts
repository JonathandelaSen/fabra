import {
  shouldAutoSelectFirstItem,
  shouldShowListShellLoader,
  shouldShowMainLoader,
  type ListDetailLoadingState,
} from "@/frontend/list-detail/list-detail-loading-state";
import type { WorkJournalRouteView } from "../hooks/use-work-journal-route-state";

interface WorkJournalAutoSelectionState {
  activeEntryId: string | null;
  entryCount: number;
  isListPending: boolean;
  showForm: boolean;
  view: WorkJournalRouteView;
}

interface WorkJournalMainLoaderState extends WorkJournalAutoSelectionState {
  isContextsPending: boolean;
}

interface WorkJournalMissingSelectionState {
  isListPending: boolean;
  routeEntryId: string | null;
  selectedEntryExists: boolean;
}

function toListDetailState(
  state: WorkJournalAutoSelectionState & { isContextsPending?: boolean },
): ListDetailLoadingState {
  return {
    isListPending: state.isListPending,
    isDetailPending: state.isContextsPending ?? false,
    itemCount: state.entryCount,
    selectedId: state.activeEntryId,
    isOnListRoute: state.view === "list",
  };
}

export function shouldAutoSelectWorkJournalEntry(state: WorkJournalAutoSelectionState) {
  if (state.showForm) return false;
  return shouldAutoSelectFirstItem(toListDetailState(state));
}

export function shouldShowWorkJournalMainLoader(state: WorkJournalMainLoaderState) {
  if (state.showForm) return false;
  // In the timeline overview (no entry selected) the timeline itself is the
  // content, so "entries exist but nothing selected" is a valid terminal state,
  // not an imminent auto-selection. Only the initial entries load shows a
  // skeleton there.
  if (state.view === "timeline" && !state.activeEntryId) {
    return shouldShowListShellLoader(toListDetailState(state));
  }
  return shouldShowMainLoader(toListDetailState(state));
}

export function shouldClearMissingWorkJournalSelection({
  isListPending,
  routeEntryId,
  selectedEntryExists,
}: WorkJournalMissingSelectionState) {
  return Boolean(routeEntryId && !isListPending && !selectedEntryExists);
}
