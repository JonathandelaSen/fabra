/**
 * Shared loading-state logic for master/detail screens that show a list of
 * items plus a detail pane, and auto-select the first item when none is
 * selected on the list route.
 *
 * The single most important rule encoded here: auto-selection and the detail
 * skeleton are gated on `isListPending` (the list query's initial load, when it
 * has no data yet), NOT on `isFetching`. Using `isFetching` causes a visible
 * flash of the empty "select an item" state during background refetches when
 * the list is already cached: the refetch blocks auto-selection, so the screen
 * falls through to the empty detail pane until the refetch settles, and only
 * then auto-selects and shows the detail skeleton.
 *
 * Pass react-query's `isPending` for `isListPending`. Keep `isFetching` for
 * UI-only spinners (e.g. a subtle "refreshing" indicator in the list), never
 * for the gating below.
 */
export interface ListDetailLoadingState {
  /** List query `isPending`: true only on the initial load, when no data exists yet. Never `isFetching`. */
  isListPending: boolean;
  /**
   * Selected item's detail query `isPending`: true whenever the detail has no
   * data yet, NOT `isFetching`. This matters because of a one-render gap right
   * after auto-selection: the detail query key just changed, so react-query
   * reports `status: "pending"` but `fetchStatus: "idle"` for one render before
   * the fetch actually starts — during that render `isFetching` is false. If the
   * loader were gated on `isFetching`, the screen would briefly fall through to
   * the empty "select an item" state (selected id set, detail data still null)
   * before the skeleton appears. `isPending` stays true across that whole window.
   * Only consulted when an item is selected; ignored otherwise.
   */
  isDetailPending: boolean;
  /** Number of items currently available in the list. */
  itemCount: number;
  /** Currently selected item id, or null when nothing is selected. */
  selectedId: string | null;
  /** True when the current route is the master/list route where the first item should be auto-selected. */
  isOnListRoute: boolean;
}

/** Whether the view should auto-select the first item (list route, nothing selected, rows are available). */
export function shouldAutoSelectFirstItem({
  isListPending,
  itemCount,
  selectedId,
  isOnListRoute,
}: ListDetailLoadingState): boolean {
  return isOnListRoute && !selectedId && !isListPending && itemCount > 0;
}

/** Whether to replace the whole screen (sidebar + detail) with a skeleton: only during the initial list load with no rows yet. */
export function shouldShowListShellLoader({
  isListPending,
  itemCount,
}: ListDetailLoadingState): boolean {
  return isListPending && itemCount === 0;
}

/**
 * Whether to show the detail-pane skeleton.
 *
 * The empty "select an item" state must never appear while items exist, so this
 * is deliberately NOT gated on `isOnListRoute`. During auto-selection there is a
 * render where `router.replace` has already flipped the URL off the list route
 * but the local selected id has not caught up yet (selectedId still null,
 * isOnListRoute already false). Gating on the route there would let the empty
 * state flash. Instead:
 *
 * - items exist but nothing is selected yet -> we are (about to be) auto-selecting
 *   the first item, so show the loader;
 * - an item is selected but its detail has no data yet -> show the loader.
 *
 * When there are no items at all, this returns false so the genuine empty state
 * can render.
 */
export function shouldShowDetailLoader(state: ListDetailLoadingState): boolean {
  if (state.itemCount > 0 && state.selectedId === null) return true;
  return state.selectedId !== null && state.isDetailPending;
}

/** Combined loader for single-pane screens that swap the whole content area (shell loader or detail loader). */
export function shouldShowMainLoader(state: ListDetailLoadingState): boolean {
  return shouldShowListShellLoader(state) || shouldShowDetailLoader(state);
}
