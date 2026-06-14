import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/modules/shared";
import { ChatMessage } from "./chat-message.entity";
import { CVChatContent } from "../value-objects/cv-chat-content.value-object";
import { CVChatConversationId } from "../value-objects/cv-chat-conversation-id.value-object";
import { CVChatMessageId } from "../value-objects/cv-chat-message-id.value-object";
import { CVDocumentReference } from "../value-objects/cv-document-reference.value-object";

const baseParams = {
  id: CVChatMessageId.fromPrimitives("message-1"),
  userId: UserId.fromPrimitives("user-1"),
  cvDocumentReference: CVDocumentReference.fromPrimitives({
    id: "analysis-1",
  }),
  conversationId: CVChatConversationId.fromPrimitives("conversation-1"),
  content: CVChatContent.fromPrimitives("Hola"),
  createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
};

describe("ChatMessage", () => {
  it("creates a user message", () => {
    expect(ChatMessage.createUserMessage(baseParams).toPrimitives()).toEqual({
      id: "message-1",
      userId: "user-1",
      cvDocumentReference: { id: "analysis-1" },
      conversationId: "conversation-1",
      role: "user",
      content: "Hola",
      model: null,
      metadata: null,
      createdAt: "2026-05-13T10:00:00.000Z",
    });
  });

  it("creates an assistant message with model and metadata", () => {
    const message = ChatMessage.createAssistantMessage({
      ...baseParams,
      id: CVChatMessageId.fromPrimitives("message-2"),
      content: CVChatContent.fromPrimitives("Respuesta"),
      model: "gemini-3.1-pro-preview",
      metadata: { requestId: "req-1" },
    });

    expect(message.toPrimitives()).toMatchObject({
      id: "message-2",
      role: "assistant",
      content: "Respuesta",
      model: "gemini-3.1-pro-preview",
      metadata: { requestId: "req-1" },
    });
  });

  it("hydrates from primitives", () => {
    const message = ChatMessage.fromPrimitives(
      ChatMessage.createUserMessage(baseParams).toPrimitives(),
    );

    expect(message.toPrimitives().role).toBe("user");
    expect(message.pullDomainEvents()).toEqual([]);
  });

  it("records a created event for a user message", () => {
    const events = ChatMessage.createUserMessage(baseParams).pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["cv_chat_message_created"]);
    expect(events[0].toPrimitives()).toEqual({
      messageId: "message-1",
      conversationId: "conversation-1",
      role: "user",
    });
  });

  it("records a created event for an assistant message", () => {
    const events = ChatMessage.createAssistantMessage({
      ...baseParams,
      id: CVChatMessageId.fromPrimitives("message-2"),
      content: CVChatContent.fromPrimitives("Respuesta"),
      model: "gemini-3.1-pro-preview",
      metadata: { requestId: "req-1" },
    }).pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual(["cv_chat_message_created"]);
    expect(events[0].toPrimitives()).toEqual({
      messageId: "message-2",
      conversationId: "conversation-1",
      role: "assistant",
    });
  });
});
