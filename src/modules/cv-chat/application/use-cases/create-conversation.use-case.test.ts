import { describe, expect, it, vi } from "vitest";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { CreateConversationUseCase } from "./create-conversation.use-case";

describe("CreateConversationUseCase", () => {
  it("creates a conversation and publishes domain events", async () => {
    const repo: ConversationRepository = {
      search: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(async (conversation) => conversation),
      delete: vi.fn(),
    };
    const eventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const conversation = await new CreateConversationUseCase({
      conversationRepo: repo,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      cvId: "analysis-1",
      title: "Chat",
      requestId: "req-1",
    });

    expect(conversation.toPrimitives()).toMatchObject({
      userId: "user-1",
      cvDocumentReference: { id: "analysis-1" },
      title: "Chat",
    });
    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_chat_conversation_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      conversationId: conversation.id,
    });
  });
});
