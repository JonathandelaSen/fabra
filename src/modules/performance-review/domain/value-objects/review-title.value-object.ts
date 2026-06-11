import { DomainError, ValueObject } from "@/modules/shared";

export class ReviewTitle extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): ReviewTitle {
    const trimmed = value.trim();
    if (!trimmed) throw new DomainError("Review title cannot be empty.");
    return new ReviewTitle(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
