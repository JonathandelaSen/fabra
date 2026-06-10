# Guión de implementación: pestaña Dashboard de métricas de contenido en Admin

Este documento es un guión paso a paso para implementar la primera iteración del
dashboard de métricas de contenido en la sección de admin. Todas las decisiones de
diseño ya están tomadas; no improvises alternativas. Si algo del guión contradice el
código real, para y repórtalo en lugar de inventar.

## Reglas obligatorias

- **No hagas commits.** Deja todos los cambios sin commitear para revisión manual.
- **No toques producción** (ni migraciones ni datos). Esta tarea no necesita migraciones.
- **No uses APIs reales de IA.** Esta tarea no involucra IA.
- Sigue las convenciones de `AGENTS.md` (anatomía de route handlers, i18n, TanStack Query, etc.).
- Al terminar cada fase, ejecuta la verificación indicada antes de pasar a la siguiente.
- Verificación final completa: `npm run ddd:check`, `npm run test:backend` y `npm run agent:check`.

## Resumen de decisiones (no renegociables)

| Decisión | Valor |
| --- | --- |
| Qué se construye | Nueva pestaña **Dashboard** en `/admin` con contadores totales de contenido y filtro global por fecha |
| Tendencias / gráficas | **No** en esta iteración. Solo números |
| Entidades (13) | Ver tabla de grupos más abajo |
| API | **5 endpoints**, uno por grupo de dominio, con `?days=N` opcional |
| Semántica de `days` | Entero 1–365. Con `days`: cuenta filas con `created_at >= now() - days`. Sin `days`: total histórico |
| Backend | Submódulo **nominal** dentro de `src/modules/admin` (capas estándar, **sin** carpeta raíz anidada tipo `admin/metrics/`) |
| Use cases | **5**, uno por grupo/endpoint. Total y ventana son **dos llamadas distintas** al mismo endpoint, no un caso de uso combinado |
| Acceso a datos | `ContentMetricsRepository` (puerto en domain) + implementación Supabase con `createAdminClient()` (service role). Un `count` por tabla, **nunca** una query que lo traiga todo |
| Observabilidad | **No** se registran eventos (son lecturas puras, consistente con `listUsers`) |
| Script DDD | Nuevo allowlist `adminReadModelReads` en `scripts/verify-ddd-supabase-repository-tables.mjs` |
| Frontend | Feature nueva `src/features/admin-metrics` |
| UI filtro | Selector global Todo / 7 / 30 / 90 días. Cada tarjeta muestra **siempre el total** y, con ventana activa, un segundo número "+X en los últimos N días" |
| Pestañas admin | Orden **Dashboard · Users · Observability**, con Dashboard como pestaña por defecto |

## Grupos, tablas y endpoints

| Grupo | Endpoint | Tablas (clave camelCase en la respuesta) |
| --- | --- | --- |
| `cv` | `GET /api/admin/metrics/cv` | `cvs` → `cvs`, `cv_structured_profiles` → `cvStructuredProfiles` |
| `analysis` | `GET /api/admin/metrics/analysis` | `job_match_analyses` → `jobMatchAnalyses`, `analysis_chat_conversations` → `analysisChatConversations`, `analysis_chat_messages` → `analysisChatMessages`, `interview_questions` → `interviewQuestions` |
| `opportunities` | `GET /api/admin/metrics/opportunities` | `job_opportunities` → `jobOpportunities`, `process_questions` → `processQuestions` |
| `feedback` | `GET /api/admin/metrics/feedback` | `feedback_notes_feedbacks` → `feedbackNotesFeedbacks`, `received_feedback` → `receivedFeedback` |
| `workspace` | `GET /api/admin/metrics/workspace` | `work_journal_entries` → `workJournalEntries`, `commitments` → `commitments`, `activity_contexts` → `activityContexts` |

Todas las tablas tienen columna `created_at`.

---

## Fase 1 — Puerto de dominio

Crear `src/modules/admin/domain/repositories/content-metrics.repository.ts`:

```ts
export interface ContentMetricsWindow {
  since: Date | null;
}

export interface CVContentMetrics {
  cvs: number;
  cvStructuredProfiles: number;
}

export interface AnalysisContentMetrics {
  jobMatchAnalyses: number;
  analysisChatConversations: number;
  analysisChatMessages: number;
  interviewQuestions: number;
}

export interface OpportunitiesContentMetrics {
  jobOpportunities: number;
  processQuestions: number;
}

export interface FeedbackContentMetrics {
  feedbackNotesFeedbacks: number;
  receivedFeedback: number;
}

export interface WorkspaceContentMetrics {
  workJournalEntries: number;
  commitments: number;
  activityContexts: number;
}

export interface ContentMetricsRepository {
  countCVContent(window: ContentMetricsWindow): Promise<CVContentMetrics>;
  countAnalysisContent(window: ContentMetricsWindow): Promise<AnalysisContentMetrics>;
  countOpportunitiesContent(window: ContentMetricsWindow): Promise<OpportunitiesContentMetrics>;
  countFeedbackContent(window: ContentMetricsWindow): Promise<FeedbackContentMetrics>;
  countWorkspaceContent(window: ContentMetricsWindow): Promise<WorkspaceContentMetrics>;
}
```

Notas:

- El módulo `admin` **no** está en `migratedModules` de `verify-ddd-entities.mjs`, así que
  este puerto de read model (sin aggregate, sin `save`/`delete`) es válido.
- No crear entidades ni value objects nuevos.

## Fase 2 — Repositorio Supabase + test

Crear `src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts`.

Patrón (igual que `supabase-user.repository.ts` del mismo módulo: sin constructor, sin
`bindRequest`, `createAdminClient()` por llamada):

```ts
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ContentMetricsRepository,
  ContentMetricsWindow,
  // ...resto de tipos
} from "../../domain/repositories/content-metrics.repository";

export class SupabaseContentMetricsRepository implements ContentMetricsRepository {
  private async countTable(table: string, window: ContentMetricsWindow): Promise<number> {
    const admin = createAdminClient();
    let query = admin.from(table).select("*", { count: "exact", head: true });
    if (window.since) {
      query = query.gte("created_at", window.since.toISOString());
    }
    const { count, error } = await query;
    if (error) {
      throw new Error(`Could not count ${table}: ${error.message}`);
    }
    return count ?? 0;
  }

  async countCVContent(window: ContentMetricsWindow) {
    const [cvs, cvStructuredProfiles] = await Promise.all([
      this.countTable("cvs", window),
      this.countTable("cv_structured_profiles", window),
    ]);
    return { cvs, cvStructuredProfiles };
  }

  // ...los otros 4 métodos, mismo patrón con las tablas de su grupo
}
```

Crear el test colocado `supabase-content-metrics.repository.test.ts` (obligatorio por
`verify-ddd-tests.mjs`). Sigue el patrón de `supabase-user.repository.test.ts`:
test backend contra el stack Supabase E2E real, usando `createTestUser` /
`createConfirmedUser` de `@/modules/test-helpers/setup`. Casos mínimos:

1. Cada método devuelve números `>= 0` con ventana `{ since: null }`.
2. Insertar una fila conocida (p. ej. un CV del usuario de test) y comprobar que el
   count del grupo correspondiente la incluye con `since: null` y con un `since`
   reciente (p. ej. hace 1 día), y que la excluye con un `since` futuro.
3. Los counts son globales (service role): una fila de otro usuario de test también cuenta.

Ojo: el stack E2E es compartido entre tests; **no** asertes igualdad exacta de totales
globales, aserta deltas (`after - before === 1`) o `>=`.

Verificación de fase: `npm run test:backend -- supabase-content-metrics` (o el filtro
equivalente del runner) en verde.

## Fase 3 — Allowlist en el script de ownership

Sin esta fase, `ddd:check` fallará con 13 violaciones de ownership de tablas.

Editar `scripts/verify-ddd-supabase-repository-tables.mjs`. Junto al set existente
`legacyCrossModuleReads`, añadir un set nuevo (no mezclar con el legacy):

```js
// Admin platform read models: aggregate counters for the admin dashboard.
// Every new dashboard table must be added here deliberately.
const adminReadModelReads = new Set([
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::cvs",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::cv_structured_profiles",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::job_match_analyses",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::analysis_chat_conversations",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::analysis_chat_messages",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::interview_questions",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::job_opportunities",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::process_questions",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::feedback_notes_feedbacks",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::received_feedback",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::work_journal_entries",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::commitments",
  "src/modules/admin/infrastructure/repositories/supabase-content-metrics.repository.ts::activity_contexts",
]);
```

Y en el bucle de violaciones, donde hoy se comprueba `legacyCrossModuleReads`, añadir la
misma comprobación para el set nuevo:

```js
if (legacyCrossModuleReads.has(`${file}::${table}`)) continue;
if (adminReadModelReads.has(`${file}::${table}`)) continue;
```

Además, añadir a `AGENTS.md` (sección "Hexagonal architecture", junto a las convenciones
de repositorios) una nota breve:

> Los read models de plataforma del módulo `admin` (contadores agregados del dashboard)
> son la única excepción permitida al ownership de tablas en
> `verify-ddd-supabase-repository-tables.mjs`, vía el allowlist `adminReadModelReads`.
> Toda tabla nueva del dashboard exige añadir su entrada `file::table` a ese set.

Verificación de fase: `node scripts/verify-ddd-supabase-repository-tables.mjs` en verde.

## Fase 4 — Use cases + tests

Crear 5 archivos en `src/modules/admin/application/use-cases/`, todos con el mismo patrón:

- `get-cv-content-metrics.use-case.ts`
- `get-analysis-content-metrics.use-case.ts`
- `get-opportunities-content-metrics.use-case.ts`
- `get-feedback-content-metrics.use-case.ts`
- `get-workspace-content-metrics.use-case.ts`

Patrón (ejemplo del grupo `cv`):

```ts
import type {
  ContentMetricsRepository,
  CVContentMetrics,
} from "../../domain/repositories/content-metrics.repository";

export interface GetCVContentMetricsInput {
  days: number | null;
}

export interface GetCVContentMetricsResult {
  counts: CVContentMetrics;
  windowDays: number | null;
}

export class GetCVContentMetricsUseCase {
  constructor(
    private readonly deps: {
      contentMetricsRepo: ContentMetricsRepository;
    }
  ) {}

  async execute(input: GetCVContentMetricsInput): Promise<GetCVContentMetricsResult> {
    const since =
      input.days === null
        ? null
        : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

    const counts = await this.deps.contentMetricsRepo.countCVContent({ since });
    return { counts, windowDays: input.days };
  }
}
```

Cada use case con su test colocado `*.use-case.test.ts` (obligatorio). Para los tests de
use case se puede usar el repositorio real contra el stack E2E o un fake en memoria del
puerto; los tests deben cubrir: `days: null` → `since: null`, `days: 30` → `since`
correcto (±tolerancia), y que el resultado propaga `counts` y `windowDays`.

**No** inyectar `EventTracker` ni registrar eventos en estos use cases.

Verificación de fase: `node scripts/verify-ddd-tests.mjs` y los tests nuevos en verde.

## Fase 5 — Wiring del módulo

Editar `src/modules/admin/admin.module.ts`:

1. Instanciar el repo a nivel de módulo: `const contentMetricsRepo = new SupabaseContentMetricsRepository();`
2. Añadir a `createUseCases()` las 5 entradas:
   `getCVContentMetrics`, `getAnalysisContentMetrics`, `getOpportunitiesContentMetrics`,
   `getFeedbackContentMetrics`, `getWorkspaceContentMetrics`, cada una con
   `{ contentMetricsRepo }`.

No hay que tocar `src/lib/container.ts` (ya crea `adminModule`) ni añadir `bindRequest`
(el módulo admin no lo usa; sus repos usan `createAdminClient()` por llamada).

El barrel `src/modules/admin/index.ts` **no** debe re-exportar el repositorio ni el
puerto (regla de `verify-ddd-barrel-exports.mjs`). Solo añadir, si hace falta para las
rutas, los tipos de resultado de los use cases — y solo si se importan desde fuera.

## Fase 6 — Rutas API

Estructura:

```
src/app/api/admin/metrics/
  _shared/validation.ts
  cv/route.ts            cv/responses.ts
  analysis/route.ts      analysis/responses.ts
  opportunities/route.ts opportunities/responses.ts
  feedback/route.ts      feedback/responses.ts
  workspace/route.ts     workspace/responses.ts
```

`_shared/validation.ts` (solo parsing HTTP, permitido en la capa API):

```ts
export interface MetricsWindowRequest {
  days: number | null;
}

export function parseMetricsWindowRequest(params: URLSearchParams):
  | { ok: true; value: MetricsWindowRequest }
  | { ok: false; error: { message: string; status: number } } {
  const raw = params.get("days");
  if (raw === null) return { ok: true, value: { days: null } };

  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return {
      ok: false,
      error: { message: "days must be an integer between 1 and 365", status: 400 },
    };
  }
  return { ok: true, value: { days } };
}
```

`responses.ts` por grupo (ejemplo `cv/responses.ts`; debe ser importable desde el
frontend: sin imports de Next, Supabase ni módulos):

```ts
export interface CVMetricsResponse {
  counts: {
    cvs: number;
    cvStructuredProfiles: number;
  };
  windowDays: number | null;
}
```

`route.ts` por grupo, siguiendo exactamente la anatomía de
`src/app/api/admin/users/route.ts` (ejemplo `cv/route.ts`):

```ts
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { adminModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { ok, forbidden, errorResponse } from "@/modules/shared";
import { parseMetricsWindowRequest } from "../_shared/validation";
import type { CVMetricsResponse } from "./responses";

export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;

    if (!(await isAdminUser(user.id))) {
      throw forbidden("Forbidden");
    }

    const parsed = parseMetricsWindowRequest(req.nextUrl.searchParams);
    if (!parsed.ok) return errorResponse(parsed.error);

    const result = await adminModule.getCVContentMetrics.execute(parsed.value);

    return ok({
      counts: result.counts,
      windowDays: result.windowDays,
    } satisfies CVMetricsResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
```

Replicar para los otros 4 grupos cambiando use case y tipo de respuesta. Comprobar la
firma exacta de `errorResponse` en `@/modules/shared` antes de usarla (en las rutas
existentes de admin GET no se usa porque su validación nunca falla).

Verificación de fase: `npm run build` compila.

## Fase 7 — Feature frontend `admin-metrics`

Estructura:

```
src/features/admin-metrics/
  api/admin-metrics-api.ts
  api/admin-metrics-query-keys.ts
  hooks/use-admin-metrics-queries.ts
  components/admin-metrics-view.tsx
  components/metrics-window-filter.tsx
  components/metrics-group-section.tsx
  components/metric-card.tsx
  index.ts                ← exporta solo AdminMetricsView
```

Reglas duras: no importar nada de `@/modules/**` ni de `route.ts`; los tipos de
respuesta se importan con `import type` desde
`@/app/api/admin/metrics/<grupo>/responses`.

### `api/admin-metrics-query-keys.ts`

```ts
export const METRIC_GROUPS = [
  "cv",
  "analysis",
  "opportunities",
  "feedback",
  "workspace",
] as const;

export type MetricGroup = (typeof METRIC_GROUPS)[number];

export const adminMetricsQueryKeys = {
  group: (group: MetricGroup, days: number | null) =>
    ["admin-metrics", group, days] as const,
};
```

### `api/admin-metrics-api.ts`

Un fetcher genérico (copiar el patrón `parseError` de
`src/features/admin-users/api/admin-users-api.ts`):

```ts
export async function fetchGroupMetrics<T>(
  group: MetricGroup,
  days: number | null,
): Promise<T> {
  const params = new URLSearchParams();
  if (days !== null) params.set("days", String(days));
  const qs = params.size > 0 ? `?${params}` : "";
  const response = await fetch(`/api/admin/metrics/${group}${qs}`);
  if (!response.ok) throw await parseError(response, "Could not load metrics.");
  return (await response.json()) as T;
}
```

### `hooks/use-admin-metrics-queries.ts`

Hook por grupo que encapsula **dos** queries: la del total (siempre activa,
`days: null`) y la de la ventana (solo si `days !== null`):

```ts
export function useGroupMetrics<T>(group: MetricGroup, days: number | null) {
  const totalQuery = useQuery({
    queryKey: adminMetricsQueryKeys.group(group, null),
    queryFn: () => fetchGroupMetrics<T>(group, null),
  });
  const windowQuery = useQuery({
    queryKey: adminMetricsQueryKeys.group(group, days),
    queryFn: () => fetchGroupMetrics<T>(group, days),
    enabled: days !== null,
  });
  return { totalQuery, windowQuery };
}
```

Al cambiar el filtro, la query del total no se invalida (su key no cambia): los totales
no parpadean. Lecturas puras: sin mutaciones ni optimistic updates.

### Componentes

- `admin-metrics-view.tsx`: orquestador. Estado local `days: number | null` (por defecto
  `null` = "Todo"). Renderiza dentro de `FeatureScreenShell` (ver
  `admin-users-view.tsx` como referencia) el `MetricsWindowFilter` y las 5
  `MetricsGroupSection`.
- `metrics-window-filter.tsx`: selector global con opciones Todo / 7 / 30 / 90 días.
  Usar componentes existentes de `src/components/ui/` (p. ej. `Tabs` o `Select` de
  shadcn — comprobar qué hay ya instalado y reutilizar; no crear primitivas nuevas).
- `metrics-group-section.tsx`: título del grupo + grid de `MetricCard`. Recibe el grupo,
  llama a `useGroupMetrics`, mapea las claves de counts a tarjetas. Maneja loading
  (skeleton sencillo) y error (`AlertBanner` de `@/components/shared/alert-banner`).
- `metric-card.tsx`: presentacional. Props: `label`, `total: number | undefined`,
  `windowCount: number | undefined`, `windowDays: number | null`. Muestra el total
  grande y, si `windowDays !== null`, debajo "+{windowCount} en los últimos {N} días".

Cada componente en su propio archivo; nada de comentarios JSX tipo `{/* Header */}`.

### Integración en la pestaña Admin

Editar `src/features/admin/components/admin-area-view.tsx`:

1. `type AdminSection = "dashboard" | "users" | "observability";`
2. Estado inicial: `useState<AdminSection>("dashboard")`.
3. Añadir la pestaña Dashboard **primera** en el array de tabs (icono sugerido:
   `LayoutDashboard` de lucide-react), luego Users y Observability.
4. Renderizar `<AdminMetricsView />` cuando `section === "dashboard"`.

### i18n

Añadir claves en `src/i18n/messages.ts`, **en `en` y en `es`** (el namespace `admin` ya
existe en ambos; añadir dentro un bloque `dashboard`):

- `admin.sections.dashboard` ("Dashboard" / "Dashboard")
- `admin.dashboard.title`, `admin.dashboard.windowAll`, `admin.dashboard.window7`,
  `admin.dashboard.window30`, `admin.dashboard.window90`,
  `admin.dashboard.windowDelta` (con placeholders `{count}` y `{days}`),
  `admin.dashboard.errors.load`
- Etiqueta por grupo: `admin.dashboard.groups.cv`, `.analysis`, `.opportunities`,
  `.feedback`, `.workspace`
- Etiqueta por métrica: `admin.dashboard.metrics.cvs`, `.cvStructuredProfiles`,
  `.jobMatchAnalyses`, `.analysisChatConversations`, `.analysisChatMessages`,
  `.interviewQuestions`, `.jobOpportunities`, `.processQuestions`,
  `.feedbackNotesFeedbacks`, `.receivedFeedback`, `.workJournalEntries`,
  `.commitments`, `.activityContexts`

Ningún string visible hardcodeado en los componentes.

## Fase 8 — Verificación final

1. `npm run ddd:check` — en verde (tests colocados, imports, ownership con el allowlist nuevo).
2. `npm run test:backend` — en verde (incluye los tests nuevos de repo y use cases).
3. `npm run agent:check` — en verde (checks de arquitectura + build de producción).
4. Comprobación manual: arrancar el stack local, sembrar datos con
   `npm run supabase:seed-agent`, iniciar sesión con el usuario de pruebas
   (`agent-test@example.com` / `agent-test-password`) — el usuario debe estar en
   `admin_users` para ver `/admin`; si no lo está, insertarlo en la base **local** —
   y verificar en `/admin`:
   - La pestaña Dashboard es la primera y la activa por defecto.
   - Con "Todo": cada tarjeta muestra un total coherente con los datos sembrados.
   - Con "7 días": los totales no cambian ni parpadean y aparece el "+X en los últimos 7 días".
   - `days=0`, `days=-1`, `days=abc`, `days=9999` en la URL del endpoint devuelven 400.
   - Un usuario no admin recibe 403 en `/api/admin/metrics/cv`.

## Fuera de alcance (no hacer)

- Series temporales, sparklines o comparativas entre periodos.
- Eventos de observabilidad para estas lecturas.
- Métricas de `follow_ups`, `cv_template_versions`, `user_preferences`, `admin_users`,
  `processing_events`, `work_journal_contexts`, `work_journal_hidden_context_suggestions`,
  `commitment_contexts`, `commitment_items`, `commitment_outcomes` ni `analyses` (legacy).
- Índices nuevos en base de datos.
- Migrar el módulo admin a `migratedModules` o introducir QueryBus para los counts.
