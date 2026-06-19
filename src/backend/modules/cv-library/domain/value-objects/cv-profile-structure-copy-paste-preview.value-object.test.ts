import { describe, expect, it } from "vitest";
import { CVProfileStructureCopyPastePreview } from "./cv-profile-structure-copy-paste-preview.value-object";

describe("CVProfileStructureCopyPastePreview", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      basicsName: "Ada Lovelace",
      sectionsCount: 3,
      missingImportantFields: ["summary"],
      templateLocale: "es",
      completeness: 80,
      originLabel: "external_chat" as const,
    };
    const vo = CVProfileStructureCopyPastePreview.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
