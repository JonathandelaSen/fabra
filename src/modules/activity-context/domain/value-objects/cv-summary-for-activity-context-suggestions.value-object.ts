import { LongText, ValueObject } from "@/modules/shared";
import type { StandardCVProfile } from "@/lib/cv-profile";

export interface CVSummaryForActivityContextSuggestionsPrimitives {
  type: string;
  profile: StandardCVProfile | null;
}

export class CVSummaryForActivityContextSuggestions extends ValueObject<CVSummaryForActivityContextSuggestionsPrimitives> {
  private constructor(
    private readonly typeText: LongText,
    public readonly profile: StandardCVProfile | null
  ) {
    super();
  }

  static fromPrimitives(primitives: CVSummaryForActivityContextSuggestionsPrimitives): CVSummaryForActivityContextSuggestions {
    return new CVSummaryForActivityContextSuggestions(
      LongText.fromPrimitives(primitives.type),
      primitives.profile
    );
  }

  get type(): string {
    return this.typeText.toPrimitives();
  }

  toPrimitives(): CVSummaryForActivityContextSuggestionsPrimitives {
    return {
      type: this.typeText.toPrimitives(),
      profile: this.profile,
    };
  }
}
