import { describe, expect, it, vi } from "vitest";
import { Conversation } from "../../domain/entities/conversation.entity";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { RenameConversationUseCase } from "./rename-conversation.use-case";

function conversation() {
  return Conversation.fromPrimitives({
    id: "conv-1",
    userId: "user-1",
    cvDocumentReference: {
      id: "analysis-1",
    },
    title: "Old",
    createdAt: "2026-05-13T10:00:00.000Z",
    updatedAt: "2026-05-13T10:00:00.000Z",
  });
}

describe("RenameConversationUseCase", () => {
  it("renames and saves an existing conversation", async () => {
    const repo: ConversationRepository = {
      search: vi.fn(),
      findById: vi.fn(async () => conversation()),
      save: vi.fn(async (conv) => conv),
      delete: vi.fn(),
    };
    const eventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const result = await new RenameConversationUseCase({
      conversationRepo: repo,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      cvId: "analysis-1",
      conversationId: "conv-1",
      title: "New",
      requestId: "req-1",
    });

    expect(result.toPrimitives().title).toBe("New");
    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_chat_conversation_renamed");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      conversationId: "conv-1",
    });
  });

  it("throws when the conversation does not exist", async () => {
    const repo: ConversationRepository = {
      search: vi.fn(),
      findById: vi.fn(async () => null),
      save: vi.fn(),
      delete: vi.fn(),
    };

    await expect(
      new RenameConversationUseCase({
        conversationRepo: repo,
        eventBus: { publish: vi.fn() } as never,
      }).execute({
        userId: "user-1",
        cvId: "analysis-1",
        conversationId: "missing",
        title: "New",
        requestId: "req-1",
      }),
    ).rejects.toBeInstanceOf(ConversationNotFoundError);
  });
});
