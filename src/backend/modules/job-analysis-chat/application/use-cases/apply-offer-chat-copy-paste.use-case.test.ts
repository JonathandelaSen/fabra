import { describe, expect, it, vi } from "vitest";
import { Timestamp, UserId } from "@/backend/modules/shared";
import { Conversation } from "../../domain/entities/conversation.entity";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { JobAnalysisChatConversationId } from "../../domain/value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatTitle } from "../../domain/value-objects/job-analysis-chat-title.value-object";
import { AnalysisReference } from "../../domain/value-objects/analysis-reference.value-object";
import { ApplyOfferChatCopyPasteUseCase } from "./apply-offer-chat-copy-paste.use-case";

function conversation() {
  return Conversation.create({
    id: JobAnalysisChatConversationId.fromPrimitives("conv-1"),
    userId: UserId.fromPrimitives("user-1"),
    analysisReference: AnalysisReference.fromPrimitives({
      type: "job_match_analysis",
      id: "analysis-1",
    }),
    title: JobAnalysisChatTitle.fromPrimitives("Chat"),
    createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
    updatedAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
  });
}

describe("ApplyOfferChatCopyPasteUseCase", () => {
  it("persists user and external assistant messages and publishes domain events", async () => {
    const conversationRepo: ConversationRepository = {
      search: vi.fn(),
      findById: vi.fn(async () => conversation()),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const messageRepo: ChatMessageRepository = {
      search: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(async (message) => message),
      delete: vi.fn(),
    };
    const eventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const result = await new ApplyOfferChatCopyPasteUseCase({
      conversationRepo,
      messageRepo,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      analysisId: "analysis-1",
      conversationId: "conv-1",
      userMessage: "Pregunta",
      assistantResponse: "Respuesta externa",
      requestId: "req-1",
    });

    expect(result.userMessage.toPrimitives()).toMatchObject({
      role: "user",
      content: "Pregunta",
    });
    expect(result.assistantMessage.toPrimitives()).toMatchObject({
      role: "assistant",
      content: "Respuesta externa",
      model: "external-chat",
      metadata: expect.objectContaining({
        assistanceMode: "copy_paste",
        source: "external-chat",
      }),
    });
    expect(messageRepo.save).toHaveBeenCalledTimes(2);
    expect(eventBus.publish).toHaveBeenCalledTimes(2);

    const firstCall = eventBus.publish.mock.calls[0][0];
    expect(firstCall).toHaveLength(1);
    expect(firstCall[0].eventName).toBe("analysis_chat_message_created");
    expect(firstCall[0].toPrimitives()).toEqual({
      messageId: result.userMessage.id,
      conversationId: "conv-1",
      role: "user",
    });

    const secondCall = eventBus.publish.mock.calls[1][0];
    expect(secondCall).toHaveLength(1);
    expect(secondCall[0].eventName).toBe("analysis_chat_message_created");
    expect(secondCall[0].toPrimitives()).toEqual({
      messageId: result.assistantMessage.id,
      conversationId: "conv-1",
      role: "assistant",
    });
  });
});
