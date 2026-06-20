import { LongText, ValueObject } from "@/backend/modules/shared";
import { dropEmpty, type StandardCVLink } from "../cv-profile";

export type CVLinkPrimitives = StandardCVLink;

export class CVLink extends ValueObject<CVLinkPrimitives> {
  private constructor(
    private readonly url: LongText,
    private readonly label?: LongText,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVLinkPrimitives): CVLink {
    return new CVLink(
      LongText.fromPrimitives(primitives.url),
      primitives.label === undefined
        ? undefined
        : LongText.fromPrimitives(primitives.label),
    );
  }

  toPrimitives(): CVLinkPrimitives {
    return dropEmpty({
      label: this.label?.toPrimitives(),
      url: this.url.toPrimitives(),
    }) as CVLinkPrimitives;
  }
}
