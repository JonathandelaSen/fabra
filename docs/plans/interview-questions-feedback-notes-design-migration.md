# Interview Questions -> Feedback Notes Design Migration Plan

Date: 2026-05-27

## Goal

Migrate the Interview Questions screen toward the newer Feedback Notes visual standard in deliberate phases, while identifying reusable UI primitives that should move to `src/components/shared/`.

The target is not a literal copy of every Feedback Notes component. Interview Questions has a different domain model: questions, answers, CV links, offer links, generation/edit AI flows, and filters. The migration should reuse the Feedback Notes layout language, panel treatments, button system, spacing, colors, and interaction density while preserving Interview Questions workflows.

## Current Reference Screens

### Feedback Notes

Primary files:

- `src/features/feedback-notes/components/feedback-notes-view.tsx`
- `src/features/feedback-notes/components/feedback-notes-sidebar.tsx`
- `src/features/feedback-notes/components/feedback-note-list-item.tsx`
- `src/features/feedback-notes/components/feedback-notes-detail.tsx`
- `src/features/feedback-notes/components/feedback-entries-panel.tsx`
- `src/features/feedback-notes/components/feedback-final-panel.tsx`
- `src/features/feedback-notes/components/feedback-copy-paste-panel.tsx`
- `src/features/feedback-notes/components/feedback-notes-skeleton.tsx`

Important visual traits:

- Full feature-owned screen shell.
- Dark page background: `bg-[#09090f]`.
- Internal header with bottom border.
- Centered max-width containers: `max-w-[1560px]` at view level and `max-w-[1600px]` at detail level.
- Controlled page padding: `p-4 lg:p-5 xl:p-6`.
- Two-column app layout: `lg:grid-cols-[320px_minmax(0,1fr)]`.
- Sidebar is a real panel, not a loose collection of controls.
- Panel surface: `rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)]`.
- Detail content is composed from smaller sibling panels.
- Buttons use `Button` from `src/components/ui/button.tsx` more often than raw `<button>`.
- Dominant accent is indigo, with rose for destructive/cancel, emerald for success, amber for reopen/warning.
- Inline editing actions use icon buttons with `size="icon-xs"` or `size="icon-sm"` and accessible labels.

### Interview Questions

Primary files:

- `src/features/interview-questions/components/interview-questions-view.tsx`
- `src/features/interview-questions/components/interview-questions-sidebar.tsx`
- `src/features/interview-questions/components/interview-question-list-item.tsx`
- `src/features/interview-questions/components/interview-question-detail.tsx`
- `src/features/interview-questions/components/interview-question-copy-paste-panel.tsx`
- `src/features/interview-questions/components/interview-question-ai-panel.tsx`
- `src/features/interview-questions/components/interview-questions-skeleton.tsx`

Current visual traits:

- No feature-owned header.
- Wrapper uses `flex-1 overflow-hidden p-6 md:p-8`.
- Main grid uses full available width: `grid h-full w-full gap-6 xl:grid-cols-[380px_1fr]`.
- No max-width constraint, so the screen expands more than Feedback Notes.
- Sidebar filters live outside the list panel.
- Sidebar list panel is `rounded-xl border border-white/[0.06] bg-white/[0.02] p-2`.
- Detail is a single large scrollable card: `rounded-xl border border-white/[0.06] bg-white/[0.02]`.
- Many actions are raw `<button>` with hand-authored classes.
- Interview-specific accent is fuchsia/teal in several places.
- Textareas use raw Tailwind classes and fuchsia focus states.
- `InterviewQuestionAIPanel` appears unused after the move to `AIActionLauncher`; no imports reference it.

## High-Level Diagnosis

The visual gap comes from four layers:

1. Screen shell: Feedback Notes owns its page frame; Interview Questions relies on generic spacing.
2. Sidebar structure: Feedback Notes treats sidebar as one continuous panel; Interview Questions splits filters and list.
3. Component polish: Feedback Notes list items, detail header, and entry/final panels have richer selected, hover, and surface states.
4. System consistency: Feedback Notes uses shadcn/base UI `Button` patterns more consistently; Interview Questions still uses raw buttons and fuchsia-specific styling.

Because these layers build on each other, the migration should start with layout and panel primitives before detail-level refactors.

## Proposed Migration Phases

## Phase 0 - Baseline Capture And Safety Checks

Purpose: capture the current state before changing UI so we can compare layout, regressions, and route behavior.

Actions:

- Open `/feedback-notes/825ad76c-23e0-413e-ae71-2ba41c2c503b?status=active`.
- Open `/interview-questions`.
- If available, seed the agent test user with `npm run supabase:seed-agent` before manual testing.
- Confirm the local app is logged in as `agent-test@example.com` if data is needed.
- Capture screenshots for desktop width around 1280px.
- Capture screenshots for a wide desktop width around 1600px or 1728px.
- Capture screenshots for tablet/mobile widths if the shell is expected to be responsive in this iteration.
- Record visible differences:
  - page width
  - sidebar width
  - sidebar surface
  - detail surface
  - selected list item state
  - button colors
  - focus states
  - empty/loading states
  - copy-paste modal appearance

Acceptance criteria:

- We have a visual baseline before the first UI migration.
- We know whether Interview Questions data exists locally.
- No code changes are made in this phase except optional documentation updates.

Verification:

- Browser smoke test of both routes.
- No build required if no source files changed.

## Phase 1 - Feature Shell Parity

Purpose: make Interview Questions occupy the page like Feedback Notes: centered, bounded, and visually contained.

Current Feedback Notes pattern:

- `feedback-notes-view.tsx`
- Root: `flex h-full min-h-0 flex-col overflow-hidden bg-[#09090f] text-zinc-100`
- Header: `shrink-0 border-b border-white/[0.06] px-5 py-4`
- Header inner: `mx-auto flex w-full max-w-[1560px] ...`
- Body: `min-h-0 flex-1 overflow-hidden bg-[#09090f] p-4 lg:p-5 xl:p-6`
- Body grid: `mx-auto grid h-full w-full max-w-[1560px] grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]`

Current Interview Questions pattern:

- `interview-questions-view.tsx`
- Root: `flex-1 overflow-hidden p-6 md:p-8`
- Motion grid: `grid h-full w-full gap-6 xl:grid-cols-[380px_1fr]`

Actions:

- Change the root wrapper in `InterviewQuestionsView` to a feature shell matching Feedback Notes.
- Add a header area with the Interview Questions title from `useTranslations("interviewQuestions")`.
- Use the same `bg-[#09090f]` and `text-zinc-100`.
- Use the same `max-w-[1560px]` page container.
- Replace `p-6 md:p-8` with `p-4 lg:p-5 xl:p-6`.
- Change grid breakpoint from `xl:grid-cols-[380px_1fr]` to a Feedback-like layout:
  - Start candidate: `lg:grid-cols-[320px_minmax(0,1fr)]`.
  - If filters become cramped, evaluate `lg:grid-cols-[340px_minmax(0,1fr)]`.
  - Avoid returning to `380px` unless content proves it needs it.
- Keep the existing `motion.div` initially, but align its class names with the Feedback Notes grid.
- Ensure detail region does not introduce a second max-width that fights the page shell.

Implementation notes:

- This phase should not change data hooks, route state, mutations, or AI behavior.
- This phase should be easy to review visually.
- Keep route behavior unchanged:
  - `/interview-questions`
  - `/interview-questions/[questionId]`
  - filter query params

Acceptance criteria:

- Interview Questions no longer expands across the whole app content width on wide screens.
- The page background, header, and outer spacing match Feedback Notes.
- The sidebar/detail grid starts at the same horizontal positions as Feedback Notes at equivalent viewport widths.
- Loading state still appears correctly before data loads.

Verification:

- `npm run build` because files under `src/features/` changed.
- Browser check `/interview-questions`.
- Browser check `/feedback-notes/...` to ensure no accidental shared regression if new shared components are introduced.

## Phase 2 - Sidebar Container Migration

Purpose: make the Interview Questions sidebar follow the Feedback Notes side panel model.

Current Feedback Notes sidebar:

- File: `feedback-notes-sidebar.tsx`
- Element: `<aside>`
- Class:
  - `flex min-h-0 w-full shrink-0 flex-col`
  - `rounded-lg border border-white/[0.06]`
  - `bg-[#101018]`
  - `shadow-[0_4px_20px_rgba(0,0,0,0.15)]`
- Header/filter area has a bottom border.
- Scrollable list is inside the same panel.

Current Interview Questions sidebar:

- File: `interview-questions-sidebar.tsx`
- Element: `<section>`
- Filters are in `div.mb-4.space-y-2`.
- List is a separate rounded card:
  - `rounded-xl border border-white/[0.06] bg-white/[0.02] p-2`

Actions:

- Change the root element from `section` to `aside`.
- Apply Feedback Notes side panel surface classes.
- Move filters inside a top region with:
  - `border-b border-white/[0.06] px-4 py-3`
- Move the list into:
  - `min-h-0 flex-1 overflow-y-auto px-2 py-3`
- Remove the nested list card surface to avoid card-inside-card feel.
- Keep all three filters initially:
  - CV selector
  - analysis/offer selector
  - answered selector
- Restyle filters to match Feedback Notes input/select language:
  - `h-9`
  - `rounded-lg`
  - `border border-input` or `border-white/[0.06]` consistently
  - `bg-white/[0.03]`
  - `text-zinc-100` or `text-zinc-300`
  - `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`
- Consider adding `ChevronDown` icons later, but avoid overloading this phase.
- Preserve keyboard and screen-reader behavior for native selects.

Acceptance criteria:

- Sidebar visually reads as one panel like Feedback Notes.
- Filters are visually part of the sidebar, not floating above the list.
- List scrolls within the sidebar panel.
- Empty state remains centered and readable.
- No functional changes to filters.

Verification:

- Filter by CV.
- Filter by offer.
- Filter by answered/pending/all.
- Select an item.
- Confirm selected item is still highlighted.
- `npm run build`.

## Phase 3 - Shared Feature Layout Components

Purpose: extract the reusable shell and sidebar surfaces only after both Feedback Notes and Interview Questions prove they need the same structure.

Candidate component 1: `FeatureScreenShell`

Possible location:

- `src/components/shared/feature-screen-shell.tsx`

Potential API:

```tsx
interface FeatureScreenShellProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidthClassName?: string;
}
```

Responsibilities:

- Own the root shell:
  - `flex h-full min-h-0 flex-col overflow-hidden bg-[#09090f] text-zinc-100`
- Render the feature header:
  - `shrink-0 border-b border-white/[0.06] px-5 py-4`
- Render a centered header inner:
  - `mx-auto flex w-full max-w-[1560px] flex-wrap items-center justify-between gap-3`
- Render the body area:
  - `min-h-0 flex-1 overflow-hidden bg-[#09090f] p-4 lg:p-5 xl:p-6`
- Allow a custom `maxWidthClassName` only if a feature has a real layout reason.

Should use it:

- `FeedbackNotesView`
- `InterviewQuestionsView`

Should not use it yet:

- Large legacy screens until they are deliberately migrated.
- Screens with radically different information architecture.

Candidate component 2: `FeatureTwoPaneLayout`

Possible location:

- `src/components/shared/feature-two-pane-layout.tsx`

Potential API:

```tsx
interface FeatureTwoPaneLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarClassName?: string;
  className?: string;
  columnsClassName?: string;
}
```

Responsibilities:

- Center the grid:
  - `mx-auto grid h-full w-full max-w-[1560px] grid-cols-1 gap-4`
- Provide default columns:
  - `lg:grid-cols-[320px_minmax(0,1fr)]`
- Keep `min-h-0` and `overflow-hidden` correct.

Should use it:

- `FeedbackNotesView`
- `InterviewQuestionsView`

Candidate component 3: `FeatureSidebarPanel`

Possible location:

- `src/components/shared/feature-sidebar-panel.tsx`

Potential API:

```tsx
interface FeatureSidebarPanelProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}
```

Responsibilities:

- Render the shared aside surface:
  - `flex min-h-0 w-full shrink-0 flex-col rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)]`
- Render optional header with:
  - `border-b border-white/[0.06] px-4 py-3`
- Render scroll body with:
  - `min-h-0 flex-1 overflow-y-auto px-2 py-3`

Should use it:

- `FeedbackNotesSidebar`
- `InterviewQuestionsSidebar`

Do not include:

- Feedback creation form logic.
- Interview filters.
- List item rendering.
- Route state.

Acceptance criteria:

- Shared components reduce duplicated surface/layout classes.
- Shared components do not import from `src/features/**`.
- Shared components do not contain feature translations.
- Shared components do not know about feedback notes or interview questions.
- Existing i18n rules remain satisfied.

Verification:

- `npm run build`.
- Browser check both screens.

## Phase 4 - Sidebar Filter And Segmented Control Standardization

Purpose: decide which sidebar controls can become shared and which should remain feature-specific.

Feedback Notes has a three-option segmented status control:

- active
- closed
- all

Interview Questions has:

- CV select
- offer select
- answered status select

Candidate shared component: `SegmentedFilter`

Possible location:

- `src/components/shared/segmented-filter.tsx`

Potential API:

```tsx
interface SegmentedFilterOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SegmentedFilterProps<T extends string> {
  value: T;
  options: SegmentedFilterOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}
```

Responsibilities:

- Render the Feedback Notes segmented visual treatment:
  - wrapper: `flex rounded-lg border border-white/[0.06] bg-white/[0.035] p-1`
  - active: `bg-white/[0.10] text-zinc-100`
  - inactive: `text-zinc-500 hover:text-zinc-300`
- Use buttons with proper `type="button"`.
- Support disabled options.

Should use it:

- Feedback Notes status filter.
- Interview Questions answered filter if we choose to convert it from a select to a segmented control.

Decision point:

- Keep CV and offer as selects because their option lists can be long.
- Convert answered filter to segmented buttons only if labels fit comfortably:
  - all
  - answered
  - pending
- On small sidebar widths, confirm labels do not overflow.

Candidate shared component: `SidebarSelectField`

Possible location:

- `src/components/shared/sidebar-select-field.tsx`

Potential API:

```tsx
interface SidebarSelectFieldOption {
  value: string;
  label: string;
}

interface SidebarSelectFieldProps {
  id: string;
  label?: string;
  value: string;
  options: SidebarSelectFieldOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
```

Responsibilities:

- Provide consistent select styling for feature sidebars.
- Keep native select semantics.
- Optionally render a visible label.

Risk:

- Native select styling varies by browser.
- The existing project already uses direct selects in several places.
- Extract only if Interview and Feedback both need it, or if Interview has repeated selects that benefit from consistency.

Recommendation:

- Extract `SegmentedFilter` before `SidebarSelectField`.
- Restyle Interview selects locally first.
- Reassess `SidebarSelectField` after seeing whether more screens adopt the same sidebar pattern.

Acceptance criteria:

- Feedback Notes filter remains visually unchanged after extraction.
- Interview answered filter either remains a restyled select or becomes a segmented control with no overflow.
- CV/offer filtering remains accessible and native.

Verification:

- Test all filter changes.
- Keyboard tab through filters.
- `npm run build`.

## Phase 5 - List Item Visual Standardization

Purpose: make Interview Question list items feel like Feedback Note list items without losing question-specific metadata.

Feedback Notes list item traits:

- Root button:
  - `group relative mb-2 w-full rounded-xl p-3.5 text-left border transition-all duration-200`
- Selected:
  - `bg-[#181825] border-indigo-500/20 text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]`
- Unselected:
  - `bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200`
- Chevron affordance.
- Main title truncates.
- Metadata row is separated and compact.

Interview Question list item current traits:

- Root button:
  - `mb-1 block w-full rounded-lg border p-3 text-left transition-colors`
- Selected:
  - `border-fuchsia-500/30 bg-fuchsia-500/10`
- Unselected:
  - `border-transparent hover:bg-white/[0.04]`
- No chevron.
- Metadata badges are stacked immediately below title.

Actions:

- Update `InterviewQuestionListItem` root to match Feedback Notes button structure.
- Replace fuchsia selected state with indigo selected state.
- Add `ChevronRight` icon to the top row.
- Keep question title as primary line, probably `line-clamp-2`.
- Convert metadata row to Feedback Notes spacing:
  - `mt-3 flex items-center justify-between gap-2` where possible.
  - If badges wrap, use `flex flex-wrap items-center gap-1.5 min-w-0`.
- Keep semantic badges:
  - answered -> emerald
  - pending -> amber
  - CV -> sky or zinc/indigo depending desired hierarchy
  - offer -> emerald or indigo
- Consider reducing badge color variety:
  - answered/pending are status and should keep color.
  - CV and offer are metadata and may become neutral/indigo to avoid a confetti effect.
- Add `aria-current` or equivalent if a selected navigation item pattern already exists elsewhere. If not, keep simple button behavior.

Candidate shared component: `SelectableListItem`

Possible location:

- `src/components/shared/selectable-list-item.tsx`

Potential API:

```tsx
interface SelectableListItemProps {
  selected: boolean;
  onClick: () => void;
  title: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}
```

Pros:

- Captures repeated selected/hover/surface treatment.
- Can be used by Feedback Notes and Interview Questions.
- Keeps feature-specific metadata outside shared.

Cons:

- Risk of over-abstracting list item composition too early.
- Feedback Notes and Interview Questions have different title and metadata layouts.

Recommendation:

- First align Interview `InterviewQuestionListItem` locally to the Feedback pattern.
- Extract `SelectableListItem` only after both components share enough markup to avoid prop soup.
- If extracted, make it a thin presentational wrapper and keep badges/title content feature-owned.

Acceptance criteria:

- Interview list item selected/hover states visually match Feedback Notes.
- Question metadata remains readable.
- No text overflow at sidebar width 320px.
- Items remain clickable by mouse and keyboard.

Verification:

- Select different questions.
- Check answered and pending items.
- Check questions with/without CV and offer.
- Check long question text.
- `npm run build`.

## Phase 6 - Detail Header And Primary Surface Migration

Purpose: restructure Interview detail so it feels like Feedback Notes detail: a header panel plus focused content panels.

Current Feedback Notes detail:

- Wrapper: `flex w-full max-w-[1600px] flex-col gap-5`
- Header panel:
  - `rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5`
- Header contains:
  - title/edit title
  - metadata
  - edit/view mode button
  - close/reopen button
  - delete button
- Content below is a grid of panels.

Current Interview detail:

- Wrapper: `space-y-4 p-4`
- Detail card is provided by parent section in `InterviewQuestionsView`.
- Header:
  - small eyebrow "detail"
  - question as `h2`
  - raw delete icon button
- Editable content is immediately below as textareas.
- Metadata cards for CV and offer are below textareas.

Actions:

- Move the detail surface responsibility into `InterviewQuestionDetail`, matching Feedback Notes.
- In `InterviewQuestionsView`, replace the detail wrapper section with a simpler scroll container:
  - `main className="min-w-0 overflow-y-auto"`
  - Error alert remains above detail.
  - Empty state remains centered.
- In `InterviewQuestionDetail`, create:
  - root: `flex w-full max-w-[1600px] flex-col gap-5`
  - header panel: Feedback Notes panel surface classes.
- Header content proposal:
  - Left:
    - eyebrow or small metadata label can be removed if redundant.
    - `h2` with question text, `text-2xl` or `text-3xl` depending fit.
    - metadata row: answered/pending, CV, offer.
  - Right:
    - save if dirty or explicit save remains.
    - delete button using `Button variant="destructive"`.
    - optional "open linked offer" using `Button variant="secondary"` when `analysisId` exists.
- Decide editing model:
  - Current Interview detail saves on blur and has manual save.
  - Feedback Notes has an explicit edit mode.
  - Do not introduce edit mode in this phase unless desired; it changes UX more deeply.
- Keep current blur-save behavior initially.
- Move textareas into one or more panels below header.

Possible content panel structure:

- Question/context panel:
  - two textareas in grid.
  - surface: `rounded-lg border border-white/[0.06] bg-[#101018] shadow... p-4`
- Answer panel:
  - textarea with larger min height.
  - AI launcher below or in header row.
  - surface similar to Feedback Final Panel if answer is the "final output".
- Metadata panel:
  - CV and offer cards may move into header metadata and disappear as separate cards.

Candidate shared component: `FeaturePanel`

Possible location:

- `src/components/shared/feature-panel.tsx`

Potential API:

```tsx
interface FeaturePanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent";
}
```

Default classes:

- `rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)]`

Accent variant could support Feedback Final Panel's indigo gradient later.

Recommendation:

- Extract `FeaturePanel` only if it immediately replaces:
  - Feedback detail header panel.
  - Feedback entry cards/create card.
  - Interview detail header panel.
  - Interview question/context/answer panels.
- If extraction makes class composition clearer, do it in the same phase as detail migration.
- Avoid a too-powerful `variant` system at first.

Acceptance criteria:

- Interview detail no longer sits inside a large pale `bg-white/[0.02]` card.
- Header and panels visually match Feedback Notes surfaces.
- Delete/save/open linked offer use shared `Button`.
- Existing update/delete/generate/copy-paste behavior remains unchanged.
- No accidental double scrollbars.

Verification:

- Edit question and blur.
- Edit context and blur.
- Edit answer and blur.
- Use manual save.
- Delete flow still confirms.
- Open linked offer still works.
- `npm run build`.

## Phase 7 - Textarea And Field Styling Standardization

Purpose: align text inputs with Feedback Notes and reduce hand-authored raw classes.

Current Feedback Notes textareas:

- Uses `Textarea` from `src/components/ui/textarea`.
- Has local `textareaClass` constants.
- Focus uses indigo or ring-based styles.

Current Interview textareas:

- Raw `<textarea>`.
- Raw classes with `focus:border-fuchsia-500/40`.
- No labels around each textarea in current detail.

Actions:

- Replace raw Interview `<textarea>` with `Textarea` where possible.
- Add visually accessible labels or visible section labels:
  - question
  - context
  - answer
- Replace fuchsia focus states with indigo/ring-compatible states.
- Create local `textareaClass` in `interview-question-detail.tsx` initially.
- Consider shared field class only after repeated patterns emerge.
- Preserve uncontrolled `defaultValue` + refs if blur-save behavior depends on it.
- If moving to controlled state, do it in a separate UX phase because it changes draft behavior.

Candidate shared component: `FeatureTextarea`

Recommendation:

- Do not extract yet.
- The existing `Textarea` UI primitive is already shared.
- A feature-specific textarea wrapper may become too opinionated too quickly.

Acceptance criteria:

- Field styling matches Feedback Notes.
- Focus state is visible.
- Blur-save behavior remains intact.
- Text does not overflow containers.

Verification:

- Keyboard through textareas.
- Edit and blur each field.
- Manual save still works.
- `npm run build`.

## Phase 8 - Button System Migration

Purpose: replace raw Interview buttons with the project button primitive and align color language.

Current shared button primitive:

- `src/components/ui/button.tsx`
- Variants:
  - default
  - outline
  - secondary
  - ghost
  - destructive
  - link
- Sizes:
  - default
  - xs
  - sm
  - lg
  - icon
  - icon-xs
  - icon-sm
  - icon-lg

Raw buttons to migrate:

- `interview-question-detail.tsx`
  - delete icon button
  - manual save button
  - open linked offer button
- `interview-questions-sidebar.tsx`
  - none currently except native selects, but future segmented filter buttons may use raw buttons or shared component.
- `interview-question-copy-paste-panel.tsx`
  - close icon button
  - mode buttons
  - prepare prompt button
- `interview-question-ai-panel.tsx`
  - all buttons, if the file remains.
- `interview-question-list-item.tsx`
  - root item remains a button because it is a selectable row; may later use `SelectableListItem`.

Actions:

- Use `Button` for command actions.
- Use `Button variant="ghost" size="icon-sm"` for close/cancel/delete icon-only where appropriate.
- Use `Button variant="destructive"` for destructive delete.
- Use `Button variant="secondary"` for save/open linked offer.
- Use `aria-label` for icon-only buttons.
- Replace fuchsia AI buttons with either:
  - existing `AIActionLauncher`, preferred; or
  - indigo secondary styling if custom controls remain.
- Keep list item root as `<button>` or extracted row component, because `Button` is not ideal for complex full-row selectable content.

Candidate shared components:

1. `IconCancelButton`
2. `IconCloseButton`
3. `IconDeleteButton`

Recommendation:

- Extract only a generic `IconButton` wrapper if repeated enough, but the existing `Button` already covers this well.
- Better candidate: `InlineCancelButton` for the specific edit-cancel pattern from Feedback Notes.

Potential `InlineCancelButton` API:

```tsx
interface InlineCancelButtonProps {
  onClick: () => void;
  label: string;
  size?: "icon-xs" | "icon-sm";
  className?: string;
}
```

Default:

- `variant="ghost"`
- `size="icon-sm"`
- icon `X`
- text hidden because this is only for inline edit controls

Use cases:

- Feedback entry edit cancel.
- CV Library inline name edit cancel.
- Work Journal inline edit cancel after later migration.
- Interview inline edit cancel if an explicit edit mode is introduced.

Do not use it:

- Modal cancel buttons with text.
- Destructive cancel/abort flows where text is safer.
- Sidebar "cancel creation" toggle that is actually a mode toggle.

Acceptance criteria:

- No raw command buttons remain in the migrated Interview detail except selectable rows and native controls.
- Icon-only buttons have accessible labels.
- Button colors follow Feedback Notes palette.

Verification:

- Keyboard focus on every button.
- Disabled states visible for save/generate.
- `npm run build`.

## Phase 9 - Copy Paste Modal Consolidation

Purpose: remove duplicated modal shell markup between Feedback Notes and Interview Questions copy-paste flows.

Duplicated shell exists in:

- `feedback-copy-paste-panel.tsx`
- `interview-question-copy-paste-panel.tsx`
- `work-journal-copy-paste-panel.tsx` also appears to use a similar shell.

Shared existing components:

- `src/components/shared/copy-paste-text-panel.tsx`
- `src/components/shared/copy-paste-workflow-modal.tsx`
- `src/components/shared/copy-paste-workflow-steps.tsx`
- `src/components/shared/copy-paste-prompt-step.tsx`

Current duplicated shell:

- Overlay:
  - `fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4`
- Dialog:
  - `flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl`
- Header:
  - title
  - close icon button
- Scroll body:
  - `min-h-0 flex-1 overflow-y-auto p-5`

Candidate shared component: `CopyPasteDialog`

Possible location:

- `src/components/shared/copy-paste-dialog.tsx`

Potential API:

```tsx
interface CopyPasteDialogProps {
  title: string;
  closeLabel: string;
  labelledById: string;
  onClose: () => void;
  children: React.ReactNode;
}
```

Responsibilities:

- Render the modal shell.
- Render the accessible dialog attributes.
- Render title and close button with `Button variant="ghost" size="icon-sm"`.
- Render scrollable body.

Should use it:

- Feedback Notes copy-paste panel.
- Interview Questions copy-paste panel.
- Work Journal copy-paste panel, if equivalent.

Actions:

- Inspect `work-journal-copy-paste-panel.tsx` before extraction.
- Create `CopyPasteDialog`.
- Replace Feedback Notes modal shell.
- Replace Interview Questions modal shell.
- Replace Work Journal modal shell if the markup matches and does not widen scope too much.
- Keep workflow-specific state and content inside feature components.

Acceptance criteria:

- Copy-paste dialogs remain visually identical after extraction.
- Dialog roles and labels remain correct.
- Close button is accessible.
- Prompt copy/apply flow still works.

Verification:

- Open Feedback Notes copy-paste.
- Open Interview Questions copy-paste.
- Prepare Interview prompt.
- Paste/apply response.
- `npm run build`.

## Phase 10 - AI Flow Visual Alignment

Purpose: ensure Interview Questions AI controls match Feedback Notes and assisted workflow conventions.

Current Feedback Notes:

- Uses `AIActionLauncher`.
- Supports integrated and copy-paste modes.
- Model selection lives inside launcher.
- Copy-paste available.

Current Interview Questions:

- `InterviewQuestionDetail` already uses `AIActionLauncher`.
- `InterviewQuestionAIPanel` appears unused.
- Copy-paste panel has generate/edit modes.
- Edit instruction flow exists in copy-paste panel but not through `AIActionLauncher` UI beyond current `onRunAI("generate", "")`.

Actions:

- Confirm `InterviewQuestionAIPanel` is genuinely unused.
- Delete `interview-question-ai-panel.tsx` if no route/import/test references it.
- Ensure Interview `AIActionLauncher` styling is acceptable once surrounding detail panel is migrated.
- Decide whether AI edit instruction remains only in copy-paste panel or needs a visible integrated edit control.
- If integrated edit is still product-required, design it as a panel using Feedback Notes surface styles.
- Avoid real AI API usage during testing; use mock provider or do not trigger actual provider calls.

Acceptance criteria:

- No dead AI component remains.
- Interview AI actions use shared `AIActionLauncher`.
- Copy-paste remains available as an assisted workflow.
- No real AI API calls are used in automated/manual agent testing.

Verification:

- With mock provider, verify UI path can be triggered without real provider cost if needed.
- Open copy-paste workflow.
- `npm run build`.

## Phase 11 - Skeleton And Empty State Alignment

Purpose: make loading and empty states match the migrated shell.

Current Feedback Notes skeleton:

- Has separate list and detail skeletons.
- Uses shared `Skeleton`.
- Matches actual panel layout.

Current Interview Questions skeleton:

- One broad skeleton:
  - `flex h-full min-h-0 gap-6 p-6 md:p-8`
  - sidebar block `w-[380px]`
  - detail block

Actions:

- Replace `InterviewQuestionsSkeleton` with Feedback Notes-like shell skeleton.
- Consider splitting:
  - `InterviewQuestionsListSkeleton`
  - `InterviewQuestionsDetailSkeleton`
- Use `Skeleton` from `src/components/ui/skeleton`.
- Match new sidebar width, page max-width, header, and body padding.
- Update empty state to sit inside the migrated sidebar panel/body area.

Candidate shared component: no immediate extraction.

Recommendation:

- Keep feature-specific skeletons. Skeletons often mirror feature-specific layout closely.
- Use shared `Skeleton` primitive only.

Acceptance criteria:

- Loading state does not jump dramatically when data loads.
- Skeleton respects centered max-width layout.
- Sidebar skeleton width matches final sidebar width.

Verification:

- Simulate loading state if possible by throttling or temporarily observing first load.
- `npm run build`.

## Phase 12 - Color Palette Cleanup

Purpose: remove the old Interview fuchsia/teal visual identity where it conflicts with Feedback Notes.

Current Interview fuchsia usage:

- Selected list item.
- Textarea focus.
- AI panel sparkle and generate button, but AI panel appears unused.
- Copy-paste generate mode.

Current Interview teal usage:

- AI edit button in unused panel.
- Copy-paste edit mode.

Target palette:

- Background:
  - `#09090f`
  - `#101018`
  - `#181825` for selected rows
- Borders:
  - `white/[0.06]`
  - `indigo-500/20` for selected/accent
- Primary accent:
  - indigo
- Destructive/cancel:
  - rose
- Success/answered:
  - emerald
- Warning/pending:
  - amber
- Metadata:
  - zinc or subdued indigo

Actions:

- Replace fuchsia selected states with indigo.
- Replace fuchsia focus states with indigo/ring styles.
- Replace fuchsia mode button in copy-paste with indigo.
- Decide whether edit mode should remain teal or become emerald/indigo:
  - If edit is a positive action, emerald can work.
  - If edit is an AI tool action, indigo may be more consistent.
- Avoid turning every badge into a different color.
- Keep answered/pending semantic colors.

Acceptance criteria:

- Interview Questions no longer reads as a separate fuchsia-themed product area.
- Status colors remain meaningful.
- Buttons and selected states visually match Feedback Notes.

Verification:

- Review desktop and wide screenshots.
- Check color contrast visually.
- `npm run build`.

## Phase 13 - Route And State Regression Pass

Purpose: ensure design changes do not disrupt the migrated frontend architecture or route-driven behavior.

Relevant route state files:

- `src/features/interview-questions/hooks/use-interview-questions-route-state.ts`
- `src/features/feedback-notes/hooks/use-feedback-notes-route-state.ts`

Actions:

- Confirm `/interview-questions` selects first question if available.
- Confirm `/interview-questions/[questionId]` opens the correct detail.
- Confirm filter changes preserve/clear selection according to existing behavior.
- Confirm AppShell's last route refs still work:
  - `lastInterviewQuestionsHrefRef`
  - `lastFeedbackNotesHrefRef`
- Ensure no new frontend imports from `src/modules/**`.
- Ensure no frontend imports from `route.ts`.
- Ensure any new shared components do not depend on feature internals.

Acceptance criteria:

- Route behavior unchanged.
- No frontend boundary violations introduced.
- No route files need changes.

Verification:

- `npm run build`.
- Run any existing frontend boundary or DDD checks if relevant:
  - `npm run ddd:check` is required only if changes touch `src/modules/`.
  - For this UI-only migration, build is required by repo instructions.

## Shared Component Inventory

## Recommended To Extract Early

### `FeatureScreenShell`

Why:

- Feedback Notes and Interview Questions should share the same page shell.
- Prevents future drift in max-width, header, background, and body padding.

Use in:

- `FeedbackNotesView`
- `InterviewQuestionsView`

Risk:

- Low, if API is intentionally small.

### `FeatureTwoPaneLayout`

Why:

- Both screens have sidebar/detail layout.
- The max-width and grid columns are central to the design migration.

Use in:

- `FeedbackNotesView`
- `InterviewQuestionsView`

Risk:

- Low to medium. The sidebar width may need per-screen override.

### `FeatureSidebarPanel`

Why:

- Feedback Notes sidebar panel should become the standard.
- Interview Questions needs the same panel treatment.

Use in:

- `FeedbackNotesSidebar`
- `InterviewQuestionsSidebar`

Risk:

- Low if it only owns surface/header/body.

### `CopyPasteDialog`

Why:

- Feedback Notes and Interview Questions duplicate modal shell markup.
- Work Journal likely duplicates it too.

Use in:

- `FeedbackCopyPastePanel`
- `InterviewQuestionCopyPastePanel`
- Possibly `WorkJournalCopyPastePanel`

Risk:

- Low if it only owns modal chrome.

## Recommended To Extract Later

### `SegmentedFilter`

Why:

- Feedback Notes already has segmented status filtering.
- Interview Questions answered filter could use the same interaction.

Use in:

- Feedback Notes status filter.
- Possibly Interview Questions answered filter.

Risk:

- Medium. Needs responsive label checks.

### `FeaturePanel`

Why:

- Panel surface repeats across detail header, entry cards, final panels, and likely Interview detail panels.

Use in:

- Feedback detail header.
- Feedback entry cards.
- Interview detail header.
- Interview content panels.

Risk:

- Medium. Too many variants could make it vague.

Recommendation:

- Extract only after Phase 6 proves the detail panels are truly aligned.

### `SelectableListItem`

Why:

- Feedback and Interview list rows can share selected/hover/surface behavior.

Use in:

- Feedback note list item.
- Interview question list item.

Risk:

- Medium to high. List item content differs enough that abstraction could become prop-heavy.

Recommendation:

- Align locally first. Extract only if the markup naturally converges.

### `InlineCancelButton`

Why:

- The new Feedback Notes inline cancel pattern is better than older text/manual buttons.

Use in:

- Feedback entry edit cancel.
- CV Library inline edit cancel.
- Work Journal inline edit cancel.
- Interview inline edit cancel if explicit edit mode is added.

Risk:

- Low, but it should not be overused for modal cancel actions.

Recommendation:

- Extract when the cancel migration starts, not necessarily during the first Interview layout phases.

## Not Recommended For Shared Yet

### `FeatureTextarea`

Reason:

- `src/components/ui/textarea.tsx` already exists.
- Feature-level textarea needs vary by autosave, ref usage, rows, and panel context.

### `SidebarSelectField`

Reason:

- Could be useful, but only Interview currently has repeated sidebar selects in this pair.
- Extract after a second feature genuinely needs the same select wrapper.

### AI Edit Panel

Reason:

- `InterviewQuestionAIPanel` appears unused.
- Feedback Notes already uses `AIActionLauncher`.
- Better to delete dead code and standardize on `AIActionLauncher`.

## Proposed Execution Order

## Slice 1 - Layout Foundation

Files:

- `src/features/interview-questions/components/interview-questions-view.tsx`
- `src/features/interview-questions/components/interview-questions-skeleton.tsx`

Actions:

- Apply Feedback Notes shell classes locally.
- Add header.
- Add centered max-width body.
- Match two-pane grid width.
- Update skeleton to match shell.

Verification:

- `npm run build`.
- Browser check `/interview-questions`.

## Slice 2 - Sidebar Foundation

Files:

- `src/features/interview-questions/components/interview-questions-sidebar.tsx`
- `src/features/interview-questions/components/interview-question-list-item.tsx`

Actions:

- Convert sidebar into a single panel.
- Restyle filters.
- Move list into scroll body.
- Align list item selected/hover states.

Verification:

- Filter interactions.
- Selection interactions.
- `npm run build`.

## Slice 3 - Extract Shared Shell Primitives

Files to add:

- `src/components/shared/feature-screen-shell.tsx`
- `src/components/shared/feature-two-pane-layout.tsx`
- `src/components/shared/feature-sidebar-panel.tsx`

Files to update:

- `src/features/feedback-notes/components/feedback-notes-view.tsx`
- `src/features/interview-questions/components/interview-questions-view.tsx`
- `src/features/feedback-notes/components/feedback-notes-sidebar.tsx`
- `src/features/interview-questions/components/interview-questions-sidebar.tsx`

Actions:

- Extract only after local migration validates the shape.
- Keep shared APIs minimal.
- Ensure no feature imports from shared components back into features.

Verification:

- `npm run build`.
- Browser check both screens.

## Slice 4 - Detail Surface Migration

Files:

- `src/features/interview-questions/components/interview-questions-view.tsx`
- `src/features/interview-questions/components/interview-question-detail.tsx`

Actions:

- Remove parent card surface.
- Move detail panel composition into detail component.
- Add Feedback-like header panel.
- Move fields into panels.
- Convert command buttons to `Button`.

Verification:

- Edit fields.
- Save.
- Delete.
- Open linked offer.
- `npm run build`.

## Slice 5 - Copy Paste Dialog Extraction

Files to add:

- `src/components/shared/copy-paste-dialog.tsx`

Files to update:

- `src/features/feedback-notes/components/feedback-copy-paste-panel.tsx`
- `src/features/interview-questions/components/interview-question-copy-paste-panel.tsx`
- Optional: `src/features/work-journal/components/work-journal-copy-paste-panel.tsx`

Actions:

- Extract duplicated modal chrome.
- Keep workflow state feature-local.

Verification:

- Open/apply Feedback Notes copy-paste.
- Open/prepare/apply Interview Questions copy-paste.
- `npm run build`.

## Slice 6 - Cleanup And Color Pass

Files:

- `src/features/interview-questions/components/interview-question-ai-panel.tsx`
- `src/features/interview-questions/components/interview-question-copy-paste-panel.tsx`
- `src/features/interview-questions/components/interview-question-detail.tsx`
- `src/features/interview-questions/components/interview-question-list-item.tsx`

Actions:

- Delete unused AI panel after confirming no references.
- Remove fuchsia/teal styling where it conflicts with the Feedback Notes palette.
- Keep semantic status colors.
- Ensure buttons use `Button`.

Verification:

- `rg -n "fuchsia|teal" src/features/interview-questions`
- `npm run build`.

## Detailed Acceptance Criteria For The Full Migration

Layout:

- Interview Questions uses a feature-owned dark shell.
- Interview Questions has a header comparable to Feedback Notes.
- Main content is centered with the same maximum width as Feedback Notes.
- Sidebar/detail grid width matches Feedback Notes unless intentionally overridden.
- No unnecessary nested cards.
- No horizontal overflow at common viewport widths.

Sidebar:

- Sidebar is one continuous panel.
- Filters are inside the panel.
- List scrolls inside the panel.
- Empty state fits the panel.
- Selected state uses indigo selected language, not fuchsia.

Detail:

- Detail uses Feedback-like panel surfaces.
- Header and content sections are visually distinct.
- Delete/save/open linked offer use `Button`.
- Textareas use shared `Textarea` where practical.
- Focus states are visible and consistent.

Copy paste:

- Modal shell is shared.
- Feature-specific prompt preparation remains feature-local.
- Dialog accessibility attributes remain correct.

Shared:

- Shared components do not import feature code.
- Shared components do not contain feature-specific translations.
- Shared components are not over-abstracted.
- Shared components reduce duplicated classes.

Behavior:

- List loading/selecting still works.
- Filters still work.
- Route state still works.
- Editing still persists.
- Deleting still works.
- Copy-paste still works.
- AI paths do not call real providers during agent testing.

Quality:

- `npm run build` passes after every source-changing slice.
- No commits are made automatically.
- No production Supabase migrations or schema changes are involved.

## Open Product Questions

1. Should Interview Questions adopt Feedback Notes' explicit edit/view mode, or keep autosave-on-blur plus manual save?
2. Should answered/pending be a segmented filter instead of a select?
3. Should CV and offer metadata badges remain colorful, or become neutral metadata chips?
4. Should "open linked offer" live in the detail header or remain below the AI controls?
5. Should the Interview answer area visually mirror Feedback Notes' final feedback panel with a subtle indigo gradient?
6. Should the copy-paste edit mode keep a distinct color, or should all AI/copy-paste modes use indigo?

## Recommended Starting Point

Start with Slice 1 and Slice 2:

1. Apply the Feedback Notes shell to Interview Questions.
2. Convert the Interview sidebar into the Feedback Notes side panel pattern.
3. Align Interview list item selected/hover states.

This gives the biggest visual improvement with the least behavioral risk. After that, extract shared shell/sidebar components once both screens have proven the same structure in practice.

