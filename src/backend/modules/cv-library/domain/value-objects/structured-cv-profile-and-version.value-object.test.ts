import { describe, expect, it } from "vitest";
import { StructuredCVProfileAndVersion } from "./structured-cv-profile-and-version.value-object";
import { CVDocument } from "../entities/cv-document.entity";
import { CVStructuredProfile } from "../entities/cv-structured-profile.entity";

const mockProfilePrimitives = {
  id: "profile-1",
  userId: "user-1",
  cvDocumentId: "cv-1",
  schemaVersion: "1",
  sourceTextHash: "hash-123",
  aiModel: "model-1",
  profile: { basics: { name: "Ada Lovelace" } },
  createdAt: "2026-06-17T00:00:00.000Z",
  updatedAt: "2026-06-17T00:00:00.000Z",
};

const mockCvPrimitives = {
  id: "cv-1",
  userId: "user-1",
  name: "Compact Resume",
  filename: "cv.pdf",
  fileSize: 12345,
  pdfStoragePath: "user-1/cv-1.pdf",
  type: "template" as const,
  sourceCvId: null,
  templateId: "compact",
  templateLocale: "es",
  schemaVersion: "1",
  sourceTextHash: "hash-123",
  aiModel: "model-1",
  profile: { basics: { name: "Ada Lovelace" } },
  extractedText: {
    textPython: null,
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
  createdAt: "2026-06-17T00:00:00.000Z",
  updatedAt: "2026-06-17T00:00:00.000Z",
};

describe("StructuredCVProfileAndVersion", () => {
  it("creates from entities and round-trips through primitives", () => {
    const profile = CVStructuredProfile.fromPrimitives(mockProfilePrimitives);
    const cv = CVDocument.fromPrimitives(mockCvPrimitives);

    const result = StructuredCVProfileAndVersion.create(profile, cv);

    expect(result.profile).toBe(profile);
    expect(result.version).toBe(cv);

    const primitives = result.toPrimitives();
    expect(primitives.profile).toEqual(profile.toPrimitives());
    expect(primitives.version).toEqual(cv.toPrimitives());

    const restored = StructuredCVProfileAndVersion.fromPrimitives(primitives);
    expect(restored.toPrimitives()).toEqual(primitives);
  });

  it("handles null version", () => {
    const profile = CVStructuredProfile.fromPrimitives(mockProfilePrimitives);
    const result = StructuredCVProfileAndVersion.create(profile, null);

    expect(result.profile).toBe(profile);
    expect(result.version).toBeNull();

    const primitives = result.toPrimitives();
    expect(primitives.profile).toEqual(profile.toPrimitives());
    expect(primitives.version).toBeNull();
  });
});
