import { describe, expect, it, vi } from "vitest";
import type { WorkJournalEntryRepository } from "../../domain/repositories/work-journal-entry.repository";
import { ListJournalEntriesInRangeUseCase } from "./list-journal-entries-in-range.use-case";

describe("ListJournalEntriesInRangeUseCase", () => {
  it("maps entries to evidence candidates preferring final text", async () => {
    const entryRepo = {
      search: vi.fn().mockResolvedValue([
        {
          toPrimitives: () => ({
            id: "e1",
            dateStart: "2026-02-01",
            finalText: "Shipped feature",
            rawNotes: "notes",
            topic: "topic",
          }),
        },
      ]),
    } as unknown as WorkJournalEntryRepository;

    const result = await new ListJournalEntriesInRangeUseCase({
      entryRepo,
    }).execute({ userId: "u1", dateFrom: "2026-01-01", dateTo: "2026-06-30" });

    expect(result).toEqual([
      { sourceId: "e1", date: "2026-02-01", content: "Shipped feature" },
    ]);
  });
});
