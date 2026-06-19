import type { CVTemplatePdfRenderer } from "../../domain/repositories/cv-analysis-preparation-services";
import { RenderedCVTemplatePdf } from "../../domain/value-objects/rendered-cv-template-pdf.value-object";

export type RenderCVTemplatePdfInput = Parameters<CVTemplatePdfRenderer["render"]>[0];

export class RenderCVTemplatePdfUseCase {
  constructor(private readonly deps: { templateRenderer: CVTemplatePdfRenderer }) {}

  async execute(input: RenderCVTemplatePdfInput): Promise<RenderedCVTemplatePdf> {
    const bytes = await this.deps.templateRenderer.render(input);
    return RenderedCVTemplatePdf.fromPrimitives(bytes);
  }
}
