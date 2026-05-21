import type { Analysis, CVRecord } from "@/lib/analysis-types";

export interface InterviewQuestionCopyPastePromptInput {
  question: string;
  context: string;
  currentAnswer?: string | null;
  instruction?: string | null;
  cv?: CVRecord | null;
  cvText?: string | null;
  analysis?: Analysis | null;
}

function section(title: string, value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `\n\n${title}:\n---\n${trimmed}\n---` : "";
}

export function buildInterviewQuestionCopyPastePrompt(
  input: InterviewQuestionCopyPastePromptInput,
): string {
  const cvSummary = input.cv
    ? [
        `CV linked: ${input.cv.name}`,
        input.cv.type ? `Type: ${input.cv.type}` : null,
        input.cv.profile
          ? `Structured profile JSON: ${JSON.stringify(input.cv.profile)}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const offerSummary = input.analysis
    ? [
        `Offer/analysis title: ${input.analysis.title}`,
        input.analysis.job_url ? `URL: ${input.analysis.job_url}` : null,
        input.analysis.job_key_data
          ? `Job key data JSON: ${input.analysis.job_key_data}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const editInstruction = input.instruction?.trim()
    ? `\n\nEdit instruction:\n${input.instruction.trim()}`
    : "";

  const currentAnswerSection = input.currentAnswer?.trim()
    ? section("Current answer to edit", input.currentAnswer)
    : "";

  return `You are an expert interview coach.

Write concise, natural interview answers in Spanish unless the user's question is clearly in another language.

Privacy note for the user: this prompt may include CV, offer, and interview data. Paste it only into external AI tools you trust.

Rules:
- Use the user's context as the factual source of truth.
- Do not invent companies, dates, roles, metrics, achievements, technologies, or personal details.
- You may lightly tailor wording to the linked CV and job posting when provided.
- If there is not enough factual context to answer safely, say what is missing.
- Make the answer specific, credible, first-person, and ready to say in an interview.
- Avoid sounding like a cover letter or a generic template.
- Return only the answer as plain text. Do not wrap it in JSON.

Interview question:
${input.question.trim()}

User-provided factual context:
${input.context.trim()}${currentAnswerSection}${editInstruction}${section("Linked CV summary", cvSummary)}${section("Linked CV extracted text", input.cvText)}${section("Linked job posting", input.analysis?.job_description)}${section("Linked offer metadata", offerSummary)}

Create the best possible answer using only the information above.`;
}
