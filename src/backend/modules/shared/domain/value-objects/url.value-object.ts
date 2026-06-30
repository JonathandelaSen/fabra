import { ValueObject } from "./value-object";

export class Url extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): Url {
    const normalized = value.trim();
    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      throw new Error("URL must use HTTP or HTTPS");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("URL must use HTTP or HTTPS");
    }
    return new Url(normalized);
  }

  toPrimitives(): string {
    return this.value;
  }
}
