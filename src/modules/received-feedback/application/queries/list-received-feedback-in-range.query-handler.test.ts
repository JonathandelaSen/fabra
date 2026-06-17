import { describe, expect, it, vi } from "vitest";
import { ListReceivedFeedbackInRangeQuery } from "./list-received-feedback-in-range.query";
import { ListReceivedFeedbackInRangeQueryHandler } from "./list-received-feedback-in-range.query-handler";
import type { ListReceivedFeedbackInRangeUseCase } from "../use-cases/list-received-feedback-in-range.use-case";
import { ReceivedFeedback } from "../../domain/entities/received-feedback.entity";

describe("ListReceivedFeedbackInRangeQueryHandler", () => {
  it("delegates to the use case with the query payload", async () => {
    const result: ReceivedFeedback[] = [];
    const useCase = {
      execute: vi.fn().mockResolvedValue(result),
    } as unknown as ListReceivedFeedbackInRangeUseCase;

    const handler = new ListReceivedFeedbackInRangeQueryHandler(useCase);
    const payload = {
      userId: "u1",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    };
    const output = await handler.handle(
      new ListReceivedFeedbackInRangeQuery(payload),
    );

    expect(useCase.execute).toHaveBeenCalledWith(payload);
    expect(output).toEqual([]);
  });
});

