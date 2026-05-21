import {
  Timestamp,
  UserId,
  type QueryBus,
} from "@/modules/shared";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import type { EventTracker } from "@/modules/shared/domain/repositories/event-tracker.repository";
import { AnalysisContextNotFoundError } from "../../domain/errors/analysis-context-not-found.error";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import type { AnalysisChatContext } from "../../domain/repositories/analysis-chat-ai-service.repository";
import { AnalysisChatConversationId } from "../../domain/value-objects/analysis-chat-conversation-id.value-object";
import { GetAnalysisChatContextQuery } from "../queries/get-analysis-chat-context.query";
import { buildOfferChatCopyPastePrompt } from "../services/offer-chat-copy-paste-prompts";

export interface PrepareOfferChatCopyPasteInput {
  userId: string;
  analysisId: string;
  conversationId: string;
  message: string;
  requestId: string;
}

export interface PrepareOfferChatCopyPasteResult {
  workflowId: "offer_chat.assistant_response";
  schemaVersion: "1";
  prompt: string;
  expectedResponse: { kind: "plain_text" };
  privacyNotice: string;
}

export class PrepareOfferChatCopyPasteUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      messageRepo: ChatMessageRepository;
      queryBus: QueryBus;
      tracker: EventTracker;
    },
  ) {}

  async execute(
    input: PrepareOfferChatCopyPasteInput,
  ): Promise<PrepareOfferChatCopyPasteResult> {
    const ownerId = UserId.fromPrimitives(input.userId);
    const conversationId = AnalysisChatConversationId.fromPrimitives(
      input.conversationId,
    );
    const conversation = await this.deps.conversationRepo.findById(
      conversationId,
      ownerId,
    );
    if (!conversation) throw new ConversationNotFoundError();

    const context =
      await this.deps.queryBus.execute<AnalysisChatContext | null>(
        new GetAnalysisChatContextQuery({
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

    await this.deps.tracker.record({
      userId: input.userId,
      cvId: context.cvId,
      analysisId: input.analysisId,
      requestId: input.requestId,
      stage: "offer_chat_copy_paste_prompt_prepared",
      status: "success",
      source: "api_analysis_chat_copy_paste",
      textLength: input.message.length,
      metadata: {
        assistanceMode: ASSISTANCE_MODE.copyPaste,
        conversationId: input.conversationId,
        historyLength: history.length,
        preparedAt: Timestamp.fromPrimitives(new Date().toISOString()).toPrimitives(),
      },
    });

    return {
      workflowId: "offer_chat.assistant_response",
      schemaVersion: "1",
      prompt,
      expectedResponse: { kind: "plain_text" },
      privacyNotice:
        "This prompt may include CV, offer, and analysis data. Paste it only into external AI tools you trust.",
    };
  }
}
