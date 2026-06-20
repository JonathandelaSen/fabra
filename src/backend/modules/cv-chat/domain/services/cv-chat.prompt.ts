import type { CVRecord } from "@/lib/analysis-types";
import { CV_CHAT_COACHING_INSTRUCTIONS } from "./cv-chat-coaching-instructions";
import type { CVChatRolePrimitives } from "../value-objects/cv-chat-role.value-object";

export interface CVChatHistoryMessage {
  role: CVChatRolePrimitives;
  content: string;
}

export interface CVChatPromptInput {
  message: string;
  cv?: CVRecord | null;
  cvText?: string | null;
  history?: CVChatHistoryMessage[];
}

export class CVChatPrompt {
  systemInstruction(): string {
    return `${CV_CHAT_COACHING_INSTRUCTIONS}
- Return ONLY valid JSON with this shape: { "answer": "<final assistant answer>" }.`;
  }

  build(input: CVChatPromptInput): string {
    return `LATEST USER QUESTION:
${input.message.trim()}${this.section("RECENT CONVERSATION", this.recentConversation(input.history))}${this.section("CURRENT CV SUMMARY (primary evidence)", this.cvSummary(input.cv))}${this.section("CURRENT CV EXTRACTED TEXT (primary evidence)", input.cvText)}

Reply in the language used by the latest user message. Do not default to English because the CV context or conversation history is in English.
Answer the latest user question now. Use only the supplied current CV context for claims about the candidate.`;
  }

  private cvSummary(cv?: CVRecord | null): string {
    return cv
      ? [
          `CV name: ${cv.name}`,
          cv.type ? `Type: ${cv.type}` : null,
          cv.profile
            ? `Current structured CV profile JSON: ${JSON.stringify(cv.profile)}`
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "";
  }

  private recentConversation(history: CVChatHistoryMessage[] | undefined): string {
    return (history ?? [])
      .slice(-12)
      .map(
        (message) =>
          `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`,
      )
      .join("\n\n");
  }

  private section(title: string, value: string | null | undefined): string {
    const trimmed = value?.trim();
    return trimmed ? `\n\n${title}:\n---\n${trimmed}\n---` : "";
  }
}
