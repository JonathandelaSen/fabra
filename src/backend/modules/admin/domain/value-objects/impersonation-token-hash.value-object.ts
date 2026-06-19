import { ValueObject } from "@/backend/modules/shared";

export class ImpersonationTokenHash extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) {
      throw new Error("Impersonation token hash cannot be empty.");
    }
  }

  static fromPrimitives(value: string): ImpersonationTokenHash {
    return new ImpersonationTokenHash(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
