import { LongText, ValueObject } from "@/modules/shared";
import type { StandardCVProfile } from "@/lib/cv-profile";

export interface CVSummaryForSuggestionsPrimitives {
  name?: string;
  filename?: string | null;
  type: string;
  profile: StandardCVProfile | null;
}

export class CVSummaryForSuggestions extends ValueObject<CVSummaryForSuggestionsPrimitives> {
  private constructor(
    private readonly typeText: LongText,
    public readonly profile: StandardCVProfile | null,
    private readonly nameText?: LongText,
    private readonly filenameText?: LongText | null
  ) {
    super();
  }

  static fromPrimitives(primitives: CVSummaryForSuggestionsPrimitives): CVSummaryForSuggestions {
    return new CVSummaryForSuggestions(
      LongText.fromPrimitives(primitives.type),
      primitives.profile,
      primitives.name === undefined ? undefined : LongText.fromPrimitives(primitives.name),
      primitives.filename === undefined || primitives.filename === null
        ? primitives.filename
        : LongText.fromPrimitives(primitives.filename)
    );
  }

  get type(): string {
    return this.typeText.toPrimitives();
  }

  get name(): string | undefined {
    return this.nameText?.toPrimitives();
  }

  get filename(): string | null | undefined {
    if (this.filenameText === undefined) return undefined;
    if (this.filenameText === null) return null;
    return this.filenameText.toPrimitives();
  }

  toPrimitives(): CVSummaryForSuggestionsPrimitives {
    return {
      type: this.typeText.toPrimitives(),
      profile: this.profile,
      name: this.name,
      filename: this.filename,
    };
  }
}
