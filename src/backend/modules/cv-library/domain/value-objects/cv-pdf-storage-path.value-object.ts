import { ValueObject } from "@/backend/modules/shared";

export class CVPdfStoragePath extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("CV PDF storage path cannot be empty.");
  }

  static fromPrimitives(value: string): CVPdfStoragePath {
    return new CVPdfStoragePath(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
