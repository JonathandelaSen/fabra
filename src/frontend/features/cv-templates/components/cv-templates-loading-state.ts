import { shouldShowMainLoader } from "@/frontend/list-detail/list-detail-loading-state";

const TEMPLATES_BASE_PATH = "/templates";

/**
 * Resolve the selected template id from the pathname, returning null unless the
 * path is under /templates AND points at a known template.
 *
 * The view is mounted synchronously when the user switches to the templates tab,
 * before `router.push` has updated the URL, so the pathname briefly still belongs
 * to the previous page (e.g. `/job-analyses/{id}`). Without this guard the stale
 * segment would be treated as a selected (but non-existent) template id, turning
 * off the loader and flashing the "choose a template" empty state. Returning null
 * for any non-template segment keeps the loader on until a real template resolves.
 */
export function resolveActiveTemplateId(
  pathname: string,
  knownTemplateIds: readonly string[],
): string | null {
  if (!pathname.startsWith(`${TEMPLATES_BASE_PATH}/`)) return null;
  const segment = decodeURIComponent(
    pathname.slice(`${TEMPLATES_BASE_PATH}/`.length).split("/")[0] ?? "",
  );
  return segment && knownTemplateIds.includes(segment) ? segment : null;
}

interface CVTemplatesLoaderState {
  isCvsPending: boolean;
  pathname: string;
  templateCount: number;
  templateId: string | null;
}

export function shouldShowCVTemplatesLoader({
  isCvsPending,
  pathname,
  templateCount,
  templateId,
}: CVTemplatesLoaderState) {
  // Templates are a static list, so they are never "pending". The CV list feeds
  // the detail pane, so its initial load maps to the detail loader.
  return shouldShowMainLoader({
    isListPending: false,
    isDetailPending: isCvsPending,
    itemCount: templateCount,
    selectedId: templateId,
    isOnListRoute: pathname === "/templates",
  });
}
