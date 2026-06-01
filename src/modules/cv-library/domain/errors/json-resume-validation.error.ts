import { DomainError } from "@/modules/shared";

export class JsonResumeValidationError extends DomainError {
  constructor(reason: string) {
    super(`Invalid JSON Resume: ${reason}`);
    this.name = "JsonResumeValidationError";
  }
}
