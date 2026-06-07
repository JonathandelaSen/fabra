import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectReceivedFeedback,
  shouldClearMissingReceivedFeedbackSelection,
  shouldShowReceivedFeedbackMainLoader,
} from "./received-feedback-loading-state";

describe("received feedback loading state", () => {
  describe("shouldAutoSelectReceivedFeedback", () => {
    it("does not auto-select while the initial feedback list is pending", () => {
      expect(
        shouldAutoSelectReceivedFeedback({
          activeSelectedId: null,
          isCreating: false,
          isListPending: true,
          itemCount: 0,
        })
      ).toBe(false);
    });

    it("auto-selects from cached feedback during a background refetch", () => {
      expect(
        shouldAutoSelectReceivedFeedback({
          activeSelectedId: null,
          isCreating: false,
          isListPending: false,
          itemCount: 2,
        })
      ).toBe(true);
    });

    it("does not auto-select while creating a new feedback", () => {
      expect(
        shouldAutoSelectReceivedFeedback({
          activeSelectedId: null,
          isCreating: true,
          isListPending: false,
          itemCount: 2,
        })
      ).toBe(false);
    });
  });

  describe("shouldShowReceivedFeedbackMainLoader", () => {
    it("shows the loader before auto-selection (items exist, nothing selected)", () => {
      expect(
        shouldShowReceivedFeedbackMainLoader({
          activeSelectedId: null,
          isContextsPending: false,
          isCreating: false,
          isListPending: false,
          itemCount: 2,
        })
      ).toBe(true);
    });

    it("does not show the loader while creating (the form is shown instead)", () => {
      expect(
        shouldShowReceivedFeedbackMainLoader({
          activeSelectedId: null,
          isContextsPending: false,
          isCreating: true,
          isListPending: false,
          itemCount: 2,
        })
      ).toBe(false);
    });

    it("shows the loader while the selected item's contexts are still loading", () => {
      expect(
        shouldShowReceivedFeedbackMainLoader({
          activeSelectedId: "a",
          isContextsPending: true,
          isCreating: false,
          isListPending: false,
          itemCount: 2,
        })
      ).toBe(true);
    });

    it("does not show the loader once an item is selected and resolved", () => {
      expect(
        shouldShowReceivedFeedbackMainLoader({
          activeSelectedId: "a",
          isContextsPending: false,
          isCreating: false,
          isListPending: false,
          itemCount: 2,
        })
      ).toBe(false);
    });

    it("lets the empty state show only when there is genuinely no feedback", () => {
      expect(
        shouldShowReceivedFeedbackMainLoader({
          activeSelectedId: null,
          isContextsPending: false,
          isCreating: false,
          isListPending: false,
          itemCount: 0,
        })
      ).toBe(false);
    });
  });

  describe("shouldClearMissingReceivedFeedbackSelection", () => {
    it("clears a route selection that no longer exists once the list has loaded", () => {
      expect(
        shouldClearMissingReceivedFeedbackSelection({
          isListPending: false,
          routeSelectedId: "gone",
          selectedItemExists: false,
        })
      ).toBe(true);
    });

    it("waits for the list to settle before clearing a route id that is not in local data", () => {
      expect(
        shouldClearMissingReceivedFeedbackSelection({
          isListPending: true,
          routeSelectedId: "feedback-1",
          selectedItemExists: false,
        })
      ).toBe(false);
    });
  });
});
