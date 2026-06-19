import { ValueObject } from "./value-object";

export class CopyPasteWorkflowId extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): CopyPasteWorkflowId {
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Copy paste workflowId cannot be empty.");
    return new CopyPasteWorkflowId(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
