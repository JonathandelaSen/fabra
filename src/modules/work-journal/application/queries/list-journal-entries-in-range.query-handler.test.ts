import { describe, expect, it, vi } from "vitest";
import { ListJournalEntriesInRangeQuery } from "./list-journal-entries-in-range.query";
import { ListJournalEntriesInRangeQueryHandler } from "./list-journal-entries-in-range.query-handler";
import type { ListJournalEntriesInRangeUseCase } from "../use-cases/list-journal-entries-in-range.use-case";

describe("ListJournalEntriesInRangeQueryHandler", () => {
  it("delegates to the use case with the query payload", async () => {
    const result = [{ sourceId: "j1", date: "2026-02-01", content: "x" }];
    const useCase = {
      execute: vi.fn().mockResolvedValue(result),
    } as unknown as ListJournalEntriesInRangeUseCase;

    const handler = new ListJournalEntriesInRangeQueryHandler(useCase);
    const payload = {
      userId: "u1",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    };
    const output = await handler.handle(
      new ListJournalEntriesInRangeQuery(payload),
    );

    expect(useCase.execute).toHaveBeenCalledWith(payload);
    expect(output).toBe(result);
  });
});
