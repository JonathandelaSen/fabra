import { describe, expect, it, vi } from "vitest";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { ListConversationsUseCase } from "./list-conversations.use-case";

describe("ListConversationsUseCase", () => {
  it("searches conversations by user and legacy analysis reference", async () => {
    const repo: ConversationRepository = {
      search: vi.fn(async () => []),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    await new ListConversationsUseCase({ conversationRepo: repo }).execute({
      userId: "user-1",
      cvId: "analysis-1",
    });

    expect(repo.search).toHaveBeenCalledWith({
      userId: expect.objectContaining({}),
      cvDocumentReference: expect.objectContaining({}),
    });
    const criteria = vi.mocked(repo.search).mock.calls[0]?.[0];
    expect(criteria?.userId.toPrimitives()).toBe("user-1");
    expect(criteria?.cvDocumentReference.toPrimitives()).toEqual({
      id: "analysis-1",
    });
  });
});
