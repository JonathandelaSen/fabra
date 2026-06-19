import type { CVChatContext } from "../value-objects/cv-chat-context.value-object";

export interface CVChatContextReader {
  findByCVId(input: {
    cvId: string;
    userId: string;
  }): Promise<CVChatContext | null>;
}
