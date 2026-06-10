import { ValueObject } from "@/modules/shared";
import type { StandardCVProfile } from "@/lib/cv-profile";

export interface CVSummaryForActivityContextSuggestionsPrimitives {
  type: string;
  profile: StandardCVProfile | null;
}

export class CVSummaryForActivityContextSuggestions extends ValueObject<CVSummaryForActivityContextSuggestionsPrimitives> {
  private constructor(public readonly type: string, public readonly profile: StandardCVProfile | null) {
    super();
  }

  static fromPrimitives(primitives: CVSummaryForActivityContextSuggestionsPrimitives): CVSummaryForActivityContextSuggestions {
    return new CVSummaryForActivityContextSuggestions(primitives.type, primitives.profile);
  }

  toPrimitives(): CVSummaryForActivityContextSuggestionsPrimitives {
    return {
      type: this.type,
      profile: this.profile,
    };
  }
}
