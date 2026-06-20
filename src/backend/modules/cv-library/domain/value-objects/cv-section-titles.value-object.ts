import { ValueObject } from "@/backend/modules/shared";
import type { CVRenderableSectionId } from "../cv-templates";

export type CVSectionTitlesPrimitives = Partial<
  Record<CVRenderableSectionId, string>
>;

export class CVSectionTitles extends ValueObject<CVSectionTitlesPrimitives> {
  private constructor(
    private readonly titles: Partial<Record<CVRenderableSectionId, string>>,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVSectionTitlesPrimitives,
  ): CVSectionTitles {
    return new CVSectionTitles({ ...primitives });
  }

  toPrimitives(): CVSectionTitlesPrimitives {
    return this.titles;
  }
}
