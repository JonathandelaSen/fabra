import { describe, expect, it } from "vitest";
import type { CVDocumentPrimitives } from "../entities/cv-document.entity";
import { CVDocumentSnapshot } from "./cv-document-snapshot.value-object";

const document: CVDocumentPrimitives = {
  id: "cv-1",
  userId: "user-1",
  name: "CV",
  filename: "cv.pdf",
  fileSize: 42,
  pdfStoragePath: "user-1/cv.pdf",
  type: "uploaded",
  sourceCvId: null,
  templateId: null,
  templateLocale: null,
  schemaVersion: null,
  sourceTextHash: null,
  aiModel: null,
  profile: null,
  extractedText: {
    textPython: "Experience",
    textPdfjs: null,
    textNode: null,
    extractErrorPython: null,
    extractErrorPdfjs: null,
    extractErrorNode: null,
  },
  publicSettings: {
    enabled: false,
    feedbackEnabled: false,
    publicId: null,
    slug: null,
    publishedAt: null,
  },
  createdAt: "2026-05-13T10:00:00.000Z",
  updatedAt: "2026-05-13T10:00:00.000Z",
};

describe("CVDocumentSnapshot", () => {
  it("round-trips primitives", () => {
    expect(CVDocumentSnapshot.fromPrimitives(document).toPrimitives()).toEqual(
      document,
    );
  });

  it("returns a defensive copy", () => {
    const snapshot = CVDocumentSnapshot.fromPrimitives(document);
    const primitives = snapshot.toPrimitives();
    primitives.name = "Changed";

    expect(snapshot.toPrimitives().name).toBe("CV");
  });
});
