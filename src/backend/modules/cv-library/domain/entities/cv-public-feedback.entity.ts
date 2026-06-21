import { AggregateRoot, Timestamp, UserId } from "@/backend/modules/shared";
import { CVDocumentId } from "../value-objects/cv-document-id.value-object";

export interface CVPublicFeedbackPrimitives {
  id: string;
  cvId: string;
  userId: string;
  giverName: string | null;
  giverContext: string | null;
  feedbackText: string;
  createdAt: string;
}

export class CVPublicFeedback extends AggregateRoot {
  private constructor(private readonly values: CVPublicFeedbackPrimitives) {
    super();
  }
  static fromPrimitives(values: CVPublicFeedbackPrimitives) {
    CVDocumentId.fromPrimitives(values.cvId);
    UserId.fromPrimitives(values.userId);
    Timestamp.fromPrimitives(values.createdAt);
    if (!values.feedbackText.trim())
      throw new Error("Public CV feedback text is required");
    return new CVPublicFeedback({
      ...values,
      feedbackText: values.feedbackText.trim(),
    });
  }
  toPrimitives(): CVPublicFeedbackPrimitives {
    return { ...this.values };
  }
}
