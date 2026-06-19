import type { CVPublicFeedbackRepository } from "../../domain/repositories/cv-public-feedback.repository";
import { CVPublicFeedback } from "../../domain/entities/cv-public-feedback.entity";

export class ListCVPublicFeedbackUseCase {
  constructor(private readonly repo: CVPublicFeedbackRepository) {}
  execute(input: { cvId: string; userId: string }): Promise<CVPublicFeedback[]> { 
    return this.repo.listForOwner(input.cvId, input.userId); 
  }
}
export class DeleteCVPublicFeedbackUseCase {
  constructor(private readonly repo: CVPublicFeedbackRepository) {}
  execute(input: { id: string; userId: string }): Promise<void> { 
    return this.repo.deleteForOwner(input.id, input.userId); 
  }
}
