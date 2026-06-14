import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/modules/shared";
import { Conversation } from "./conversation.entity";
import { CVChatConversationId } from "../value-objects/cv-chat-conversation-id.value-object";
import { CVChatTitle } from "../value-objects/cv-chat-title.value-object";
import { CVDocumentReference } from "../value-objects/cv-document-reference.value-object";

function createConversation() {
  return Conversation.create({
    id: CVChatConversationId.fromPrimitives("conversation-1"),
    userId: UserId.fromPrimitives("user-1"),
    cvDocumentReference: CVDocumentReference.fromPrimitives({
      id: "analysis-1",
    }),
    title: CVChatTitle.fromPrimitives("Oferta"),
    createdAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
    updatedAt: Timestamp.fromPrimitives("2026-05-13T10:00:00.000Z"),
  });
}

describe("Conversation", () => {
  it("creates and serializes a conversation", () => {
    expect(createConversation().toPrimitives()).toEqual({
      id: "conversation-1",
      userId: "user-1",
      cvDocumentReference: { id: "analysis-1" },
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

    conversation.rename(CVChatTitle.fromPrimitives("Nueva oferta"));

    expect(conversation.toPrimitives().title).toBe("Nueva oferta");
  });

  it("records a created event on create", () => {
    const events = createConversation().pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["cv_chat_conversation_created"]);
    expect(events[0].toPrimitives()).toEqual({ conversationId: "conversation-1" });
  });

  it("records a renamed event on rename", () => {
    const conversation = Conversation.fromPrimitives(
      createConversation().toPrimitives(),
    );

    conversation.rename(CVChatTitle.fromPrimitives("Nueva oferta"));
    const events = conversation.pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual(["cv_chat_conversation_renamed"]);
    expect(events[0].toPrimitives()).toEqual({ conversationId: "conversation-1" });
  });
});
