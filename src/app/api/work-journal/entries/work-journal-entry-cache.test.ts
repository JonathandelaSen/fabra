import { describe, expect, it } from "vitest";
import {
  addWorkJournalEntryToCache,
  removeWorkJournalEntryFromCache,
  replaceWorkJournalEntryInCache,
} from "@/features/work-journal/api/work-journal-entry-cache";
import type { WorkJournalEntry } from "@/features/work-journal/api/work-journal-types";

function entry(id: string, dateStart = "2026-05-18"): WorkJournalEntry {
  return {
    id,
    userId: "user-1",
    contextId: "context-1",
    dateStart: dateStart,
    dateEnd: null,
    topic: null,
    inputMode: "manual",
    rawNotes: `raw ${id}`,
    finalText: `final ${id}`,
    createdAt: `${dateStart}T10:00:00.000Z`,
    updatedAt: `${dateStart}T10:00:00.000Z`,
    metadata: {},
    context: null,
  };
}

describe("work journal entry cache updates", () => {
  it("adds a created entry without needing a full data refetch", () => {
    expect(addWorkJournalEntryToCache([entry("old")], entry("new"))).toEqual([
      entry("new"),
      entry("old"),
    ]);
  });

  it("replaces an edited entry in place", () => {
    const edited = { ...entry("entry-1"), finalText: "edited" };

    expect(
      replaceWorkJournalEntryInCache([entry("entry-1"), entry("entry-2")], edited)
    ).toEqual([edited, entry("entry-2")]);
  });

  it("removes a deleted entry", () => {
    expect(removeWorkJournalEntryFromCache([entry("one"), entry("two")], "one")).toEqual([
      entry("two"),
    ]);
  });
});
