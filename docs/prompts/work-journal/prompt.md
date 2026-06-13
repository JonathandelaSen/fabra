# Work journal AI prompt

Integrated runs persist the prompt input and full AI interaction lifecycle through the shared `ai-interactions` event subscriber.

## Source files

- Prompt builders and system instructions: `src/modules/work-journal/infrastructure/services/work-journal-prompts.ts`
- Model-call controller: `src/modules/work-journal/infrastructure/services/gemini-journal-ai.service.ts`
- Frontend clipboard prompt copy: `src/features/work-journal/api/work-journal-prompt.ts`
- Copy Paste text UI: `src/features/work-journal/components/work-journal-copy-paste-panel.tsx`

## Current prompts

### System prompt

The entry drafting prompt tells the model to rewrite rough notes into a concise first-person factual journal entry, keep the user's language, preserve uncertainty, and avoid inventing metrics, outcomes, technologies, dates, roles, or impact.

### User prompt

`buildWorkJournalEntryDraftPrompt` receives:

- context type;
- context name;
- optional role/label;
- start date;
- optional end date;
- optional topic;
- original notes.

It asks the model to return:

```json
{
  "final_text": "first-person factual journal entry"
}
```

## Runtime flow

### Integrated flow

1. The user chooses a context, date/range, optional topic, and "Help me write it".
2. The API validates the context belongs to the user.
3. `draftWorkJournalEntry` calls the selected AI provider with the entry drafting prompt.
4. The API returns `finalText` as an editable preview.
5. The user saves the entry manually after review.

### Copy Paste plain-text flow

1. The user chooses the AI drafting mode, enters context/date/topic and rough notes, then opens "Use external AI".
2. `WorkJournalCopyPastePanel` builds the plain-text clipboard prompt with `buildWorkJournalEntryDraftClipboardPrompt`.
3. The user copies that prompt into an external chat tool.
4. The external tool must return only the final journal entry as plain text.
5. The user pastes that plain text into the Copy Paste panel and applies it to the editable `final_text` field.
6. The app does not save automatically; the user can edit `final_text` and then saves through the normal Work Journal save path.

No JSON envelope is required for this workflow because the destination is one editable plain-text field, not a structured result.

## Copy Paste data included

The copied prompt includes:

- context type;
- context name;
- optional context role/label;
- start date;
- optional end date;
- optional topic;
- original rough notes.

The frontend helper mirrors the clipboard branch of the module prompt builder without importing module internals into client code.

## Maintenance notes

- Keep prompt text and model-call code separate.
- Keep the integrated JSON prompt and Copy Paste plain-text prompt semantically aligned when changing drafting behavior.
- Do not ask the model to infer facts that are not present in entries or additional evidence.
- When changing response shape, update `src/modules/work-journal/infrastructure/services/gemini-journal-ai.service.ts`, API routes, UI handling, and this document in the same change.
