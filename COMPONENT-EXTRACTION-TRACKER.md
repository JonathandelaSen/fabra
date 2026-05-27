# Component Extraction Tracker

Track de los componentes revisados durante el barrido de extracción de UI.

## Command

```bash
find src/features src/components -name '*.tsx' -not -path '*/ui/*' -type f | xargs wc -l | sort -rn | awk '$1 > 250'
```

## Verification

```bash
npx tsc --noEmit --pretty false
npm run build
```

## Status Legend

- Done: scanned and extracted where useful.
- Scanned: reviewed and intentionally left as-is because the remaining size is mostly orchestration, state, or an already cohesive sub-view.

## Done

| File | Notes |
|------|-------|
| `src/features/work-journal/components/work-journal-view.tsx` | Scanned; Claude removed dead imports/constants. Remaining size is view orchestration. |
| `src/features/work-journal/components/work-journal-form.tsx` | Extracted input mode tabs, AI section, actions, and metadata. |
| `src/features/work-journal/components/work-journal-timeline.tsx` | Extracted entry editor, display, and empty state. |
| `src/features/job-match-analysis/components/tab-chat-oferta.tsx` | Extracted chat markdown, header/input/messages, empty states, conversation list, bubble, and copy-paste modal. |
| `src/features/cv-analysis/components/tab-chat-oferta.tsx` | Extracted chat markdown, header/input/messages, empty states, conversation list, and bubble. |
| `src/features/cv-editor/components/cv-editor-view.tsx` | Extracted empty state, header, AI panel, recommendations, public/settings sections, and modals. |
| `src/features/received-feedback/components/received-feedback-view.tsx` | Extracted detail, form, list item, and empty state. |
| `src/features/cv-analysis/components/extraction-view.tsx` | Extracted extraction header, parser tabs, and PDF preview. |
| `src/features/admin-observability/components/admin-observability-view.tsx` | Extracted filters, event item/detail, primitives, and timeline item. |
| `src/features/cv-editor/components/cv-manual-editor/manual-editor.tsx` | Extracted presentation and section item components. |
| `src/features/job-match-analysis/components/job-match-extraction-view.tsx` | Extracted job-match extraction header, parser tabs, and PDF preview. |
| `src/features/interview-questions/components/interview-question-detail.tsx` | Extracted header, prompt/context panel, and answer panel. |
| `src/features/cv-library/components/templates-view.tsx` | Extracted template card and template configuration modal. |
| `src/features/cv-analysis/components/score-hero.tsx` | Extracted shared animated score circle. |
| `src/features/job-match-analysis/components/score-hero.tsx` | Extracted shared animated score circle. |
| `src/components/shell/sidebar.tsx` | Extracted nav item, nav section, footer, and active-view type. |
| `src/components/shell/app-shell.tsx` | Extracted `AppShellContent` render component; remaining size is route/state coordination. |

## Scanned

| File | Reason |
|------|--------|
| `src/features/objectives/components/objectives-view.tsx` | Mostly route/view orchestration delegating to existing sections. |
| `src/features/cv-analysis/components/analysis-view.tsx` | Already delegates to score hero and tab components; remaining size is handlers and flow. |
| `src/features/job-match-analysis/components/job-match-analysis-detail.tsx` | Similar to analysis detail shell; mostly tab/detail orchestration. |
| `src/features/objectives/components/objective-outcomes-section.tsx` | Already a focused sub-component. |
| `src/features/cv-library/components/cv-template-preview.tsx` | Cohesive renderer with internal helper pieces for a fixed CV template preview. |
| `src/components/shared/copy-paste-workflow-modal.tsx` | Already decomposed internally by workflow step and kept shared. |
| `src/features/objectives/components/objective-items-section.tsx` | Already a focused sub-component. |
| `src/features/job-match-analysis/components/job-match-analysis-view.tsx` | Route/list orchestrator with existing child components. |
| `src/features/cv-analysis/components/new-analysis-flow.tsx` | Cohesive form flow; no obvious repeated UI region left to extract safely. |
| `src/features/cv-analysis/components/cv-analysis-view.tsx` | Route/view orchestrator with child components. |
| `src/components/shell/app-shell-content.tsx` | New extracted render switch; acceptable as the shell view renderer. |
