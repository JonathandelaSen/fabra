import { ValueObject } from "./value-object";

export class StringList extends ValueObject<string[]> {
  private constructor(private readonly list: readonly string[]) {
    super();
  }

  static fromPrimitives(list: string[]): StringList {
    return new StringList(list);
  }

  toPrimitives(): string[] {
    return [...this.list];
  }
}
