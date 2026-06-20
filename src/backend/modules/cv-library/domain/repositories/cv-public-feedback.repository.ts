import type { UserId } from "@/backend/modules/shared";
import type { CVPublicFeedback } from "../entities/cv-public-feedback.entity";
import type { CVDocumentId } from "../value-objects/cv-document-id.value-object";
import type { CVPublicFeedbackId } from "../value-objects/cv-public-feedback-id.value-object";

export interface CVPublicFeedbackRepository {
  listForOwner(cvId: CVDocumentId, userId: UserId): Promise<CVPublicFeedback[]>;
  deleteForOwner(id: CVPublicFeedbackId, userId: UserId): Promise<void>;
}
