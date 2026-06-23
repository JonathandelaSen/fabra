# Fabra Evals Integration

This document defines the Fabra-side changes required to make local prompt and AI-action evaluations viable through an external tool, temporarily named Eval Studio.

Eval Studio is a separate local web application. Fabra is not responsible for rendering the evaluation UI, but Fabra must be able to export reproducible evaluation artifacts into a shared folder that Eval Studio can read.

## Goal

Fabra should let an admin capture meaningful AI-backed product actions as reusable evaluation cases and, when available, persist the concrete result produced by Fabra as a baseline result.

The integration must support two flows:

1. Fabra captures cases and optional baseline results.
2. Eval Studio reads those cases, can run additional experiments with other providers/models, and writes results back to the same artifact workspace.

## Non-Goals

- Do not build Eval Studio inside Fabra.
- Do not create a database-backed eval management UI in Fabra.
- Do not require Eval Studio to connect to Fabra, Supabase, or Fabra internals for the MVP.
- Do not add anonymization or privacy classification to the MVP artifact contract.
- Do not make production Supabase migrations for this effort unless explicitly requested later.

## Shared Artifact Workspace

Fabra writes evaluation artifacts to a repo-local folder:

```txt
evals/
  manifest.json
  suites/
  runs/
  annotations/
```

For the MVP, all artifacts may be versioned in Git. The initial expected data is either owned by the developer, public, invented, or synthetic.

If sensitive user data is ever introduced later, the workspace policy should be revisited before capture is enabled.

## Product Action as Evaluation Unit

The evaluation unit is an AI-backed product action, not a prompt file by itself.

Examples:

- `job_match_analysis.score_cv_against_offer`
- `cv_analysis.score_cv`
- `cv_library.structure_profile`
- `cv_library.edit_profile`
- `job_analysis_chat.answer_message`
- `feedback_notes.generate_final_feedback`
- `performance_review.generate_self_assessment`
- `work_journal.draft_entry`
- `selection_process.answer_interview_question`

This matters because behavior depends on more than prompt text: input assembly, output schema, parser behavior, provider/model, runtime config, mode, and post-processing all affect the final result.

## Fabra Responsibilities

Fabra must provide a small producer layer that can write evaluation artifacts from real product flows.

Minimum responsibilities:

1. Detect the current AI-backed product action.
2. Build a reproducible case from the current execution context.
3. Persist the fully materialized prompt used for the execution.
4. Persist the unresolved prompt template and the variables used to render it, when available.
5. Persist structured input where available.
6. Persist provider/model/config metadata.
7. Persist the Fabra-produced output as a baseline result when an execution already happened.
8. Restrict capture controls to admin users.

## Admin Capture Flow

An admin-only control should be available near completed AI-backed product actions:

```txt
Save as eval case
```

The first version should ask only for:

- Case name
- Optional note

Fabra should infer the rest from the current product context and AI execution.

The saved case should include:

- Stable case id
- Human name
- Optional note
- Product action id
- Input object required to reproduce the action
- Prompt template/messages before variable substitution, when available
- Prompt variables used to render the template
- Rendered prompt/messages sent to the model
- Output schema or response contract reference when known
- Provider/model/config used by the original run
- Source metadata pointing back to Fabra context when useful
- Baseline result if a model response exists

## Case Artifact

Cases are self-contained. Eval Studio must be able to inspect them without running Fabra.

Example:

```json
{
  "schemaVersion": "1",
  "caseId": "job-match-analysis.score_cv_against_offer.senior-backend-node",
  "actionId": "job_match_analysis.score_cv_against_offer",
  "name": "Senior backend with missing Node requirement",
  "note": "The result should strongly penalize the missing Node.js requirement.",
  "createdAt": "2026-06-22T10:00:00.000Z",
  "createdBy": {
    "source": "fabra",
    "userRole": "admin"
  },
  "input": {
    "cvText": "...",
    "jobDescription": "...",
    "jobUrl": "https://example.com/job",
    "language": "es"
  },
  "promptTemplate": {
    "format": "messages",
    "templateId": "job_match_analysis.score_cv_against_offer.v1",
    "messages": [
      {
        "role": "system",
        "content": "You are evaluating a CV against a job description. Respond in {{language}}."
      },
      {
        "role": "user",
        "content": "CV:\n{{cvText}}\n\nJob description:\n{{jobDescription}}"
      }
    ]
  },
  "promptVariables": {
    "language": "es",
    "cvText": "...",
    "jobDescription": "..."
  },
  "renderedPrompt": {
    "format": "messages",
    "messages": [
      {
        "role": "system",
        "content": "You are evaluating a CV against a job description. Respond in es."
      },
      {
        "role": "user",
        "content": "CV:\n...\n\nJob description:\n..."
      }
    ]
  },
  "runtime": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "temperature": 0.2
  },
  "expectedOutput": {
    "kind": "json",
    "schemaRef": "fabra://job_match_analysis/score_response/v1"
  },
  "source": {
    "app": "fabra",
    "route": "/job-match-analyses/...",
    "entityRefs": {
      "analysisId": "..."
    }
  }
}
```

The exact `input` shape is action-specific. It should be plain JSON and should not require database lookups to understand.

## Baseline Result Artifact

If the admin saves a case after a real Fabra AI execution, Fabra should also save the original output as a result. This avoids re-running an expensive call just to inspect it in Eval Studio.

Example:

```json
{
  "schemaVersion": "1",
  "resultId": "2026-06-22T100005Z.fabra.job-match-analysis.score_cv_against_offer.senior-backend-node",
  "caseId": "job-match-analysis.score_cv_against_offer.senior-backend-node",
  "runId": "2026-06-22T100000Z.fabra-baseline",
  "producer": "fabra",
  "createdAt": "2026-06-22T10:00:05.000Z",
  "runtime": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "temperature": 0.2
  },
  "rawOutput": "...",
  "parsedOutput": {
    "score": 72
  },
  "status": "completed",
  "error": null,
  "usage": {
    "inputTokens": null,
    "outputTokens": null,
    "costUsd": null
  },
  "latencyMs": null
}
```

## Run Artifact

A run groups result artifacts for one experiment execution.

Fabra may create a run when it saves a baseline result. Eval Studio will also create runs when it executes experiments.

Example:

```json
{
  "schemaVersion": "1",
  "runId": "2026-06-22T100000Z.fabra-baseline",
  "name": "Fabra baseline capture",
  "actionId": "job_match_analysis.score_cv_against_offer",
  "producer": "fabra",
  "createdAt": "2026-06-22T10:00:00.000Z",
  "caseIds": [
    "job-match-analysis.score_cv_against_offer.senior-backend-node"
  ],
  "runtime": {
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  },
  "notes": "Created while saving case from Fabra admin UI."
}
```

## Suggested Folder Layout

Use stable paths that are easy to diff:

```txt
evals/
  manifest.json
  suites/
    job_match_analysis.score_cv_against_offer/
      suite.json
      cases/
        senior-backend-missing-node.case.json
  runs/
    2026-06-22T100000Z.fabra-baseline/
      run.json
      results/
        senior-backend-missing-node.result.json
  annotations/
    2026-06-22T100000Z.fabra-baseline/
      senior-backend-missing-node.annotation.json
```

Annotations are primarily owned by Eval Studio, but the folder is part of the same shared contract.

## Prompt Capture Requirements

Fabra should save all three prompt layers when they are available:

1. `promptTemplate`: the unresolved prompt template or message templates before variable substitution.
2. `promptVariables`: the values used to render the prompt for this case.
3. `renderedPrompt`: the fully materialized prompt or message list sent to the model.

Fabra should also save the broader structured `input` object that produced the action when available. `input` can overlap with `promptVariables`, but they have different purposes:

- `input` represents the product action payload.
- `promptVariables` represents the exact variables injected into the prompt template.

This enables two Eval Studio modes:

- Exact replay: send `renderedPrompt` as-is.
- Variable editing: edit `promptVariables`, re-render `promptTemplate`, and run the changed prompt.
- Experiment mode: reuse structured input with a different prompt template or model later.

For current Fabra architecture, capture should happen after prompt builders assemble the prompt and before/after the provider-specific service call, depending on what data is already available in each action.

## Implementation Guidance in Fabra

Keep the artifact writer small and infrastructure-oriented.

Recommended pieces:

1. Add an eval artifact writer service under a shared backend infrastructure area or a narrowly scoped module if a better owner emerges.
2. Add action-specific capture adapters near each AI-backed action as they are enabled.
3. Start with one action only, preferably `job_match_analysis.score_cv_against_offer`, because CV + offer comparison is easy to inspect and compare.
4. Add admin-only UI action in the relevant feature screen.
5. Add an API route that validates admin permissions and writes the case/result artifacts through a use case.

Respect existing Fabra architecture:

- Route handlers must use `getAuthenticatedRequestContext()`.
- Validate request body before binding modules.
- Use response helpers from `@/backend/modules/shared`.
- Keep business workflow logic in backend modules/use cases, not route helpers.
- Keep prompt builders separate from model-call controllers.
- Update prompt documentation under `docs/prompts/<prompt-type>/prompt.md` if prompt inputs, prompt builder behavior, response shape, or controller behavior changes.

## Admin Authorization

The capture action must be visible only to admins and enforced server-side.

The UI hiding is not enough. The API route must reject non-admin users.

The exact admin check should reuse Fabra's existing admin/role pattern.

## MVP Sequence

Implement incrementally:

1. Create the `evals/` folder contract and sample files.
2. Add a small artifact writer with tests.
3. Enable one Fabra action to export a case and baseline result.
4. Add admin-only UI capture button for that action.
5. Verify Eval Studio can read the exported artifacts.
6. Expand to additional AI-backed actions only after the first action works end to end.

## Open Decisions for Later

- Whether Eval Studio should ever write cases back into the Fabra repo directly.
- Whether Fabra should offer a command to run a full suite itself.
- Whether artifacts should be validated by JSON Schema in CI.
- Whether any future artifacts need redaction, encryption, or `.gitignore` policy.
- Whether prompt versions should be formalized across all Fabra AI actions.
