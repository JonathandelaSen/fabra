import { describe, expect, it, vi } from "vitest";
import type { WorkJournalEntryRepository } from "../../domain/repositories/work-journal-entry.repository";
import { ListJournalEntriesInRangeUseCase } from "./list-journal-entries-in-range.use-case";

describe("ListJournalEntriesInRangeUseCase", () => {
  it("queries repository with parsed primitives and filters by contextId", async () => {
    const entry1 = { contextId: "c1" };
    const entry2 = { contextId: "c2" };
    const entryRepo = {
      search: vi.fn().mockResolvedValue([entry1, entry2]),
    } as unknown as WorkJournalEntryRepository;

    const useCase = new ListJournalEntriesInRangeUseCase({ entryRepo });

    const result = await useCase.execute({
      userId: "u1",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
      contextId: "c1",
    });

    expect(entryRepo.search).toHaveBeenCalled();
    expect(result).toEqual([entry1]);
  });
});
