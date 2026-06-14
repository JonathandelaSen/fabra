# CV chat prompt

## Current prompt

The CV chat answers questions about one CV document. It receives the structured CV record, the best available extracted text, the conversation history, and the user's latest message. The system instructions require evidence-based answers grounded only in that CV and explicitly acknowledge missing information.

## Source

- Prompt builder: `src/modules/cv-chat/infrastructure/services/cv-chat-prompts.ts`
- Coaching instructions: `src/modules/cv-chat/domain/services/cv-chat-coaching-instructions.ts`
- Model controllers: `src/modules/cv-chat/infrastructure/services/*-cv-chat-ai.service.ts`

## Data and runtime flow

`CVChatContextRepository` loads the user-owned CV from `cvs`. `SendMessageUseCase` loads the independent CV conversation and message history, creates the provider-aware AI service, sends the prompt, and persists the answer in `cv_chat_messages`.

The workflow supports integrated assistance. Manual and copy-paste modes are not currently exposed because the chat interaction depends on persisted conversational history and immediate turn-by-turn responses.

## Maintenance notes

Keep this prompt independent from job analysis chat prompts. Changes to prompt inputs, output behavior, provider controllers, or the runtime flow must update this document in the same change.
