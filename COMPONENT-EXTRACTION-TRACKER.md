# Component Extraction Tracker

Track which components have been scanned and decomposed into smaller sub-components.

## Command

```bash
# Find all .tsx files >250 lines (excluding ui/ primitives) sorted by size:
find src/features src/components -name '*.tsx' -not -path '*/ui/*' -type f | xargs wc -l | sort -rn | awk '$1 > 250'
```

## Status legend

- ✅ Done — scanned and extracted
- 🔄 In progress
- ⏳ Pending
- ➖ Skipped — already small or well-decomposed

## Features

| File | Lines | Status |
|------|-------|--------|
| `src/features/work-journal/components/work-journal-view.tsx` | 334 | ✅ |
| `src/features/work-journal/components/work-journal-form.tsx` | 145 | ✅ |
| `src/features/work-journal/components/work-journal-timeline.tsx` | 68 | ✅ |
| `src/features/job-match-analysis/components/tab-chat-oferta.tsx` | 829 | ⏳ |
| `src/features/cv-editor/components/cv-editor-view.tsx` | 806 | ⏳ |
| `src/features/cv-analysis/components/tab-chat-oferta.tsx` | 695 | ⏳ |
| `src/features/received-feedback/components/received-feedback-view.tsx` | 693 | ⏳ |
| `src/features/objectives/components/objectives-view.tsx` | 578 | ⏳ |
| `src/features/cv-analysis/components/analysis-view.tsx` | 513 | ⏳ |
| `src/features/cv-analysis/components/extraction-view.tsx` | 500 | ⏳ |
| `src/features/admin-observability/components/admin-observability-view.tsx` | 482 | ⏳ |
| `src/features/job-match-analysis/components/job-match-analysis-detail.tsx` | 457 | ⏳ |
| `src/features/cv-editor/components/cv-manual-editor/manual-editor.tsx` | 434 | ⏳ |
| `src/features/job-match-analysis/components/job-match-extraction-view.tsx` | 384 | ⏳ |
| `src/features/interview-questions/components/interview-question-detail.tsx` | 378 | ⏳ |
| `src/features/cv-library/components/templates-view.tsx` | 364 | ⏳ |
| `src/features/objectives/components/objective-outcomes-section.tsx` | 334 | ⏳ |
| `src/features/cv-analysis/components/score-hero.tsx` | 328 | ⏳ |
| `src/features/cv-library/components/cv-template-preview.tsx` | 326 | ⏳ |
| `src/features/job-match-analysis/components/score-hero.tsx` | 312 | ⏳ |
| `src/features/objectives/components/objective-items-section.tsx` | 306 | ⏳ |
| `src/features/job-match-analysis/components/job-match-analysis-view.tsx` | 300 | ⏳ |
| `src/features/cv-analysis/components/new-analysis-flow.tsx` | 294 | ⏳ |
| `src/features/cv-analysis/components/cv-analysis-view.tsx` | 271 | ⏳ |

## Shell / Shared

| File | Lines | Status |
|------|-------|--------|
| `src/components/shell/app-shell.tsx` | 1060 | ⏳ |
| `src/components/shell/sidebar.tsx` | 466 | ⏳ |
| `src/components/shared/copy-paste-workflow-modal.tsx` | 309 | ⏳ |
