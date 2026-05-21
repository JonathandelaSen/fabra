# Screen Design System

This guide defines the product screen direction for JulyLog. It is intentionally about screen composition, not brand exploration or isolated component styling.

## Direction

JulyLog should feel like a focused professional workspace: operational, sober, dense enough for repeated work, and calm enough for reflective writing. AI-assisted moments should feel guided and slightly elevated, but they must still belong to the same application.

The design direction is new, but derived from the best current patterns in the app:

- Use the shell and feature routes as a stable frame.
- Prefer compact headers, predictable sidebars, and structured detail areas.
- Keep the product dark, restrained, and content-first.
- Use accent color to indicate action or status, not to decorate large areas.
- Avoid landing-page composition inside the app.

## Audit Notes

Screens reviewed for this first pass:

- Feedback Notes: strongest pilot candidate because it combines list-detail navigation, raw notes, final AI-assisted output, status changes, and copy-paste AI mode.
- Work Journal: useful for reflective writing and timeline rhythm, but currently more editorial than the rest of the product.
- Objectives: strongest current reference for an operational sidebar plus detail composition.
- Opportunities: included as a target pattern for future pipeline/comparison work, though no migrated feature screen was available in `src/features` at the time of this pass.

Useful patterns to preserve:

- Objectives has the clearest app-like skeleton: compact route header, left navigation, scrollable detail.
- Feedback Notes already has a good private-workspace feeling and a focused list-detail route model.
- Work Journal has a strong writing surface and good separation between raw input and assisted output.

Inconsistencies to correct:

- Header scale varies too much between screens.
- Some screens use large editorial spacing while others use dense SaaS layout.
- Panels, cards, borders, and rounded corners are not used with the same meaning.
- Primary actions move between sidebar, header, and local panels without a clear hierarchy.
- AI-assisted areas sometimes read like a different product surface.

## Screen Anatomy

Substantial product screens should use this anatomy unless there is a strong reason not to:

1. App shell
   The global shell owns product navigation and should remain the stable outer frame.

2. Route header
   A compact header names the workspace, shows short context, and places route-level actions on the right. Avoid hero-scale headings inside authenticated app screens.

3. Work area
   Use either a list-detail layout, a focused editor layout, a dashboard grid, or a pipeline layout. The chosen pattern should be obvious from the user's job, not from visual preference.

4. Context navigation
   Filters, tabs, object lists, and grouped navigation belong in a predictable left rail when they select the detail resource. Use a compact segmented control for low-cardinality filters.

5. Detail region
   The detail region owns the selected resource. It should start with a summary band, then divide into functional sections.

6. Action hierarchy
   Route-level creation and refresh live in the header or sidebar top. Resource-level actions live in the detail summary. Section-level actions live inside the section.

## Screen Patterns

### List Detail

Use for Feedback Notes, Objectives, and future resource review screens.

- Left rail: filters, create affordance, grouped or chronological resource list.
- Detail: resource summary, metadata, status actions, then two or more work sections.
- Selection is route-driven when the selected item is a durable resource.
- Empty selection should be calm and short.

### Reflective Editor

Use for Work Journal and long-form writing flows.

- Keep writing surfaces spacious, but preserve the same compact route header and action hierarchy.
- Metadata may sit in a side column when editing, but should not look like a disconnected settings card.
- Timeline entries can have more rhythm than operational lists, but text scale should still fit the product.

### Planning And Progress

Use for Objectives.

- Summary band at top with status, context, progress, dates, and resource actions.
- Follow with explicit sections for tasks, outcomes, evidence, and notes.
- Progress indicators should be compact and textual before decorative.

### Pipeline And Comparison

Use for Opportunities and future decision workflows.

- Prefer table, grouped list, or kanban only when the workflow really benefits from columns.
- Keep comparison attributes aligned and scan-friendly.
- Detail panels should show decision evidence, linked CV/profile context, and next actions.

### AI Assisted Review

Use when the user asks the app to transform, draft, evaluate, or summarize.

- Manual input and AI output should be visually adjacent but not confused.
- Use a restrained accent band or bordered panel for AI controls.
- Always support copy-paste mode as an interaction mode when the workflow supports it.
- Avoid making AI moments look like marketing cards.

## Composition Rules

- Use page-level grids for page skeletons and flex for toolbars, button rows, and item rows.
- Set `min-w-0` on flexible content regions that contain long names or prose.
- Use scrollable regions intentionally: left rail and detail can scroll independently in list-detail screens.
- Use compact headings inside app screens: route titles around `text-xl` or `text-2xl`; detail titles around `text-2xl` or `text-3xl` only when they are the selected object name.
- Cards are for repeated items, modals, and framed tools. Do not put cards inside cards.
- Page sections should read as full-width bands or unframed layouts. Use borders and background tints sparingly.
- Keep rounded corners at `rounded-lg` or below for routine controls and cards unless an existing shadcn component requires otherwise.
- Use native controls and shadcn primitives where available before custom controls.
- Use visible labels for form fields. Place labels above fields.
- For 1-5 mutually exclusive choices, prefer visible segmented/radio controls. Use `select` when the list is longer or dynamic.
- Prefer icons for compact actions when the icon is familiar; include text for destructive or consequential actions unless space is constrained.

## Visual Language

- Background: dark neutral workspace.
- Surfaces: slight contrast only; avoid stacked translucent cards.
- Borders: subtle, consistent separators.
- Accent: use indigo for primary AI/product actions, emerald for positive active state, rose for destructive actions, amber for caution or outcomes.
- Typography: keep font weight restrained; avoid very light hero-like type in operational screens.
- Motion: use short transitions for insertion/removal and state changes, not page spectacle.

## Frontend Conventions

- New substantial feature UI belongs under `src/features/<feature-name>/`.
- Route/view components orchestrate data and state; substantial regions live in sibling component files.
- User-visible React strings must use `next-intl` and live in `src/i18n/messages.ts`.
- Prefer shadcn/ui primitives for buttons, inputs, textareas, badges, tabs, alerts, scroll areas, and cards when they fit.
- Feature internals are private; cross-feature imports go through feature barrels.
- Frontend API clients import route response types from `responses.ts`, never from `route.ts`.
- TanStack Query owns server state for migrated features.

## Feedback Notes Pilot

Feedback Notes is the first validation screen for this guide.

The pilot should prove:

- A list-detail screen can feel operational without becoming visually flat.
- The left rail can contain filters, creation, and resource navigation without feeling like a form dump.
- The detail region can separate summary, raw entries, and final AI-assisted output.
- AI controls can feel integrated rather than bolted on.

## PR Checklist

- Does the screen use a recognizable product anatomy?
- Is the primary action in a predictable location?
- Are filters, tabs, and navigation secondary to the selected work?
- Does the density fit an operational SaaS workspace?
- Are cards used only for repeated items, modals, or framed tools?
- Are section headings and detail headings scaled appropriately?
- Do empty, loading, error, and disabled states use the same visual language?
- Do AI-assisted moments belong to the app instead of becoming a separate visual theme?
- Are all visible React strings translated in English and Spanish?
- Does the implementation respect feature-folder boundaries?
- If the screen touches `src/app`, `src/components`, `src/features`, `src/frontend`, `src/lib`, or `src/modules`, has `npm run build` been run?
