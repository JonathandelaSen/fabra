# Assisted workflows

This file is the stable entrypoint for the assisted workflow architecture.

Implementation plans live in feature-specific files:

- `docs/architecture/assisted-workflows-implementation-plan-analisys-cv.md`
- `docs/architecture/assisted-workflows-implementation-plan-job-match-analysis.md`

Shared implementation contracts live under:

```txt
src/modules/shared/application/assisted-workflows/
src/components/shared/
```

When adding a new Copy Paste workflow, prefer reusing shared backend parsing/envelope utilities and shared frontend trigger/modal primitives before creating feature-specific UI.
