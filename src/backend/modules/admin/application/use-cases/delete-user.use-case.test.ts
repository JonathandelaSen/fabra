import { describe, expect, it, vi } from "vitest";
import { DeleteUserUseCase } from "./delete-user.use-case";
import type { UserRepository } from "../../domain/repositories/user.repository";

describe("DeleteUserUseCase", () => {
  it("delegates to the repository", async () => {
    const mockRepo: UserRepository = {
      search: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new DeleteUserUseCase({ userRepo: mockRepo });
    await useCase.execute({ userId: "some-user-id" });

    expect(mockRepo.delete).toHaveBeenCalledWith("some-user-id");
  });
});
