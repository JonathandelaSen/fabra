export function parseFinalFeedbackAIResponse(rawText: string): string {
  const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
  const value = parsed.final_feedback;
  const finalFeedback =
    typeof value === "string" && value.trim() ? value.trim() : null;
  if (!finalFeedback) {
    throw new Error("The AI could not draft the feedback with these notes.");
  }
  return finalFeedback;
}
