import { describe, expect, it } from "vitest";
import type { WorkJournalEntry } from "../../api/work-journal-types";
import {
  formatRangeBadge,
  getContextTone,
  groupEntriesByPeriod,
  periodKey,
} from "./work-journal-timeline-utils";

function entry(
  overrides: Partial<WorkJournalEntry> & Pick<WorkJournalEntry, "id" | "dateStart">,
): WorkJournalEntry {
  return {
    id: overrides.id,
    userId: "user-1",
    contextId: overrides.contextId ?? "context-1",
    dateStart: overrides.dateStart,
    dateEnd: overrides.dateEnd ?? null,
    topic: overrides.topic ?? null,
    inputMode: overrides.inputMode ?? "manual",
    rawNotes: overrides.rawNotes ?? "",
    finalText: overrides.finalText ?? "",
    createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-01-01T00:00:00.000Z",
    context: overrides.context ?? null,
  };
}

describe("work-journal-timeline-utils", () => {
  it("computes month period keys from the start date", () => {
    expect(periodKey(new Date("2026-05-14T00:00:00"), "month")).toBe("2026-05");
  });

  it("computes week period keys anchored to Monday", () => {
    // 2026-05-14 is a Thursday; the Monday of that week is 2026-05-11
    expect(periodKey(new Date("2026-05-14T00:00:00"), "week")).toBe("2026-05-11");
  });

  it("groups entries by month in descending order", () => {
    const groups = groupEntriesByPeriod(
      [
        entry({ id: "a", dateStart: "2026-04-02" }),
        entry({ id: "b", dateStart: "2026-05-20" }),
        entry({ id: "c", dateStart: "2026-05-03" }),
      ],
      "month",
      "en-US",
    );

    expect(groups.map((group) => group.key)).toEqual(["2026-05", "2026-04"]);
    expect(groups[0].entries.map((view) => view.entry.id)).toEqual(["b", "c"]);
  });

  it("flags entries that continue past their period boundary", () => {
    const groups = groupEntriesByPeriod(
      [entry({ id: "long", dateStart: "2026-05-20", dateEnd: "2026-07-10" })],
      "month",
      "en-US",
    );

    expect(groups[0].entries[0].continuesAfter).toBe(true);
  });

  it("does not flag single-period ranges as continuing", () => {
    const groups = groupEntriesByPeriod(
      [entry({ id: "short", dateStart: "2026-05-04", dateEnd: "2026-05-08" })],
      "month",
      "en-US",
    );

    expect(groups[0].entries[0].continuesAfter).toBe(false);
  });

  it("formats single-day ranges without a dash", () => {
    expect(formatRangeBadge("2026-05-14", null, "en-US")).not.toContain("–");
    expect(formatRangeBadge("2026-05-14", "2026-05-18", "en-US")).toContain("–");
  });

  it("returns a deterministic, stable tone for a context id", () => {
    expect(getContextTone("context-1")).toBe(getContextTone("context-1"));
  });
});
