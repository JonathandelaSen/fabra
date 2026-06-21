import { LongText, ValueObject } from "@/backend/modules/shared";
import { CVLink, type CVLinkPrimitives } from "./cv-link.value-object";

export interface CVBasicsPrimitives {
  name?: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: CVLinkPrimitives[];
}

const dropEmpty = <T extends Record<string, unknown>>(value: T): T => {
  for (const key of Object.keys(value)) {
    if (
      value[key] === undefined ||
      (Array.isArray(value[key]) && value[key].length === 0)
    ) {
      delete value[key];
    }
  }
  return value;
};

export class CVBasics extends ValueObject<CVBasicsPrimitives> {
  private constructor(
    private readonly name?: LongText,
    private readonly headline?: LongText,
    private readonly email?: LongText,
    private readonly phone?: LongText,
    private readonly location?: LongText,
    private readonly links?: CVLink[],
  ) {
    super();
  }

  static fromPrimitives(primitives: CVBasicsPrimitives): CVBasics {
    const text = (value: string | undefined) =>
      value === undefined ? undefined : LongText.fromPrimitives(value);
    return new CVBasics(
      text(primitives.name),
      text(primitives.headline),
      text(primitives.email),
      text(primitives.phone),
      text(primitives.location),
      primitives.links?.map((link) => CVLink.fromPrimitives(link)),
    );
  }

  toPrimitives(): CVBasicsPrimitives {
    return dropEmpty({
      name: this.name?.toPrimitives(),
      headline: this.headline?.toPrimitives(),
      email: this.email?.toPrimitives(),
      phone: this.phone?.toPrimitives(),
      location: this.location?.toPrimitives(),
      links: this.links?.map((link) => link.toPrimitives()),
    });
  }
}
