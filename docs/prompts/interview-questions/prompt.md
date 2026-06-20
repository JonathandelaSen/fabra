# Interview Questions

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

## Source
- Prompt source file: `src/backend/modules/selection-process/domain/services/interview-question.prompt.ts`
- System prompt constant: `InterviewQuestionPromptService.systemInstruction()`
- Prompt builder: `InterviewQuestionPromptService.build`
- Copy Paste prompt builder: `InterviewQuestionPromptService.buildForClipboard` in `src/backend/modules/selection-process/domain/services/interview-question-prompt.service.ts`
- Model controller: `src/modules/selection-process/infrastructure/services/gemini-interview-question-ai.service.ts`

## Current Prompt

The system prompt frames the model as an elite interview coach (former Big Tech hiring manager and bar-raiser, thousands of interviews on both sides of the table) and structures answer generation in three steps. See `InterviewQuestionPromptService.systemInstruction()` in `src/backend/modules/selection-process/domain/services/interview-question.prompt.ts` for the full literal text.

**Step 1 — Question diagnosis:** identify the competency or signal the interviewer is really evaluating (ownership, conflict handling, judgement under ambiguity, culture fit, motivation, technical depth), then classify the question type and apply the matching framework:

- **Behavioral** → compressed STAR with first-person-singular ownership and a concrete result (metric only if present in the context), optional short learning.
- **Self-presentation** ("tell me about yourself") → present-past-future positioning pitch, never a chronological CV recital.
- **Weakness / failure** → a real weakness from the context, owned, with remediation and progress; bans fake-humble clichés ("I'm a perfectionist").
- **Motivation** ("why us", "why leaving") → connect genuine trajectory evidence to the linked posting; forward-looking framing, never badmouthing.
- **Technical / competency claims** → claim + proving example from context + trade-off awareness.
- **Hypothetical / situational** → brief assumptions, structured approach, decision criteria.
- **Salary / logistics** → honest and flexible; never invent figures or conditions.

**Step 2 — Spoken-word writing:** the answer will be said aloud — natural spoken register, no bullets/headers, length calibrated as spoken time by question type (~20-30s factual, ~45-90s behavioral/motivation, up to ~90s self-presentation, shorter when in doubt), open with the point, close with strength, no unevidenced filler clichés.

**Step 3 — Tailoring and honesty guardrails:** the user's context is the single source of factual truth; mirror the posting's key terms only when the candidate genuinely has them; never invent or inflate facts or metrics (qualitative result if no metric exists); return `{ "answer": "" }` when there is not enough factual context; edit mode applies the instruction while keeping every true fact and the candidate's voice.

**Language rule:** the answer is written in the same language as the interview question — that is the language the interview will be conducted in — even when the user's context is in a different language. (Previously the prompt defaulted to Spanish.)

The JSON contract is unchanged: `{ "answer": "<final answer>" }`.

The user message is built by `InterviewQuestionPromptService.build` with:

```text
Interview question:
{question}

User-provided factual context:
{context}

Current answer to edit:
---
{currentAnswer}
---

Edit instruction:
{instruction}

Linked CV summary:
---
CV linked, type, Structured profile JSON
---

Linked CV extracted text:
---
{cvText}
---

Linked job posting:
---
{job_description}
---

Linked offer metadata:
---
Offer/analysis title, URL, Job key data JSON
---

Create the best possible answer using only the information above.
```

## Data Inputs
- Interview question and user-provided factual context.
- Optional current answer and edit instruction.
- Optional linked CV summary, structured profile, and extracted CV text.
- Optional linked offer description and metadata.
- Output parser: `parseInterviewQuestionAIResponse`, expecting `{ "answer": string }`.

## Runtime Flow
1. Interview question generate/edit routes validate ownership and linked CV/offer.
2. The route gathers CV text and offer data.
3. `generateInterviewQuestionAnswer` or `editInterviewQuestionAnswer` sends the system prompt and builder output.
4. The answer is saved on the interview question record.

## Copy Paste Prompt

`InterviewQuestionPromptService.buildForClipboard` embeds the same elite-coach system text (Step 1 diagnosis, Step 2 spoken-word writing, Step 3 honesty guardrails, and the question-language rule) as a single prompt for external chat tools, plus the same context sections (question, factual context, current answer, edit instruction, linked CV, linked posting, offer metadata). Differences from the integrated prompt:

- Includes a privacy note warning the user that the prompt may contain CV, offer, and interview data.
- When factual context is insufficient, it asks the model to say what is missing instead of returning an empty answer.
- The response is plain text, not JSON.

Both prompts must stay semantically aligned: same coaching frameworks, same honesty rules, same language rule.

## Maintenance
When `InterviewQuestionPromptService.systemInstruction()`, `InterviewQuestionPromptService.build`, `InterviewQuestionPromptService.buildForClipboard`, linked context, or response parsing changes, update this document in the same change.
