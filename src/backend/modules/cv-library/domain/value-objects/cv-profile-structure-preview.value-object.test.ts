import { describe, expect, it } from "vitest";
import { CVProfileStructurePreview } from "./cv-profile-structure-preview.value-object";

describe("CVProfileStructurePreview", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      parsedResult: {
        basics: { name: "Ada Lovelace" },
      },
      preview: {
        basicsName: "Ada Lovelace",
        sectionsCount: 1,
        missingImportantFields: ["summary"],
        templateLocale: "es",
        completeness: 80,
        originLabel: "external_chat" as const,
      },
      warnings: ["warning-1"],
    };
    const vo = CVProfileStructurePreview.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toMatchObject({
      parsedResult: {
        basics: { name: "Ada Lovelace" },
        experience: [],
        education: [],
        skills: [],
      },
      preview: primitives.preview,
      warnings: primitives.warnings,
    });
  });
});
