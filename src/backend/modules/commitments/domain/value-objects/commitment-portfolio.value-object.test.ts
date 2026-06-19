import { describe, expect, it } from "vitest";
import { Commitment } from "../entities/commitment.entity";
import { CommitmentItem } from "../entities/commitment-item.entity";
import { CommitmentOutcome } from "../entities/commitment-outcome.entity";
import { CommitmentPortfolio } from "./commitment-portfolio.value-object";

const commitmentPrimitives = {
  id: "11111111-1111-4111-8111-111111111111",
  userId: "22222222-2222-4222-8222-222222222222",
  contextId: "33333333-3333-4333-8333-333333333333",
  title: "Ship the migration",
  description: null,
  successCriteria: null,
  resultNotes: null,
  source: "self" as const,
  status: "active" as const,
  priority: "high" as const,
  startDate: "2026-01-01",
  targetDate: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const itemPrimitives = {
  id: "44444444-4444-4444-8444-444444444444",
  userId: commitmentPrimitives.userId,
  commitmentId: commitmentPrimitives.id,
  title: "Write the value object",
  notes: null,
  evidenceNotes: null,
  status: "todo" as const,
  dueDate: null,
  completedAt: null,
  orderIndex: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const outcomePrimitives = {
  id: "55555555-5555-4555-8555-555555555555",
  userId: commitmentPrimitives.userId,
  commitmentId: commitmentPrimitives.id,
  type: "recognition" as const,
  status: "expected" as const,
  title: "Kudos in review",
  description: null,
  amount: null,
  currency: null,
  decidedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("CommitmentPortfolio", () => {
  it("exposes the collections it was built from", () => {
    const portfolio = CommitmentPortfolio.fromCollections({
      commitments: [Commitment.fromPrimitives(commitmentPrimitives)],
      items: [CommitmentItem.fromPrimitives(itemPrimitives)],
      outcomes: [CommitmentOutcome.fromPrimitives(outcomePrimitives)],
    });

    expect(portfolio.commitments).toHaveLength(1);
    expect(portfolio.items).toHaveLength(1);
    expect(portfolio.outcomes).toHaveLength(1);
  });

  it("serializes by delegating to each aggregate's toPrimitives", () => {
    const portfolio = CommitmentPortfolio.fromCollections({
      commitments: [Commitment.fromPrimitives(commitmentPrimitives)],
      items: [CommitmentItem.fromPrimitives(itemPrimitives)],
      outcomes: [CommitmentOutcome.fromPrimitives(outcomePrimitives)],
    });

    expect(portfolio.toPrimitives()).toEqual({
      commitments: [commitmentPrimitives],
      items: [itemPrimitives],
      outcomes: [outcomePrimitives],
    });
  });

  it("does not reflect later mutations of the source arrays", () => {
    const commitments = [Commitment.fromPrimitives(commitmentPrimitives)];
    const portfolio = CommitmentPortfolio.fromCollections({
      commitments,
      items: [],
      outcomes: [],
    });

    commitments.push(Commitment.fromPrimitives(commitmentPrimitives));

    expect(portfolio.commitments).toHaveLength(1);
  });
});
