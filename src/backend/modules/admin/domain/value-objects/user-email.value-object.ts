import { ValueObject } from "@/backend/modules/shared";

export class UserEmail extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("User email cannot be empty.");
  }

  static fromPrimitives(value: string): UserEmail {
    return new UserEmail(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
