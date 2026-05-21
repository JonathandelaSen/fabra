import { describe, expect, it, vi } from "vitest";
import {
  InMemoryQueryBus,
  Timestamp,
  UserId,
  type EventTracker,
} from "@/modules/shared";
import { ChatMessage } from "../../domain/entities/chat-message.entity";
import { Conversation } from "../../domain/entities/conversation.entity";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { AnalysisChatContent } from "../../domain/value-objects/analysis-chat-content.value-object";
import { AnalysisChatConversationId } from "../../domain/value-objects/analysis-chat-conversation-id.value-object";
import { AnalysisChatMessageId } from "../../domain/value-objects/analysis-chat-message-id.value-object";
import { AnalysisChatTitle } from "../../domain/value-objects/analysis-chat-title.value-object";
import { AnalysisReference } from "../../domain/value-objects/analysis-reference.value-object";
import { GetAnalysisChatContextQuery } from "../queries/get-analysis-chat-context.query";
import { PrepareOfferChatCopyPasteUseCase } from "./prepare-offer-chat-copy-paste.use-case";

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

function historyMessage() {
  return ChatMessage.createAssistantMessage({
    id: AnalysisChatMessageId.fromPrimitives("history-1"),
    userId: UserId.fromPrimitives("user-1"),
    analysisReference: AnalysisReference.fromPrimitives({
      type: "job_match_analysis",
      id: "analysis-1",
    }),
    conversationId: AnalysisChatConversationId.fromPrimitives("conv-1"),
    content: AnalysisChatContent.fromPrimitives("Respuesta previa"),
    model: "mock-model",
    metadata: null,
    createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
  });
}

describe("PrepareOfferChatCopyPasteUseCase", () => {
  it("builds a plain text external chat prompt with context and history", async () => {
    const queryBus = new InMemoryQueryBus();
    queryBus.register(GetAnalysisChatContextQuery.queryName, {
      async handle() {
        return {
          analysisId: "analysis-1",
          cvId: "cv-1",
          analysisMode: "job_match",
          analysis: {
            title: "Frontend role",
            job_description: "React and TypeScript role",
          },
          cv: { name: "CV principal" },
          cvText: "React experience",
        };
      },
    });
    const conversationRepo: ConversationRepository = {
      search: vi.fn(),
      findById: vi.fn(async () => conversation()),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const messageRepo: ChatMessageRepository = {
      search: vi.fn(async () => [historyMessage()]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const tracker = { record: vi.fn(async () => undefined) } satisfies EventTracker;

    const result = await new PrepareOfferChatCopyPasteUseCase({
      conversationRepo,
      messageRepo,
      queryBus,
      tracker,
    }).execute({
      userId: "user-1",
      analysisId: "analysis-1",
      conversationId: "conv-1",
      message: "Como explico mi experiencia?",
      requestId: "req-1",
    });

    expect(result).toMatchObject({
      workflowId: "offer_chat.assistant_response",
      schemaVersion: "1",
      expectedResponse: { kind: "plain_text" },
    });
    expect(result.prompt).toContain("Como explico mi experiencia?");
    expect(result.prompt).toContain("React and TypeScript role");
    expect(result.prompt).toContain("Respuesta previa");
    expect(tracker.record).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: "offer_chat_copy_paste_prompt_prepared",
        metadata: expect.objectContaining({ assistanceMode: "copy_paste" }),
      }),
    );
  });
});
