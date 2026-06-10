import type { AnalysisChatContext } from "../../domain/value-objects/analysis-chat-context.value-object";
import type { ChatMessagePrimitives } from "../../domain/entities/chat-message.entity";

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

  return `You are an expert job-search coach and ATS recruiter.

Reply in Spanish unless the user clearly asks for another language.

Privacy note for the user: this prompt may include CV, offer, and analysis data. Paste it only into external AI tools you trust.

Task:
- Answer the user's latest question as the assistant in this offer chat.
- Use only the CV, offer, analysis context, and recent conversation below as source material.
- Do not invent experience, dates, companies, achievements, or technical depth.
- Be practical, candid, and specific. Give wording the user could actually say in an interview or cover message.
- If context is insufficient, say what is missing and ask for the smallest useful clarification.
- Return only the assistant message as plain text. Do not wrap it in JSON.

User question:
${input.message.trim()}${section("Recent conversation", recentConversation(input.history))}${section("Linked offer analysis", analysisSummary)}${section("Linked job posting", stringField(analysis, "job_description"))}${section("Linked CV summary", cvSummary)}${section("Linked CV extracted text", context.cvText)}

Answer the user using only this context.`;
}
