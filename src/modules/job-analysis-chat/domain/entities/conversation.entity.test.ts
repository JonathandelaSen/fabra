import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/modules/shared";
import { Conversation } from "./conversation.entity";
import { JobAnalysisChatConversationId } from "../value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatTitle } from "../value-objects/job-analysis-chat-title.value-object";
import { AnalysisReference } from "../value-objects/analysis-reference.value-object";

function createConversation() {
  return Conversation.create({
    id: JobAnalysisChatConversationId.fromPrimitives("conversation-1"),
    userId: UserId.fromPrimitives("user-1"),
    analysisReference: AnalysisReference.fromPrimitives({
      type: "job_match_analysis",
      id: "analysis-1",
    }),
    title: JobAnalysisChatTitle.fromPrimitives("Oferta"),
    createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
    updatedAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
  });
}

describe("Conversation", () => {
  it("creates and serializes a conversation", () => {
    expect(createConversation().toPrimitives()).toEqual({
      id: "conversation-1",
      userId: "user-1",
      analysisReference: { type: "job_match_analysis", id: "analysis-1" },
      title: "Oferta",
      createdAt: "2026-05-13T10:00:00.000Z",
      updatedAt: "2026-05-13T10:00:00.000Z",
    });
  });

  it("hydrates from primitives without recording events", () => {
    const conversation = Conversation.fromPrimitives(
      createConversation().toPrimitives(),
    );

    expect(conversation.pullDomainEvents()).toEqual([]);
  });

  it("renames a conversation", () => {
    const conversation = Conversation.fromPrimitives(
      createConversation().toPrimitives(),
    );

    conversation.rename(JobAnalysisChatTitle.fromPrimitives("Nueva oferta"));

    expect(conversation.toPrimitives().title).toBe("Nueva oferta");
  });

  it("records a created event on create", () => {
    const events = createConversation().pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["analysis_chat_conversation_created"]);
    expect(events[0].toPrimitives()).toEqual({ conversationId: "conversation-1" });
  });

  it("records a renamed event on rename", () => {
    const conversation = Conversation.fromPrimitives(
      createConversation().toPrimitives(),
    );

    conversation.rename(JobAnalysisChatTitle.fromPrimitives("Nueva oferta"));
    const events = conversation.pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual(["analysis_chat_conversation_renamed"]);
    expect(events[0].toPrimitives()).toEqual({ conversationId: "conversation-1" });
  });
});
