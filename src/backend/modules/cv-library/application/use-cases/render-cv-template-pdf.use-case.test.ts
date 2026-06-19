import { describe, expect, it } from "vitest";
import {
  RenderCVTemplatePdfUseCase,
  type RenderCVTemplatePdfInput,
} from "./render-cv-template-pdf.use-case";

describe("RenderCVTemplatePdfUseCase", () => {
  it("delegates rendering to the template renderer", async () => {
    const buffer = Buffer.from("pdf-bytes");
    const calls: RenderCVTemplatePdfInput[] = [];
    const templateRenderer = {
      render: async (input: RenderCVTemplatePdfInput) => {
        calls.push(input);
        return buffer;
      },
    };
    const useCase = new RenderCVTemplatePdfUseCase({ templateRenderer });

    const input = {
      profile: {},
      templateId: "modern",
      locale: "es",
    } as RenderCVTemplatePdfInput;

    const result = await useCase.execute(input);
    expect(result.toPrimitives()).toBe(buffer);
    expect(calls).toEqual([input]);
  });
});
