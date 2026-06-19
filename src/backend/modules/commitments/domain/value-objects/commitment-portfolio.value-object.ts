import { ValueObject } from "@/backend/modules/shared";
import { Commitment, type CommitmentPrimitives } from "../entities/commitment.entity";
import { CommitmentItem, type CommitmentItemPrimitives } from "../entities/commitment-item.entity";
import { CommitmentOutcome, type CommitmentOutcomePrimitives } from "../entities/commitment-outcome.entity";

export interface CommitmentPortfolioPrimitives {
  commitments: CommitmentPrimitives[];
  items: CommitmentItemPrimitives[];
  outcomes: CommitmentOutcomePrimitives[];
}

export class CommitmentPortfolio extends ValueObject<CommitmentPortfolioPrimitives> {
  private constructor(
    private readonly commitmentList: readonly Commitment[],
    private readonly itemList: readonly CommitmentItem[],
    private readonly outcomeList: readonly CommitmentOutcome[]
  ) {
    super();
  }

  static fromPrimitives(primitives: CommitmentPortfolioPrimitives): CommitmentPortfolio {
    return new CommitmentPortfolio(
      primitives.commitments.map((commitment) => Commitment.fromPrimitives(commitment)),
      primitives.items.map((item) => CommitmentItem.fromPrimitives(item)),
      primitives.outcomes.map((outcome) => CommitmentOutcome.fromPrimitives(outcome))
    );
  }

  static fromCollections(collections: {
    commitments: Commitment[];
    items: CommitmentItem[];
    outcomes: CommitmentOutcome[];
  }): CommitmentPortfolio {
    return new CommitmentPortfolio(
      [...collections.commitments],
      [...collections.items],
      [...collections.outcomes]
    );
  }

  get commitments(): readonly Commitment[] {
    return this.commitmentList;
  }

  get items(): readonly CommitmentItem[] {
    return this.itemList;
  }

  get outcomes(): readonly CommitmentOutcome[] {
    return this.outcomeList;
  }

  toPrimitives(): CommitmentPortfolioPrimitives {
    return {
      commitments: this.commitmentList.map((commitment) => commitment.toPrimitives()),
      items: this.itemList.map((item) => item.toPrimitives()),
      outcomes: this.outcomeList.map((outcome) => outcome.toPrimitives()),
    };
  }
}
