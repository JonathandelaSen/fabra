import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class ConversationNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.CONVERSATION_NOT_FOUND, "Conversation not found");
    this.name = "ConversationNotFoundError";
  }
}
