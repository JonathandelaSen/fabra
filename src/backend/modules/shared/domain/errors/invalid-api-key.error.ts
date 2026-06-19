import { DomainError } from "./domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidApiKeyError extends DomainError {
  constructor(message?: string) {
    super(
      ErrorCode.AI_API_KEY_INVALID,
      message || "The provided AI API key is incorrect or invalid."
    );
    this.name = "InvalidApiKeyError";
  }
}
