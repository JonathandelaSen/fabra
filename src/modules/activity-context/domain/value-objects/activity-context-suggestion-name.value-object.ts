import { ValueObject } from "@/modules/shared";

export class ActivityContextSuggestionName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): ActivityContextSuggestionName {
    const name = value.trim();
    if (!name) throw new Error("Activity context suggestion name cannot be empty.");
    return new ActivityContextSuggestionName(name);
  }

  toPrimitives(): string {
    return this.value;
  }
}
