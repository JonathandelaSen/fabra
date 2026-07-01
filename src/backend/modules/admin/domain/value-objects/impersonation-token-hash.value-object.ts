import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
export class InvalidImpersonationTokenHashError extends DomainError {
  constructor(value: string) { super(ErrorCode.INVALID_IMPERSONATION_TOKEN_HASH, "Impersonation token hash cannot be empty.", { value }); this.name = "InvalidImpersonationTokenHashError"; }
}

export class ImpersonationTokenHash extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) {
      throw new InvalidImpersonationTokenHashError(value);
    }
  }

  static fromPrimitives(value: string): ImpersonationTokenHash {
    return new ImpersonationTokenHash(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
