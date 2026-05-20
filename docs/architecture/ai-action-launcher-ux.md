# AI Action Launcher UX

## Purpose

Design a reusable AI action launcher for every place where the user can start an AI-backed product action.

The current product supports two assistance modes:

- `integrated`: the app backend calls the selected AI provider/model.
- `copy_paste`: the app prepares a prompt, the user runs it in an external chat, and then pastes the structured result back into the app.

The UI should not show two permanent sibling buttons across the interface. Instead, every AI-capable action should expose one compact entry point. Pressing it opens a polished chooser where the user explicitly selects how they want to run the action.

## Core Pattern

Use one contextual AI button per action.

Examples:

- `AI`
- `Generate with AI`
- `Improve with AI`
- `Analyze with AI`

The button opens an attached popover on desktop. On mobile, the same content may become a bottom sheet if the popover would feel cramped.

The launcher is not a global settings screen. It is a contextual action chooser.

## Recommended Desktop UI

Use a button with a sparkle icon and chevron:

```text
[ AI v ]
```

The popover should be attached to the button and feel like an intentional command surface.

```text
Use AI for this action

Inside the app
Choose a model and generate here.

Model
[ Gemini 3.1 Pro Preview        v ]

[ Continue ]

External chat
Copy the prompt, run it outside the app, and paste the result.

[ Open flow ]
```

For Spanish UI:

```text
Usar AI para esta accion

Dentro de la app
Elige modelo y genera aqui.

Modelo
[ Gemini 3.1 Pro Preview        v ]

[ Continuar ]

Chat externo
Copia el prompt, usalo fuera y pega el resultado.

[ Abrir flujo ]
```

Use the app's translation system for all visible strings.

## Option Semantics

### Inside the app

This starts the integrated backend-managed AI flow.

The option must include:

- An icon, preferably a sparkle icon.
- A clear label: `Inside the app` / `Dentro de la app`.
- A short description focused on the benefit: the user stays in the current workflow.
- A visible model selector.
- A primary action button with contextual copy.

Suggested action button labels:

- `Generate`
- `Analyze`
- `Improve`
- `Draft`
- `Continue`

Use the verb that matches the product action. Avoid a generic `Submit`.

### External chat

This starts the existing Copy Paste flow.

The option must include:

- An icon, preferably an external-link or copy icon.
- A clear label: `External chat` / `Chat externo`.
- A short description explaining that the prompt is copied and the result is pasted back.
- A secondary action button that opens the existing Copy Paste modal flow.

Suggested action button labels:

- `Open flow`
- `Use external chat`
- `Copy prompt`

For Spanish:

- `Abrir flujo`
- `Usar chat externo`
- `Copiar prompt`

## Model Selection

The model selector belongs inside the `Inside the app` option.

Do not use a `change` text link as the primary model affordance. The selected model should be directly visible and changeable in place.

Recommended behavior:

1. The popover opens.
2. The `Inside the app` option shows the currently selected/default model.
3. The user can open the model select from inside the popover.
4. The user selects a model.
5. The selected model is used for this action.
6. If the product stores AI preferences, the implementation may also persist the selected model as the new default, but that should be an explicit product decision.

The selector should be compact. It should not turn the launcher into a configuration page.

Model option content:

- Model name.
- Optional provider label if there are multiple providers.
- Optional badge for non-production models such as `Mock` or `Dev only`.

Example:

```text
Gemini 3.1 Pro Preview
Gemini 2.5 Flash
Mock local              Dev only
```

## Future Modes

The launcher should be designed to support more modes later.

Possible future modes:

- App subscription credits.
- Bring-your-own API key.
- Local model.
- Organization-managed provider.
- Saved prompt template.

The first version should still optimize for the two current modes. Do not overbuild the UI into a marketplace or wizard.

Recommended extensibility:

- Use a generic `AIModePicker` / `AIActionLauncher` component.
- Represent options as structured objects with label, description, icon, availability, and action.
- Keep the integrated option able to render an inline configuration area.
- Keep mode-specific long flows outside the popover.

## Interaction Rules

The launcher must follow these rules:

1. One visible AI entry point per product action.
2. The user always chooses the execution mode after pressing the AI button.
3. The chooser must not auto-run integrated AI just because the user has a configured provider.
4. The integrated option must expose model selection before execution.
5. The external chat option should open the existing Copy Paste flow.
6. If integrated AI is unavailable, show the option disabled or with a configuration-required state rather than removing it.
7. If external chat is unavailable for a specific action, show only when supported or explain why it is unavailable.
8. Do not route the user to global settings unless they explicitly choose to configure credentials.

## Availability States

### Integrated available

Show the model selector and enabled primary CTA.

Example:

```text
Dentro de la app
Elige modelo y genera aqui.
Modelo: Gemini 3.1 Pro Preview
[ Generar ]
```

### Integrated missing API key

Keep the option visible.

Show a clear status and a configuration action.

Example:

```text
Dentro de la app
Configura un proveedor para generar sin salir de la app.
[ Configurar AI ]
```

Do not hide `Chat externo`; it remains a valid path that does not require an API key.

### Integrated in progress

The launcher should close or stay open depending on the host flow.

Recommended default:

- Close the popover after the integrated action starts.
- Show progress in the host UI, not inside the popover.
- Disable the launcher button while the same action is running.

### External chat started

Open the existing modal flow for Copy Paste.

The popover should close before the modal opens.

## Visual Direction

The design should match the app's SaaS/productivity character:

- Polished, quiet, and operational.
- Crisp spacing and alignment.
- Subtle borders and restrained surfaces.
- Clear hierarchy without marketing-style hero treatment.
- No decorative gradient blobs or oversized illustrations.
- Use cards only for the individual mode options if needed, not nested cards.
- Keep radius around 8px unless the existing app system requires otherwise.

Recommended visual details:

- Popover width: around 360-420px on desktop.
- Option surfaces: subtle border, soft hover state, 8px radius.
- Primary accent: use the app's existing accent color.
- Icons: use `lucide-react` where available.
- `Inside the app` should receive the stronger CTA.
- `External chat` should be visually equal as a mode, but its CTA can be secondary.

The chooser should feel elegant and a little special, because it starts the app's AI capability, but it should remain fast and utilitarian.

## Accessibility

The component should be keyboard and screen-reader accessible.

Requirements:

- The AI button opens the popover with keyboard activation.
- Focus moves into the popover when opened.
- Escape closes the popover.
- Click outside closes the popover.
- Model selector is reachable by keyboard.
- Each mode has a programmatic name and description.
- Disabled states explain why the option cannot be used.
- Loading state should be announced if the integrated action begins from the popover.

## Component API Sketch

This is not a required implementation, but agents should use a similar separation of concerns.

```ts
type AIActionMode = "integrated" | "copy_paste";

type AIModelOption = {
  id: string;
  label: string;
  provider?: string;
  badge?: string;
  disabled?: boolean;
};

type AIActionLauncherProps = {
  actionLabel: string;
  integrated: {
    available: boolean;
    selectedModelId: string;
    models: AIModelOption[];
    onModelChange: (modelId: string) => void;
    onRun: () => void;
    unavailableReason?: string;
    onConfigure?: () => void;
  };
  copyPaste: {
    available: boolean;
    onOpenFlow: () => void;
    unavailableReason?: string;
  };
  loading?: boolean;
};
```

The UI component should not call AI endpoints directly. Host feature hooks should pass action handlers into the launcher.

## Copy Guidelines

English:

- Button: `AI`
- Popover title: `Use AI for this action`
- Integrated label: `Inside the app`
- Integrated description: `Choose a model and generate here.`
- External label: `External chat`
- External description: `Copy the prompt, run it outside the app, and paste the result.`

Spanish:

- Button: `AI`
- Popover title: `Usar AI para esta accion`
- Integrated label: `Dentro de la app`
- Integrated description: `Elige modelo y genera aqui.`
- External label: `Chat externo`
- External description: `Copia el prompt, usalo fuera y pega el resultado.`

Final Spanish copy should use proper accents in `src/i18n/messages.ts`:

- `Usar AI para esta acción`
- `Elige modelo y genera aquí.`
- `Copia el prompt, úsalo fuera y pega el resultado.`

ASCII-only text is used in this document where useful for wireframes.

## Implementation Expectations

Agents implementing this UI should:

1. Reuse existing shadcn/ui primitives where useful, especially `Popover`, `Select`, `Button`, and possibly `Command`.
2. Use existing app typography, color tokens, and spacing conventions.
3. Add translations under both English and Spanish message sections.
4. Keep feature-specific action orchestration in feature hooks, not inside the launcher component.
5. Avoid hardcoded visible strings inside React components.
6. Ensure the component can be used by CV editor, Work Journal, Feedback Notes, analysis scoring, and future AI actions.
7. Preserve existing Copy Paste modal flows and call them from the `External chat` option.
8. Do not perform real AI calls in tests.

## Success Criteria

The result is successful when:

- The UI shows one AI entry point instead of two sibling AI buttons.
- The chooser is visually polished enough to feel like a first-class product pattern.
- The user always chooses between integrated AI and external chat.
- Integrated AI exposes model selection before execution.
- External chat opens the existing Copy Paste flow.
- The component is reusable across AI-backed product actions.
- The design can grow to more modes later without redesigning the whole pattern.
