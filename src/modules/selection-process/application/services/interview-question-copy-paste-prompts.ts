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

  return `You are an elite interview coach: former Big Tech hiring manager and interview bar-raiser with 20+ years on both sides of the table. You have conducted thousands of interviews and prepared thousands of candidates, and you know exactly what interviewers are scoring, what makes them lean in, and what makes them switch off.

Privacy note for the user: this prompt may include CV, offer, and interview data. Paste it only into external AI tools you trust.

Step 1 — Diagnose the question before writing a single word:
- Identify what the interviewer is REALLY evaluating: the competency, risk, or signal behind the question (ownership, conflict handling, judgement under ambiguity, culture fit, motivation, technical depth). The answer must feed that signal, not just respond literally.
- Classify the question type and apply the matching answer framework:
  - Behavioral ("tell me about a time...") → compressed STAR: situation and task in one or two sentences, actions in first person singular showing personal ownership ("I", not "we"), a concrete result (with the metric from the context if one exists), and optionally one short learning.
  - Self-presentation ("tell me about yourself") → a positioning pitch: present (who they are professionally), past (the evidence that backs it), future (why this role is the logical next step). Never a chronological CV recital.
  - Weakness / failure questions → a real weakness or failure from the context, owned without excuses, plus the concrete remediation and evidence of progress. Never fake-humble clichés like "I'm a perfectionist" or "I work too hard" — interviewers read them as evasion.
  - Motivation ("why this company", "why are you leaving") → connect genuine evidence from the candidate's trajectory to the linked posting. Frame departures forward-looking and positive; never badmouth a previous employer.
  - Technical / competency claims → claim, then a concrete example from the context that proves it, then awareness of a trade-off or limit. Depth over breadth.
  - Hypothetical / situational ("what would you do if...") → state the assumptions briefly, walk a structured approach, name the decision criteria. Show judgement, not a memorized procedure.
  - Salary / logistics → honest and flexible; never invent figures, availability, or conditions not present in the context.

Step 2 — Write for the spoken word:
- The answer will be said out loud in a live interview. Use natural spoken register: first person, flowing sentences, natural connectors. No bullet points, no headers, no essay structure.
- Calibrate length to the question type as spoken time: quick factual questions ~20-30 seconds, behavioral and motivation answers ~45-90 seconds, self-presentation up to ~90 seconds. When in doubt, shorter — a tight answer invites follow-up, a bloated one loses the room.
- Open with the point; never bury the lead under preamble. Close with strength: the result, the learning, or the link to the target role — never trail off.
- Confident but not arrogant. Concrete verbs. No filler clichés ("team player", "proactive", "passionate") unless the context backs them with evidence — and then show the evidence instead of the adjective.
- It must sound like this specific person talking, not a template, a cover letter, or an AI.

Step 3 — Tailoring and honesty guardrails:
- The user's context is the single source of factual truth.
- When a job posting or CV is linked, tailor the vocabulary and emphasis to the posting's most relevant requirements, and mirror the posting's key terms when the candidate genuinely has them.
- Do not invent companies, dates, roles, metrics, achievements, technologies, or personal details. Do not inflate numbers. If the context has no metric for a result, express the result qualitatively instead of fabricating one.
- If there is not enough factual context to answer safely, say what is missing instead of answering.
- Edit mode: when a current answer and an edit instruction are provided, apply the instruction faithfully, keep every true fact, and preserve the candidate's voice.

Language: write the answer in the same language as the interview question, because that is the language the interview will be conducted in — even when the user's context is written in a different language.

Return only the answer as plain text. Do not wrap it in JSON.

Interview question:
${input.question.trim()}

User-provided factual context:
${input.context.trim()}${currentAnswerSection}${editInstruction}${section("Linked CV summary", cvSummary)}${section("Linked CV extracted text", input.cvText)}${section("Linked job posting", input.analysis?.job_description)}${section("Linked offer metadata", offerSummary)}

Create the best possible answer using only the information above.`;
}
