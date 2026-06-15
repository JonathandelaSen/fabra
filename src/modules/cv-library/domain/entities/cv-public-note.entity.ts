import { AggregateRoot, Timestamp, UserId } from "@/modules/shared";
import { CVDocumentId } from "../value-objects/cv-document-id.value-object";

export const cvPublicNoteAnchorTypes = {
  presentation: "presentation",
  section: "section",
  item: "item",
  bullet: "bullet",
} as const;

export type CVPublicNoteAnchorType =
  (typeof cvPublicNoteAnchorTypes)[keyof typeof cvPublicNoteAnchorTypes];
export interface CVPublicNotePrimitives { id: string; cvId: string; userId: string; anchorType: CVPublicNoteAnchorType; sectionId: string | null; anchorId: string | null; body: string; createdAt: string; updatedAt: string }

export class CVPublicNote extends AggregateRoot {
  private constructor(private readonly values: CVPublicNotePrimitives) { super(); }
  static fromPrimitives(values: CVPublicNotePrimitives) {
    CVDocumentId.fromPrimitives(values.cvId); UserId.fromPrimitives(values.userId);
    Timestamp.fromPrimitives(values.createdAt); Timestamp.fromPrimitives(values.updatedAt);
    if (!values.body.trim()) throw new Error("CV public note body is required");
    return new CVPublicNote({ ...values, body: values.body.trim() });
  }
  toPrimitives(): CVPublicNotePrimitives { return { ...this.values }; }
}
