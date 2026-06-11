import type { ReviewSelfAssessmentAIInput } from "../../domain/repositories/review-self-assessment-ai.service";

const REVIEW_TYPE_LABEL: Record<string, string> = {
  performance_review: "performance review",
  promotion_case: "promotion case",
};

function formatEvidence(input: ReviewSelfAssessmentAIInput): string {
  if (input.evidence.length === 0) {
    return "(No curated evidence was provided.)";
  }
  return input.evidence
    .map((item, index) => {
      const date = item.date ? ` (${item.date})` : "";
      const star = item.highlighted ? " [HIGHLIGHTED]" : "";
      return `${index + 1}. [${item.source}${date}]${star} ${item.content}`;
    })
    .join("\n");
}

export function buildSelfAssessmentCopyPastePrompt(
  input: ReviewSelfAssessmentAIInput,
  envelope: { workflowId: string; schemaVersion: string },
): string {
  const typeLabel = REVIEW_TYPE_LABEL[input.reviewType] ?? input.reviewType;
  return [
    "You are an assistant that helps an employed professional write a self-assessment document",
    "for an upcoming performance review or promotion case. Group achievements by theme. Every",
    "claim must cite the supporting evidence by referencing its source and date. Be concise,",
    "factual, and first-person. Do not invent achievements not backed by the provided evidence.",
    "Give highlighted evidence greater prominence while still using the rest where relevant.",
    "",
    `Title: ${input.title}`,
    `Type: ${typeLabel}`,
    `Review period: ${input.periodStart} to ${input.periodEnd}`,
    "",
    "Curated evidence:",
    formatEvidence(input),
    "",
    "Respond ONLY with a JSON object using exactly this shape (no extra text):",
    "{",
    `  "workflowId": "${envelope.workflowId}",`,
    `  "schemaVersion": "${envelope.schemaVersion}",`,
    '  "result": { "content": "<the self-assessment document as Markdown>" }',
    "}",
  ].join("\n");
}
