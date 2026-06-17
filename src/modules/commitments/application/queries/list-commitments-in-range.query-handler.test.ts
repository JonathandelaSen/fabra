import { describe, expect, it, vi } from "vitest";
import { ListCommitmentsInRangeQuery } from "./list-commitments-in-range.query";
import { ListCommitmentsInRangeQueryHandler } from "./list-commitments-in-range.query-handler";
import type { ListCommitmentsInRangeUseCase } from "../use-cases/list-commitments-in-range.use-case";

describe("ListCommitmentsInRangeQueryHandler", () => {
  it("delegates to the use case with the query payload", async () => {
    const mockCommitment = {
      toPrimitives: () => ({
        id: "c1",
        title: "commitment",
      }),
    };
    const useCase = {
      execute: vi.fn().mockResolvedValue([mockCommitment]),
    } as unknown as ListCommitmentsInRangeUseCase;

    const handler = new ListCommitmentsInRangeQueryHandler(useCase);
    const payload = {
      userId: "u1",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    };
    const output = await handler.handle(
      new ListCommitmentsInRangeQuery(payload),
    );

    expect(useCase.execute).toHaveBeenCalledWith(payload);
    expect(output).toEqual([{ id: "c1", title: "commitment" }]);
  });
});
