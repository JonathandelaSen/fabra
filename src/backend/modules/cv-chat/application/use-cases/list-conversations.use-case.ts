import { UserId } from "@/modules/shared";
import type { Conversation } from "../../domain/entities/conversation.entity";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { CVDocumentReference } from "../../domain/value-objects/cv-document-reference.value-object";

export interface ListConversationsInput {
  userId: string;
  cvId: string;
}

export class ListConversationsUseCase {
  constructor(
    private readonly deps: { conversationRepo: ConversationRepository },
  ) {}

  async execute(input: ListConversationsInput): Promise<Conversation[]> {
    return this.deps.conversationRepo.search({
      userId: UserId.fromPrimitives(input.userId),
      cvDocumentReference: CVDocumentReference.fromPrimitives({ id: input.cvId }),
    });
  }
}
