# Plan: Markdown básico en el editor manual de CV

## Objetivo

Permitir formato básico en los campos narrativos del editor manual de CV usando Markdown limitado, manteniendo el modelo actual basado en strings.

El usuario editará Markdown literal en los textarea/input, y el resultado se verá formateado en:

- PDF preview/export.
- Vista pública HTML del CV.

## Alcance v1

Formatos soportados:

- Negrita: `**texto**`
- Cursiva: `*texto*`
- Negrita + cursiva: `***texto***`
- Enlace explícito: `[texto](https://example.com)`

No soportar en v1:

- Colores inline.
- Subrayado.
- Headings.
- Listas Markdown.
- HTML.
- Auto-link de URLs sueltas.
- Markdown en títulos, fechas, ubicaciones, URLs o nombres de entidades.

## Campos soportados

Aplicar formato solo a campos narrativos:

- `profile.summary`
- `experience[].bullets[]`
- `education[].details[]`
- `projects[].description`
- `projects[].bullets[]`
- `certifications[].description`
- `certifications[].bullets[]`
- `awards[].description`
- `awards[].bullets[]`
- `publications[].description`
- `publications[].bullets[]`
- `volunteering[].description`
- `volunteering[].bullets[]`

Mantener texto plano en:

- `basics.name`
- `basics.headline`
- `role`
- `company`
- `institution`
- `degree`
- `field`
- `location`
- Fechas
- URLs directas de item
- Section titles
- Skills/chips/languages/technical skills

## Modelo de datos

No cambiar el schema.

Los campos siguen siendo strings dentro de `StandardCVProfile`.

Ejemplo:

```json
{
  "summary": "Product engineer focused on **AI workflows** and *developer experience*."
}
```

Ventajas:

- No requiere migraciones.
- CVs existentes siguen funcionando.
- IA/copy-paste/API siguen operando con texto.
- Si una superficie no renderiza Markdown todavía, el contenido sigue siendo legible.

## Editor manual

Crear un control reusable para campos narrativos, por ejemplo:

- `CVInlineMarkdownField`
- `CVInlineMarkdownToolbar`

Comportamiento:

- El campo muestra Markdown literal.
- La toolbar inserta Markdown sobre la selección actual.
- Botones:
  - Bold
  - Italic
  - Bold italic
  - Link
- Usar iconos lucide o controles compactos.
- Añadir tooltips y labels traducidos con `next-intl`.
- No introducir TipTap/Lexical/ProseMirror en v1.

Aplicar el control en:

- `section-summary.tsx`
- `editable-bullet-list.tsx` cuando se use para campos narrativos
- `section-named-items.tsx` para `description`
- Mantener inputs normales en campos no narrativos

## Renderer compartido

Crear un parser pequeño de Markdown limitado, idealmente en una capa compartida frontend-safe, por ejemplo:

- `src/lib/cv-inline-markdown.ts`

Responsabilidades:

- Parsear texto a tokens seguros:
  - text
  - strong
  - emphasis
  - strongEmphasis
  - link
- Escapar todo texto.
- No aceptar HTML.
- Validar enlaces con `buildExternalLinkHref` o helper equivalente.
- No autolink.
- Manejar Markdown inválido como texto literal.

## Render HTML

Crear componente web, por ejemplo:

- `src/features/cv-templates/components/cv-inline-markdown.tsx`

Usarlo en:

- `CVTemplatePreview` para `summary`
- `CVTemplatePreviewExperienceItem` para bullets
- `CVTemplatePreviewEducationItem` para details
- `CVTemplatePreviewNamedItem` para `description` y bullets

Salida:

- `<strong>`
- `<em>`
- `<strong><em>`
- `<a target="_blank" rel="noopener noreferrer">`

## Render PDF

Extender `src/lib/cv-template-pdf.tsx`.

Crear helper tipo:

- `FormattedPDFText`
- `renderInlineMarkdownPDF(text, baseStyle, options)`

Usarlo en:

- Summary
- Bullet text
- Named item descriptions

Salida:

- `<Text style={baseStyle}>`
- Segmentos anidados con:
  - bold font family
  - italic font family
  - bold italic font family
  - `<Link src="...">`

Añadir o registrar fuentes italic si no existen:

- Inter Italic
- Inter SemiBold/Bold Italic
- EB Garamond Italic
- EB Garamond Bold Italic

Si no se añaden fuentes italic, documentar la limitación y verificar visualmente el resultado.

## IA y prompts

Actualizar prompts de edición de CV para permitir Markdown limitado.

Reglas para IA:

- Puede preservar Markdown existente.
- Puede añadir énfasis de forma moderada.
- No debe llenar el CV de negritas.
- No debe inventar enlaces.
- Solo puede usar:
  - `**texto**`
  - `*texto*`
  - `***texto***`
  - `[texto](url)`

Actualizar documentación obligatoria del prompt bajo:

- `docs/prompts/<prompt-type>/prompt.md`

Incluir:

- Prompt actual.
- Source file.
- Cómo se alimenta con datos.
- Runtime flow.
- Notas de mantenimiento.

## Tests

Añadir tests del parser:

- Texto plano no cambia.
- Bold.
- Italic.
- Bold italic.
- Link válido.
- Markdown incompleto queda literal.
- HTML queda literal/escapado.
- Marcadores anidados o ambiguos tienen comportamiento definido.

Añadir tests de render HTML:

- `strong`, `em`, `a`.
- Texto plano sin Markdown.
- Enlaces con `target` y `rel`.

Añadir tests de PDF si el setup lo permite:

- El renderer no rompe con Markdown.
- Links se renderizan como `Link`.
- Segmentos se crean con estilos esperados.

Actualizar tests existentes si snapshots/assertions esperan texto literal.

## Verificación manual

1. Crear o abrir un CV template.
2. En resumen escribir:
   - `Ingeniero con foco en **AI workflows** y *producto*.`
3. En experiencia añadir bullet:
   - `Reducí tiempos un ***35%*** usando [Fabra](https://fabra.app).`
4. Confirmar que textarea muestra Markdown literal.
5. Confirmar que PDF preview muestra formato.
6. Descargar PDF y comprobar:
   - Bold.
   - Italic.
   - Bold italic.
   - Link clicable.
7. Publicar CV y comprobar la vista pública HTML.
8. Confirmar que CVs antiguos siguen renderizando igual.

## Riesgos

- Cursiva en PDF puede requerir fuentes italic reales.
- Un parser Markdown demasiado permisivo puede introducir casos raros.
- Los enlaces deben sanearse para evitar protocolos peligrosos.
- IA podría sobreusar énfasis si el prompt no lo limita.
- Vista pública y PDF pueden divergir si no comparten parser.

## Decisiones tomadas

- Alcance inicial: editor manual de CV.
- Formato interno: Markdown limitado en strings.
- UI: Markdown visible en textarea/input.
- Preview: formato renderizado en PDF y vista pública.
- No migraciones.
- Enlaces clicables solo con Markdown explícito.
- No colores inline en v1.
