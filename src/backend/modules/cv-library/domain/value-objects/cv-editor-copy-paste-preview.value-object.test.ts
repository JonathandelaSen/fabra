import { describe, expect, it } from "vitest";
import { CVEditorCopyPastePreview } from "./cv-editor-copy-paste-preview.value-object";

describe("CVEditorCopyPastePreview", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      basicsName: "Ada Lovelace",
      sectionsCount: 3,
      changedSections: ["basics", "experience"],
      originLabel: "external_chat" as const,
    };
    const vo = CVEditorCopyPastePreview.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
