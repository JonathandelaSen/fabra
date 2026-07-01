import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidProfileSchemaVersionError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_PROFILE_SCHEMA_VERSION, "Profile schema version is required", { value });
    this.name = "InvalidProfileSchemaVersionError";
  }
}

export class ProfileSchemaVersion extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidProfileSchemaVersionError(value);
  }

  static fromPrimitives(value: string): ProfileSchemaVersion {
    return new ProfileSchemaVersion(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
