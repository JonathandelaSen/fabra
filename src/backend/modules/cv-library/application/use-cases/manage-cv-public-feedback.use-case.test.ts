import { describe, expect, it, vi } from "vitest";
import { DeleteCVPublicFeedbackUseCase, ListCVPublicFeedbackUseCase } from "./manage-cv-public-feedback.use-case";
describe("CV public feedback use cases", () => {
  it("lists and deletes owner feedback", async () => {
    const repo = { listForOwner: vi.fn(async () => []), deleteForOwner: vi.fn(async () => undefined) };
    await expect(new ListCVPublicFeedbackUseCase(repo).execute({ cvId: "cv", userId: "user" })).resolves.toEqual([]);
    await new DeleteCVPublicFeedbackUseCase(repo).execute({ id: "feedback", userId: "user" });
    expect(repo.deleteForOwner).toHaveBeenCalledWith("feedback", "user");
  });
});
