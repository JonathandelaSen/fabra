interface CVLibraryAutoSelectionState {
  cvCount: number;
  isResolvingList: boolean;
  pathname: string;
  selectedCvId: string | null;
}

interface CVLibraryLoaderState extends CVLibraryAutoSelectionState {
  isResolvingDetail: boolean;
}

export function shouldAutoSelectCVLibraryItem({
  cvCount,
  isResolvingList,
  pathname,
  selectedCvId,
}: CVLibraryAutoSelectionState) {
  return pathname === "/cvs" && !selectedCvId && !isResolvingList && cvCount > 0;
}

export function shouldShowCVLibraryShellLoader({
  cvCount,
  isResolvingList,
}: CVLibraryLoaderState) {
  return isResolvingList && cvCount === 0;
}

export function shouldShowCVLibraryDetailLoader(state: CVLibraryLoaderState) {
  return state.isResolvingDetail || shouldAutoSelectCVLibraryItem(state);
}
