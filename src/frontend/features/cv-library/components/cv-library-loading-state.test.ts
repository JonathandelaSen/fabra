import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectCVLibraryItem,
  shouldShowCVLibraryDetailLoader,
  shouldShowCVLibraryShellLoader,
} from "./cv-library-loading-state";

describe("cv library loading state", () => {
  it("does not auto-select while the initial cv list is still pending", () => {
    expect(
      shouldAutoSelectCVLibraryItem({
        cvCount: 0,
        isListPending: true,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(false);
  });

  it("auto-selects from cached rows during a background refetch", () => {
    expect(
      shouldAutoSelectCVLibraryItem({
        cvCount: 2,
        isListPending: false,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(true);
  });

  it("keeps the sidebar visible and shows the detail skeleton before auto-selection", () => {
    expect(
      shouldShowCVLibraryShellLoader({
        cvCount: 2,
        isDetailPending: false,
        isListPending: false,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(false);

    expect(
      shouldShowCVLibraryDetailLoader({
        cvCount: 2,
        isDetailPending: false,
        isListPending: false,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(true);
  });

  it("only replaces the whole shell while the initial cv list has no rows yet", () => {
    expect(
      shouldShowCVLibraryShellLoader({
        cvCount: 0,
        isDetailPending: false,
        isListPending: true,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(true);

    expect(
      shouldShowCVLibraryShellLoader({
        cvCount: 2,
        isDetailPending: false,
        isListPending: true,
        pathname: "/cvs/one",
        selectedCvId: "one",
      })
    ).toBe(false);
  });
});
