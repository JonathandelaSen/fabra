import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/frontend/testing/render";
import { useIsDesktopLayout } from "./use-is-desktop-layout";

type ChangeListener = () => void;

function createMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<ChangeListener>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: "(min-width: 1024px)",
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: ChangeListener) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_event: string, listener: ChangeListener) => {
      listeners.delete(listener);
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  return {
    matchMedia: vi.fn(() => mediaQuery),
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      for (const listener of listeners) listener();
    },
    mediaQuery,
  };
}

describe("useIsDesktopLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reads the current desktop media query state", () => {
    const media = createMatchMedia(true);
    vi.stubGlobal("matchMedia", media.matchMedia);

    const { result } = renderHookWithProviders(() => useIsDesktopLayout());

    expect(result.current).toBe(true);
    expect(media.matchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
  });

  it("updates when the media query changes", () => {
    const media = createMatchMedia(false);
    vi.stubGlobal("matchMedia", media.matchMedia);
    const { result } = renderHookWithProviders(() => useIsDesktopLayout());

    act(() => {
      media.setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it("unsubscribes from media query changes on unmount", () => {
    const media = createMatchMedia(false);
    vi.stubGlobal("matchMedia", media.matchMedia);
    const { unmount } = renderHookWithProviders(() => useIsDesktopLayout());

    unmount();

    expect(media.mediaQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
