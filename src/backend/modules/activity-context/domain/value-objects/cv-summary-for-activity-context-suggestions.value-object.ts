import { LongText, ValueObject } from "@/backend/modules/shared";
import {
  CVProfile,
  type CVProfilePrimitives,
} from "@/backend/modules/cv-library";

export interface CVSummaryForActivityContextSuggestionsPrimitives {
  type: string;
  profile: CVProfilePrimitives | null;
}

export class CVSummaryForActivityContextSuggestions extends ValueObject<CVSummaryForActivityContextSuggestionsPrimitives> {
  private constructor(
    private readonly typeText: LongText,
    private readonly profileValue: CVProfile | null,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVSummaryForActivityContextSuggestionsPrimitives): CVSummaryForActivityContextSuggestions {
    return new CVSummaryForActivityContextSuggestions(
      LongText.fromPrimitives(primitives.type),
      primitives.profile === null ? null : CVProfile.fromPrimitives(primitives.profile),
    );
  }

  get type(): string {
    return this.typeText.toPrimitives();
  }

  toPrimitives(): CVSummaryForActivityContextSuggestionsPrimitives {
    return {
      type: this.typeText.toPrimitives(),
      profile: this.profileValue?.toPrimitives() ?? null,
    };
  }

  get profile(): CVProfilePrimitives | null {
    return this.profileValue?.toPrimitives() ?? null;
  }
}
