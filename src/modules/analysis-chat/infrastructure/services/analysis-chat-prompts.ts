import type { Analysis, CVRecord } from "@/lib/analysis-types";
import { OFFER_CHAT_COACHING_INSTRUCTIONS } from "../../domain/services/analysis-chat-coaching-instructions";

export interface OfferChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OfferChatPromptInput {
  message: string;
  cv?: CVRecord | null;
  cvText?: string | null;
  analysis: Analysis;
  history?: OfferChatHistoryMessage[];
}

export const OFFER_CHAT_SYSTEM_PROMPT = `${OFFER_CHAT_COACHING_INSTRUCTIONS}
- Return ONLY valid JSON with this shape: { "answer": "<final assistant answer>" }.`;

function section(title: string, value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `\n\n${title}:\n---\n${trimmed}\n---` : "";
}

function stringifyJson(
  value: string | Record<string, unknown> | null | undefined,
) {
  if (!value) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function recentConversation(history: OfferChatHistoryMessage[] | undefined) {
  const recent = (history ?? []).slice(-12);
  if (recent.length === 0) return "";

  return recent
    .map(
      (message) =>
        `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`,
    )
    .join("\n\n");
}

export function buildOfferChatPrompt(input: OfferChatPromptInput): string {
  const cvSummary = input.cv
    ? [
        `CV linked: ${input.cv.name}`,
        input.cv.type ? `Type: ${input.cv.type}` : null,
        input.cv.profile
          ? `Structured CV profile JSON: ${JSON.stringify(input.cv.profile)}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const analysisSummary = [
    `Analysis title: ${input.analysis.title}`,
    `Score: ${input.analysis.ai_score ?? "not available"}`,
    input.analysis.ai_feedback
      ? `Feedback: ${input.analysis.ai_feedback}`
      : null,
    input.analysis.job_url ? `URL: ${input.analysis.job_url}` : null,
    input.analysis.job_key_data
      ? `job_key_data JSON: ${stringifyJson(input.analysis.job_key_data)}`
      : null,
    input.analysis.job_keywords
      ? `job_keywords JSON: ${stringifyJson(input.analysis.job_keywords)}`
      : null,
    input.analysis.matching_keywords
      ? `matching_keywords JSON: ${stringifyJson(input.analysis.matching_keywords)}`
      : null,
    input.analysis.missing_keywords
      ? `missing_keywords JSON: ${stringifyJson(input.analysis.missing_keywords)}`
      : null,
    input.analysis.ai_improvements
      ? `improvements JSON: ${stringifyJson(input.analysis.ai_improvements)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `LATEST USER QUESTION:
${input.message.trim()}${section("RECENT CONVERSATION", recentConversation(input.history))}${section("LINKED ANALYSIS (secondary interpretation; verify against primary evidence)", analysisSummary)}${section("JOB POSTING (primary evidence)", input.analysis.job_description)}${section("CV SUMMARY (primary evidence)", cvSummary)}${section("CV EXTRACTED TEXT (primary evidence)", input.cvText)}

Answer the latest user question now. Use only the supplied context for claims about the candidate and opportunity.`;
}
