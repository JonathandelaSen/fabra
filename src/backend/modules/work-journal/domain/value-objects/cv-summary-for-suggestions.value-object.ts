import { LongText, ValueObject } from "@/backend/modules/shared";
import {
  CVProfile,
  type CVProfilePrimitives,
} from "@/backend/modules/cv-library";

export interface CVSummaryForSuggestionsPrimitives {
  name?: string;
  filename?: string | null;
  type: string;
  profile: CVProfilePrimitives | null;
}

export class CVSummaryForSuggestions extends ValueObject<CVSummaryForSuggestionsPrimitives> {
  private constructor(
    private readonly typeText: LongText,
    private readonly profileValue: CVProfile | null,
    private readonly nameText?: LongText,
    private readonly filenameText?: LongText | null
  ) {
    super();
  }

  static fromPrimitives(primitives: CVSummaryForSuggestionsPrimitives): CVSummaryForSuggestions {
    return new CVSummaryForSuggestions(
      LongText.fromPrimitives(primitives.type),
      primitives.profile === null ? null : CVProfile.fromPrimitives(primitives.profile),
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
      profile: this.profileValue?.toPrimitives() ?? null,
      name: this.name,
      filename: this.filename,
    };
  }

  get profile(): CVProfilePrimitives | null {
    return this.profileValue?.toPrimitives() ?? null;
  }
}
