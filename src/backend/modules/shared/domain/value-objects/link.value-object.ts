import { LongText } from "./long-text.value-object";
import { Url } from "./url.value-object";
import { ValueObject } from "./value-object";

export interface LinkPrimitives {
  url: string;
  label: string | null;
}

export class Link extends ValueObject<LinkPrimitives> {
  private constructor(
    private readonly linkUrl: Url,
    private readonly linkLabel: LongText | null,
  ) {
    super();
  }

  static fromPrimitives(primitives: LinkPrimitives): Link {
    const label = primitives.label?.trim() || null;
    return new Link(
      Url.fromPrimitives(primitives.url),
      label === null ? null : LongText.fromPrimitives(label),
    );
  }

  toPrimitives(): LinkPrimitives {
    return {
      url: this.linkUrl.toPrimitives(),
      label: this.linkLabel?.toPrimitives() ?? null,
    };
  }
}
