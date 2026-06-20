import { BooleanFlag, LongText, OptionalIsoDate, ValueObject } from "@/backend/modules/shared";

export interface CVPublicSettingsPrimitives {
  enabled: boolean;
  feedbackEnabled?: boolean;
  publicId: string | null;
  slug: string | null;
  publishedAt: string | null;
}

export class CVPublicSettings extends ValueObject<CVPublicSettingsPrimitives> {
  private constructor(
    private readonly enabledValue: BooleanFlag,
    private readonly feedbackEnabledValue: BooleanFlag,
    private readonly publicIdValue: LongText | null,
    private readonly slugValue: LongText | null,
    private readonly publishedAtValue: OptionalIsoDate,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVPublicSettingsPrimitives,
  ): CVPublicSettings {
    return new CVPublicSettings(
      BooleanFlag.fromPrimitives(primitives.enabled),
      BooleanFlag.fromPrimitives(primitives.feedbackEnabled ?? false),
      primitives.publicId === null ? null : LongText.fromPrimitives(primitives.publicId),
      primitives.slug === null ? null : LongText.fromPrimitives(primitives.slug),
      OptionalIsoDate.fromPrimitives(primitives.publishedAt),
    );
  }

  toPrimitives(): CVPublicSettingsPrimitives {
    return {
      enabled: this.enabledValue.toPrimitives(),
      feedbackEnabled: this.feedbackEnabledValue.toPrimitives(),
      publicId: this.publicIdValue?.toPrimitives() ?? null,
      slug: this.slugValue?.toPrimitives() ?? null,
      publishedAt: this.publishedAtValue.toPrimitives(),
    };
  }
}
