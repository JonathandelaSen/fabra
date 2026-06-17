import { describe, expect, it } from "vitest";
import { CVProfileEditPreview } from "./cv-profile-edit-preview.value-object";

describe("CVProfileEditPreview", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      parsedResult: {
        basics: { name: "Ada Lovelace" },
      },
      preview: {
        basicsName: "Ada Lovelace",
        sectionsCount: 1,
        changedSections: ["basics"],
        originLabel: "external_chat" as const,
      },
      warnings: ["warning-1"],
    };
    const vo = CVProfileEditPreview.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
