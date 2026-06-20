import type { CVPublicFeedbackRepository } from "../../domain/repositories/cv-public-feedback.repository";
import { CVPublicFeedback } from "../../domain/entities/cv-public-feedback.entity";
import { UserId } from "@/backend/modules/shared";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVPublicFeedbackId } from "../../domain/value-objects/cv-public-feedback-id.value-object";

export class ListCVPublicFeedbackUseCase {
  constructor(private readonly repo: CVPublicFeedbackRepository) {}
  execute(input: { cvId: string; userId: string }): Promise<CVPublicFeedback[]> { 
    return this.repo.listForOwner(
      CVDocumentId.fromPrimitives(input.cvId),
      UserId.fromPrimitives(input.userId),
    ); 
  }
}
export class DeleteCVPublicFeedbackUseCase {
  constructor(private readonly repo: CVPublicFeedbackRepository) {}
  execute(input: { id: string; userId: string }): Promise<void> { 
    return this.repo.deleteForOwner(
      CVPublicFeedbackId.fromPrimitives(input.id),
      UserId.fromPrimitives(input.userId),
    ); 
  }
}
