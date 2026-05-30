# Plan: Home Screen

## Decisiones de diseño

| Decisión | Resultado |
|---|---|
| Tipo | Home permanente, no onboarding descartable |
| Ruta por defecto | Reemplaza `cv-analyses` como vista inicial tras login |
| Sidebar | Nueva entrada "Home" con icono, primera posición |
| Hero | Personalizado ("Hola, Jon"), 1-2 líneas de propuesta de valor |
| Diferenciación por usuario | Ninguna — misma pantalla siempre, sin lógica condicional |
| Actividad reciente | No incluida en esta iteración |

## Estructura de la pantalla

```
┌─────────────────────────────────────────┐
│  Hero                                   │
│  "Hola, Jon"                            │
│  Breve descripción de la app (1-2 líneas│
│  de propuesta de valor)                 │
├────────────────────┬────────────────────┤
│  Bloque 1          │  Bloque 2          │
│  "Analiza tu CV"   │  "Gestiona tu      │
│                    │   carrera"          │
│  · Sube un CV      │  · Work Journal    │
│  · Analiza tu CV   │  · Objetivos       │
│    contra oferta   │  · Feedback        │
│  · Compara con     │                    │
│    otras ofertas   │                    │
└────────────────────┴────────────────────┘
```

## Archivos impactados

### Nuevos

| Archivo | Propósito |
|---|---|
| `src/features/home/components/home-view.tsx` | Componente principal del home |
| `src/features/home/components/hero-section.tsx` | Hero con saludo personalizado |
| `src/features/home/components/quick-actions-block.tsx` | Bloque reutilizable de acciones rápidas (título + lista de acciones) |
| `src/features/home/index.ts` | Barrel export |

### Modificados

| Archivo | Cambio |
|---|---|
| `src/components/shell/sidebar-types.ts` | Añadir `"home"` al type `SidebarActiveView` |
| `src/components/shell/sidebar.tsx` | Añadir entrada "Home" como primer ítem del sidebar (icono `Home` de lucide-react) |
| `src/components/shell/app-shell.tsx` | Cambiar `initialView` default de `"cv-analyses"` a `"home"` (línea 106) |
| `src/components/shell/app-shell-content.tsx` | Añadir rama condicional para `activeView === "home"` que renderice `HomeView` |
| `src/i18n/messages.ts` | Añadir namespace `home` (en + es) y key `navigation.home` |

## Pasos de implementación

### Paso 1 — Tipos y sidebar

1. **`sidebar-types.ts`**: Añadir `"home"` al union type `SidebarActiveView`.
2. **`sidebar.tsx`**: Añadir entrada "Home" como primer ítem, antes de la sección CV. Icono: `Home` de `lucide-react`. La entrada debe estar fuera de las secciones CV/Career, como ítem independiente arriba del todo.
3. **`app-shell.tsx`** (línea 106): Cambiar `initialView = "cv-analyses"` → `initialView = "home"`.

### Paso 2 — i18n

Añadir en `src/i18n/messages.ts`:

**Namespace `navigation`** (en ambos idiomas):
- `home`: "Home" / "Inicio"

**Namespace `home`** (nuevo, en ambos idiomas):

```ts
// en
home: {
  greeting: "Hello, {name}",
  tagline: "Your AI-powered career companion. Analyze your CV, prepare for interviews, and manage your professional growth.",
  cvBlock: {
    title: "Analyze your CV",
    uploadCv: "Upload a CV",
    uploadCvDescription: "Add your CV to get started with AI-powered analysis",
    analyzeCv: "Analyze your CV against an offer",
    analyzeCvDescription: "Compare your CV with a job posting to get improvement suggestions",
    compareOffers: "Compare with other offers",
    compareOffersDescription: "See how your CV matches different job opportunities",
  },
  careerBlock: {
    title: "Manage your career",
    workJournal: "Work Journal",
    workJournalDescription: "Track your daily achievements and learnings",
    objectives: "Objectives",
    objectivesDescription: "Set and follow up on your professional goals",
    feedback: "Feedback",
    feedbackDescription: "Organize and reflect on feedback you've received",
  },
},

// es
home: {
  greeting: "Hola, {name}",
  tagline: "Tu compañero de carrera potenciado por IA. Analiza tu CV, prepárate para entrevistas y gestiona tu crecimiento profesional.",
  cvBlock: {
    title: "Analiza tu CV",
    uploadCv: "Sube un CV",
    uploadCvDescription: "Añade tu CV para empezar con el análisis con IA",
    analyzeCv: "Analiza tu CV contra una oferta",
    analyzeCvDescription: "Compara tu CV con una oferta de trabajo y obtén sugerencias de mejora",
    compareOffers: "Compara con otras ofertas",
    compareOffersDescription: "Mira cómo encaja tu CV con distintas oportunidades laborales",
  },
  careerBlock: {
    title: "Gestiona tu carrera",
    workJournal: "Diario de trabajo",
    workJournalDescription: "Registra tus logros y aprendizajes diarios",
    objectives: "Objetivos",
    objectivesDescription: "Define y da seguimiento a tus metas profesionales",
    feedback: "Feedback",
    feedbackDescription: "Organiza y reflexiona sobre el feedback que has recibido",
  },
},
```

### Paso 3 — Feature home

**`src/features/home/components/hero-section.tsx`**

- Props: `userName: string | null`
- Muestra el saludo personalizado con `t("greeting", { name })`. Si no hay nombre, fallback al email antes del `@`. Si tampoco hay email, solo el tagline sin saludo.
- Debajo: el tagline (1-2 líneas).
- Estilo: texto grande para el saludo, texto secundario para el tagline. Sin imagen ni ilustración — solo tipografía limpia.

**`src/features/home/components/quick-actions-block.tsx`**

- Props: `title: string`, `actions: Array<{ label: string; description: string; icon: LucideIcon; onClick: () => void }>`
- Renderiza el título del bloque y una lista de tarjetas/botones de acción.
- Cada acción: icono a la izquierda, label en negrita, description debajo en texto secundario.
- Componente shadcn/ui candidato: `Card` para cada acción.

**`src/features/home/components/home-view.tsx`**

- Props: `userEmail: string | null`, `onNavigate: (view: SidebarActiveView) => void`
- Usa `useTranslations("home")`.
- Compone `HeroSection` + dos `QuickActionsBlock`.
- El `onNavigate` callback conecta cada acción con la vista correspondiente:
  - Sube un CV → `onNavigate("cvs")`
  - Analiza tu CV → `onNavigate("new")`
  - Compara con ofertas → `onNavigate("job-analyses")`
  - Work Journal → `onNavigate("journal")`
  - Objetivos → `onNavigate("objectives")`
  - Feedback → `onNavigate("received-feedback")`
- Layout: los dos bloques en grid de 2 columnas en desktop, 1 columna en mobile.

**`src/features/home/index.ts`**

```ts
export { HomeView } from "./components/home-view";
```

### Paso 4 — Conectar al app shell

**`src/components/shell/app-shell-content.tsx`**

- Importar `HomeView` desde `@/features/home`.
- Añadir rama condicional: `if (activeView === "home")` renderiza `<HomeView>` dentro de `<ViewFrame>`.
- Pasar `userEmail` y `onNavigate` (que llame a `setActiveView`).

### Paso 5 — Verificación

1. `npm run agent:check` (incluye DDD checks + build).
2. Verificar visualmente en el navegador:
   - Login → llega al home.
   - Hero muestra el nombre/email del usuario.
   - Cada acción rápida navega a la vista correcta.
   - Icono "Home" en sidebar funciona para volver.
   - Responsive: 2 columnas → 1 columna en mobile.

## Fuera de alcance

- Actividad reciente / resúmenes de datos del usuario.
- Diferenciación de experiencia por tipo de usuario.
- Onboarding wizard o pasos guiados.
- Ilustraciones o assets gráficos.
