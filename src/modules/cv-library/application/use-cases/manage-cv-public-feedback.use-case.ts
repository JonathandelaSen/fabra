import type { CVPublicFeedbackRepository } from "../../domain/repositories/cv-public-feedback.repository";
export class ListCVPublicFeedbackUseCase {
  constructor(private readonly repo: CVPublicFeedbackRepository) {}
  execute(input: { cvId: string; userId: string }) { return this.repo.listForOwner(input.cvId, input.userId); }
}
export class DeleteCVPublicFeedbackUseCase {
  constructor(private readonly repo: CVPublicFeedbackRepository) {}
  execute(input: { id: string; userId: string }) { return this.repo.deleteForOwner(input.id, input.userId); }
}
