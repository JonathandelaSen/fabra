# Analysis AI Chat

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

## Source
- Prompt source file: `src/modules/analysis-chat/infrastructure/services/analysis-chat-prompts.ts`
- System prompt constant: `OFFER_CHAT_SYSTEM_PROMPT`
- Prompt builder: `buildOfferChatPrompt`
- Copy Paste prompt builder: `src/modules/analysis-chat/application/services/offer-chat-copy-paste-prompts.ts`
- AI service (controller): `src/modules/analysis-chat/infrastructure/services/gemini-analysis-chat-ai.service.ts`
- API route: `src/app/api/job-match-analyses/[id]/chat/route.ts`
- Copy Paste routes:
  - `src/app/api/job-match-analyses/[id]/chat/copy-paste/prepare/route.ts`
  - `src/app/api/job-match-analyses/[id]/chat/copy-paste/apply/route.ts`

## Current Prompt
```text
You are an expert job-search coach and ATS recruiter.

Reply in Spanish unless the user clearly asks for another language.

Rules:
- Return ONLY valid JSON with this shape: { "answer": "<final answer>" }.
- Use the CV, offer, and analysis context as the source of truth.
- Do not invent experience, dates, companies, achievements, or technical depth.
- When the user asks about a missing skill such as Redis, explain how important it appears in the offer, what not to claim, and what credible counter-positioning they can use.
- Be practical, candid, and specific. Give wording the user could actually say in an interview or cover message.
- If context is insufficient, say what is missing and ask for the smallest useful clarification.
```

The user message is built by `buildOfferChatPrompt` with this structure:

```text
User question:
{message}

Recent conversation:
---
{last 12 chat messages}
---

Linked offer analysis:
---
Analysis title, score, feedback, URL, job_key_data, job_keywords, matching_keywords, missing_keywords, improvements
---

Linked job posting:
---
{job_description}
---

Linked CV summary:
---
CV linked, type, Structured CV profile JSON
---

Linked CV extracted text:
---
{cvText}
---

Answer the user using only this context.
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

`POST /api/job-match-analyses/[id]/chat/copy-paste/prepare` receives the current draft user message and conversation id. It validates the same job-match context, loads the recent persisted conversation, and returns a plain-text prompt. The prompt keeps the same semantic coaching rules as the integrated chat, but instructs the external model to return only the assistant message as plain text, not JSON.

`POST /api/job-match-analyses/[id]/chat/copy-paste/apply` receives the draft user message plus the pasted assistant response. It persists both messages through the `analysis-chat` module. The assistant message uses `model: "external-chat"` and metadata with `assistanceMode: "copy_paste"` and `source: "external-chat"`. This route does not call any real AI provider.

The Copy Paste prompt includes:
- the current draft user question
- the last 12 persisted chat messages
- the linked offer analysis fields
- the linked job posting
- linked CV summary and extracted text when available
- a privacy notice reminding the user to use trusted external tools

## Maintenance
When `OFFER_CHAT_SYSTEM_PROMPT`, `buildOfferChatPrompt`, `buildOfferChatCopyPastePrompt`, chat persistence, model metadata, or the context sent from either chat route changes, update this document in the same change. Keep integrated and Copy Paste semantics aligned unless a difference is documented here.
