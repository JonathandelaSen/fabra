import type { AnalysisChatContext } from "../../domain/value-objects/analysis-chat-context.value-object";
import type { ChatMessagePrimitives } from "../../domain/entities/chat-message.entity";
import { OFFER_CHAT_COACHING_INSTRUCTIONS } from "../../domain/services/analysis-chat-coaching-instructions";

export interface OfferChatCopyPastePromptInput {
  message: string;
  context: AnalysisChatContext;
  history: ChatMessagePrimitives[];
}

function section(title: string, value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `\n\n${title}:\n---\n${trimmed}\n---` : "";
}

function stringifyJson(value: unknown) {
  if (!value) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringField(source: Record<string, unknown> | null, key: string) {
  const value = source?.[key];
  return typeof value === "string" ? value : null;
}

function recentConversation(history: ChatMessagePrimitives[]) {
  const recent = history.slice(-12);
  if (recent.length === 0) return "";

  return recent
    .map(
      (message) =>
        `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`,
    )
    .join("\n\n");
}

export function buildOfferChatCopyPastePrompt(
  input: OfferChatCopyPastePromptInput,
) {
  const { context } = input;
  const cv = record(context.cv);
  const analysis = record(context.analysis);
  const cvSummary = cv
    ? [
        stringField(cv, "name") ? `CV linked: ${stringField(cv, "name")}` : null,
        stringField(cv, "type") ? `Type: ${stringField(cv, "type")}` : null,
        cv.profile
          ? `Structured CV profile JSON: ${JSON.stringify(cv.profile)}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const analysisSummary = [
    `Analysis title: ${stringField(analysis, "title") ?? "Untitled"}`,
    `Score: ${analysis?.ai_score ?? "not available"}`,
    stringField(analysis, "ai_feedback")
      ? `Feedback: ${stringField(analysis, "ai_feedback")}`
      : null,
    stringField(analysis, "job_url") ? `URL: ${stringField(analysis, "job_url")}` : null,
    analysis?.job_key_data
      ? `job_key_data JSON: ${stringifyJson(analysis.job_key_data)}`
      : null,
    analysis?.job_keywords
      ? `job_keywords JSON: ${stringifyJson(analysis.job_keywords)}`
      : null,
    analysis?.matching_keywords
      ? `matching_keywords JSON: ${stringifyJson(analysis.matching_keywords)}`
      : null,
    analysis?.missing_keywords
      ? `missing_keywords JSON: ${stringifyJson(analysis.missing_keywords)}`
      : null,
    analysis?.ai_improvements
      ? `improvements JSON: ${stringifyJson(analysis.ai_improvements)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `${OFFER_CHAT_COACHING_INSTRUCTIONS}

Privacy note for the user: this prompt may include CV, offer, and analysis data. Paste it only into external AI tools you trust.

Return only the assistant message as plain text. Do not wrap it in JSON.

LATEST USER QUESTION:
${input.message.trim()}${section("RECENT CONVERSATION", recentConversation(input.history))}${section("LINKED ANALYSIS (secondary interpretation; verify against primary evidence)", analysisSummary)}${section("JOB POSTING (primary evidence)", stringField(analysis, "job_description"))}${section("CV SUMMARY (primary evidence)", cvSummary)}${section("CV EXTRACTED TEXT (primary evidence)", context.cvText)}

Answer the latest user question now. Use only the supplied context for claims about the candidate and opportunity.`;
}
