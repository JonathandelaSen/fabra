import { ValueObject } from "./value-object";

class InvalidUrlError extends Error {
  constructor() {
    super("URL must use HTTP or HTTPS");
    this.name = "InvalidUrlError";
  }
}

export class Url extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): Url {
    const normalized = value.trim();
    if (!normalized) {
      throw new InvalidUrlError();
    }

    const hasScheme = /^[a-zA-Z0-9+.-]+:/.test(normalized);
    if (hasScheme) {
      let parsed: URL;
      try {
        parsed = new URL(normalized);
      } catch {
        throw new InvalidUrlError();
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new InvalidUrlError();
      }
    } else {
      if (!normalized.includes(".") || normalized.startsWith(".") || normalized.endsWith(".")) {
        throw new InvalidUrlError();
      }
      try {
        new URL(`https://${normalized}`);
      } catch {
        throw new InvalidUrlError();
      }
    }
    return new Url(normalized);
  }

  toPrimitives(): string {
    return this.value;
  }
}
