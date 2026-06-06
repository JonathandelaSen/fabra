"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_LAYOUT_QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_LAYOUT_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_LAYOUT_QUERY).matches;
}

export function useIsDesktopLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
