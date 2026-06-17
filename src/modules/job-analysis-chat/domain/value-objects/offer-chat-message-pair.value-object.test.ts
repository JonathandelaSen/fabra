import { describe, expect, it } from "vitest";
import { OfferChatMessagePair } from "./offer-chat-message-pair.value-object";
import { ChatMessage } from "../entities/chat-message.entity";

const mockMsgPrimitives = {
  id: "msg-1",
  userId: "user-1",
  analysisReference: { type: "job_match_analysis" as const, id: "analysis-1" },
  conversationId: "conv-1",
  role: "user" as const,
  content: "Hello",
  model: null,
  metadata: null,
  createdAt: "2026-06-17T00:00:00.000Z",
};

const mockAssistantPrimitives = {
  id: "msg-2",
  userId: "user-1",
  analysisReference: { type: "job_match_analysis" as const, id: "analysis-1" },
  conversationId: "conv-1",
  role: "assistant" as const,
  content: "Hi there",
  model: "external-chat",
  metadata: { requestId: "req-1" },
  createdAt: "2026-06-17T00:00:01.000Z",
};

describe("OfferChatMessagePair", () => {
  it("creates from entities and round-trips through primitives", () => {
    const userMsg = ChatMessage.fromPrimitives(mockMsgPrimitives);
    const assistantMsg = ChatMessage.fromPrimitives(mockAssistantPrimitives);

    const result = OfferChatMessagePair.create(userMsg, assistantMsg);

    expect(result.userMessage).toBe(userMsg);
    expect(result.assistantMessage).toBe(assistantMsg);

    const primitives = result.toPrimitives();
    expect(primitives.userMessage).toEqual(mockMsgPrimitives);
    expect(primitives.assistantMessage).toEqual(mockAssistantPrimitives);

    const restored = OfferChatMessagePair.fromPrimitives(primitives);
    expect(restored.toPrimitives()).toEqual(primitives);
  });
});
