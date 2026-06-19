import { describe, expect, it } from "vitest";
import { HttpError } from "../../infrastructure/http/api-errors";
import { validateCopyPasteEnvelope } from "./copy-paste-json-envelope";

const expected = { workflowId: "cv_analysis.score", schemaVersion: "1" };

describe("validateCopyPasteEnvelope", () => {
  it("returns the result object from a valid envelope", () => {
    expect(
      validateCopyPasteEnvelope(
        { workflowId: "cv_analysis.score", schemaVersion: "1", result: { score: 80 } },
        expected,
      ),
    ).toEqual({ score: 80 });
  });

  it("rejects invalid envelope fields", () => {
    expect(() => validateCopyPasteEnvelope(null, expected)).toThrow(HttpError);
    expect(() =>
      validateCopyPasteEnvelope({ schemaVersion: "1", result: {} }, expected),
    ).toThrow(HttpError);
    expect(() =>
      validateCopyPasteEnvelope(
        { workflowId: "other", schemaVersion: "1", result: {} },
        expected,
      ),
    ).toThrow(HttpError);
    expect(() =>
      validateCopyPasteEnvelope(
        { workflowId: "cv_analysis.score", schemaVersion: "2", result: {} },
        expected,
      ),
    ).toThrow(HttpError);
    expect(() =>
      validateCopyPasteEnvelope(
        { workflowId: "cv_analysis.score", schemaVersion: "1" },
        expected,
      ),
    ).toThrow(HttpError);
    expect(() =>
      validateCopyPasteEnvelope(
        { workflowId: "cv_analysis.score", schemaVersion: "1", result: [] },
        expected,
      ),
    ).toThrow(HttpError);
  });
});
