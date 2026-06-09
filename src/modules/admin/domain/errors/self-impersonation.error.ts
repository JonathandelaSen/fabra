import { DomainError } from "@/modules/shared/domain/errors/domain-error";

export class SelfImpersonationError extends DomainError {
  constructor() {
    super("Cannot impersonate yourself");
    this.name = "SelfImpersonationError";
  }
}
