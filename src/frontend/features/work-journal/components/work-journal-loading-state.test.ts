import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectWorkJournalEntry,
  shouldClearMissingWorkJournalSelection,
  shouldShowWorkJournalMainLoader,
} from "./work-journal-loading-state";

describe("work journal loading state", () => {
  describe("shouldAutoSelectWorkJournalEntry", () => {
    it("does not auto-select while the initial entries list is pending", () => {
      expect(
        shouldAutoSelectWorkJournalEntry({
          activeEntryId: null,
          entryCount: 0,
          isListPending: true,
          showForm: false,
          view: "list",
        })
      ).toBe(false);
    });

    it("auto-selects from cached entries during a background refetch (list view)", () => {
      expect(
        shouldAutoSelectWorkJournalEntry({
          activeEntryId: null,
          entryCount: 3,
          isListPending: false,
          showForm: false,
          view: "list",
        })
      ).toBe(true);
    });

    it("does not auto-select in the timeline view", () => {
      expect(
        shouldAutoSelectWorkJournalEntry({
          activeEntryId: null,
          entryCount: 3,
          isListPending: false,
          showForm: false,
          view: "timeline",
        })
      ).toBe(false);
    });

    it("does not auto-select while the new-entry form is open", () => {
      expect(
        shouldAutoSelectWorkJournalEntry({
          activeEntryId: null,
          entryCount: 3,
          isListPending: false,
          showForm: true,
          view: "list",
        })
      ).toBe(false);
    });
  });

  describe("shouldShowWorkJournalMainLoader", () => {
    it("shows the loader before auto-selection in list view (entries exist, nothing selected)", () => {
      expect(
        shouldShowWorkJournalMainLoader({
          activeEntryId: null,
          entryCount: 3,
          isContextsPending: false,
          isListPending: false,
          showForm: false,
          view: "list",
        })
      ).toBe(true);
    });

    it("does not show the loader once an entry is selected and resolved", () => {
      expect(
        shouldShowWorkJournalMainLoader({
          activeEntryId: "entry-1",
          entryCount: 3,
          isContextsPending: false,
          isListPending: false,
          showForm: false,
          view: "list",
        })
      ).toBe(false);
    });

    it("does not show the loader while the new-entry form is open", () => {
      expect(
        shouldShowWorkJournalMainLoader({
          activeEntryId: null,
          entryCount: 3,
          isContextsPending: false,
          isListPending: false,
          showForm: true,
          view: "list",
        })
      ).toBe(false);
    });

    it("does NOT show the loader in the timeline overview with no selection (the timeline is the content)", () => {
      expect(
        shouldShowWorkJournalMainLoader({
          activeEntryId: null,
          entryCount: 3,
          isContextsPending: false,
          isListPending: false,
          showForm: false,
          view: "timeline",
        })
      ).toBe(false);
    });

    it("shows the loader during the initial entries load in the timeline view", () => {
      expect(
        shouldShowWorkJournalMainLoader({
          activeEntryId: null,
          entryCount: 0,
          isContextsPending: false,
          isListPending: true,
          showForm: false,
          view: "timeline",
        })
      ).toBe(true);
    });

    it("shows the loader while a selected timeline entry's contexts are still loading", () => {
      expect(
        shouldShowWorkJournalMainLoader({
          activeEntryId: "entry-1",
          entryCount: 3,
          isContextsPending: true,
          isListPending: false,
          showForm: false,
          view: "timeline",
        })
      ).toBe(true);
    });

    it("does not flash the loader during a background refetch in list view with an entry selected", () => {
      expect(
        shouldShowWorkJournalMainLoader({
          activeEntryId: "entry-1",
          entryCount: 3,
          isContextsPending: false,
          isListPending: false,
          showForm: false,
          view: "list",
        })
      ).toBe(false);
    });
  });

  describe("shouldClearMissingWorkJournalSelection", () => {
    it("clears a route entry that no longer exists once the list has loaded", () => {
      expect(
        shouldClearMissingWorkJournalSelection({
          isListPending: false,
          routeEntryId: "gone",
          selectedEntryExists: false,
        })
      ).toBe(true);
    });

    it("waits for the list to settle before clearing a route id that is not in local data", () => {
      expect(
        shouldClearMissingWorkJournalSelection({
          isListPending: true,
          routeEntryId: "entry-1",
          selectedEntryExists: false,
        })
      ).toBe(false);
    });
  });
});
