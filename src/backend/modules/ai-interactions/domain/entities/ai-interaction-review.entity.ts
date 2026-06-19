import { AggregateRoot } from "@/modules/shared";

export const aiInteractionRatings = {
  good: "good",
  mixed: "mixed",
  bad: "bad",
} as const;

export type AIInteractionRating =
  (typeof aiInteractionRatings)[keyof typeof aiInteractionRatings];

export interface AIInteractionReviewPrimitives {
  interactionId: string;
  reviewerUserId: string;
  rating: AIInteractionRating;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export class AIInteractionReview extends AggregateRoot {
  private constructor(private readonly primitives: AIInteractionReviewPrimitives) {
    super();
  }

  static create(primitives: AIInteractionReviewPrimitives) {
    return new AIInteractionReview(structuredClone(primitives));
  }

  static fromPrimitives(primitives: AIInteractionReviewPrimitives) {
    return new AIInteractionReview(structuredClone(primitives));
  }

  toPrimitives() {
    return structuredClone(this.primitives);
  }
}
