# Refactor de comentarios JSX a componentes extraidos

Este documento lista las pantallas y componentes donde hay comentarios JSX que identifican regiones visuales, por ejemplo `Header`, `Sidebar`, `Tabs`, `Panel Body` o `Score Hero`. Estos comentarios suelen ser una senal de que el archivo esta agrupando varias responsabilidades visuales y de que conviene extraer componentes con nombres semanticos.

## Objetivo

Reemplazar comentarios estructurales por componentes nombrados. El resultado esperado es que una vista lea como composicion de piezas, sin necesitar comentarios para explicar que representa cada bloque.

Ejemplo:

```tsx
{/* Header */}
<div className="...">
  ...
</div>
```

Deberia evolucionar hacia:

```tsx
<AnalysisHeader ... />
```

El comentario desaparece porque el nombre del componente expresa la intencion.

## Inventario

### Prioridad alta

Estos archivos tienen muchos comentarios estructurales o son vistas grandes. Conviene empezar por aqui.

| Archivo | Comentarios | Bloques identificados |
| --- | ---: | --- |
| `src/features/cv-analysis/components/extraction-view.tsx` | 11 | Header bar, Content, Educational Banner, Parser Tabs, text/PDF layout, scan animation, toolbar, text, PDF Previewer Panel, fullscreen backdrop, AI Analysis Section |
| `src/features/cv-editor/components/cv-manual-editor/manual-editor.tsx` | 10 | Personal Details section, dynamic sections, left-side controls, drag handle, icon, title input, count badge, right-side controls, move buttons, visibility button |
| `src/features/job-match-analysis/components/job-match-extraction-view.tsx` | 9 | Header bar, Content, Parser Tabs, text/PDF layout, scan animation, toolbar, text, PDF Previewer Panel, fullscreen backdrop |
| `src/features/work-journal/components/work-journal-view.tsx` | 6 | Header, animated form, editor column, metadata/context column, timeline, row actions |
| `src/features/received-feedback/components/received-feedback-view.tsx` | 6 | Creation form mode, edit form mode, read-only detail mode, quotation feedback card, private note card, empty state |
| `src/features/objectives/components/objective-form-panel.tsx` | 6 | Panel header, panel body, identity section, planning/attributes section, narrative/reflection section, footer actions |
| `src/features/cv-analysis/components/tab-chat-oferta.tsx` | 6 | Sidebar, chat area, header, messages, error, input |
| `src/features/job-match-analysis/components/tab-chat-oferta.tsx` | 6 | Sidebar, chat area, header, messages, error, input |
| `src/features/cv-analysis/components/score-hero.tsx` | 6 | Score circle, score info, meta row, CV link, job URL, actions row |
| `src/features/job-match-analysis/components/score-hero.tsx` | 6 | Score circle, score info, meta row, CV link, job URL, actions row |
| `src/components/shell/sidebar.tsx` | 6 | Header, new analysis button, nav sections, CV section, career section, footer |

### Prioridad media

Estos archivos tienen menos comentarios, pero los bloques son buenos candidatos para componentes pequenos o componentes de seccion.

| Archivo | Comentarios | Bloques identificados |
| --- | ---: | --- |
| `src/features/interview-questions/components/interview-question-detail.tsx` | 4 | Header panel, inputs panels, question/context panel, answer panel |
| `src/features/cv-library/components/upload-phase.tsx` | 4 | Header, upload area, error, upload button |
| `src/features/cv-analysis/components/job-match-form.tsx` | 4 | Header, job URL, job description, AI action launcher |
| `src/features/cv-analysis/components/analysis-mode-selector.tsx` | 4 | Tag, icon, text, arrow |
| `src/features/cv-analysis/components/general-analysis-form.tsx` | 3 | Header, additional context, footer/action launcher |
| `src/features/objectives/components/objective-outcomes-section.tsx` | 3 | Panel header, panel body, add outcome input bar |
| `src/features/objectives/components/objective-items-section.tsx` | 3 | Panel header, panel body, add action item input bar |
| `src/features/objectives/components/objective-confirm-dialog.tsx` | 3 | Header area, content area, actions footer |
| `src/components/shell/app-shell.tsx` | 3 | Background ambient gradient, sidebar, main content |
| `src/components/shared/skeletons/analysis-detail-skeleton.tsx` | 3 | Score hero skeleton, tab bar, tab content |
| `src/features/objectives/components/objective-summary-panel.tsx` | 2 | Progress/target section, success criteria/reflection |
| `src/features/cv-analysis/components/tab-resumen.tsx` | 2 | Improvements/keywords, matching/missing keywords |
| `src/features/job-match-analysis/components/tab-resumen.tsx` | 2 | Improvements/keywords, matching/missing keywords |
| `src/features/cv-analysis/components/cv-analyses-list-view.tsx` | 2 | Header, list |
| `src/features/job-match-analysis/components/job-match-analysis-list.tsx` | 2 | Header, list |
| `src/features/cv-analysis/components/analysis-view.tsx` | 2 | Score hero, tabs |
| `src/features/job-match-analysis/components/job-match-analysis-detail.tsx` | 2 | Score hero, tabs |
| `src/components/shared/pdf-preview.tsx` | 2 | Zoom toolbar, PDF container |

## Como refactorizar un comentario a componente

### 1. Confirmar que el comentario identifica una region real

Un comentario es candidato si nombra una parte de UI:

- `Header`
- `Sidebar`
- `Tabs`
- `Panel Body`
- `Footer Actions`
- `Timeline`
- `Empty State`
- `Upload Area`

No hace falta extraer todos los comentarios en una sola pasada. Prioriza bloques con estado propio, markup largo, condicionales, handlers o repeticion.

### 2. Elegir un nombre de componente semantico

El nombre debe decir que representa la pieza dentro del dominio de la pantalla, no solo que etiqueta HTML usa.

Buenos ejemplos:

- `ExtractionHeaderBar`
- `ExtractionParserTabs`
- `ExtractionTextPanel`
- `ExtractionPdfPreviewPanel`
- `WorkJournalTimeline`
- `ObjectiveFormIdentitySection`
- `OfferChatSidebar`
- `ManualEditorSectionControls`

Evita nombres demasiado genericos si el componente no es realmente compartido:

- `Header`
- `Content`
- `Section`
- `Panel`

### 3. Crear un archivo sibling en la misma carpeta

Para componentes especificos de una pantalla, crea un archivo al lado de la vista original:

```text
src/features/cv-analysis/components/
  extraction-view.tsx
  extraction-header-bar.tsx
  extraction-parser-tabs.tsx
  extraction-text-panel.tsx
```

No muevas a `src/components/shared/` salvo que haya reutilizacion real. Un componente extraido para limpiar una vista puede seguir siendo privado de la feature.

### 4. Mover el JSX sin cambiar comportamiento

Primero haz una extraccion mecanica:

1. Corta el bloque debajo del comentario.
2. Pegalo en el nuevo componente.
3. Pasa por props solo los datos, callbacks y flags que el bloque necesita.
4. Mantén las clases, estructura DOM, keys y atributos igual.
5. Sustituye el bloque original por el nuevo componente.

Ejemplo:

```tsx
<ExtractionHeaderBar
  fileName={fileName}
  parser={parser}
  onBack={onBack}
/>
```

### 5. Tipar las props cerca del componente

Define una interfaz de props en el archivo extraido:

```tsx
interface ExtractionHeaderBarProps {
  fileName: string;
  parser: ParserKind;
  onBack: () => void;
}

export function ExtractionHeaderBar({
  fileName,
  parser,
  onBack,
}: ExtractionHeaderBarProps) {
  ...
}
```

Si el tipo ya existe en la feature, importalo desde el barrel publico de la feature o desde un archivo local permitido. No introduzcas imports desde `src/modules/**` en frontend.

### 6. Mantener traducciones e i18n

Todo texto visible en componentes React debe seguir usando `next-intl`.

Opciones validas:

- El componente extraido llama a `useTranslations("namespace")` si renderiza textos propios.
- La vista padre pasa strings ya traducidos si eso mantiene el componente mas simple.

No hardcodees textos nuevos durante la extraccion.

### 7. Eliminar el comentario original

Cuando el componente tenga un nombre claro, el comentario ya no debe quedarse encima:

```tsx
<ObjectiveFormIdentitySection ... />
<ObjectiveFormPlanningSection ... />
<ObjectiveFormNarrativeSection ... />
<ObjectiveFormFooterActions ... />
```

La composicion debe leerse sola.

### 8. No crear abstracciones prematuras

Extraer un bloque a un componente no implica volverlo generico. Primero extrae componentes especificos y estables. Solo crea un componente compartido cuando existan al menos dos usos reales con forma parecida.

Buen orden:

1. Extraer `CvExtractionTextPanel`.
2. Extraer `JobMatchExtractionTextPanel`.
3. Comparar ambas piezas.
4. Si son casi iguales, crear un componente comun como `DocumentExtractionTextPanel`.

### 9. Verificar despues de cada grupo

Despues de cambios bajo `src/features/`, `src/components/` o `src/app/`, ejecuta:

```bash
npm run build
```

Si el cambio toca imports o boundaries de frontend, tambien conviene ejecutar las verificaciones de arquitectura disponibles en el repo.

## Orden recomendado de trabajo

1. `src/features/cv-analysis/components/extraction-view.tsx`
2. `src/features/job-match-analysis/components/job-match-extraction-view.tsx`
3. Comparar y deduplicar extraction views si procede.
4. `src/features/cv-editor/components/cv-manual-editor/manual-editor.tsx`
5. `src/features/work-journal/components/work-journal-view.tsx`
6. `src/features/received-feedback/components/received-feedback-view.tsx`
7. `src/features/objectives/components/objective-form-panel.tsx`
8. Chats de oferta en CV Analysis y Job Match Analysis.
9. Shell/shared: `sidebar.tsx`, `app-shell.tsx`, skeletons y `pdf-preview.tsx`.

## Checklist por archivo

- [ ] Identificar comentarios que nombran regiones visuales.
- [ ] Agrupar bloques relacionados en componentes con nombre semantico.
- [ ] Crear archivos sibling dentro de la feature.
- [ ] Pasar props minimas y tipadas.
- [ ] Mantener i18n con `next-intl`.
- [ ] Eliminar comentarios obvios reemplazados por componentes.
- [ ] Evitar mover a shared sin reutilizacion real.
- [ ] Revisar que la vista principal quede como orquestador.
- [ ] Ejecutar `npm run build`.

