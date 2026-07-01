import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
export class InvalidUserEmailError extends DomainError {
  constructor(value: string) { super(ErrorCode.INVALID_USER_EMAIL, "User email cannot be empty.", { value }); this.name = "InvalidUserEmailError"; }
}

export class UserEmail extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidUserEmailError(value);
  }

  static fromPrimitives(value: string): UserEmail {
    return new UserEmail(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
