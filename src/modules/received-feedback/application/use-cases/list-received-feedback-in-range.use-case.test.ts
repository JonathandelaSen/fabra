import { describe, expect, it, vi } from "vitest";
import type { ReceivedFeedbackRepository } from "../../domain/repositories/received-feedback.repository";
import { ListReceivedFeedbackInRangeUseCase } from "./list-received-feedback-in-range.use-case";
import { ReceivedFeedback } from "../../domain/entities/received-feedback.entity";

describe("ListReceivedFeedbackInRangeUseCase", () => {
  it("filters feedback to the period and returns ReceivedFeedback entities", async () => {
    const f1 = ReceivedFeedback.fromPrimitives({
      id: "f1",
      userId: "u1",
      activityContextId: "c1",
      receivedDate: "2026-03-01",
      giverName: "Manager",
      feedbackText: "Great work",
      userNote: null,
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z",
    });
    const f2 = ReceivedFeedback.fromPrimitives({
      id: "f2",
      userId: "u1",
      activityContextId: "c1",
      receivedDate: "2025-12-01",
      giverName: "Peer",
      feedbackText: "Out of range",
      userNote: null,
      createdAt: "2025-12-01T00:00:00Z",
      updatedAt: "2025-12-01T00:00:00Z",
    });

    const receivedFeedbackRepo = {
      search: vi.fn().mockResolvedValue([f1, f2]),
    } as unknown as ReceivedFeedbackRepository;

    const result = await new ListReceivedFeedbackInRangeUseCase({
      receivedFeedbackRepo,
    }).execute({ userId: "u1", dateFrom: "2026-01-01", dateTo: "2026-06-30" });

    expect(result).toEqual([f1]);
  });
});

