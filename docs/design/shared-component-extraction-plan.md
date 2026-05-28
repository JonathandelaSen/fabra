# Shared Component Extraction Plan

Plan de extracción de los componentes UI más repetidos en la aplicación. El objetivo es eliminar duplicación, unificar el lenguaje visual y facilitar cambios de diseño globales desde un solo punto.

Todos los componentes extraídos van a `src/components/shared/` salvo las utilidades puras que van a `src/lib/`.

---

## Fase 0 — Utilidades puras (sin JSX) ✅ COMPLETADA

Extracciones que no son componentes pero bloquean duplicación en toda la app.

### 0.1 `formatDate` utility ✅

- **Destino:** `src/lib/format.ts`
- **Duplicación actual:** 4+ archivos con la misma función `formatDate` inline (`toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })`).
- **Archivos migrados:**
  - ✅ `src/features/work-journal/components/work-journal-list-item.tsx`
  - ✅ `src/features/feedback-notes/components/feedback-note-list-item.tsx`
  - ✅ `src/features/received-feedback/components/received-feedback-list-item.tsx`
  - ✅ `src/features/feedback-notes/components/feedback-entries-panel.tsx` (bonus — encontrada durante migración)
  - ⬜ `src/features/interview-questions/components/interview-question-list-item.tsx` (no tenía `formatDate`)
- **Acción:** Crear la utilidad, importar desde todos los consumidores, eliminar funciones locales.

---

## Fase 1 — Building blocks atómicos ✅ COMPLETADA

Componentes pequeños y sin estado que se componen en los demás.

### 1.1 `StatusBadge` ✅

- **Destino:** `src/components/shared/status-badge.tsx`
- **Duplicación actual:** 10+ archivos con inline `rounded-full border border-{color}-500/20 bg-{color}-500/10 text-[9px] uppercase tracking-wide`.
- **Props:** `label`, `color` (enum: emerald, amber, rose, teal, zinc, indigo), `size?` (sm, md), `icon?`.
- **Archivos migrados:**
  - ✅ `src/features/feedback-notes/components/feedback-note-list-item.tsx`
  - ✅ `src/features/interview-questions/components/interview-question-list-item.tsx`
  - ✅ `src/features/interview-questions/components/interview-question-header.tsx`
  - ✅ `src/features/objectives/components/objective-summary-panel.tsx`
  - ✅ `src/features/cv-library/components/cv-library-detail-header.tsx`
  - ✅ `src/features/cv-library/components/cv-library-type-badge.tsx`
  - ⬜ `src/features/admin-observability/components/observability-primitives.tsx` (usa mapa dinámico de status — no encaja directamente)

### 1.2 `DestructiveButton` ⬜ PENDIENTE

- **Destino:** `src/components/shared/destructive-button.tsx`
- **Duplicación actual:** 15+ archivos con `bg-rose-600/15 text-rose-300 hover:bg-rose-600/25 border border-rose-500/20` + `Trash2` icon.
- **Props:** `onClick`, `loading?`, `label?`, `icon?` (default Trash2), `size?`.
- **Nota:** Los patrones de botón destructivo varían bastante (algunos son `<Button variant="destructive">`, otros son `<button>` nativo, algunos en dropdowns). Se recomienda evaluar si un componente compartido o una variante de `Button` es más apropiado.
- **Archivos a repatriar:** Todos los detail headers de cada feature (feedback-notes, work-journal, objectives, interview-questions, received-feedback, cv-library, cv-analysis, job-match-analysis, settings).

### 1.3 `ErrorBanner` ✅

- **Destino:** `src/components/shared/error-banner.tsx`
- **Duplicación actual:** 4+ archivos con `rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300`.
- **Props:** `message`, `onRetry?`, `className?`.
- **Archivos migrados:**
  - ✅ `src/features/activity-context/components/activity-context-view.tsx`
  - ⬜ `src/features/cv-library/components/cv-library-sidebar-error.tsx` (tiene lógica extra de blocking analyses)
  - ⬜ `src/features/settings/components/ai-settings-panel.tsx`
  - ⬜ Formularios de auth

---

## Fase 2 — Componentes de layout compuesto ✅ COMPLETADA

Piezas reutilizables que forman la estructura de las pantallas two-pane.

### 2.1 `SidebarListItem` ✅

- **Destino:** `src/components/shared/sidebar-list-item.tsx`
- **Duplicación actual:** 5 componentes con el mismo botón seleccionable, ChevronRight, title + footer con tag chip + date.
- **Props:** `title`, `selected`, `onClick`, `subtitle?`, `footer?`, `titleClamp?`, `className?`.
- **Usa:** `featureListItemClassName` / `featureListItemIconClassName` del visual system.
- **Archivos migrados:**
  - ✅ `src/features/work-journal/components/work-journal-list-item.tsx`
  - ✅ `src/features/feedback-notes/components/feedback-note-list-item.tsx`
  - ✅ `src/features/objectives/components/objective-list-item.tsx`
  - ✅ `src/features/received-feedback/components/received-feedback-list-item.tsx`
  - ✅ `src/features/interview-questions/components/interview-question-list-item.tsx`

### 2.2 `SectionCard` ✅ (componente creado, migraciones pendientes)

- **Destino:** `src/components/shared/section-card.tsx`
- **Props:** `title?`, `icon?`, `actions?` (ReactNode), `children`, `className?`, `noPadding?`.
- **Nota:** Creado el componente compartido. Las 11+ instancias en features varían mucho en layout interno (p-3/p-5, flex-col, overflow, gap, animate-fade-in), así que la migración de consumidores se recomienda hacerla progresivamente.
- **Archivos a repatriar:**
  - ⬜ `src/features/feedback-notes/components/feedback-entries-panel.tsx`
  - ⬜ `src/features/feedback-notes/components/feedback-notes-detail.tsx`
  - ⬜ `src/features/interview-questions/components/interview-question-answer-panel.tsx`
  - ⬜ `src/features/interview-questions/components/interview-question-header.tsx`
  - ⬜ `src/features/interview-questions/components/interview-question-prompt-panel.tsx`
  - ⬜ `src/features/objectives/components/objective-form-panel.tsx`
  - ⬜ `src/features/objectives/components/objective-items-section.tsx`
  - ⬜ `src/features/objectives/components/objective-outcomes-section.tsx`
  - ⬜ `src/features/objectives/components/objective-summary-panel.tsx`

### 2.3 `SegmentedControl` ✅

- **Destino:** `src/components/shared/segmented-control.tsx`
- **Props:** `options: { value, label, count? }[]`, `value`, `onChange`, `className?`.
- **Archivos migrados:**
  - ✅ `src/features/feedback-notes/components/feedback-notes-sidebar.tsx`
  - ✅ `src/features/objectives/components/objectives-sidebar.tsx`
  - ⬜ `src/features/work-journal/components/work-journal-input-mode-tabs.tsx`

### 2.4 `SearchInput` ✅

- **Destino:** `src/components/shared/search-input.tsx`
- **Props:** `value`, `onChange`, `placeholder?`, `shortcutKey?`, `inputRef?`, `className?`.
- **Archivos migrados:**
  - ✅ `src/features/cv-library/components/cv-library-search-input.tsx` (delegado al shared)
  - ⬜ `src/features/work-journal/components/work-journal-sidebar.tsx`
  - ⬜ `src/features/cv-analysis/components/cv-analyses-list-view.tsx`
  - ⬜ `src/features/job-match-analysis/components/job-match-analysis-list.tsx`
  - ⬜ `src/features/admin-observability/components/observability-filters.tsx`

### 2.5 `SectionGroupHeader` ✅

- **Destino:** `src/components/shared/section-group-header.tsx`
- **Props:** `label`, `count?`, `className?`.
- **Archivos migrados:**
  - ✅ `src/features/objectives/components/objectives-sidebar.tsx`
  - ⬜ `src/features/objectives/components/objective-identity-section.tsx`
  - ⬜ `src/features/objectives/components/objective-items-section.tsx`
  - ⬜ `src/features/objectives/components/objective-narrative-section.tsx`
  - ⬜ `src/features/objectives/components/objective-planning-section.tsx`
  - ⬜ `src/features/cv-editor/components/cv-editor-public-section.tsx`

### 2.6 `SettingsSectionPanel` ✅

- **Destino:** `src/components/shared/settings-section-panel.tsx`
- **Props:** `title`, `icon`, `description?`, `children`.
- **Archivos migrados:**
  - ✅ `src/features/settings/components/account-security-panel.tsx`
  - ✅ `src/features/settings/components/language-settings-panel.tsx`
  - ⬜ `src/features/settings/components/ai-settings-panel.tsx`
  - ⬜ `src/features/settings/components/delete-account-panel.tsx` (usa estilo rose diferente — no aplica)

---

## Fase 3 — Empty states y skeletons ✅ COMPLETADA

Componentes que aparecen en estados de carga y vacío de cada feature.

### 3.1 `SidebarEmptyState` ✅

- **Destino:** `src/components/shared/sidebar-empty-state.tsx`
- **Props:** `icon`, `message`, `className?`.
- **Archivos migrados:**
  - ✅ `src/features/work-journal/components/work-journal-empty-state.tsx`
  - ⬜ `src/features/feedback-notes/components/feedback-notes-sidebar.tsx`
  - ⬜ `src/features/interview-questions/components/interview-questions-sidebar.tsx`
  - ⬜ `src/features/activity-context/components/activity-context-view.tsx`

### 3.2 `FeatureEmptyState` ✅

- **Destino:** `src/components/shared/feature-empty-state.tsx`
- **Props:** `icon`, `title`, `description?`, `action?` (ReactNode), `className?`.
- **Archivos migrados:**
  - ✅ `src/features/received-feedback/components/received-feedback-empty-state.tsx`
  - ⬜ `src/features/cv-editor/components/cv-editor-empty-state.tsx` (layout muy diferente — tiene template cards grid)
  - ⬜ Inline en `cv-analyses-list-view.tsx`, `job-match-analysis-list.tsx`

### 3.3 `SidebarListSkeleton` ✅ (+ `DetailPaneSkeleton` pendiente)

- **Destino:** `src/components/shared/skeletons/sidebar-list-skeleton.tsx`
- **Props:** `itemCount?` (default 5).
- **Archivos migrados:**
  - ✅ `src/features/feedback-notes/components/feedback-notes-skeleton.tsx` (`FeedbackNotesListSkeleton`)
  - ⬜ `src/features/received-feedback/components/received-feedback-skeleton.tsx` (estructura diferente con bg/borders)
  - ⬜ `src/features/objectives/components/objectives-skeleton.tsx` (tiene secciones agrupadas)
  - ⬜ `src/features/interview-questions/components/interview-questions-skeleton.tsx`
  - ⬜ `src/features/cv-library/components/cv-library-skeleton.tsx`
  - ⬜ `src/features/cv-analysis/components/cv-analyses-list-skeleton.tsx`
  - ⬜ `DetailPaneSkeleton` — no creado aún (los detail skeletons son muy específicos por feature)

---

## Fase 4 — Componentes interactivos ✅ COMPLETADA

Componentes con estado interno o lógica de interacción.

### 4.1 `InlineEditableField` ⬜ PENDIENTE

- **Destino:** `src/components/shared/inline-editable-field.tsx`
- **Duplicación actual:** 3 archivos con input + save/cancel icon buttons.
- **Props:** `value`, `onSave`, `loading?`, `placeholder?`, `renderDisplay?`.
- **Nota:** Las implementaciones varían significativamente en UX (inline edit vs modal vs dropdown).
- **Archivos a repatriar:**
  - ⬜ `src/features/cv-library/components/cv-library-detail-header.tsx`
  - ⬜ `src/features/activity-context/components/context-row.tsx`
  - ⬜ `src/features/cv-analysis/components/conversation-list.tsx`

### 4.2 `ConfirmDialog` ✅

- **Destino:** `src/components/shared/confirm-dialog.tsx`
- **Props:** `open`, `onConfirm`, `onCancel`, `title`, `description`, `confirmLabel?`, `cancelLabel?`, `variant?` (danger, default).
- **Archivos migrados:**
  - ✅ `src/features/objectives/components/objective-confirm-dialog.tsx`
  - ⬜ Inline confirm logic en cv-library, work-journal, feedback-notes

---

## Fase 5 — Deduplicación de features gemelos (cv-analysis ↔ job-match-analysis) ⬜ PENDIENTE

Esta es la extracción de mayor impacto en líneas de código (~1600 líneas duplicadas).

### 5.1 Chat UI compartido ⬜

- **Destino:** `src/components/shared/chat/`
- **Componentes a extraer:**
  - `chat-bubble.tsx`
  - `chat-empty-chat.tsx`
  - `chat-empty-state.tsx`
  - `chat-markdown.tsx`
  - `chat-messages-area.tsx`
  - `conversation-list.tsx`
  - `tab-entrevista.tsx`
- **Archivos a repatriar (eliminar duplicado):**
  - `src/features/cv-analysis/components/chat-*.tsx` (7 archivos)
  - `src/features/job-match-analysis/components/chat-*.tsx` (7 archivos)

### 5.2 Extraction viewer compartido ⬜

- **Destino:** `src/components/shared/extraction/`
- **Componentes a extraer:**
  - `extraction-parser-tabs.tsx`
  - `extraction-text-panel.tsx`
  - `extraction-header.tsx`
- **Archivos a repatriar:**
  - `src/features/cv-analysis/components/extraction-parser-tabs.tsx`
  - `src/features/cv-analysis/components/cv-extraction-text-panel.tsx`
  - `src/features/cv-analysis/components/extraction-header.tsx`
  - `src/features/job-match-analysis/components/job-match-extraction-*.tsx` (3 archivos)

### 5.3 Score Hero compartido ⬜

- **Destino:** `src/components/shared/score-hero.tsx`
- **Incluye:** `getScoreColor()` utility + layout completo.
- **Archivos a repatriar:**
  - `src/features/cv-analysis/components/score-hero.tsx`
  - `src/features/job-match-analysis/components/score-hero.tsx`

### 5.4 Analysis List View compartido ⬜

- **Destino:** `src/components/shared/analysis-list-view.tsx`
- **Archivos a repatriar:**
  - `src/features/cv-analysis/components/cv-analyses-list-view.tsx`
  - `src/features/job-match-analysis/components/job-match-analysis-list.tsx`

---

## Orden de ejecución recomendado

```
Fase 0  →  Fase 1  →  Fase 2  →  Fase 3  →  Fase 4  →  Fase 5
  ✅         ✅         ✅         ✅         ✅         ⬜
```

Cada fase es un commit independiente. Cada componente dentro de la fase se puede hacer en un sub-commit si se prefiere granularidad.

**Reglas de extracción:**

1. Crear el componente compartido en `src/components/shared/`.
2. Añadir traducciones i18n si el componente tiene texto visible.
3. Reemplazar todas las instancias en features con el import compartido.
4. Eliminar el código duplicado del feature.
5. Verificar con `npm run build` tras cada fase.
6. No cambiar comportamiento visual — refactor puro.

---

## Métricas objetivo

| Métrica | Antes | Después (actual) | Objetivo |
|---------|-------|-------------------|----------|
| Archivos duplicados chat UI | 14 | 14 | 7 (shared) |
| Implementaciones de list-item | 5 independientes | ✅ 1 shared + 5 consumidores | ✅ |
| Skeleton files | 7 independientes | 1 shared + 1 migrado | 2 shared + 7 consumidores ligeros |
| Inline status badge | 10+ copy-paste | ✅ 1 `StatusBadge` + 6 migrados | ✅ |
| formatDate copias | 4+ | ✅ 1 utility + 4 migrados | ✅ |
| Líneas eliminadas estimadas | — | ~400 | ~2500-3000 |

---

## Resumen de componentes shared creados

| Componente | Archivo | Estado |
|------------|---------|--------|
| `formatDate` | `src/lib/format.ts` | ✅ Creado + migrado |
| `StatusBadge` | `src/components/shared/status-badge.tsx` | ✅ Creado + 6 consumidores migrados |
| `ErrorBanner` | `src/components/shared/error-banner.tsx` | ✅ Creado + 1 consumidor migrado |
| `SidebarListItem` | `src/components/shared/sidebar-list-item.tsx` | ✅ Creado + 5 consumidores migrados |
| `SectionCard` | `src/components/shared/section-card.tsx` | ✅ Creado (migraciones progresivas) |
| `SegmentedControl` | `src/components/shared/segmented-control.tsx` | ✅ Creado + 2 consumidores migrados |
| `SearchInput` | `src/components/shared/search-input.tsx` | ✅ Creado + 1 consumidor migrado |
| `SectionGroupHeader` | `src/components/shared/section-group-header.tsx` | ✅ Creado + 1 consumidor migrado |
| `SettingsSectionPanel` | `src/components/shared/settings-section-panel.tsx` | ✅ Creado + 2 consumidores migrados |
| `SidebarEmptyState` | `src/components/shared/sidebar-empty-state.tsx` | ✅ Creado + 1 consumidor migrado |
| `FeatureEmptyState` | `src/components/shared/feature-empty-state.tsx` | ✅ Creado + 1 consumidor migrado |
| `SidebarListSkeleton` | `src/components/shared/skeletons/sidebar-list-skeleton.tsx` | ✅ Creado + 1 consumidor migrado |
| `ConfirmDialog` | `src/components/shared/confirm-dialog.tsx` | ✅ Creado + 1 consumidor migrado |
