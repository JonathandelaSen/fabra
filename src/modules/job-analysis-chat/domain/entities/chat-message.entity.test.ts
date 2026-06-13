import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/modules/shared";
import { ChatMessage } from "./chat-message.entity";
import { JobAnalysisChatContent } from "../value-objects/job-analysis-chat-content.value-object";
import { JobAnalysisChatConversationId } from "../value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatMessageId } from "../value-objects/job-analysis-chat-message-id.value-object";
import { AnalysisReference } from "../value-objects/analysis-reference.value-object";

const baseParams = {
  id: JobAnalysisChatMessageId.fromPrimitives("message-1"),
  userId: UserId.fromPrimitives("user-1"),
  analysisReference: AnalysisReference.fromPrimitives({
    type: "job_match_analysis",
    id: "analysis-1",
  }),
  conversationId: JobAnalysisChatConversationId.fromPrimitives("conversation-1"),
  content: JobAnalysisChatContent.fromPrimitives("Hola"),
  createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
};

describe("ChatMessage", () => {
  it("creates a user message", () => {
    expect(ChatMessage.createUserMessage(baseParams).toPrimitives()).toEqual({
      id: "message-1",
      userId: "user-1",
      analysisReference: { type: "job_match_analysis", id: "analysis-1" },
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
      id: JobAnalysisChatMessageId.fromPrimitives("message-2"),
      content: JobAnalysisChatContent.fromPrimitives("Respuesta"),
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
    expect(events.map((e) => e.eventName)).toEqual(["analysis_chat_message_created"]);
    expect(events[0].toPrimitives()).toEqual({
      messageId: "message-1",
      conversationId: "conversation-1",
      role: "user",
    });
  });

  it("records a created event for an assistant message", () => {
    const events = ChatMessage.createAssistantMessage({
      ...baseParams,
      id: JobAnalysisChatMessageId.fromPrimitives("message-2"),
      content: JobAnalysisChatContent.fromPrimitives("Respuesta"),
      model: "gemini-3.1-pro-preview",
      metadata: { requestId: "req-1" },
    }).pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual(["analysis_chat_message_created"]);
    expect(events[0].toPrimitives()).toEqual({
      messageId: "message-2",
      conversationId: "conversation-1",
      role: "assistant",
    });
  });
});
