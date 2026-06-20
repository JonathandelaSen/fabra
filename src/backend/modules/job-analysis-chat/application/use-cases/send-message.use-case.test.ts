import { describe, expect, it, vi } from "vitest";
import {
  InMemoryQueryBus,
  NoOpTelemetry,
  Timestamp,
  UserId,
} from "@/backend/modules/shared";
import { ChatMessage } from "../../domain/entities/chat-message.entity";
import { Conversation } from "../../domain/entities/conversation.entity";
import { AnalysisContextNotFoundError } from "../../domain/errors/analysis-context-not-found.error";
import type { JobAnalysisChatAIService } from "../../domain/repositories/job-analysis-chat-ai-service.repository";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { JobAnalysisChatContent } from "../../domain/value-objects/job-analysis-chat-content.value-object";
import { JobAnalysisChatConversationId } from "../../domain/value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatMessageId } from "../../domain/value-objects/job-analysis-chat-message-id.value-object";
import { JobAnalysisChatTitle } from "../../domain/value-objects/job-analysis-chat-title.value-object";
import { AnalysisReference } from "../../domain/value-objects/analysis-reference.value-object";
import { GetJobAnalysisChatContextQuery } from "../queries/get-job-analysis-chat-context.query";
import { SendMessageUseCase } from "./send-message.use-case";

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

function historyMessage() {
  return ChatMessage.createUserMessage({
    id: JobAnalysisChatMessageId.fromPrimitives("history-1"),
    userId: UserId.fromPrimitives("user-1"),
    analysisReference: AnalysisReference.fromPrimitives({
      type: "job_match_analysis",
      id: "analysis-1",
    }),
    conversationId: JobAnalysisChatConversationId.fromPrimitives("conv-1"),
    content: JobAnalysisChatContent.fromPrimitives("Antes"),
    createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
  });
}

describe("SendMessageUseCase", () => {
  it("gets context through the query bus, saves both messages, calls AI, and publishes events", async () => {
    const queryBus = new InMemoryQueryBus(new NoOpTelemetry());
    queryBus.register(GetJobAnalysisChatContextQuery.queryName, {
      async handle(query: GetJobAnalysisChatContextQuery) {
        expect(query.payload).toEqual({
          analysisId: "analysis-1",
          userId: "user-1",
        });
        return {
          analysisId: "analysis-1",
          cvId: "cv-1",
          analysisMode: "job_match",
          analysis: {},
          cv: {},
          cvText: "CV text",
        };
      },
    });
    const savedMessages: ChatMessage[] = [];
    const conversationRepo: ConversationRepository = {
      search: vi.fn(),
      findById: vi.fn(async () => conversation()),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const messageRepo: ChatMessageRepository = {
      search: vi.fn(async () => [historyMessage()]),
      findById: vi.fn(),
      save: vi.fn(async (message) => {
        savedMessages.push(message);
        return message;
      }),
      delete: vi.fn(),
    };
    const aiService: JobAnalysisChatAIService = {
      generateAnswer: vi.fn(async () => JobAnalysisChatContent.fromPrimitives("Respuesta IA")),
    };
    const eventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const result = await new SendMessageUseCase({
      conversationRepo,
      messageRepo,
      aiFactory: { create: vi.fn(() => aiService) },
      queryBus,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      analysisId: "analysis-1",
      conversationId: "conv-1",
      message: "Hola",
      provider: "mock",
      apiKey: "key",
      model: "gemini-3.1-pro-preview",
      requestId: "req-1",
    });

    expect(result.userMessage.toPrimitives().content).toBe("Hola");
    expect(result.assistantMessage.toPrimitives()).toMatchObject({
      role: "assistant",
      content: "Respuesta IA",
      model: "gemini-3.1-pro-preview",
    });
    expect(savedMessages).toHaveLength(2);
    expect(aiService.generateAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Hola",
        history: [expect.objectContaining({ content: "Antes" })],
      }),
    );
    expect(eventBus.publish).toHaveBeenCalledTimes(5);

    const firstCall = eventBus.publish.mock.calls[0][0];
    expect(firstCall).toHaveLength(1);
    expect(firstCall[0].eventName).toBe("analysis_chat_message_created");
    expect(firstCall[0].toPrimitives()).toEqual({
      messageId: result.userMessage.id,
      conversationId: "conv-1",
      role: "user",
    });

    const secondCall = eventBus.publish.mock.calls[3][0];
    expect(secondCall).toHaveLength(1);
    expect(secondCall[0].eventName).toBe("analysis_chat_message_created");
    expect(secondCall[0].toPrimitives()).toEqual({
      messageId: result.assistantMessage.id,
      conversationId: "conv-1",
      role: "assistant",
    });
  });

  it("does not call AI when legacy context is missing", async () => {
    const queryBus = new InMemoryQueryBus(new NoOpTelemetry());
    queryBus.register(GetJobAnalysisChatContextQuery.queryName, {
      async handle() {
        return null;
      },
    });
    const aiService: JobAnalysisChatAIService = {
      generateAnswer: vi.fn(async () => JobAnalysisChatContent.fromPrimitives("Respuesta IA")),
    };

    await expect(
      new SendMessageUseCase({
        conversationRepo: {
          search: vi.fn(),
          findById: vi.fn(async () => conversation()),
          save: vi.fn(),
          delete: vi.fn(),
        },
        messageRepo: {
          search: vi.fn(async () => []),
          findById: vi.fn(),
          save: vi.fn(),
          delete: vi.fn(),
        },
        aiFactory: { create: vi.fn(() => aiService) },
        queryBus,
        eventBus: { publish: vi.fn() } as never,
      }).execute({
        userId: "user-1",
        analysisId: "missing",
        conversationId: "conv-1",
        message: "Hola",
        provider: "mock",
        apiKey: "key",
        model: "gemini-3.1-pro-preview",
        requestId: "req-1",
      }),
    ).rejects.toBeInstanceOf(AnalysisContextNotFoundError);

    expect(aiService.generateAnswer).not.toHaveBeenCalled();
  });
});
