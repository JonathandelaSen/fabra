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

export const CV_CHAT_SYSTEM_PROMPT = `${CV_CHAT_COACHING_INSTRUCTIONS}
- Return ONLY valid JSON with this shape: { "answer": "<final assistant answer>" }.`;

function section(title: string, value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `\n\n${title}:\n---\n${trimmed}\n---` : "";
}

function recentConversation(history: CVChatHistoryMessage[] | undefined) {
  return (history ?? [])
    .slice(-12)
    .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
    .join("\n\n");
}

export function buildCVChatPrompt(input: CVChatPromptInput): string {
  const cvSummary = input.cv
    ? [
        `CV name: ${input.cv.name}`,
        input.cv.type ? `Type: ${input.cv.type}` : null,
        input.cv.profile
          ? `Current structured CV profile JSON: ${JSON.stringify(input.cv.profile)}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return `LATEST USER QUESTION:
${input.message.trim()}${section("RECENT CONVERSATION", recentConversation(input.history))}${section("CURRENT CV SUMMARY (primary evidence)", cvSummary)}${section("CURRENT CV EXTRACTED TEXT (primary evidence)", input.cvText)}

Reply in the language used by the latest user message. Do not default to English because the CV context or conversation history is in English.
Answer the latest user question now. Use only the supplied current CV context for claims about the candidate.`;
}
