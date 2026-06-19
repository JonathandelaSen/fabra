import { describe, expect, it, vi } from "vitest";
import { GetCVChatContextUseCase } from "./get-cv-chat-context.use-case";

describe("GetCVChatContextUseCase", () => {
  it("delegates to the CV context reader", async () => {
    const context = { cvId: "cv-1", cv: {} as never, cvText: "text" };
    const findByCVId = vi.fn().mockResolvedValue(context);
    const useCase = new GetCVChatContextUseCase({ findByCVId });
    await expect(useCase.execute({ cvId: "cv-1", userId: "user-1" })).resolves.toBe(context);
  });
});
