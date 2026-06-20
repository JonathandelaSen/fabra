import { describe, expect, it } from "vitest";
import { CVDocumentType } from "./cv-document-type.value-object";

describe("CVDocumentType", () => {
  it("accepts uploaded, template, and jsonResume document types", () => {
    expect(CVDocumentType.fromPrimitives("uploaded").toPrimitives()).toBe("uploaded");
    expect(CVDocumentType.fromPrimitives("template").toPrimitives()).toBe("template");
    expect(CVDocumentType.fromPrimitives("json_resume").toPrimitives()).toBe("json_resume");
  });

  it("rejects unknown document types", () => {
    expect(() => CVDocumentType.fromPrimitives("other")).toThrow("Invalid CV document type");
  });

  it("constructs and checks uploaded types", () => {
    const type = CVDocumentType.uploaded();
    expect(type.toPrimitives()).toBe("uploaded");
    expect(type.isUploaded()).toBe(true);
    expect(type.isTemplate()).toBe(false);
    expect(type.isJsonResume()).toBe(false);
  });

  it("constructs and checks template types", () => {
    const type = CVDocumentType.template();
    expect(type.toPrimitives()).toBe("template");
    expect(type.isUploaded()).toBe(false);
    expect(type.isTemplate()).toBe(true);
    expect(type.isJsonResume()).toBe(false);
  });

  it("constructs and checks jsonResume types", () => {
    const type = CVDocumentType.jsonResume();
    expect(type.toPrimitives()).toBe("json_resume");
    expect(type.isUploaded()).toBe(false);
    expect(type.isTemplate()).toBe(false);
    expect(type.isJsonResume()).toBe(true);
  });
});
