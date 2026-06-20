import { IsoDate, ValueObject } from "@/backend/modules/shared";

export class ReceivedFeedbackDate extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(
    value: string,
    today = new Date().toISOString().slice(0, 10),
  ): ReceivedFeedbackDate {
    IsoDate.fromPrimitives(value);
    if (value > today)
      throw new Error("Received feedback date cannot be in the future.");
    return new ReceivedFeedbackDate(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
