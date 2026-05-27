# Objectives Design Migration Plan

Date: 2026-05-27

## Goal

Migrate the Objectives screen toward the newer shared feature layout standard that emerged from the Feedback Notes and Interview Questions design migrations.

The target is not a literal copy of Feedback Notes, Interview Questions, or Job Match Analysis. Objectives has a different domain model: commitments, activity contexts, action items, evidence notes, expected outcomes, achieved outcomes, dates, status, priority, and source. The migration should reuse the shared feature shell, two-pane layout, sidebar surface, button system, spacing, colors, and interaction density while preserving Objectives workflows.

Important update: some layout primitives already exist because they were created during the previous design migration work. This plan should use those components directly instead of re-proposing them as future extractions.

Existing shared components to consider first:

- `src/components/shared/feature-screen-shell.tsx`
- `src/components/shared/feature-two-pane-layout.tsx`
- `src/components/shared/feature-sidebar-panel.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/dialog.tsx` if present, or the existing project dialog pattern if not
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/select.tsx` if present, or native selects with the established sidebar/input styling
- `src/components/ui/skeleton.tsx`

## Current Reference Screens

### Shared Feature Layout

Primary files:

- `src/components/shared/feature-screen-shell.tsx`
- `src/components/shared/feature-two-pane-layout.tsx`
- `src/components/shared/feature-sidebar-panel.tsx`

Important visual traits:

- Full feature-owned screen shell.
- Dark page background: `bg-[#09090f]`.
- Internal header with bottom border.
- Header/content can be centered with `max-w-[1560px]`.
- Controlled page padding: `p-4 lg:p-5 xl:p-6`.
- Two-pane layout defaults to `lg:grid-cols-[320px_minmax(0,1fr)]`.
- Sidebar is a real panel:
  - `rounded-lg`
  - `border border-white/[0.06]`
  - `bg-[#101018]`
  - `shadow-[0_4px_20px_rgba(0,0,0,0.15)]`
- Sidebar header and scroll body are separated.
- Feature-specific content remains inside feature components.

### Interview Questions

Primary files:

- `src/features/interview-questions/components/interview-questions-view.tsx`
- `src/features/interview-questions/components/interview-questions-sidebar.tsx`
- `src/features/interview-questions/components/interview-question-list-item.tsx`
- `src/features/interview-questions/components/interview-question-detail.tsx`

Useful migration result:

- `InterviewQuestionsView` already uses `FeatureScreenShell`.
- `InterviewQuestionsView` already uses `FeatureTwoPaneLayout`.
- `InterviewQuestionsSidebar` already uses `FeatureSidebarPanel`.
- The screen now demonstrates how a feature can adopt the shared shell without moving domain-specific list item or detail logic into shared components.

### Objectives

Primary files:

- `src/features/objectives/components/objectives-view.tsx`
- `src/features/objectives/components/objectives-sidebar.tsx`
- `src/features/objectives/components/objective-detail.tsx`
- `src/features/objectives/components/objective-form-panel.tsx`
- `src/features/objectives/components/objective-items-section.tsx`
- `src/features/objectives/components/objective-outcomes-section.tsx`
- `src/features/objectives/components/objectives-skeleton.tsx`
- `src/features/objectives/components/objectives-ui.ts`
- `src/features/objectives/hooks/use-objectives-route-state.ts`
- `src/features/objectives/hooks/use-objectives-queries.ts`
- `src/features/objectives/hooks/use-objectives-mutations.ts`
- `src/features/objectives/api/objectives-api.ts`
- `src/features/objectives/api/objectives-cache.ts`
- `src/app/api/commitments/responses.ts`

Current visual traits:

- Feature already lives under `src/features/objectives`.
- Root shell is custom:
  - `flex h-full min-h-0 flex-col overflow-hidden text-zinc-100`
- Header is custom:
  - `border-b border-white/[0.06] px-5 py-4`
- Sidebar is custom:
  - `border-b border-white/[0.06] bg-[#0d0d14]/80 lg:w-[340px] lg:border-r`
- Detail uses a large objective header card with emerald/amber gradient treatment.
- Items and outcomes are separate sections below the header.
- Many controls are raw `<button>`, `<input>`, `<textarea>`, and `<select>` elements with hand-authored classes.
- `window.confirm(...)` is used for destructive actions.
- Some user-visible strings still appear outside the translation layer:
  - confirm messages
  - fallback label maps in `objectives-ui.ts`
  - fixed `en-GB` date formatting
- The UI is useful but less aligned with the newer shared feature screen standard.

## High-Level Diagnosis

The visual gap comes from five layers:

1. Screen shell: Objectives has a custom shell instead of the shared `FeatureScreenShell`.
2. Two-pane layout: Objectives manually implements sidebar/detail structure rather than using `FeatureTwoPaneLayout`.
3. Sidebar structure: Objectives uses a full-height custom sidebar with a hard border, while the newer standard uses `FeatureSidebarPanel`.
4. Detail composition: Objectives has a strong header card, but action items and outcomes need clearer hierarchy and more consistent panel treatment.
5. System consistency: Objectives still has raw controls, hardcoded confirmations, fixed locale date formatting, and utility label fallbacks that should move fully into `next-intl`.

Because the shared shell components already exist, the migration should start by adopting them directly. New shared abstractions should be added only after Objectives proves a repeated need not already covered by the existing set.

## Proposed Migration Phases

## Phase 0 - Baseline Capture And Safety Checks

Purpose: capture the current state before changing UI so we can compare layout, regressions, and route behavior.

Actions:

- Open `/objectives`.
- Open `/objectives/[objectiveId]` with a known seeded objective.
- Open `/interview-questions` as the nearest shared-layout reference.
- Open `/feedback-notes` as the original visual standard reference if local data exists.
- If available, seed the agent test user with `npm run supabase:seed-agent` before manual testing.
- Confirm the local app is logged in as `agent-test@example.com` if data is needed.
- Capture screenshots for desktop width around 1280px.
- Capture screenshots for wide desktop width around 1600px or 1728px.
- Capture screenshots for tablet/mobile widths if responsive behavior is expected in this iteration.
- Record visible differences:
  - page width
  - header alignment
  - sidebar width
  - sidebar surface
  - filter segmented control
  - selected objective state
  - detail header surface
  - action item density
  - outcome panel hierarchy
  - create/edit form appearance
  - loading and empty states

Acceptance criteria:

- We have a visual baseline before the first UI migration.
- We know whether Objectives data exists locally.
- We know whether the current seeded data has open, closed, and all-status examples.
- No code changes are made in this phase except optional documentation updates.

Verification:

- Browser smoke test of `/objectives`.
- Browser smoke test of `/interview-questions`.
- No build required if no source files changed.

## Phase 1 - Adopt Existing Shared Feature Shell

Purpose: make Objectives occupy the page like the newer migrated feature screens, using the shared components already available.

Existing shared components:

- `FeatureScreenShell`
- `FeatureTwoPaneLayout`

Current Objectives pattern:

- `objectives-view.tsx`
- Root: `flex h-full min-h-0 flex-col overflow-hidden text-zinc-100`
- Header: custom `header` with title and create button.
- Body: custom `flex min-h-0 flex-1 flex-col lg:flex-row`.
- Sidebar/detail split is manually encoded.

Target pattern:

- `FeatureScreenShell`
  - `title={...}`
  - `actions={...}`
  - `contentClassName="max-w-[1560px] mx-auto"`
  - `bodyContentClassName="max-w-[1560px] mx-auto"`
- `FeatureTwoPaneLayout`
  - `sidebar={<ObjectivesSidebar ... />}`
  - detail content as children
  - default columns first: `lg:grid-cols-[320px_minmax(0,1fr)]`

Actions:

- Replace the custom root/header/body shell in `ObjectivesView` with `FeatureScreenShell`.
- Move the create objective button into the `actions` slot.
- Keep the `Target` icon in the title only if it still fits the shared header language.
- Replace the manual `flex` sidebar/detail body with `FeatureTwoPaneLayout`.
- Start with default `320px` sidebar width.
- If Objectives context grouping or item titles feel cramped, evaluate `columnsClassName="lg:grid-cols-[340px_minmax(0,1fr)]"`.
- Keep route behavior unchanged:
  - `/objectives`
  - `/objectives/[objectiveId]`
  - `?status=open|closed|all`
- Keep data hooks, mutations, optimistic updates, and route state unchanged in this phase.

Acceptance criteria:

- Objectives uses `FeatureScreenShell`.
- Objectives uses `FeatureTwoPaneLayout`.
- The page background, header, and outer spacing match Interview Questions and Feedback Notes.
- Objectives no longer carries a custom full-screen layout that duplicates shared shell responsibilities.
- Loading state still appears correctly before data loads.

Verification:

- `npm run build` because files under `src/features/` changed.
- Browser check `/objectives`.
- Browser check `/objectives/[objectiveId]`.
- Browser check `/interview-questions` to ensure the shared components were not regressed.

## Phase 2 - Adopt Existing Shared Sidebar Panel

Purpose: move Objectives sidebar to the same panel surface used by the newer migrated screens.

Existing shared component:

- `FeatureSidebarPanel`

Current Objectives sidebar:

- File: `objectives-sidebar.tsx`
- Element: `<aside>`
- Class:
  - `flex w-full shrink-0 flex-col`
  - `border-b border-white/[0.06]`
  - `bg-[#0d0d14]/80`
  - `lg:w-[340px] lg:border-b-0 lg:border-r`
- Filter segmented control is in a separate top area.
- Context groups and list items live in a scroll area below.

Target pattern:

- `FeatureSidebarPanel`
- Header slot contains the status filter:
  - open
  - closed
  - all
- Body contains grouped objective list.
- No nested sidebar card surface.

Actions:

- Wrap the existing filter and grouped list in `FeatureSidebarPanel`.
- Put the filter segmented control in the `header` prop.
- Move the list groups into the panel body.
- Remove custom root border/background/sidebar width classes that duplicate `FeatureSidebarPanel`.
- Keep context grouping behavior:
  - activity context groups
  - missing-context fallback group
  - group count
- Keep selected objective behavior:
  - selected only when the objective is inside the current filter list
  - path objective remains open even if not in the selected filter
- Restyle the segmented control to match the shared sidebar filter language:
  - wrapper: `flex rounded-lg border border-white/[0.06] bg-white/[0.035] p-1`
  - active: `bg-white/[0.10] text-zinc-100`
  - inactive: `text-zinc-500 hover:text-zinc-300`
- Do not introduce a new shared segmented control yet unless the same component is needed by more than Objectives and Feedback Notes.

Acceptance criteria:

- Sidebar visually reads as one panel like Interview Questions.
- Status filter is part of the sidebar panel header.
- List scrolls within the panel body.
- Context grouping remains intact.
- Empty groups do not render.
- Missing-context fallback remains translated.

Verification:

- Switch between open, closed, and all filters.
- Select an objective from each filter.
- Open a path objective that is not present in the selected filter and confirm no sidebar item is incorrectly selected.
- `npm run build`.

## Phase 3 - Objectives List Item Visual Migration

Purpose: make objective list items match the newer selected/hover density without losing Objectives-specific progress and context information.

Current Objectives list item traits:

- Root button:
  - `mb-1 w-full rounded-lg px-3 py-3 text-left transition-colors`
- Selected:
  - `bg-white/[0.08] text-zinc-100`
- Unselected:
  - `text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200`
- Title is line-clamped.
- Chevron is present.
- Metadata row contains status badge and item completion count.

Target traits from migrated screens:

- Root button:
  - `group relative mb-2 w-full rounded-xl border p-3.5 text-left transition-all duration-200`
- Selected:
  - `bg-[#181825] border-indigo-500/20 text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]`
- Unselected:
  - `bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200`
- Chevron affordance remains.
- Metadata row is compact and readable at 320px.

Actions:

- Extract objective list item rendering from `ObjectivesSidebar` into a sibling component:
  - `src/features/objectives/components/objective-list-item.tsx`
- Keep feature-specific metadata in the feature:
  - title
  - status
  - done count
  - total count
  - optional priority marker if useful
- Keep `statusClass` or replace it with a more local badge treatment using translated status labels.
- Consider a thin progress indicator inside each item only if it remains readable:
  - done/total text is required
  - progress bar is optional
- Avoid extracting `SelectableListItem` in this phase unless both Feedback Notes, Interview Questions, and Objectives converge on the same markup without prop overload.

Acceptance criteria:

- Objective list items visually align with the newer selected/hover language.
- Long objective titles do not overflow at 320px.
- Status and completion metadata remain readable.
- Context group headers remain quieter than list item titles.
- There is no card-inside-card effect inside the sidebar panel.

Verification:

- Check objectives with long titles.
- Check objectives with zero items.
- Check objectives with all items done.
- Check achieved, missed, cancelled, paused, and active statuses if seeded data supports them.
- `npm run build`.

## Phase 4 - Detail Header And Progress Summary Migration

Purpose: restructure the selected objective detail so it reads as a focused work surface: summary first, then action progress, then outcomes.

Current Objectives detail:

- File: `objective-detail.tsx`
- Root: `section className="w-full"`
- Header card:
  - `rounded-xl`
  - emerald/amber gradient background
  - status, priority, context, title, description
  - dates, success criteria, result notes
- Items and outcomes render below as separate sections.

Target pattern:

- Root:
  - `flex w-full max-w-[1600px] flex-col gap-5`
- Header panel:
  - `rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5`
- Detail panels:
  - clear sections for objective summary, action items, and outcomes
- Progress should be first-class:
  - done count
  - total count
  - completion percentage
  - target date if present
  - status

Actions:

- Keep `ObjectiveDetail` as the feature detail orchestrator.
- Extract a new sibling component:
  - `objective-summary-panel.tsx`
- Move current header content into `ObjectiveSummaryPanel`.
- Replace the gradient-heavy header with the newer shared panel surface.
- Preserve domain information:
  - status
  - priority
  - context
  - source
  - start date
  - target date
  - description
  - success criteria
  - result notes
- Add a compact progress summary in the header:
  - completion percentage
  - `done/total`
  - progress bar
- Keep edit/delete actions in the header right side.
- Use `Button` from `src/components/ui/button.tsx` for edit and delete where practical.
- Keep destructive action visually rose.

Acceptance criteria:

- Detail header feels aligned with the shared panel language.
- Objective title remains the dominant information.
- Progress is visible without scrolling.
- Dates and context metadata are scannable.
- Success criteria and result notes are not visually lost.
- Header actions are accessible and use consistent button sizing.

Verification:

- Check objectives with and without description.
- Check objectives with and without success criteria.
- Check objectives with and without result notes.
- Check objectives with and without target date.
- `npm run build`.

## Phase 5 - Action Items Panel Migration

Purpose: make action items feel like a practical checklist rather than a generic list of cards.

Current action item traits:

- File: `objective-items-section.tsx`
- Section has a heading and progress text.
- Progress bar sits above list.
- Each item is a rounded card:
  - `rounded-lg border border-white/10 bg-black/20`
- Inline edit form expands inside the item.
- Add-new input sits at the bottom.
- Raw buttons and raw inputs are used.

Target traits:

- Panel surface matches the shared feature panel language.
- Progress summary belongs in the panel header.
- Checklist rows are stable, compact, and easy to scan.
- Done/todo toggle uses a familiar icon button.
- Edit/delete actions are icon buttons with accessible labels.
- Add-new action is prominent but not visually heavier than the list.

Actions:

- Rename or replace the component with a clearer panel name:
  - keep `objective-items-section.tsx`, or move to `objective-actions-panel.tsx` if the domain copy says "actions" in the UI.
- Wrap the section in:
  - `rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)]`
- Move heading, progress count, and progress bar into a structured panel header.
- Use `Button` for add/save/cancel where practical.
- Use icon buttons for:
  - toggle done
  - edit
  - delete
  - cancel inline edit
- Replace raw `inputClass`, `textareaClass`, and `selectClass` usage with shadcn `Input`, `Textarea`, and available select patterns where practical.
- Keep inline edit behavior unchanged in the first pass.
- Ensure the add item row does not shift layout when saving.

Acceptance criteria:

- Action items read as one panel, not several unrelated cards.
- Progress remains visible.
- Checklist interactions remain fast.
- Inline edit remains possible for title, notes, evidence, status, and due date.
- Add item works by clicking add and by pressing Enter.
- Long notes and evidence do not break row layout.

Verification:

- Add an item.
- Toggle item done/todo.
- Edit an item.
- Delete an item.
- Check item with due date, notes, and evidence notes.
- `npm run build`.

## Phase 6 - Outcomes Panel Migration

Purpose: make outcomes visually distinct from action items while still matching the shared feature panel standard.

Current outcome traits:

- File: `objective-outcomes-section.tsx`
- Amber heading and amber-tinted row backgrounds.
- Each outcome row has:
  - title
  - description
  - type badge
  - status
  - optional amount/currency
  - status select
  - edit/delete controls
- Add-new outcome row has type select, title input, and add button.

Target traits:

- Outcomes remain distinct because they are results, not tasks.
- Amber can remain the semantic accent for expected/achieved outcomes, but should be restrained.
- Panel surface matches the same base as action items.
- Outcome status should be easier to scan.

Actions:

- Wrap outcomes in the same base panel surface as action items.
- Keep amber as an accent in icons, badges, and status affordances.
- Reduce full-row amber background if it competes with the panel surface.
- Convert outcome rows into compact result rows:
  - title and description left
  - type/status/amount metadata below or right depending width
  - status control right on desktop
  - actions right with icon buttons
- Use `Button`, `Input`, `Textarea`, and available select patterns where practical.
- Preserve all supported fields:
  - title
  - description
  - type
  - status
  - amount
  - currency
  - decidedAt behavior
- Confirm `changed` status support:
  - API type includes `"changed"`
  - current UI only maps/selects `expected`, `achieved`, `missed`
  - decide whether this is intentional or a gap before changing the UI.

Acceptance criteria:

- Outcomes are visually related to the objective but distinct from tasks.
- Status is easy to see and update.
- Money outcomes show amount/currency cleanly.
- Editing an outcome does not create visual jumps.
- The UI does not accidentally drop the `changed` status if the backend supports it.

Verification:

- Add an outcome.
- Edit an outcome.
- Update outcome status.
- Delete an outcome.
- Test a money outcome.
- Test an outcome with long description.
- `npm run build`.

## Phase 7 - Create/Edit Objective Form Migration

Purpose: align the create/edit objective form with the migrated panel system and remove raw-control inconsistency.

Current form traits:

- File: `objective-form-panel.tsx`
- Single rounded card:
  - `rounded-xl border border-emerald-200/10 bg-white/[0.035] p-6`
- Raw inputs, textareas, and selects use shared class strings from `objectives-ui.ts`.
- Manage contexts button is inline near the context select.
- Save/cancel buttons are raw buttons.

Target traits:

- Form uses the shared feature panel surface.
- Fields are grouped by decision:
  - identity: title, context
  - planning: source, status, priority, dates
  - narrative: description, success criteria, result notes
- Save/cancel actions use `Button`.
- Inputs use shadcn primitives where practical.
- Manage contexts remains available but visually secondary.

Actions:

- Keep `ObjectiveFormPanel` as a sibling component.
- Restyle the panel to match the shared surface.
- Replace raw button classes with `Button`.
- Replace raw input/textarea where practical with:
  - `Input`
  - `Textarea`
- Evaluate native selects:
  - If no shadcn select exists, keep native select with consistent migrated styling.
  - If a shadcn select exists, use it only if it does not add unnecessary complexity.
- Ensure all visible labels and placeholders use `next-intl`.
- Remove reliance on hardcoded fallback label maps from `objectives-ui.ts` if they are not needed.

Acceptance criteria:

- Create and edit forms visually match the migrated detail panels.
- Field grouping is clearer.
- Required title/context validation remains unchanged.
- Manage contexts flow still navigates to `/activity-contexts?source=objectives&returnTo=/objectives`.
- Form works for create and edit.

Verification:

- Create an objective.
- Edit an objective.
- Cancel create.
- Cancel edit.
- Manage contexts navigation.
- `npm run build`.

## Phase 8 - Destructive Actions And i18n Cleanup

Purpose: remove hardcoded UI strings and browser-native confirmations from Objectives.

Known issues:

- `objectives-view.tsx` uses:
  - `window.confirm("Delete this action item?")`
  - `window.confirm("Delete this outcome?")`
  - `window.confirm("Delete this objective?")`
- `objectives-ui.ts` contains English label maps.
- `formatDate()` uses fixed `en-GB`.

Actions:

- Replace browser `window.confirm` with a project-standard dialog.
- If a shared confirm dialog exists, use it.
- If no shared confirm dialog exists, add an Objectives-owned dialog first:
  - `objective-delete-dialog.tsx`
  - keep it feature-specific until a second feature needs the same API.
- Add translation keys under `src/i18n/messages.ts` for:
  - delete objective title/body/action
  - delete item title/body/action
  - delete outcome title/body/action
  - any missing labels/placeholders
- Remove or reduce English fallback maps in `objectives-ui.ts`.
- Use translated label functions from `ObjectivesView` or local `useTranslations(...)` in child components.
- Make date formatting locale-aware:
  - use `useLocale()` where formatting happens in React components
  - or pass a formatter function from the view
  - avoid fixed `en-GB`

Acceptance criteria:

- No hardcoded user-visible English strings remain in Objectives React components.
- Destructive actions use a styled confirmation flow.
- Dialog copy exists in both `en` and `es`.
- Date formatting respects the active locale.
- TypeScript remains strict.

Verification:

- Search:
  - `rg 'Delete this|Active|Paused|Achieved|Missed|Cancelled|To do|In progress|Promotion|Leadership' src/features/objectives`
- Delete objective, item, and outcome through the new dialog.
- Check English and Spanish UI if locale switching is available.
- `npm run build`.

## Phase 9 - Loading, Empty, And Error States

Purpose: make transient states match the migrated screen standard.

Current state files:

- `objectives-skeleton.tsx`
- error alert in `ObjectivesView`
- empty selection block in `ObjectivesView`
- sidebar empty behavior is implicit through group rendering

Actions:

- Update `ObjectivesDetailSkeleton` and `ObjectivesSidebarSkeleton` to match the new shell/sidebar/panel surfaces.
- Ensure loading state can be rendered inside `FeatureScreenShell` without layout jump.
- Add clear empty states for:
  - no objectives at all
  - no open objectives
  - no closed objectives
  - selected objective not found
- Keep empty state copy translated.
- Restyle error alert to match existing migrated feature alerts:
  - `rounded-lg`
  - `border border-rose-500/20`
  - `bg-rose-500/10`
  - `text-rose-300`

Acceptance criteria:

- Skeletons align with final layout dimensions.
- Empty states are specific enough to guide the user.
- Error state does not collapse layout.
- No loading state flashes a different page structure.

Verification:

- Hard refresh `/objectives`.
- Test an empty local user if practical.
- Test filters with no matching objectives.
- Force a failed mutation or inspect error path where practical.
- `npm run build`.

## Phase 10 - Final Visual Pass And Shared Component Discipline

Purpose: ensure the migration is cohesive and avoids unnecessary shared abstractions.

Actions:

- Compare `/objectives` with `/interview-questions` at desktop widths.
- Compare `/objectives` with `/feedback-notes` where local data exists.
- Review whether any repeated Objectives-only styling should remain local.
- Do not create new shared components for:
  - objective-specific progress calculations
  - objective list item metadata
  - outcome status semantics
  - activity context grouping
- Consider a new shared component only if it is clearly generic and already needed by at least two migrated screens:
  - segmented sidebar filter
  - confirm dialog
  - selectable list item wrapper
- Keep feature internals private behind `src/features/objectives/index.ts`.
- Do not deep-import from another feature.

Acceptance criteria:

- Objectives feels like part of the same product system as Interview Questions and Feedback Notes.
- Objectives still feels domain-specific, not like a renamed feedback screen.
- Shared components remain generic and feature-agnostic.
- No unnecessary abstractions were introduced.

Verification:

- `npm run build`.
- Manual browser check:
  - `/objectives`
  - `/objectives/[objectiveId]`
  - `/objectives?status=open`
  - `/objectives?status=closed`
  - `/objectives?status=all`
- Regression check:
  - `/interview-questions`
  - `/feedback-notes` if data exists

## Implementation Order Recommendation

Recommended order:

1. Baseline screenshots and route behavior notes.
2. Adopt `FeatureScreenShell` and `FeatureTwoPaneLayout`.
3. Adopt `FeatureSidebarPanel`.
4. Extract and restyle `ObjectiveListItem`.
5. Restyle objective summary/detail header.
6. Restyle action items panel.
7. Restyle outcomes panel.
8. Restyle create/edit form.
9. Replace destructive confirms and finish i18n cleanup.
10. Update skeletons, empty states, and final visual polish.

Avoid starting with the deepest item/outcome rows before the shell migration. The outer layout controls spacing, widths, and panel rhythm; changing rows first would likely need rework once the shared shell is in place.

## Testing And Verification Summary

Required after source changes under `src/features/`, `src/components/`, `src/app/`, or `src/frontend/`:

- `npm run build`

Recommended targeted checks:

- `npm run test -- src/app/api/commitments/responses.test.ts`
- `npm run test -- src/app/api/commitments/objectives-cache.test.ts`

Manual smoke test with seeded user:

- `npm run supabase:seed-agent`
- Log in as `agent-test@example.com`.
- Open `/objectives`.
- Create an objective.
- Edit an objective.
- Add, edit, complete, and delete an action item.
- Add, edit, update, and delete an outcome.
- Delete an objective.
- Switch open, closed, and all filters.
- Verify direct navigation to `/objectives/[objectiveId]`.
- Verify Spanish and English copy if locale switching is available.

## Non-Goals

- Do not migrate the Commitments backend module in this design migration unless a UI bug exposes a contract issue.
- Do not rename API routes from `/api/commitments` to `/api/objectives` in this pass.
- Do not change the Objectives domain model.
- Do not introduce AI-assisted Objectives workflows in this pass.
- Do not create production Supabase migrations.
- Do not push or commit automatically.
