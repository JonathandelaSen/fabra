import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/backend/modules/shared";
import { ChatMessage } from "../entities/chat-message.entity";
import { JobAnalysisChatContent } from "./job-analysis-chat-content.value-object";
import { JobAnalysisChatConversationId } from "./job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatMessageId } from "./job-analysis-chat-message-id.value-object";
import { AnalysisReference } from "./analysis-reference.value-object";
import { JobAnalysisChatExchange } from "./job-analysis-chat-exchange.value-object";

const userParams = {
  id: JobAnalysisChatMessageId.fromPrimitives("message-1"),
  userId: UserId.fromPrimitives("user-1"),
  analysisReference: AnalysisReference.fromPrimitives({
    type: "job_match_analysis",
    id: "analysis-1",
  }),
  conversationId: JobAnalysisChatConversationId.fromPrimitives("conversation-1"),
  content: JobAnalysisChatContent.fromPrimitives("Hello"),
  createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
};

const assistantParams = {
  ...userParams,
  id: JobAnalysisChatMessageId.fromPrimitives("message-2"),
  content: JobAnalysisChatContent.fromPrimitives("Hi there"),
  model: "gemini-3.1-pro-preview",
  metadata: { requestId: "req-1" },
};

describe("JobAnalysisChatExchange", () => {
  it("round-trips the exchange via primitives", () => {
    const userMsg = ChatMessage.createUserMessage(userParams);
    const assistantMsg = ChatMessage.createAssistantMessage(assistantParams);

    const exchange = JobAnalysisChatExchange.create(userMsg, assistantMsg);

    expect(exchange.userMessage.id).toBe("message-1");
    expect(exchange.assistantMessage.id).toBe("message-2");

    const primitives = exchange.toPrimitives();
    const hydrated = JobAnalysisChatExchange.fromPrimitives(primitives);

    expect(hydrated.userMessage.id).toBe("message-1");
    expect(hydrated.assistantMessage.id).toBe("message-2");
    expect(hydrated.assistantMessage.toPrimitives().model).toBe("gemini-3.1-pro-preview");
  });
});
