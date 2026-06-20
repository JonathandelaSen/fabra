# Feedback Notes Prompt

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

## Current Prompt

System prompt source: `src/backend/modules/feedback-notes/domain/services/feedback-notes-prompts.ts`

The system prompt tells the model to turn private raw feedback notes into useful peer feedback, write in the same language as the notes, use only the provided notes, avoid invented facts, preserve uncertainty, and return JSON only.

The user prompt includes:

- the target `personName`
- all feedback entries ordered chronologically
- each entry's creation timestamp and content
- the required JSON response shape with `final_feedback`

## Source Files

- Prompt builder: `src/backend/modules/feedback-notes/domain/services/feedback-notes-prompts.ts`
- Clipboard prompt builder: `src/features/feedback-notes/api/feedback-notes-api.ts`
- AI service (model calls + response parsing): `src/modules/feedback-notes/infrastructure/services/gemini-feedback-ai.service.ts`
- Generate use case: `src/modules/feedback-notes/application/use-cases/generate-final-feedback.use-case.ts`

## Data Flow

The route receives provider, apiKey, and model, composes the Feedback Notes module, and creates a `GenerateFinalFeedbackUseCase` with provider-selected `FeedbackAIService`. The use case loads the feedback, verifies it is active, loads all entries, rejects empty entry sets, calls the AI service, saves the result into `final_feedback`, and records `feedback_final_feedback_generated`.

The frontend Feedback Notes feature also exposes a clipboard-only prompt builder (`buildFeedbackNotesFinalPrompt` in `src/features/feedback-notes/api/feedback-notes-api.ts`) for the Copy Paste assisted workflow. It uses the same private notes, person name, language, grounding, and no-invention rules, but asks for plain text instead of the JSON response shape used by the model controller.

## Assisted Workflow: Copy Paste

The Copy Paste flow uses the shared `AIActionLauncher` button (integrated + external AI options) and the `CopyPasteTextPanel` shared component. No backend `prepare` endpoint is needed because the prompt is built client-side from the feedback entries.

Flow:
1. User clicks "Generate with AI" → popover shows "Inside the app" (integrated) and "External chat" (copy-paste).
2. Selecting "External chat" → "Open flow" opens a modal with the prompt and a paste textarea.
3. User copies the prompt, pastes into an external AI, copies the response, pastes it back.
4. Clicking "Use as final feedback" saves the pasted text as `finalFeedback` and closes the modal.
5. The textarea remains editable. Save is explicit via "Save final".

Source files:
- Copy-paste panel: `src/features/feedback-notes/components/feedback-copy-paste-panel.tsx`
- Final panel with AIActionLauncher: `src/features/feedback-notes/components/feedback-final-panel.tsx`
- Prompt builder: `src/features/feedback-notes/api/feedback-notes-api.ts` (`buildFeedbackNotesFinalPrompt`)

## Maintenance Notes

Keep the model prompt text and prompt builders in `src/backend/modules/feedback-notes/domain/services/feedback-notes-prompts.ts`. Keep Gemini SDK calls and response parsing in `src/modules/feedback-notes/infrastructure/services/gemini-feedback-ai.service.ts`. Keep the frontend clipboard prompt (`buildFeedbackNotesFinalPrompt`) in sync with the model prompt's grounding rules. When changing the prompt, input data, response shape, copy-paste behavior, or generate controller behavior, update this document in the same change.
