import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectReceivedFeedback,
  shouldClearMissingReceivedFeedbackSelection,
  shouldShowReceivedFeedbackMainLoader,
} from "./received-feedback-loading-state";

describe("received feedback loading state", () => {
  it("does not auto-select feedback while the list query is in flight", () => {
    expect(
      shouldAutoSelectReceivedFeedback({
        activeSelectedId: null,
        isCreating: false,
        isResolvingQueries: true,
        itemCount: 2,
      })
    ).toBe(false);
  });

  it("auto-selects feedback after loading when items exist and there is no selection", () => {
    expect(
      shouldAutoSelectReceivedFeedback({
        activeSelectedId: null,
        isCreating: false,
        isResolvingQueries: false,
        itemCount: 2,
      })
    ).toBe(true);
  });

  it("keeps the main pane on a loader while replacing the root URL with the first feedback id", () => {
    expect(
      shouldShowReceivedFeedbackMainLoader({
        activeSelectedId: null,
        isCreating: false,
        isResolvingQueries: false,
        itemCount: 2,
      })
    ).toBe(true);
  });

  it("waits for queries to settle before clearing a route id that is not in local data", () => {
    expect(
      shouldClearMissingReceivedFeedbackSelection({
        isResolvingQueries: true,
        routeSelectedId: "feedback-1",
        selectedItemExists: false,
      })
    ).toBe(false);
  });
});
