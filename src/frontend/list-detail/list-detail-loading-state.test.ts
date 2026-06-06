import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectFirstItem,
  shouldShowDetailLoader,
  shouldShowListShellLoader,
  shouldShowMainLoader,
  type ListDetailLoadingState,
} from "./list-detail-loading-state";

function state(overrides: Partial<ListDetailLoadingState> = {}): ListDetailLoadingState {
  return {
    isListPending: false,
    isDetailPending: false,
    itemCount: 0,
    selectedId: null,
    isOnListRoute: true,
    ...overrides,
  };
}

describe("list-detail loading state", () => {
  describe("shouldAutoSelectFirstItem", () => {
    it("does not auto-select while the initial list load is pending", () => {
      expect(
        shouldAutoSelectFirstItem(state({ isListPending: true, itemCount: 2 })),
      ).toBe(false);
    });

    it("auto-selects from cached rows during a background refetch (isFetching is irrelevant)", () => {
      expect(
        shouldAutoSelectFirstItem(state({ isListPending: false, itemCount: 2 })),
      ).toBe(true);
    });

    it("does not auto-select off the list route", () => {
      expect(
        shouldAutoSelectFirstItem(state({ itemCount: 2, isOnListRoute: false })),
      ).toBe(false);
    });

    it("does not auto-select when an item is already selected", () => {
      expect(
        shouldAutoSelectFirstItem(state({ itemCount: 2, selectedId: "a" })),
      ).toBe(false);
    });

    it("does not auto-select when there are no items", () => {
      expect(shouldAutoSelectFirstItem(state({ itemCount: 0 }))).toBe(false);
    });
  });

  describe("shouldShowListShellLoader", () => {
    it("shows the shell loader only during the initial load with no rows", () => {
      expect(
        shouldShowListShellLoader(state({ isListPending: true, itemCount: 0 })),
      ).toBe(true);
    });

    it("does not show the shell loader once rows exist", () => {
      expect(
        shouldShowListShellLoader(state({ isListPending: true, itemCount: 2 })),
      ).toBe(false);
    });

    it("does not show the shell loader during a background refetch", () => {
      expect(
        shouldShowListShellLoader(state({ isListPending: false, itemCount: 2 })),
      ).toBe(false);
    });
  });

  describe("shouldShowDetailLoader", () => {
    it("shows the detail skeleton while the selected detail has no data yet", () => {
      expect(
        shouldShowDetailLoader(
          state({ itemCount: 2, selectedId: "a", isDetailPending: true }),
        ),
      ).toBe(true);
    });

    it("shows the detail skeleton while about to auto-select the first item", () => {
      expect(shouldShowDetailLoader(state({ itemCount: 2 }))).toBe(true);
    });

    it("does not show the detail skeleton when an item is selected and resolved", () => {
      expect(
        shouldShowDetailLoader(state({ itemCount: 2, selectedId: "a" })),
      ).toBe(false);
    });

    it(
      "regression: keeps the loader on during the select->fetch gap so the empty " +
        "state never flashes (right after auto-select, the detail query still has " +
        "no data even though isFetching is briefly false)",
      () => {
        expect(
          shouldShowDetailLoader(
            state({
              itemCount: 2,
              selectedId: "a",
              isDetailPending: true,
            }),
          ),
        ).toBe(true);
      },
    );

    it("does not keep the loader on during a background detail refetch (data already present)", () => {
      expect(
        shouldShowDetailLoader(
          state({ itemCount: 2, selectedId: "a", isDetailPending: false }),
        ),
      ).toBe(false);
    });

    it(
      "regression: keeps the loader on during the route handoff when items exist but " +
        "local selection still lags. router.replace flips the URL off the list route " +
        "one render before the local selected id updates, so isOnListRoute is false and " +
        "selectedId is still null. The empty state must never show while items exist.",
      () => {
        expect(
          shouldShowDetailLoader(
            state({ itemCount: 2, selectedId: null, isOnListRoute: false }),
          ),
        ).toBe(true);
      },
    );

    it("lets the empty state show only when there are genuinely no items", () => {
      expect(
        shouldShowDetailLoader(
          state({ itemCount: 0, selectedId: null, isOnListRoute: false }),
        ),
      ).toBe(false);
    });
  });

  describe("shouldShowMainLoader", () => {
    it("combines the shell and detail loaders", () => {
      expect(
        shouldShowMainLoader(state({ isListPending: true, itemCount: 0 })),
      ).toBe(true);
      expect(shouldShowMainLoader(state({ itemCount: 2 }))).toBe(true);
      expect(
        shouldShowMainLoader(state({ itemCount: 2, selectedId: "a" })),
      ).toBe(false);
    });
  });
});
