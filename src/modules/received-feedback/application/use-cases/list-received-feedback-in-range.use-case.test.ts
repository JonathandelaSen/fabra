import { describe, expect, it, vi } from "vitest";
import type { ReceivedFeedbackRepository } from "../../domain/repositories/received-feedback.repository";
import { ListReceivedFeedbackInRangeUseCase } from "./list-received-feedback-in-range.use-case";

describe("ListReceivedFeedbackInRangeUseCase", () => {
  it("filters feedback to the period and formats the content", async () => {
    const receivedFeedbackRepo = {
      search: vi.fn().mockResolvedValue([
        {
          toPrimitives: () => ({
            id: "f1",
            receivedDate: "2026-03-01",
            giverName: "Manager",
            feedbackText: "Great work",
          }),
        },
        {
          toPrimitives: () => ({
            id: "f2",
            receivedDate: "2025-12-01",
            giverName: "Peer",
            feedbackText: "Out of range",
          }),
        },
      ]),
    } as unknown as ReceivedFeedbackRepository;

    const result = await new ListReceivedFeedbackInRangeUseCase({
      receivedFeedbackRepo,
    }).execute({ userId: "u1", dateFrom: "2026-01-01", dateTo: "2026-06-30" });

    expect(result).toEqual([
      { sourceId: "f1", date: "2026-03-01", content: "Manager: Great work" },
    ]);
  });
});
