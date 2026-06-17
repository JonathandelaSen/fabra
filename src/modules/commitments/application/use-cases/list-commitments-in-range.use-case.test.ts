import { describe, expect, it, vi } from "vitest";
import type { CommitmentRepository } from "../../domain/repositories/commitment.repository";
import { ListCommitmentsInRangeUseCase } from "./list-commitments-in-range.use-case";
import { Commitment } from "../../domain/entities/commitment.entity";

function buildUseCase(
  commitments: Array<Record<string, unknown>>,
) {
  const commitmentRepo = {
    search: vi.fn().mockResolvedValue(
      commitments.map((c) =>
        Commitment.fromPrimitives({
          id: (c.id as string) ?? "c1",
          userId: (c.userId as string) ?? "u1",
          contextId: (c.contextId as string) ?? "ctx1",
          title: (c.title as string) ?? "commitment",
          description: (c.description as string | null) ?? null,
          successCriteria: null,
          resultNotes: (c.resultNotes as string | null) ?? null,
          source: "self",
          status: "active",
          priority: null,
          startDate: (c.startDate as string) ?? "2026-02-01",
          targetDate: (c.targetDate as string | null) ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ),
    ),
  } as unknown as CommitmentRepository;
  return new ListCommitmentsInRangeUseCase({ commitmentRepo });
}

describe("ListCommitmentsInRangeUseCase", () => {
  it("filters commitments to the period", async () => {
    const useCase = buildUseCase([
      {
        id: "c1",
        contextId: "ctx1",
        title: "Improve onboarding",
        description: null,
        resultNotes: "Reduced time to first value",
        startDate: "2026-02-01",
        targetDate: "2026-04-01",
      },
    ]);

    const result = await useCase.execute({
      userId: "u1",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c1");
  });

  it("includes commitments that overlap the period even when started earlier", async () => {
    const useCase = buildUseCase([
      {
        id: "before-open",
        contextId: "ctx1",
        title: "Started before, still active",
        description: null,
        resultNotes: null,
        startDate: "2025-03-01",
        targetDate: null,
      },
      {
        id: "before-ends-inside",
        contextId: "ctx1",
        title: "Started before, ends inside",
        description: null,
        resultNotes: null,
        startDate: "2025-03-01",
        targetDate: "2026-02-15",
      },
      {
        id: "after-period",
        contextId: "ctx1",
        title: "Starts after the period",
        description: null,
        resultNotes: null,
        startDate: "2026-08-01",
        targetDate: null,
      },
      {
        id: "ended-before",
        contextId: "ctx1",
        title: "Ended before the period",
        description: null,
        resultNotes: null,
        startDate: "2025-01-01",
        targetDate: "2025-06-30",
      },
    ]);

    const result = await useCase.execute({
      userId: "u1",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });

    expect(result.map((c) => c.id)).toEqual([
      "before-open",
      "before-ends-inside",
    ]);
  });

  it("filters by context when contextId is provided", async () => {
    const useCase = buildUseCase([
      {
        id: "in-context",
        contextId: "ctx1",
        title: "Same context",
        description: null,
        resultNotes: null,
        startDate: "2026-02-01",
        targetDate: null,
      },
      {
        id: "other-context",
        contextId: "ctx2",
        title: "Other context",
        description: null,
        resultNotes: null,
        startDate: "2026-02-01",
        targetDate: null,
      },
    ]);

    const result = await useCase.execute({
      userId: "u1",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
      contextId: "ctx1",
    });

    expect(result.map((c) => c.id)).toEqual(["in-context"]);
  });
});

