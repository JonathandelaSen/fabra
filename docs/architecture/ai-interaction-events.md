# AI interaction infrastructure events

AI calls and Copy Paste workflows publish `InfrastructureEvent` instances through the shared `EventBus`. Domain and infrastructure events use the same transport, while their interfaces preserve their different intent.

The shared bus supports synchronous subscribers. The `ai-interactions` subscriber persists every AI infrastructure event to `ai_interaction_events` before the originating request completes.

Each event carries:

- `interactionId`: correlation across the complete assisted workflow
- `attemptId`: correlation for one concrete attempt
- `module` and `operation`: the AI capability performing the work
- `entityType` and `entityId`: the entity the interaction belongs to
- assistance mode, provider, model, and user

The lifecycle event names are:

- `ai_runtime.prompt_prepared`
- `ai_runtime.request_sent`
- `ai_runtime.response_received`
- `ai_runtime.response_validated`
- `ai_runtime.result_applied`
- `ai_runtime.failed`

Integrated flows publish lifecycle events around provider calls. Copy Paste `prepare` returns the generated correlation IDs, and subsequent `preview` and `apply` requests send those IDs back so their events belong to the same interaction.

All integrated AI use cases publish this lifecycle. The prepared event stores the
prompt-builder input snapshot so prompts can be inspected consistently across
providers and features.
