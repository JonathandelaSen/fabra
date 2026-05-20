# Assisted workflow implementation plan: Offer chat external response

## Workflow summary

Workflow id:

```txt
offer_chat.assistant_response
```

Response kind:

```txt
plain_text
```

Offer chat is a special case. Manual mode is not meaningful because the product action is creating an assistant response in a chat conversation. Copy Paste can still be useful by letting the user generate an assistant response in an external chat and insert it into the conversation after confirmation.

Manual support:

```txt
supported: false
reason: A chat assistant response cannot be meaningfully completed without generating or inserting an assistant message.
```

Integrated support:

```txt
supported: true
providers: api_key, mock
```

Copy Paste support:

```txt
status: planned special case
```

## Execution policy for agents

Do not stop between phases for approval. Implement end to end, run verification including E2E, fix failures, and leave changes uncommitted. The user gives final OK and commits/pushes manually.

Do not call real AI APIs.

## Expected user experience

1. User opens offer chat for a job match analysis.
2. User writes a message/question.
3. User can send through integrated AI or choose Copy Paste.
4. Copy Paste prepares a prompt with the analysis context and recent conversation.
5. User copies prompt to external chat.
6. User pastes assistant response as plain text.
7. App shows editable assistant response preview.
8. User confirms insertion.
9. Backend persists both the user message and externally generated assistant message, or persists only the assistant message if the user message already exists, depending on current chat flow.
10. Chat displays the assistant message with discreet origin: external chat.

No JSON envelope is required for the assistant response text.

## Shared UI requirements

Use shared text Copy Paste components, but this workflow needs a chat-specific wrapper.

Feature wrapper:

```txt
src/features/cv-analysis/components/offer-chat-copy-paste-modal.tsx
```

The wrapper owns:

- current draft user message
- selected conversation
- conversation history context
- editable assistant response preview
- insert confirmation

Do not use the structured JSON modal.

## Backend plan

Current likely files:

```txt
src/app/api/job-match-analyses/[id]/chat/route.ts
src/app/api/job-match-analyses/[id]/chat/validation.ts
src/modules/analysis-chat/application/use-cases/send-message.use-case.ts
src/modules/analysis-chat/application/use-cases/list-messages.use-case.ts
src/modules/analysis-chat/infrastructure/services/analysis-chat-prompts.ts
docs/prompts/chat-oferta-ai/prompt.md
```

Add routes:

```txt
POST /api/job-match-analyses/[id]/chat/copy-paste/prepare
POST /api/job-match-analyses/[id]/chat/copy-paste/apply
```

Prepare:

- authenticate
- validate job match analysis context
- load conversation history
- build prompt from same semantics as integrated chat
- include privacy notice

Apply:

- validate pasted assistant response is non-empty
- persist chat messages through analysis-chat module
- record `assistanceMode: "copy_paste"`
- set message model/source to `external-chat` where supported

No preview endpoint is required unless server-side validation/preview becomes more complex. The frontend can preview/edit plain text before apply.

## Frontend plan

Current likely files:

```txt
src/features/cv-analysis/components/tab-chat-oferta.tsx
src/i18n/messages.ts
```

Tasks:

1. Add Copy Paste action next to chat send action.
2. Keep Copy Paste available without API key.
3. Prepare prompt from current draft and conversation.
4. Copy prompt.
5. Paste assistant response into editable preview.
6. Confirm insert.
7. Persist through backend apply.
8. Show assistant message in chat.
9. Mark source as external chat if UI supports metadata.
10. Add translations.

## Prompt documentation

Update:

```txt
docs/prompts/chat-oferta-ai/prompt.md
```

Document:

- integrated chat flow
- Copy Paste assistant-response flow
- conversation history included
- user message handling
- apply/persistence behavior
- maintenance notes

## Tests

Backend:

- prepare prompt for owned job match analysis
- reject non-job-match analysis
- include recent history
- apply persists external assistant response
- no AI service call

E2E:

```txt
e2e/offer-chat-copy-paste.spec.ts
```

Scenarios:

1. Open offer chat without API key.
2. Copy Paste action visible.
3. Prompt prepares from draft message.
4. Pasted assistant response preview is editable.
5. Confirm insert persists assistant message.
6. Message appears in chat with external-chat origin if visible.

## Verification commands

```bash
npm run test:backend -- analysis-chat
npm run ddd:check
npm run build
npm run test:e2e -- offer-chat-copy-paste
```

## Non-goals

- JSON envelope
- replacing integrated chat
- global assistance settings
- automatic insertion without confirmation
- long-term chat export/import
