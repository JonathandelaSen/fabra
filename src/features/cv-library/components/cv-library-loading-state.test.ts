import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectCVLibraryItem,
  shouldShowCVLibraryDetailLoader,
  shouldShowCVLibraryShellLoader,
} from "./cv-library-loading-state";

describe("cv library loading state", () => {
  it("does not auto-select while the cv list query is in flight", () => {
    expect(
      shouldAutoSelectCVLibraryItem({
        cvCount: 2,
        isResolvingList: true,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(false);
  });

  it("keeps the sidebar visible while resolving the selected cv detail", () => {
    expect(
      shouldShowCVLibraryShellLoader({
        cvCount: 2,
        isResolvingDetail: false,
        isResolvingList: false,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(false);

    expect(
      shouldShowCVLibraryDetailLoader({
        cvCount: 2,
        isResolvingDetail: false,
        isResolvingList: false,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(true);
  });

  it("only replaces the whole shell while the initial cv list has no rows yet", () => {
    expect(
      shouldShowCVLibraryShellLoader({
        cvCount: 0,
        isResolvingDetail: false,
        isResolvingList: true,
        pathname: "/cvs",
        selectedCvId: null,
      })
    ).toBe(true);

    expect(
      shouldShowCVLibraryShellLoader({
        cvCount: 2,
        isResolvingDetail: false,
        isResolvingList: true,
        pathname: "/cvs/one",
        selectedCvId: "one",
      })
    ).toBe(false);
  });
});
