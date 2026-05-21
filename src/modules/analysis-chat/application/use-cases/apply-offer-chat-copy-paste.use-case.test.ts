import { describe, expect, it, vi } from "vitest";
import { Timestamp, UserId, type EventTracker } from "@/modules/shared";
import { Conversation } from "../../domain/entities/conversation.entity";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { AnalysisChatConversationId } from "../../domain/value-objects/analysis-chat-conversation-id.value-object";
import { AnalysisChatTitle } from "../../domain/value-objects/analysis-chat-title.value-object";
import { AnalysisReference } from "../../domain/value-objects/analysis-reference.value-object";
import { ApplyOfferChatCopyPasteUseCase } from "./apply-offer-chat-copy-paste.use-case";

function conversation() {
  return Conversation.create({
    id: AnalysisChatConversationId.fromPrimitives("conv-1"),
    userId: UserId.fromPrimitives("user-1"),
    analysisReference: AnalysisReference.fromPrimitives({
      type: "job_match_analysis",
      id: "analysis-1",
    }),
    title: AnalysisChatTitle.fromPrimitives("Chat"),
    createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
    updatedAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
  });
}

describe("ApplyOfferChatCopyPasteUseCase", () => {
  it("persists user and external assistant messages without calling AI", async () => {
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
    const tracker = { record: vi.fn(async () => undefined) } satisfies EventTracker;

    const result = await new ApplyOfferChatCopyPasteUseCase({
      conversationRepo,
      messageRepo,
      tracker,
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
    expect(tracker.record).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: "offer_chat_copy_paste_response_applied",
        metadata: expect.objectContaining({
          assistanceMode: "copy_paste",
          provider: "external-chat",
        }),
      }),
    );
  });
});
