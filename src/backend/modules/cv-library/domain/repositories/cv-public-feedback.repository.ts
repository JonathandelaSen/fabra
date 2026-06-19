import type { CVPublicFeedback } from "../entities/cv-public-feedback.entity";
export interface CVPublicFeedbackRepository {
  listForOwner(cvId: string, userId: string): Promise<CVPublicFeedback[]>;
  deleteForOwner(id: string, userId: string): Promise<void>;
}
