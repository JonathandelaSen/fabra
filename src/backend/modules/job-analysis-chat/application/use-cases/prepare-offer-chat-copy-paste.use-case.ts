import {
  CopyPastePreparation,
  UserId,
  type QueryBus,
} from "@/backend/modules/shared";
import { AnalysisContextNotFoundError } from "../../domain/errors/analysis-context-not-found.error";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import type { JobAnalysisChatContext } from "../../domain/value-objects/job-analysis-chat-context.value-object";
import { JobAnalysisChatConversationId } from "../../domain/value-objects/job-analysis-chat-conversation-id.value-object";
import { GetJobAnalysisChatContextQuery } from "../queries/get-job-analysis-chat-context.query";
import { buildOfferChatCopyPastePrompt } from "../services/offer-chat-copy-paste-prompts";

export interface PrepareOfferChatCopyPasteInput {
  userId: string;
  analysisId: string;
  conversationId: string;
  message: string;
  requestId: string;
}

export class PrepareOfferChatCopyPasteUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      messageRepo: ChatMessageRepository;
      queryBus: QueryBus;
    },
  ) {}

  async execute(
    input: PrepareOfferChatCopyPasteInput,
  ): Promise<CopyPastePreparation> {
    const ownerId = UserId.fromPrimitives(input.userId);
    const conversationId = JobAnalysisChatConversationId.fromPrimitives(
      input.conversationId,
    );
    const conversation = await this.deps.conversationRepo.findById(
      conversationId,
      ownerId,
    );
    if (!conversation) throw new ConversationNotFoundError();

    const context =
      await this.deps.queryBus.execute<JobAnalysisChatContext | null>(
        new GetJobAnalysisChatContextQuery({
          analysisId: input.analysisId,
          userId: input.userId,
        }),
      );
    if (!context) throw new AnalysisContextNotFoundError();

    const history = await this.deps.messageRepo.search({
      userId: ownerId,
      conversationId,
    });
    const prompt = buildOfferChatCopyPastePrompt({
      message: input.message,
      context,
      history: history.map((message) => message.toPrimitives()),
    });

    return CopyPastePreparation.fromPrimitives({
      workflowId: "offer_chat.assistant_response",
      schemaVersion: "1",
      prompt,
      expectedResponse: { kind: "plain_text", envelope: null },
      privacyNotice:
        "This prompt may include CV, offer, and analysis data. Paste it only into external AI tools you trust.",
      interactionId: null,
      attemptId: null,
    });
  }
}
