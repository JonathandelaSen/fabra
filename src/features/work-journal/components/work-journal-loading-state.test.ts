import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectWorkJournalEntry,
  shouldClearMissingWorkJournalSelection,
  shouldShowWorkJournalMainLoader,
} from "./work-journal-loading-state";

describe("work journal loading state", () => {
  it("keeps the main pane on a loader for any in-flight query", () => {
    expect(
      shouldShowWorkJournalMainLoader({
        activeEntryId: "entry-1",
        entryCount: 3,
        isResolvingQueries: true,
        showForm: false,
        view: "list",
      })
    ).toBe(true);
  });

  it("does not auto-select the first entry while list data is still resolving", () => {
    expect(
      shouldAutoSelectWorkJournalEntry({
        activeEntryId: null,
        entryCount: 3,
        isResolvingQueries: true,
        showForm: false,
        view: "list",
      })
    ).toBe(false);
  });

  it("auto-selects after loading when the list has entries and no explicit selection", () => {
    expect(
      shouldAutoSelectWorkJournalEntry({
        activeEntryId: null,
        entryCount: 3,
        isResolvingQueries: false,
        showForm: false,
        view: "list",
      })
    ).toBe(true);
  });

  it("keeps the main pane on a loader while replacing the root URL with the first entry id", () => {
    expect(
      shouldShowWorkJournalMainLoader({
        activeEntryId: null,
        entryCount: 3,
        isResolvingQueries: false,
        showForm: false,
        view: "list",
      })
    ).toBe(true);
  });

  it("waits for queries to settle before clearing a route id that is not in local data", () => {
    expect(
      shouldClearMissingWorkJournalSelection({
        isResolvingQueries: true,
        routeEntryId: "entry-1",
        selectedEntryExists: false,
      })
    ).toBe(false);
  });
});
