import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

export class InvalidEntityIdError extends DomainError {
  constructor(value: string, label: string) {
    super(ErrorCode.INVALID_ENTITY_ID, `${label} cannot be empty.`, { value, label });
    this.name = "InvalidEntityIdError";
  }
}

export class EntityId extends ValueObject<string> {
  protected constructor(private readonly value: string, label: string) {
    super();
    if (!value.trim()) throw new InvalidEntityIdError(value, label);
  }

  static fromPrimitives(value: string): EntityId {
    return new EntityId(value, "Entity id");
  }

  toPrimitives(): string {
    return this.value;
  }
}
