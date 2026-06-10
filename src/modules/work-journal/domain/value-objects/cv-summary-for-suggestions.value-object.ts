import { ValueObject } from "@/modules/shared";
import type { StandardCVProfile } from "@/lib/cv-profile";

export interface CVSummaryForSuggestionsPrimitives {
  name?: string;
  filename?: string | null;
  type: string;
  profile: StandardCVProfile | null;
}

export class CVSummaryForSuggestions extends ValueObject<CVSummaryForSuggestionsPrimitives> {
  private constructor(
    public readonly type: string,
    public readonly profile: StandardCVProfile | null,
    public readonly name?: string,
    public readonly filename?: string | null
  ) {
    super();
  }

  static fromPrimitives(primitives: CVSummaryForSuggestionsPrimitives): CVSummaryForSuggestions {
    return new CVSummaryForSuggestions(
      primitives.type,
      primitives.profile,
      primitives.name,
      primitives.filename
    );
  }

  toPrimitives(): CVSummaryForSuggestionsPrimitives {
    return {
      type: this.type,
      profile: this.profile,
      name: this.name,
      filename: this.filename,
    };
  }
}
