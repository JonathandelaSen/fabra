import type { CVChatContextReader } from "../../domain/repositories/cv-chat-context.repository";
import type { CVChatContext } from "../../domain/value-objects/cv-chat-context.value-object";

export class GetCVChatContextUseCase {
  constructor(private readonly contextReader: CVChatContextReader) {}

  execute(input: { cvId: string; userId: string }): Promise<CVChatContext | null> {
    return this.contextReader.findByCVId(input);
  }
}
