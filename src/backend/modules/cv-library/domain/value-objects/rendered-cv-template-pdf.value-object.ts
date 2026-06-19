import { ValueObject } from "@/backend/modules/shared";

export class RenderedCVTemplatePdf extends ValueObject<Buffer> {
  private constructor(private readonly bytes: Buffer) {
    super();
  }

  static fromPrimitives(bytes: Buffer): RenderedCVTemplatePdf {
    return new RenderedCVTemplatePdf(bytes);
  }

  toPrimitives(): Buffer {
    return this.bytes;
  }
}
