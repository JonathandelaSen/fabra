import { LongText, StringList, ValueObject } from "@/backend/modules/shared";
import { dropEmpty, type StandardCVPresentation } from "../cv-profile";
import type { CVRenderableSectionId } from "../cv-templates";
import { CVSectionTitles } from "./cv-section-titles.value-object";

export type CVPresentationPrimitives = StandardCVPresentation;

export class CVPresentation extends ValueObject<CVPresentationPrimitives> {
  private constructor(
    private readonly sectionTitles?: CVSectionTitles,
    private readonly sectionOrder?: StringList,
    private readonly hiddenSections?: StringList,
    private readonly accentColor?: LongText,
    private readonly tagsColor?: LongText,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVPresentationPrimitives,
  ): CVPresentation {
    const text = (value: string | undefined) =>
      value === undefined ? undefined : LongText.fromPrimitives(value);
    return new CVPresentation(
      primitives.sectionTitles === undefined
        ? undefined
        : CVSectionTitles.fromPrimitives(primitives.sectionTitles),
      primitives.sectionOrder === undefined
        ? undefined
        : StringList.fromPrimitives(primitives.sectionOrder),
      primitives.hiddenSections === undefined
        ? undefined
        : StringList.fromPrimitives(primitives.hiddenSections),
      text(primitives.accentColor),
      text(primitives.tagsColor),
    );
  }

  toPrimitives(): CVPresentationPrimitives {
    return dropEmpty({
      sectionTitles: this.sectionTitles?.toPrimitives(),
      sectionOrder: this.sectionOrder?.toPrimitives() as
        | CVRenderableSectionId[]
        | undefined,
      hiddenSections: this.hiddenSections?.toPrimitives() as
        | CVRenderableSectionId[]
        | undefined,
      accentColor: this.accentColor?.toPrimitives(),
      tagsColor: this.tagsColor?.toPrimitives(),
    });
  }
}
