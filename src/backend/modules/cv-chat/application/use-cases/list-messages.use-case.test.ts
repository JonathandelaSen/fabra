import { describe, expect, it, vi } from "vitest";
import { ListMessagesUseCase } from "./list-messages.use-case";

describe("ListMessagesUseCase", () => {
  it("loads messages for a CV conversation", async () => {
    const search = vi.fn().mockResolvedValue([]);
    const useCase = new ListMessagesUseCase({ messageRepo: { search } as never });
    await expect(useCase.execute({ userId: "user-1", conversationId: "conversation-1" })).resolves.toEqual([]);
    expect(search).toHaveBeenCalledOnce();
  });
});
