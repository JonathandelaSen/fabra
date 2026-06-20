# Analysis AI Chat

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

## Source
- Prompt source file: `src/backend/modules/job-analysis-chat/domain/services/job-analysis-chat-prompts.ts`
- Shared coaching instructions: `src/modules/job-analysis-chat/domain/services/job-analysis-chat-coaching-instructions.ts` (`OFFER_CHAT_COACHING_INSTRUCTIONS`)
- System prompt constant: `OFFER_CHAT_SYSTEM_PROMPT`
- Prompt builder: `buildOfferChatPrompt`
- Copy Paste prompt builder: `src/modules/job-analysis-chat/application/services/offer-chat-copy-paste-prompts.ts`
- AI service (controller): `src/modules/job-analysis-chat/infrastructure/services/gemini-job-analysis-chat-ai.service.ts`
- API route: `src/app/api/job-match-analyses/[id]/chat/route.ts`
- Copy Paste routes:
  - `src/app/api/job-match-analyses/[id]/chat/copy-paste/prepare/route.ts`
  - `src/app/api/job-match-analyses/[id]/chat/copy-paste/apply/route.ts`

## Current Prompt
```text
You are the user's evidence-based job-search strategist for one specific job opportunity. Combine the judgment of a senior recruiter, hiring manager, ATS specialist, and interview coach.

The prompt then defines:
- a language policy that follows the latest user message, then recent conversation, then job posting; explicit user requests take precedence
- an evidence hierarchy: job posting and CV are primary evidence; generated analysis is secondary interpretation
- strict truthfulness and explicit correction of misleading claims
- prioritization of critical requirements over preferences and generic keywords
- consideration of transferable evidence, adjacent skills, learning speed, and seniority
- intent-sensitive answers that lead with a conclusion, relevant evidence, and a practical next action
- tailored behavior for gaps, decisions, preparation, and ready-to-use wording
- concise answers and a single clarification only when it would materially change the answer
- integrated JSON output: `{ "answer": "<final assistant answer>" }`
```

See `OFFER_CHAT_COACHING_INSTRUCTIONS` in the shared prompt-only domain service and `OFFER_CHAT_SYSTEM_PROMPT` in the integrated prompt source for the complete current text. The user message is built by `buildOfferChatPrompt` with this structure:

```text
LATEST USER QUESTION:
{message}

RECENT CONVERSATION:
---
{last 12 chat messages}
---

LINKED ANALYSIS (secondary interpretation; verify against primary evidence):
---
Analysis title, score, feedback, URL, job_key_data, job_keywords, matching_keywords, missing_keywords, improvements
---

JOB POSTING (primary evidence):
---
{job_description}
---

CV SUMMARY (primary evidence):
---
CV linked, type, Structured CV profile JSON
---

CV EXTRACTED TEXT (primary evidence):
---
{cvText}
---

Answer the latest user question now. Use only the supplied context for claims about the candidate and opportunity.
```

## Data Inputs
- User question: the latest chat message.
- Recent conversation: last 12 persisted messages from `analysis_chat_messages`.
- Offer context: analysis title, score, feedback, `job_description`, `job_url`, `job_key_data`, keywords, gaps, and improvements.
- CV context: linked CV metadata, structured profile JSON when present, and extracted CV text.
- Output parser: `parseOfferChatAIResponse`, expecting `{ "answer": string }`.

## Runtime Flow
1. `POST /api/job-match-analyses/[id]/chat` validates ownership, `job_match` mode, message, provider, model, and API key when required.
2. The user message is persisted with role `user`.
3. `generateOfferChatAnswer` sends `OFFER_CHAT_SYSTEM_PROMPT` plus the built user prompt.
4. The AI answer is persisted with role `assistant`.
5. `GET /api/job-match-analyses/[id]/chat` returns the persisted history for the chat tab.

## Copy Paste Flow
The external-chat workflow id is:

```text
offer_chat.assistant_response
```

`POST /api/job-match-analyses/[id]/chat/copy-paste/prepare` receives the current draft user message and conversation id. It validates the same job-match context, loads the recent persisted conversation, and returns a plain-text prompt. The prompt imports `OFFER_CHAT_COACHING_INSTRUCTIONS`, keeping the integrated and external-chat coaching semantics aligned, but instructs the external model to return only the assistant message as plain text, not JSON.

`POST /api/job-match-analyses/[id]/chat/copy-paste/apply` receives the draft user message plus the pasted assistant response. It persists both messages through the `job-analysis-chat` module. The assistant message uses `model: "external-chat"` and metadata with `assistanceMode: "copy_paste"` and `source: "external-chat"`. This route does not call any real AI provider.

The Copy Paste prompt includes:
- the current draft user question
- the last 12 persisted chat messages
- the linked offer analysis fields
- the linked job posting
- linked CV summary and extracted text when available
- a privacy notice reminding the user to use trusted external tools

## Maintenance
When `OFFER_CHAT_SYSTEM_PROMPT`, `buildOfferChatPrompt`, `buildOfferChatCopyPastePrompt`, chat persistence, model metadata, or the context sent from either chat route changes, update this document in the same change. Keep integrated and Copy Paste semantics aligned unless a difference is documented here.
